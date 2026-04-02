import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../providers/providers.dart';

class LabOrderDetailsScreen extends ConsumerStatefulWidget {
  final String orderId;

  const LabOrderDetailsScreen({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<LabOrderDetailsScreen> createState() =>
      _LabOrderDetailsScreenState();
}

class _LabOrderDetailsScreenState extends ConsumerState<LabOrderDetailsScreen> {
  static const Duration _autoRefreshInterval = Duration(seconds: 20);

  late Future<LabOrder?> _orderFuture;
  Timer? _autoRefreshTimer;
  bool _isAutoRefreshing = false;
  final List<String> _timelineStatuses = const [
    'created',
    'confirmed',
    'collector_assigned',
    'collector_on_the_way',
    'sample_collected',
    'processing',
    'report_ready',
    'completed',
  ];

  @override
  void initState() {
    super.initState();
    _orderFuture = ref.read(labServiceProvider).getLabOrderById(widget.orderId);
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  bool _isTerminalStatus(String status) {
    final normalized = status.toLowerCase();
    return normalized == 'completed' || normalized == 'cancelled';
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(_autoRefreshInterval, (_) {
      _refreshOrderSilently();
    });
  }

  Future<void> _refreshOrderSilently() async {
    if (_isAutoRefreshing) return;
    _isAutoRefreshing = true;

    try {
      final latest =
          await ref.read(labServiceProvider).getLabOrderById(widget.orderId);
      if (!mounted || latest == null) return;

      setState(() {
        _orderFuture = Future<LabOrder?>.value(latest);
      });

      if (_isTerminalStatus(latest.status)) {
        _autoRefreshTimer?.cancel();
      }
    } finally {
      _isAutoRefreshing = false;
    }
  }

  bool _canCancel(String status) {
    final s = status.toLowerCase();
    return s == 'created' || s == 'payment_pending' || s == 'confirmed';
  }

  String _statusLabel(String status) {
    switch (status) {
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
    return _timelineStatuses.indexOf(status.toLowerCase());
  }

  Future<void> _cancelOrder(LabOrder order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Lab Booking'),
        content: const Text(
          'Are you sure you want to cancel this lab booking?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('No'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final result = await ref.read(labServiceProvider).cancelLabOrder(order.id);
    if (!mounted) return;

    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to cancel booking')),
      );
      return;
    }

    setState(() {
      _orderFuture = Future<LabOrder?>.value(result);
    });

    if (_isTerminalStatus(result.status)) {
      _autoRefreshTimer?.cancel();
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Lab booking cancelled successfully')),
    );
  }

  Future<void> _openPrescription(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _openReport(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Booking Details'),
      ),
      body: FutureBuilder<LabOrder?>(
        future: _orderFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError || snapshot.data == null) {
            return const Center(child: Text('Unable to load booking details'));
          }

          final order = snapshot.data!;
          final currentStatus = order.status.toLowerCase();
          final currentIndex = _statusIndex(currentStatus);
          final isCancelled = currentStatus == 'cancelled';

          return ListView(
            padding: const EdgeInsets.all(UIConstants.spacingLarge),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              order.lab?.name ?? 'Lab Order',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: UIConstants.spacingMedium,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: theme.primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              _statusLabel(order.status),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.primaryColor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: UIConstants.spacingSmall),
                      Text('Order ID: ${order.id}'),
                      Text(
                        'Amount: ₹${order.amount.toStringAsFixed(0)}',
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Booking Timeline',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: UIConstants.spacingMedium),
                      if (isCancelled)
                        Container(
                          width: double.infinity,
                          padding:
                              const EdgeInsets.all(UIConstants.spacingMedium),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.08),
                            borderRadius:
                                BorderRadius.circular(UIConstants.radiusMedium),
                            border:
                                Border.all(color: Colors.red.withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.cancel, color: Colors.red),
                              const SizedBox(width: UIConstants.spacingSmall),
                              Expanded(
                                child: Text(
                                  'This booking was cancelled.',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: Colors.red[700],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        ..._timelineStatuses.asMap().entries.map((entry) {
                          final index = entry.key;
                          final stepStatus = entry.value;
                          final completed =
                              currentIndex >= 0 && index <= currentIndex;
                          final isCurrent = currentIndex == index;
                          final color = isCurrent
                              ? theme.primaryColor
                              : completed
                                  ? Colors.green
                                  : Colors.grey;

                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: color.withOpacity(0.14),
                                      border:
                                          Border.all(color: color, width: 2),
                                    ),
                                    child: Icon(
                                      completed ? Icons.check : Icons.circle,
                                      size: completed ? 12 : 8,
                                      color: color,
                                    ),
                                  ),
                                  if (index < _timelineStatuses.length - 1)
                                    Container(
                                      width: 2,
                                      height: 24,
                                      color: completed
                                          ? Colors.green
                                          : Colors.grey[300],
                                    ),
                                ],
                              ),
                              const SizedBox(width: UIConstants.spacingMedium),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 1),
                                  child: Text(
                                    _statusLabel(stepStatus),
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      fontWeight: isCurrent
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: isCurrent
                                          ? theme.primaryColor
                                          : completed
                                              ? Colors.green[700]
                                              : Colors.grey[700],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Collection Details',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: UIConstants.spacingSmall),
                      Text(
                          'Date: ${order.slotDate?.toLocal().toString().split(' ').first ?? 'N/A'}'),
                      Text('Time: ${order.slotTime}'),
                      Text(
                          'Type: ${order.homeCollection ? 'Home Collection' : 'Lab Visit'}'),
                      if (order.address != null && order.address!.isNotEmpty)
                        Text('Address: ${order.address}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Patient Profile',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: UIConstants.spacingSmall),
                      Text('Name: ${order.patientProfile?.name ?? 'N/A'}'),
                      Text('Age: ${order.patientProfile?.age ?? 'N/A'}'),
                      Text('Gender: ${order.patientProfile?.gender ?? 'N/A'}'),
                      if (order.patientProfile?.relationship != null)
                        Text(
                            'Relationship: ${order.patientProfile!.relationship}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Selected Tests / Packages',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: UIConstants.spacingSmall),
                      ...order.items.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                Expanded(
                                  child:
                                      Text('${item.name} (${item.itemType})'),
                                ),
                                Text('₹${item.price.toStringAsFixed(0)}'),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
              ),
              if (order.preparationInstructions.isNotEmpty) ...[
                const SizedBox(height: UIConstants.spacingMedium),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(UIConstants.spacingLarge),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Preparation Instructions',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingSmall),
                        ...order.preparationInstructions.map(
                          (line) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('• '),
                                Expanded(child: Text(line)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              if (order.prescriptionUrl != null &&
                  order.prescriptionUrl!.isNotEmpty) ...[
                const SizedBox(height: UIConstants.spacingMedium),
                OutlinedButton.icon(
                  onPressed: () => _openPrescription(order.prescriptionUrl!),
                  icon: const Icon(Icons.description_outlined),
                  label: const Text('View Prescription'),
                ),
              ],
              const SizedBox(height: UIConstants.spacingMedium),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lab Report',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: UIConstants.spacingSmall),
                      if (order.reportUrl != null &&
                          order.reportUrl!.isNotEmpty)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (order.reportUploadedAt != null)
                              Text(
                                'Uploaded on: ${order.reportUploadedAt!.toLocal().toString().split('.').first}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[700],
                                ),
                              ),
                            if (order.reportUploadedAt != null)
                              const SizedBox(height: UIConstants.spacingSmall),
                            OutlinedButton.icon(
                              onPressed: () => _openReport(order.reportUrl!),
                              icon: const Icon(Icons.download_outlined),
                              label: const Text('View Report'),
                            ),
                          ],
                        )
                      else
                        Text(
                          order.status == 'report_ready' ||
                                  order.status == 'completed'
                              ? 'Report should be available soon.'
                              : 'Report is not ready yet.',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[700],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              if (_canCancel(order.status))
                ElevatedButton.icon(
                  onPressed: () => _cancelOrder(order),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Cancel Booking'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
