import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/constants.dart';
import '../../widgets/doctor_bottom_nav.dart';
import '../../widgets/app_text_field.dart';
import '../../providers/doctor_provider.dart';

class DoctorAppointmentsScreen extends ConsumerStatefulWidget {
  const DoctorAppointmentsScreen({super.key});

  @override
  ConsumerState<DoctorAppointmentsScreen> createState() =>
      _DoctorAppointmentsScreenState();
}

class _DoctorAppointmentsScreenState
    extends ConsumerState<DoctorAppointmentsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    // Load doctor profile + appointments
    Future.microtask(() {
      ref.read(doctorProvider.notifier).fetchProfile();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _handleAppointmentAction(
    String appointmentId,
    String action,
  ) async {
    // action can be 'accept', 'reject', 'reschedule'
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${action.capitalize()} Appointment'),
        content: Text(
          'Are you sure you want to $action this appointment?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: action == 'reject' ? Colors.red : Colors.blue,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: Text(action.capitalize()),
          ),
        ],
      ),
    );

    if (!mounted) return;

    if (confirmed == true) {
      final messenger = ScaffoldMessenger.of(context);

      if (action == 'reschedule') {
        // Show reschedule bottom sheet to pick date and times
        DateTime selectedDate = DateTime.now();
        final startController = TextEditingController();
        final endController = TextEditingController();

        final proceed = await showModalBottomSheet<bool>(
          context: context,
          isScrollControlled: true,
          builder: (context) {
            final padding = MediaQuery.of(context).viewInsets;
            return Padding(
              padding: EdgeInsets.only(
                bottom: padding.bottom,
                left: UIConstants.spacingLarge,
                right: UIConstants.spacingLarge,
                top: UIConstants.spacingLarge,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Reschedule Appointment',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime.now(),
                              lastDate:
                                  DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              selectedDate = date;
                            }
                          },
                          icon: const Icon(Icons.calendar_today),
                          label: const Text('Pick Date'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  AppTextField(
                    label: 'Start Time (HH:MM)',
                    hintText: 'e.g., 14:00',
                    controller: startController,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  AppTextField(
                    label: 'End Time (HH:MM)',
                    hintText: 'e.g., 14:30',
                    controller: endController,
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  ElevatedButton(
                    onPressed: () {
                      final start = startController.text.trim();
                      final end = endController.text.trim();
                      if (start.isEmpty || end.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Please provide start and end times'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }
                      Navigator.pop(context, true);
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    child: const Text('Confirm'),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                ],
              ),
            );
          },
        );

        if (!mounted) return;
        if (proceed == true) {
          final start = startController.text.trim();
          final end = endController.text.trim();
          final ok =
              await ref.read(doctorProvider.notifier).rescheduleAppointment(
                    appointmentId: appointmentId,
                    date: selectedDate,
                    startTime: start,
                    endTime: end,
                  );
          if (!mounted) return;
          if (ok) {
            messenger.showSnackBar(
              const SnackBar(
                content: Text('Appointment rescheduled successfully'),
                backgroundColor: Colors.green,
              ),
            );
          } else {
            messenger.showSnackBar(
              const SnackBar(
                content: Text('Failed to reschedule appointment'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
        return;
      }

      final targetStatus = switch (action) {
        'accept' => AppConstants.appointmentConfirmed,
        'reject' => AppConstants.appointmentCancelled,
        _ => AppConstants.appointmentPending,
      };

      final success = await ref
          .read(doctorProvider.notifier)
          .updateAppointmentStatus(appointmentId, targetStatus);

      if (!mounted) return;

      if (success) {
        messenger.showSnackBar(
          SnackBar(
            content: Text('Appointment ${action}ed successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        messenger.showSnackBar(
          const SnackBar(
            content: Text('Failed to update appointment'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Confirmed'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Pending Appointments
          _AppointmentsList(
            status: AppConstants.appointmentPending,
            onAction: _handleAppointmentAction,
          ),
          // Confirmed Appointments
          _AppointmentsList(
            status: AppConstants.appointmentConfirmed,
            onAction: _handleAppointmentAction,
          ),
          // Completed Appointments
          _AppointmentsList(
            status: AppConstants.appointmentCompleted,
            onAction: _handleAppointmentAction,
          ),
        ],
      ),
      bottomNavigationBar: const DoctorBottomNav(
        currentRoute: '/doctor/appointments',
      ),
    );
  }
}

class _AppointmentsList extends ConsumerWidget {
  final String status;
  final Function(String, String)? onAction;

  const _AppointmentsList({
    required this.status,
    this.onAction,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final doctorState = ref.watch(doctorProvider);
    final appointmentsByStatus =
        doctorState.appointments.where((a) => a.status == status).toList();

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(doctorProvider.notifier).fetchProfile();
      },
      child: appointmentsByStatus.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              children: const [
                Center(child: Text('No appointments found')),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              itemCount: appointmentsByStatus.length,
              itemBuilder: (context, index) {
                final apt = appointmentsByStatus[index];
                final patient = apt.patientId;
                final typeLabel = switch (apt.type) {
                  AppConstants.consultationVideo => 'Video Call',
                  AppConstants.consultationClinic => 'In-Person',
                  AppConstants.consultationHome => 'Home Visit',
                  _ => 'Consultation',
                };

                final dateLabel =
                    '${apt.date.day}/${apt.date.month}/${apt.date.year}';
                final timeLabel = '${apt.timeSlot.start} - ${apt.timeSlot.end}';

                return Padding(
                  padding:
                      const EdgeInsets.only(bottom: UIConstants.spacingMedium),
                  child: _AppointmentCard(
                    patientName: patient.name,
                    appointmentDate: dateLabel,
                    appointmentTime: timeLabel,
                    consultationType: typeLabel,
                    reasonForVisit: apt.symptoms ?? 'N/A',
                    status: apt.status,
                    onAccept: status == AppConstants.appointmentPending
                        ? () => onAction?.call(apt.id, 'accept')
                        : null,
                    onReject: status == AppConstants.appointmentPending
                        ? () => onAction?.call(apt.id, 'reject')
                        : null,
                    onReschedule: status == AppConstants.appointmentConfirmed
                        ? () => onAction?.call(apt.id, 'reschedule')
                        : null,
                  ),
                );
              },
            ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final String patientName;
  final String appointmentDate;
  final String appointmentTime;
  final String consultationType;
  final String reasonForVisit;
  final String status;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;
  final VoidCallback? onReschedule;

  const _AppointmentCard({
    required this.patientName,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.consultationType,
    required this.reasonForVisit,
    required this.status,
    this.onAccept,
    this.onReject,
    this.onReschedule,
  });

  Color _getStatusColor() {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel() {
    return status[0].toUpperCase() + status.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Column(
        children: [
          // Header with status
          Container(
            padding: const EdgeInsets.all(UIConstants.spacingMedium),
            decoration: BoxDecoration(
              color: _getStatusColor().withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(UIConstants.radiusMedium),
                topRight: Radius.circular(UIConstants.radiusMedium),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patientName,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Type: $consultationType',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: UIConstants.spacingSmall,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    _getStatusLabel(),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.all(UIConstants.spacingMedium),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _DetailRow(
                  icon: Icons.calendar_today,
                  label: 'Date',
                  value: appointmentDate,
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                _DetailRow(
                  icon: Icons.access_time,
                  label: 'Time',
                  value: appointmentTime,
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                _DetailRow(
                  icon: Icons.note_outlined,
                  label: 'Reason',
                  value: reasonForVisit,
                ),
              ],
            ),
          ),

          // Action Buttons (if applicable)
          if (onAccept != null || onReject != null || onReschedule != null)
            Container(
              padding: const EdgeInsets.all(UIConstants.spacingMedium),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(UIConstants.radiusMedium),
                  bottomRight: Radius.circular(UIConstants.radiusMedium),
                ),
              ),
              child: Row(
                children: [
                  if (onAccept != null) ...[
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onAccept,
                        icon: const Icon(Icons.check, size: 18),
                        label: const Text('Accept'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                        ),
                      ),
                    ),
                    const SizedBox(width: UIConstants.spacingSmall),
                  ],
                  if (onReject != null)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onReject,
                        icon: const Icon(Icons.close, size: 18),
                        label: const Text('Reject'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                        ),
                      ),
                    ),
                  if (onReschedule != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onReschedule,
                        icon: const Icon(Icons.edit_calendar, size: 18),
                        label: const Text('Reschedule'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                        ),
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Icon(
          icon,
          size: 18,
          color: Colors.grey[600],
        ),
        const SizedBox(width: UIConstants.spacingSmall),
        Text(
          '$label: ',
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

extension on String {
  String capitalize() {
    return this[0].toUpperCase() + substring(1);
  }
}
