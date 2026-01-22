import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/doctor.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/app_button.dart';

class BookAppointmentScreen extends ConsumerStatefulWidget {
  final String doctorId;

  const BookAppointmentScreen({super.key, required this.doctorId});

  @override
  ConsumerState<BookAppointmentScreen> createState() =>
      _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends ConsumerState<BookAppointmentScreen> {
  late Future<Doctor?> _doctorFuture;
  DateTime? selectedDate;
  TimeOfDay? selectedTime;
  String? selectedReason;
  String? selectedNotes;

  final reasonController = TextEditingController();
  final notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _doctorFuture =
        ref.read(doctorServiceProvider).getDoctorById(widget.doctorId);
  }

  @override
  void dispose() {
    reasonController.dispose();
    notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context, Doctor doctor) async {
    // Calculate available dates based on doctor's slots
    final firstAvailableDate = DateTime.now().add(const Duration(days: 1));
    final lastDate = DateTime.now().add(const Duration(days: 30));

    final pickedDate = await showDatePicker(
      context: context,
      initialDate: firstAvailableDate,
      firstDate: firstAvailableDate,
      lastDate: lastDate,
      selectableDayPredicate: (date) {
        // Only allow days when doctor is available
        return doctor.availableSlots
            .any((slot) => slot.day == date.weekday % 7);
      },
    );

    if (pickedDate != null) {
      setState(() {
        selectedDate = pickedDate;
        selectedTime = null; // Reset time when date changes
      });
    }
  }

  Future<void> _selectTime(BuildContext context, Doctor doctor) async {
    if (selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date first')),
      );
      return;
    }

    // Get available slots for selected day
    final dayOfWeek = selectedDate!.weekday % 7;
    final availableSlots =
        doctor.availableSlots.where((slot) => slot.day == dayOfWeek).toList();

    if (availableSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No slots available for this day')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Time',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: UIConstants.spacingMedium),
            SingleChildScrollView(
              child: Column(
                children: availableSlots.map((slot) {
                  return ListTile(
                    title: Text('${slot.startTime} - ${slot.endTime}'),
                    trailing: selectedTime?.hour ==
                                int.parse(slot.startTime.split(':')[0]) &&
                            selectedTime?.minute ==
                                int.parse(slot.startTime.split(':')[1])
                        ? Icon(
                            Icons.check,
                            color: Theme.of(context).primaryColor,
                          )
                        : null,
                    onTap: () {
                      final timeParts = slot.startTime.split(':');
                      setState(() {
                        selectedTime = TimeOfDay(
                          hour: int.parse(timeParts[0]),
                          minute: int.parse(timeParts[1]),
                        );
                      });
                      Navigator.pop(context);
                    },
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _bookAppointment(Doctor doctor) async {
    if (selectedDate == null || selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select date and time')),
      );
      return;
    }

    if (reasonController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter reason for consultation')),
      );
      return;
    }

    try {
      final appointmentService = ref.read(appointmentServiceProvider);
      final authState = ref.read(authStateProvider);

      final success = await appointmentService.bookAppointment(
        doctorId: widget.doctorId,
        patientId: authState.user?.id ?? '',
        date: selectedDate!,
        time:
            '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}',
        reason: reasonController.text,
        notes: notesController.text.isNotEmpty ? notesController.text : null,
      );

      if (!mounted) return;

      if (success) {
        // Show success dialog
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Appointment Booked'),
            content:
                const Text('Your appointment has been booked successfully!'),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  context.go(AppRoutes.patientHome);
                },
                child: const Text('Go Home'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to book appointment'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
        centerTitle: true,
      ),
      body: FutureBuilder<Doctor?>(
        future: _doctorFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError || snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    Text(
                      'Doctor not found',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            );
          }

          final doctor = snapshot.data!;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Doctor Info Card
                  Container(
                    padding: const EdgeInsets.all(UIConstants.spacingMedium),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.1),
                      borderRadius:
                          BorderRadius.circular(UIConstants.radiusMedium),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: theme.primaryColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(
                              UIConstants.radiusMedium,
                            ),
                          ),
                          child: doctor.photoUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(
                                    UIConstants.radiusMedium,
                                  ),
                                  child: Image.network(
                                    doctor.photoUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Icon(
                                        Icons.person,
                                        size: 40,
                                        color: theme.primaryColor,
                                      );
                                    },
                                  ),
                                )
                              : Icon(
                                  Icons.person,
                                  size: 40,
                                  color: theme.primaryColor,
                                ),
                        ),
                        const SizedBox(width: UIConstants.spacingMedium),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Dr. ${doctor.specialization}',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                doctor.specialization,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '₹${doctor.consultationFee}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: theme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Date Selection
                  Text(
                    'Select Date',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  GestureDetector(
                    onTap: () => _selectDate(context, doctor),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: UIConstants.spacingMedium,
                        vertical: UIConstants.spacingLarge,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: selectedDate != null
                              ? theme.primaryColor
                              : Colors.grey[300]!,
                          width: selectedDate != null ? 2 : 1,
                        ),
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            color: theme.primaryColor,
                          ),
                          const SizedBox(width: UIConstants.spacingMedium),
                          Expanded(
                            child: Text(
                              selectedDate != null
                                  ? '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}'
                                  : 'Choose a date',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: selectedDate != null
                                    ? Colors.black87
                                    : Colors.grey[500],
                                fontWeight: selectedDate != null
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Time Selection
                  Text(
                    'Select Time',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  GestureDetector(
                    onTap: () => _selectTime(context, doctor),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: UIConstants.spacingMedium,
                        vertical: UIConstants.spacingLarge,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: selectedTime != null
                              ? theme.primaryColor
                              : Colors.grey[300]!,
                          width: selectedTime != null ? 2 : 1,
                        ),
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            color: theme.primaryColor,
                          ),
                          const SizedBox(width: UIConstants.spacingMedium),
                          Expanded(
                            child: Text(
                              selectedTime != null
                                  ? '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}'
                                  : 'Choose a time',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: selectedTime != null
                                    ? Colors.black87
                                    : Colors.grey[500],
                                fontWeight: selectedTime != null
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Reason for Consultation
                  Text(
                    'Reason for Consultation',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  TextField(
                    controller: reasonController,
                    decoration: InputDecoration(
                      hintText: 'e.g., Checkup, Pain, Follow-up',
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Additional Notes
                  Text(
                    'Additional Notes (Optional)',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  TextField(
                    controller: notesController,
                    decoration: InputDecoration(
                      hintText: 'Add any additional information...',
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                    ),
                    maxLines: 3,
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Summary
                  if (selectedDate != null && selectedTime != null)
                    Container(
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        border:
                            Border.all(color: Colors.green.withOpacity(0.3)),
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Appointment Summary',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.green[700],
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          _SummaryRow(
                            label: 'Doctor',
                            value: 'Dr. ${doctor.specialization}',
                          ),
                          _SummaryRow(
                            label: 'Date',
                            value:
                                '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}',
                          ),
                          _SummaryRow(
                            label: 'Time',
                            value:
                                '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}',
                          ),
                          _SummaryRow(
                            label: 'Fee',
                            value: '₹${doctor.consultationFee}',
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Book Button
                  AppButton(
                    label: 'Confirm & Book Appointment',
                    onPressed: () => _bookAppointment(doctor),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: Colors.grey[700],
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.green[700],
            ),
          ),
        ],
      ),
    );
  }
}
