import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/appointment.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/patient_bottom_nav.dart';

class PatientBookingsScreen extends ConsumerStatefulWidget {
  const PatientBookingsScreen({super.key});

  @override
  ConsumerState<PatientBookingsScreen> createState() =>
      _PatientBookingsScreenState();
}

class _PatientBookingsScreenState extends ConsumerState<PatientBookingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _cancelAppointment(String appointmentId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: const Text(
          'Are you sure you want to cancel this appointment? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final appointmentService = ref.read(appointmentServiceProvider);
        await appointmentService.cancelAppointment(appointmentId);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Appointment cancelled successfully'),
              backgroundColor: Colors.green,
            ),
          );
          setState(() {}); // Refresh the list
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to cancel appointment: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final patientId = authState.user?.id ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bookings'),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Past'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Upcoming Appointments
          _AppointmentsList(
            patientId: patientId,
            isUpcoming: true,
            onCancel: _cancelAppointment,
          ),
          // Past Appointments
          _AppointmentsList(
            patientId: patientId,
            isUpcoming: false,
            onCancel: null,
          ),
        ],
      ),
      bottomNavigationBar:
          const PatientBottomNav(currentRoute: '/patient/bookings'),
    );
  }
}

class _AppointmentsList extends ConsumerWidget {
  final String patientId;
  final bool isUpcoming;
  final Function(String)? onCancel;

  const _AppointmentsList({
    required this.patientId,
    required this.isUpcoming,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final appointmentService = ref.read(appointmentServiceProvider);

    return FutureBuilder(
      future: appointmentService.getPatientAppointments(
        patientId,
        upcoming: isUpcoming,
      ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
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
                  'Error loading appointments',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                TextButton(
                  onPressed: () {
                    // Trigger rebuild
                    (context as Element).markNeedsBuild();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        final response = snapshot.data;
        final appointments = response?.data ?? [];

        // Split into upcoming vs past using date + start time
        DateTime appointmentDateTime(Appointment apt) {
          final base = apt.date;
          final parts = apt.timeSlot.start.split(':');
          final hour = parts.isNotEmpty ? int.tryParse(parts[0]) ?? 0 : 0;
          final minute = parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0;
          return DateTime(base.year, base.month, base.day, hour, minute);
        }

        final now = DateTime.now();
        final filteredAppointments = appointments.where((apt) {
          final dt = appointmentDateTime(apt);
          final isUpcomingAppointment = dt.isAfter(now);
          final isCancelled = apt.status.toLowerCase() == 'cancelled';

          if (isUpcoming) {
            // Upcoming: future + not cancelled
            return isUpcomingAppointment && !isCancelled;
          } else {
            // Past tab: include anything not upcoming, including cancelled
            return !isUpcomingAppointment || isCancelled;
          }
        }).toList();

        if (filteredAppointments.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isUpcoming
                      ? Icons.calendar_today_outlined
                      : Icons.history_outlined,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                Text(
                  isUpcoming
                      ? 'No upcoming appointments'
                      : 'No past appointments',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                if (isUpcoming)
                  TextButton(
                    onPressed: () => context.go(AppRoutes.patientHome),
                    child: const Text('Book an Appointment'),
                  ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            // Trigger rebuild
            (context as Element).markNeedsBuild();
          },
          child: ListView.separated(
            padding: const EdgeInsets.all(UIConstants.spacingLarge),
            itemCount: filteredAppointments.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: UIConstants.spacingMedium),
            itemBuilder: (context, index) {
              final appointment = filteredAppointments[index];
              return _AppointmentCard(
                appointment: appointment,
                isUpcoming: isUpcoming,
                onCancel: onCancel,
              );
            },
          ),
        );
      },
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final Appointment appointment;
  final bool isUpcoming;
  final Function(String)? onCancel;

  const _AppointmentCard({
    required this.appointment,
    required this.isUpcoming,
    this.onCancel,
  });

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return Colors.green;
      case 'completed':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Icons.schedule;
      case 'confirmed':
        return Icons.check_circle;
      case 'completed':
        return Icons.done_all;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(appointment.status);
    final statusIcon = _getStatusIcon(appointment.status);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Status Banner
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: UIConstants.spacingMedium,
              vertical: UIConstants.spacingSmall,
            ),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(UIConstants.radiusMedium),
                topRight: Radius.circular(UIConstants.radiusMedium),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  statusIcon,
                  size: 16,
                  color: statusColor,
                ),
                const SizedBox(width: 6),
                Text(
                  appointment.status.toUpperCase(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  'ID: ${appointment.id.substring(0, 8)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(UIConstants.spacingMedium),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Doctor Info
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                      ),
                      child: Icon(
                        Icons.person,
                        color: theme.primaryColor,
                      ),
                    ),
                    const SizedBox(width: UIConstants.spacingMedium),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dr. ${appointment.doctorId.userId?.name ?? 'Doctor'}',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            appointment.type,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: UIConstants.spacingMedium),

                // Appointment Details
                _DetailRow(
                  icon: Icons.calendar_today,
                  label: 'Date',
                  value: _formatDate(appointment.date),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                _DetailRow(
                  icon: Icons.access_time,
                  label: 'Time',
                  value: appointment.timeSlot.start,
                ),
                if (appointment.symptoms != null) ...[
                  const SizedBox(height: UIConstants.spacingSmall),
                  _DetailRow(
                    icon: Icons.note_outlined,
                    label: 'Reason',
                    value: appointment.symptoms ?? '',
                  ),
                ],

                // Action Buttons
                if (isUpcoming &&
                    appointment.status.toLowerCase() != 'cancelled')
                  Padding(
                    padding:
                        const EdgeInsets.only(top: UIConstants.spacingMedium),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: onCancel != null
                                ? () => onCancel!(appointment.id)
                                : null,
                            icon: const Icon(Icons.cancel_outlined, size: 18),
                            label: const Text('Cancel'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                            ),
                          ),
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Appointment Details'),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                          'Doctor: ${appointment.doctorId.userId?.name ?? 'Doctor'}'),
                                      const SizedBox(height: 6),
                                      Text('Type: ${appointment.type}'),
                                      const SizedBox(height: 6),
                                      Text(
                                          'Date: ${_formatDate(appointment.date)}'),
                                      const SizedBox(height: 6),
                                      Text(
                                          'Time: ${appointment.timeSlot.start}'),
                                      if (appointment.symptoms != null) ...[
                                        const SizedBox(height: 6),
                                        Text('Reason: ${appointment.symptoms}')
                                      ],
                                      const SizedBox(height: 6),
                                      Text('Status: ${appointment.status}'),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(ctx),
                                      child: const Text('Close'),
                                    ),
                                  ],
                                ),
                              );
                            },
                            icon: const Icon(Icons.info_outline, size: 18),
                            label: const Text('Details'),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
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
