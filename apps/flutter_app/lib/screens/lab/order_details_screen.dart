import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  static const Map<String, List<String>> _statusTransitions = {
    'created': ['payment_pending', 'confirmed', 'cancelled'],
    'payment_pending': ['confirmed', 'cancelled'],
    'confirmed': ['collector_assigned', 'cancelled'],
    'collector_assigned': ['collector_on_the_way', 'cancelled'],
    'collector_on_the_way': ['sample_collected', 'cancelled'],
    'sample_collected': ['processing', 'cancelled'],
    'processing': ['report_ready', 'cancelled'],
    'report_ready': ['completed'],
    'completed': [],
    'cancelled': [],
  };

  late Future<LabOrder?> _orderFuture;
  String? _nextStatus;
  final _collectorNameController = TextEditingController();
  final _collectorPhoneController = TextEditingController();
  bool _isSavingStatus = false;
  bool _isAssigningCollector = false;
  bool _isUploadingReport = false;
  bool _isEscalating = false;

  @override
  void initState() {
    super.initState();
    _orderFuture =
        ref.read(labServiceProvider).getLabProviderOrderById(widget.orderId);
  }

  @override
  void dispose() {
    _collectorNameController.dispose();
    _collectorPhoneController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    final next =
        ref.read(labServiceProvider).getLabProviderOrderById(widget.orderId);
    setState(() {
      _orderFuture = next;
    });
    await next;
  }

  String _statusLabel(String status) {
    return status
        .replaceAll('_', ' ')
        .split(' ')
        .map((p) => p.isEmpty ? p : '${p[0].toUpperCase()}${p.substring(1)}')
        .join(' ');
  }

  List<String> _buildStatusOptions(String currentStatus) {
    final allowedNext = _statusTransitions[currentStatus] ?? const <String>[];
    return <String>{currentStatus, ...allowedNext}.toList();
  }

  Future<void> _updateStatus(LabOrder order) async {
    if (_nextStatus == null || _nextStatus == order.status) return;

    setState(() => _isSavingStatus = true);
    final updated =
        await ref.read(labServiceProvider).updateLabProviderOrderStatus(
              order.id,
              _nextStatus!,
            );
    if (!mounted) return;
    setState(() => _isSavingStatus = false);

    if (updated == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Failed to update status'),
            backgroundColor: Colors.red),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Order status updated'), backgroundColor: Colors.green),
    );
    await _refresh();
  }

  Future<void> _assignCollector(LabOrder order) async {
    final name = _collectorNameController.text.trim();
    final phone = _collectorPhoneController.text.trim();
    if (name.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Collector name and phone are required')),
      );
      return;
    }

    setState(() => _isAssigningCollector = true);
    final updated =
        await ref.read(labServiceProvider).assignLabProviderCollector(
              order.id,
              collectorName: name,
              collectorPhone: phone,
            );
    if (!mounted) return;
    setState(() => _isAssigningCollector = false);

    if (updated == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Failed to assign collector'),
            backgroundColor: Colors.red),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Collector assigned'), backgroundColor: Colors.green),
    );
    await _refresh();
  }

  Future<void> _uploadReport(LabOrder order) async {
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const <String>['pdf'],
      withData: false,
    );
    final path = picked?.files.single.path;
    if (path == null || path.isEmpty) return;

    setState(() => _isUploadingReport = true);
    final updated = await ref.read(labServiceProvider).uploadLabProviderReport(
          order.id,
          filePath: path,
        );
    if (!mounted) return;
    setState(() => _isUploadingReport = false);

    if (updated == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Failed to upload report'),
            backgroundColor: Colors.red),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Report uploaded successfully'),
          backgroundColor: Colors.green),
    );
    await _refresh();
  }

  Future<void> _escalateOrder(LabOrder order) async {
    final reasonController = TextEditingController();
    bool isSubmitting = false;

    final reason = await showDialog<String>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Escalate to Admin'),
          content: TextField(
            controller: reasonController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Explain why admin override is needed',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed:
                  isSubmitting ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () {
                      final text = reasonController.text.trim();
                      if (text.length < 5) {
                        ScaffoldMessenger.of(this.context).showSnackBar(
                          const SnackBar(
                            content: Text('Please enter at least 5 characters'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }
                      setDialogState(() => isSubmitting = true);
                      Navigator.of(dialogContext).pop(text);
                    },
              child: const Text('Escalate'),
            ),
          ],
        ),
      ),
    );

    if (!mounted || reason == null || reason.trim().length < 5) return;

    setState(() => _isEscalating = true);
    final updated = await ref.read(labServiceProvider).escalateLabProviderOrder(
          order.id,
          escalationReason: reason,
        );

    if (!mounted) return;
    setState(() => _isEscalating = false);

    if (updated == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to escalate order'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Order escalated to admin support'),
        backgroundColor: Colors.green,
      ),
    );
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lab Order Details')),
      body: SafeArea(
        child: FutureBuilder<LabOrder?>(
          future: _orderFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError || snapshot.data == null) {
              return const Center(child: Text('Unable to load order details'));
            }

            final order = snapshot.data!;
            final canAssignCollector = order.status == 'confirmed' ||
                order.status == 'collector_assigned';
            final canUploadReport = order.status == 'processing';
            final isEscalated = order.adminOverride?.isEscalated == true;
            final escalationReason = order.adminOverride?.escalationReason;
            final statusOptions = _buildStatusOptions(order.status);

            _nextStatus ??= order.status;
            if (!statusOptions.contains(_nextStatus)) {
              _nextStatus = order.status;
            }

            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Order #${order.id.substring(0, 8)}',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                              'Patient: ${order.patientProfile?.name ?? 'N/A'}'),
                          Text('Status: ${_statusLabel(order.status)}'),
                          Text('Amount: ₹${order.amount.toStringAsFixed(0)}'),
                          Text(
                              'Slot: ${order.slotDate?.toLocal().toString().split(' ').first ?? 'N/A'} • ${order.slotTime}'),
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
                            'Update Status',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          DropdownButtonFormField<String>(
                            value: _nextStatus,
                            items: statusOptions
                                .map((status) => DropdownMenuItem<String>(
                                      value: status,
                                      child: Text(_statusLabel(status)),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              if (value == null) return;
                              setState(() => _nextStatus = value);
                            },
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          ElevatedButton(
                            onPressed: _isSavingStatus
                                ? null
                                : () => _updateStatus(order),
                            child: Text(_isSavingStatus
                                ? 'Updating...'
                                : 'Update Status'),
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
                            'Collector',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          if (order.collector != null) ...[
                            Text('Name: ${order.collector!.name}'),
                            Text('Phone: ${order.collector!.phone}'),
                            const SizedBox(height: UIConstants.spacingSmall),
                          ],
                          TextField(
                            controller: _collectorNameController,
                            decoration: const InputDecoration(
                              labelText: 'Collector Name',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          TextField(
                            controller: _collectorPhoneController,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(
                              labelText: 'Collector Phone',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          ElevatedButton(
                            onPressed:
                                canAssignCollector && !_isAssigningCollector
                                    ? () => _assignCollector(order)
                                    : null,
                            child: Text(_isAssigningCollector
                                ? 'Saving...'
                                : 'Assign Collector'),
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
                            'Admin Support Escalation',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          if (isEscalated)
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(
                                  UIConstants.spacingSmall),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(
                                  UIConstants.radiusSmall,
                                ),
                                border: Border.all(
                                  color: Colors.orange.withOpacity(0.3),
                                ),
                              ),
                              child: Text(
                                escalationReason == null ||
                                        escalationReason.trim().isEmpty
                                    ? 'This order is already escalated.'
                                    : 'Escalated reason: $escalationReason',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: Colors.orange[900]),
                              ),
                            )
                          else
                            ElevatedButton.icon(
                              onPressed: _isEscalating
                                  ? null
                                  : () => _escalateOrder(order),
                              icon: _isEscalating
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.support_agent),
                              label: Text(_isEscalating
                                  ? 'Escalating...'
                                  : 'Escalate to Admin'),
                            ),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Text(
                            'Report',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          if (order.reportUrl != null)
                            const Text(
                                'Report already uploaded for this order.'),
                          const SizedBox(height: UIConstants.spacingSmall),
                          ElevatedButton(
                            onPressed: canUploadReport && !_isUploadingReport
                                ? () => _uploadReport(order)
                                : null,
                            child: Text(_isUploadingReport
                                ? 'Uploading...'
                                : 'Upload PDF Report'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
