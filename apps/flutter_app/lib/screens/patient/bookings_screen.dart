import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/appointment.dart';
import '../../models/lab.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/patient_bottom_nav.dart';

class _PatientBookingsData {
  final List<Appointment> appointments;
  final List<LabOrder> labOrders;

  const _PatientBookingsData({
    required this.appointments,
    required this.labOrders,
  });
}

class PatientBookingsScreen extends ConsumerStatefulWidget {
  const PatientBookingsScreen({super.key});

  @override
  ConsumerState<PatientBookingsScreen> createState() =>
      _PatientBookingsScreenState();
}

class _PatientBookingsScreenState extends ConsumerState<PatientBookingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _reloadToken = 0;
  final Set<String> _cancellingAppointmentIds = <String>{};

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
      if (_cancellingAppointmentIds.contains(appointmentId)) {
        return;
      }

      setState(() {
        _cancellingAppointmentIds.add(appointmentId);
      });

      try {
        final appointmentService = ref.read(appointmentServiceProvider);
        final response =
            await appointmentService.cancelAppointment(appointmentId);

        if (!mounted) return;

        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Appointment cancelled successfully'),
              backgroundColor: Colors.green,
            ),
          );

          setState(() {
            _reloadToken++;
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.error ?? 'Failed to cancel appointment'),
              backgroundColor: Colors.red,
            ),
          );
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
      } finally {
        if (mounted) {
          setState(() {
            _cancellingAppointmentIds.remove(appointmentId);
          });
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
            key: ValueKey('upcoming-$_reloadToken'),
            patientId: patientId,
            isUpcoming: true,
            onCancel: _cancelAppointment,
            cancellingAppointmentIds: _cancellingAppointmentIds,
            reloadToken: _reloadToken,
          ),
          // Past Appointments
          _AppointmentsList(
            key: ValueKey('past-$_reloadToken'),
            patientId: patientId,
            isUpcoming: false,
            onCancel: null,
            cancellingAppointmentIds: _cancellingAppointmentIds,
            reloadToken: _reloadToken,
          ),
        ],
      ),
      bottomNavigationBar:
          const PatientBottomNav(currentRoute: '/patient/bookings'),
    );
  }
}

class _AppointmentsList extends ConsumerStatefulWidget {
  final String patientId;
  final bool isUpcoming;
  final Function(String)? onCancel;
  final Set<String> cancellingAppointmentIds;
  final int reloadToken;

  const _AppointmentsList({
    super.key,
    required this.patientId,
    required this.isUpcoming,
    this.onCancel,
    this.cancellingAppointmentIds = const <String>{},
    this.reloadToken = 0,
  });

  @override
  ConsumerState<_AppointmentsList> createState() => _AppointmentsListState();
}

class _AppointmentsListState extends ConsumerState<_AppointmentsList> {
  late Future<_PatientBookingsData> _bookingsFuture;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _loadAppointments() {
    _bookingsFuture = _fetchBookings();
  }

  @override
  void didUpdateWidget(covariant _AppointmentsList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.reloadToken != widget.reloadToken) {
      _retry();
    }
  }

  Future<_PatientBookingsData> _fetchBookings() async {
    final appointmentService = ref.read(appointmentServiceProvider);
    final labService = ref.read(labServiceProvider);

    final appointmentsResponse =
        await appointmentService.getPatientAppointments(
      widget.patientId,
      upcoming: widget.isUpcoming,
    );

    if (!appointmentsResponse.success) {
      throw Exception(
        appointmentsResponse.error ?? 'Failed to load doctor appointments',
      );
    }

    final appointments = appointmentsResponse.data ?? <Appointment>[];

    List<LabOrder> allLabOrders = <LabOrder>[];
    try {
      allLabOrders = await labService.getMyLabOrders();
    } catch (_) {
      allLabOrders = <LabOrder>[];
    }

    final now = DateTime.now();

    DateTime? labOrderScheduledAt(LabOrder order) {
      final date = order.slotDate;
      if (date == null) return null;

      final raw = order.slotTime.trim();
      final match =
          RegExp(r'^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$').firstMatch(raw);

      if (match == null) {
        // Fallback to end of day if slot format is unexpected.
        return DateTime(date.year, date.month, date.day, 23, 59, 59);
      }

      var hour = int.tryParse(match.group(1) ?? '') ?? 0;
      final minute = int.tryParse(match.group(2) ?? '') ?? 0;
      final period = match.group(3)?.toUpperCase();

      if (period != null) {
        if (hour == 12) {
          hour = period == 'AM' ? 0 : 12;
        } else if (period == 'PM') {
          hour += 12;
        }
      }

      hour = hour.clamp(0, 23);
      final safeMinute = minute.clamp(0, 59);

      return DateTime(date.year, date.month, date.day, hour, safeMinute);
    }

    bool isLabUpcoming(LabOrder order) {
      final status = order.status.toLowerCase();
      if (status == 'cancelled' ||
          status == 'completed' ||
          status == 'report_ready') {
        return false;
      }
      final scheduledAt = labOrderScheduledAt(order);
      if (scheduledAt == null) {
        return true;
      }

      // Consider the order upcoming until the scheduled slot time has passed.
      return !scheduledAt.isBefore(now);
    }

    final filteredLabOrders = allLabOrders.where((order) {
      final upcoming = isLabUpcoming(order);
      return widget.isUpcoming ? upcoming : !upcoming;
    }).toList();

    return _PatientBookingsData(
      appointments: appointments,
      labOrders: filteredLabOrders,
    );
  }

  void _retry() {
    setState(() {
      _loadAppointments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return FutureBuilder(
      future: _bookingsFuture,
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
                  onPressed: _retry,
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        final bookings = snapshot.data;
        final appointments = bookings?.appointments ?? <Appointment>[];
        final labOrders = bookings?.labOrders ?? <LabOrder>[];

        // Split into upcoming vs past using date + start time
        DateTime appointmentDateTime(Appointment apt) {
          final base = apt.date;
          final raw = apt.timeSlot.start.trim();
          final match = RegExp(r'^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$')
              .firstMatch(raw);

          var hour = 0;
          var minute = 0;
          if (match != null) {
            hour = int.tryParse(match.group(1) ?? '') ?? 0;
            minute = int.tryParse(match.group(2) ?? '') ?? 0;
            final period = match.group(3)?.toUpperCase();

            if (period != null) {
              if (hour == 12) {
                hour = period == 'AM' ? 0 : 12;
              } else if (period == 'PM') {
                hour += 12;
              }
            }
          }

          hour = hour.clamp(0, 23);
          minute = minute.clamp(0, 59);
          return DateTime(base.year, base.month, base.day, hour, minute);
        }

        final now = DateTime.now();
        final filteredAppointments = appointments.where((apt) {
          final dt = appointmentDateTime(apt);
          final isUpcomingAppointment = dt.isAfter(now);
          final status = apt.status.toLowerCase();
          final isActiveStatus = status == 'pending' ||
              status == 'confirmed' ||
              status == 'in-progress';
          final isCancelled = status == 'cancelled';

          if (widget.isUpcoming) {
            // Upcoming: future + active status
            return isUpcomingAppointment && isActiveStatus;
          } else {
            // Past tab: include anything not upcoming, including cancelled
            return !isUpcomingAppointment || isCancelled;
          }
        }).toList();

        if (filteredAppointments.isEmpty && labOrders.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  widget.isUpcoming
                      ? Icons.calendar_today_outlined
                      : Icons.history_outlined,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                Text(
                  widget.isUpcoming
                      ? 'No upcoming appointments'
                      : 'No past appointments',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                if (widget.isUpcoming)
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: UIConstants.spacingMedium,
                    children: [
                      TextButton(
                        onPressed: () => context.go(AppRoutes.patientHome),
                        child: const Text('Book Doctor Appointment'),
                      ),
                      TextButton(
                        onPressed: () => context.push(AppRoutes.patientLabs),
                        child: const Text('Book Lab Test'),
                      ),
                    ],
                  ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            _retry();
          },
          child: ListView(
            padding: const EdgeInsets.all(UIConstants.spacingLarge),
            children: [
              if (filteredAppointments.isNotEmpty) ...[
                Text(
                  'Doctor Appointments',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                ...filteredAppointments.map((appointment) => Padding(
                      padding: const EdgeInsets.only(
                          bottom: UIConstants.spacingMedium),
                      child: _AppointmentCard(
                        appointment: appointment,
                        isUpcoming: widget.isUpcoming,
                        onCancel: widget.onCancel,
                        isCancelling: widget.cancellingAppointmentIds
                            .contains(appointment.id),
                      ),
                    )),
              ],
              if (labOrders.isNotEmpty) ...[
                if (filteredAppointments.isNotEmpty)
                  const SizedBox(height: UIConstants.spacingSmall),
                Text(
                  'Lab Test Bookings',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                ...labOrders.map((order) => Padding(
                      padding: const EdgeInsets.only(
                          bottom: UIConstants.spacingMedium),
                      child:
                          _LabOrderCard(key: ValueKey(order.id), order: order),
                    )),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _LabOrderCard extends ConsumerStatefulWidget {
  final LabOrder order;
  static const List<String> _previewTimelineStatuses = [
    'created',
    'confirmed',
    'sample_collected',
    'processing',
    'report_ready',
    'completed',
  ];

  const _LabOrderCard({super.key, required this.order});

  @override
  ConsumerState<_LabOrderCard> createState() => _LabOrderCardState();
}

class _LabOrderCardState extends ConsumerState<_LabOrderCard> {
  static const Duration _statusPollInterval = Duration(seconds: 15);
  late LabOrder _currentOrder;
  Timer? _pollTimer;
  bool _isPolling = false;

  @override
  void initState() {
    super.initState();
    _currentOrder = widget.order;
    _startPolling();
  }

  @override
  void didUpdateWidget(covariant _LabOrderCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.order.id != widget.order.id) {
      _currentOrder = widget.order;
      _stopPolling();
      _startPolling();
    }
  }

  @override
  void dispose() {
    _stopPolling();
    super.dispose();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(_statusPollInterval, (_) {
      _refreshOrderStatus();
    });
  }

  void _stopPolling() {
    _pollTimer?.cancel();
  }

  Future<void> _refreshOrderStatus() async {
    if (_isPolling || !mounted) return;
    _isPolling = true;

    try {
      final labService = ref.read(labServiceProvider);
      // Fetch fresh order details
      final ordersResponse = await labService.getMyLabOrders();

      if (ordersResponse.isNotEmpty && mounted) {
        // Find this specific order in the fresh list
        final updatedOrder = ordersResponse.firstWhere(
          (o) => o.id == _currentOrder.id,
          orElse: () => _currentOrder,
        );

        // Only rebuild if status actually changed
        if (updatedOrder.status != _currentOrder.status) {
          setState(() {
            _currentOrder = updatedOrder;
          });
        }
      }
    } catch (e) {
      // Silent fail - don't disrupt user experience
    } finally {
      _isPolling = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = _currentOrder;
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(order.status);
    final currentStatus = order.status.toLowerCase();
    final currentIndex = _statusIndex(currentStatus);
    final isCancelled = currentStatus == 'cancelled';

    final dateText = order.slotDate == null
        ? 'Date N/A'
        : '${order.slotDate!.day.toString().padLeft(2, '0')}/'
            '${order.slotDate!.month.toString().padLeft(2, '0')}/'
            '${order.slotDate!.year}';

    return InkWell(
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      onTap: () => context.push('${AppRoutes.labOrderDetails}?id=${order.id}'),
      child: Container(
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
                  Icon(Icons.science_outlined, size: 16, color: statusColor),
                  const SizedBox(width: 6),
                  Text(
                    _statusLabel(order.status).toUpperCase(),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'ID: ${order.id.substring(0, 8)}',
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
                  Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withOpacity(0.1),
                          borderRadius:
                              BorderRadius.circular(UIConstants.radiusMedium),
                        ),
                        child: Icon(
                          Icons.biotech_outlined,
                          color: theme.primaryColor,
                        ),
                      ),
                      const SizedBox(width: UIConstants.spacingMedium),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Lab Order',
                              style: theme.textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$dateText • ${order.slotTime}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: Colors.grey[700],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '₹${order.amount.toStringAsFixed(0)}',
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  if (isCancelled)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: UIConstants.spacingSmall,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.08),
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusSmall),
                        border: Border.all(color: Colors.red.withOpacity(0.2)),
                      ),
                      child: Text(
                        'Timeline: Cancelled',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.red[700],
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Progress',
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: _LabOrderCard._previewTimelineStatuses
                              .asMap()
                              .entries
                              .map(
                            (entry) {
                              final index = entry.key;
                              final completed =
                                  currentIndex >= 0 && index <= currentIndex;

                              return Expanded(
                                child: Row(
                                  children: [
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: completed
                                            ? theme.primaryColor
                                            : Colors.grey[300],
                                      ),
                                    ),
                                    if (index <
                                        _LabOrderCard._previewTimelineStatuses
                                                .length -
                                            1)
                                      Expanded(
                                        child: Container(
                                          margin: const EdgeInsets.symmetric(
                                              horizontal: 4),
                                          height: 2,
                                          color: completed
                                              ? theme.primaryColor
                                              : Colors.grey[300],
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ).toList(),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Current: ${_statusLabel(order.status)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  if (order.preparationInstructions.isNotEmpty) ...[
                    const SizedBox(height: UIConstants.spacingMedium),
                    Text(
                      'Preparation',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 6),
                    ...order.preparationInstructions.take(2).map(
                          (line) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('• '),
                                Expanded(
                                  child: Text(
                                    line,
                                    style: theme.textTheme.bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'created':
      case 'payment_pending':
        return Colors.orange;
      case 'confirmed':
      case 'collector_assigned':
      case 'collector_on_the_way':
      case 'sample_collected':
      case 'processing':
        return Colors.blue;
      case 'report_ready':
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'created':
        return 'Created';
      case 'payment_pending':
        return 'Payment Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'collector_assigned':
        return 'Collector Assigned';
      case 'collector_on_the_way':
        return 'Collector On The Way';
      case 'sample_collected':
        return 'Sample Collected';
      case 'processing':
        return 'Processing';
      case 'report_ready':
        return 'Report Ready';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  int _statusIndex(String status) {
    return _LabOrderCard._previewTimelineStatuses.indexOf(status.toLowerCase());
  }
}

class _AppointmentCard extends StatelessWidget {
  final Appointment appointment;
  final bool isUpcoming;
  final Function(String)? onCancel;
  final bool isCancelling;

  const _AppointmentCard({
    required this.appointment,
    required this.isUpcoming,
    this.onCancel,
    this.isCancelling = false,
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

  Color _getPaymentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return Colors.green;
      case 'failed':
        return Colors.red;
      case 'refunded':
        return Colors.deepPurple;
      default:
        return Colors.orange;
    }
  }

  String _getPaymentStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'PAID';
      case 'failed':
        return 'FAILED';
      case 'refunded':
        return 'REFUNDED';
      default:
        return 'PENDING';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(appointment.status);
    final statusIcon = _getStatusIcon(appointment.status);
    final paymentColor = _getPaymentStatusColor(appointment.paymentStatus);
    final paymentLabel = _getPaymentStatusLabel(appointment.paymentStatus);
    final canRetryPayment = isUpcoming &&
        appointment.status.toLowerCase() != 'cancelled' &&
        (appointment.paymentStatus.toLowerCase() == 'pending' ||
            appointment.paymentStatus.toLowerCase() == 'failed') &&
        appointment.amount > 0;

    return InkWell(
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      onTap: () {
        context.push(
          AppRoutes.patientAppointmentDetails,
          extra: {
            'appointment': appointment,
            'isUpcoming': isUpcoming,
          },
        );
      },
      child: Container(
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
                  const SizedBox(height: UIConstants.spacingSmall),
                  _DetailRow(
                    icon: Icons.currency_rupee,
                    label: 'Fee',
                    value: '₹${appointment.amount.toStringAsFixed(0)}',
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Row(
                    children: [
                      Icon(
                        Icons.receipt_long_outlined,
                        size: 18,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: UIConstants.spacingSmall),
                      Text(
                        'Payment: ',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: paymentColor.withOpacity(0.12),
                          borderRadius:
                              BorderRadius.circular(UIConstants.radiusRound),
                        ),
                        child: Text(
                          paymentLabel,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: paymentColor,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (appointment.symptoms != null) ...[
                    const SizedBox(height: UIConstants.spacingSmall),
                    _DetailRow(
                      icon: Icons.note_outlined,
                      label: 'Reason',
                      value: appointment.symptoms ?? '',
                    ),
                  ],

                  // Action Buttons for upcoming
                  if (isUpcoming &&
                      appointment.status.toLowerCase() != 'cancelled')
                    Padding(
                      padding:
                          const EdgeInsets.only(top: UIConstants.spacingMedium),
                      child: Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: !isCancelling && onCancel != null
                                  ? () => onCancel!(appointment.id)
                                  : null,
                              icon: isCancelling
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    )
                                  : const Icon(Icons.cancel_outlined, size: 18),
                              label: Text(
                                  isCancelling ? 'Cancelling...' : 'Cancel'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: const BorderSide(color: Colors.red),
                              ),
                            ),
                          ),
                          if (canRetryPayment) ...[
                            const SizedBox(height: UIConstants.spacingSmall),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  final doctorName =
                                      appointment.doctorId.userId?.name ??
                                          'Doctor';
                                  context.push(
                                    '${AppRoutes.patientPayment}?appointmentId=${appointment.id}&amount=${appointment.amount}&doctorName=${Uri.encodeComponent(doctorName)}',
                                  );
                                },
                                icon: const Icon(Icons.payment_outlined,
                                    size: 18),
                                label: const Text('Retry Payment'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.orange[800],
                                  side: BorderSide(color: Colors.orange[700]!),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                  // Write Review button for completed appointments
                  if (!isUpcoming &&
                      appointment.status.toLowerCase() == 'completed')
                    Padding(
                      padding:
                          const EdgeInsets.only(top: UIConstants.spacingMedium),
                      child: SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            final doctorName =
                                appointment.doctorId.userId?.name ?? 'Doctor';
                            context.push(
                              '${AppRoutes.writeReview}?appointmentId=${appointment.id}&doctorName=$doctorName',
                            );
                          },
                          icon:
                              const Icon(Icons.rate_review_outlined, size: 18),
                          label: const Text('Write a Review'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.amber[800],
                            side: BorderSide(color: Colors.amber[800]!),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
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
