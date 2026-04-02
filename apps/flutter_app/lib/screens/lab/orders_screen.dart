import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/lab_bottom_nav.dart';

class LabOrdersScreen extends ConsumerStatefulWidget {
  const LabOrdersScreen({super.key});

  @override
  ConsumerState<LabOrdersScreen> createState() => _LabOrdersScreenState();
}

class _LabOrdersScreenState extends ConsumerState<LabOrdersScreen> {
  static const List<String> _statuses = [
    'all',
    'created',
    'payment_pending',
    'confirmed',
    'collector_assigned',
    'collector_on_the_way',
    'sample_collected',
    'processing',
    'report_ready',
    'completed',
    'cancelled',
  ];

  String _status = 'all';
  late Future<List<LabOrder>> _ordersFuture;

  @override
  void initState() {
    super.initState();
    _ordersFuture = _fetchOrders();
  }

  Future<List<LabOrder>> _fetchOrders() {
    return ref.read(labServiceProvider).getLabProviderOrders(status: _status);
  }

  String _statusLabel(String status) {
    return status
        .replaceAll('_', ' ')
        .split(' ')
        .map((p) => p.isEmpty ? p : '${p[0].toUpperCase()}${p.substring(1)}')
        .join(' ');
  }

  Future<void> _refresh() async {
    final next = _fetchOrders();
    setState(() {
      _ordersFuture = next;
    });
    await next;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Orders'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.spacingLarge,
                UIConstants.spacingMedium,
                UIConstants.spacingLarge,
                0,
              ),
              child: DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(
                  labelText: 'Filter by status',
                  border: OutlineInputBorder(),
                ),
                items: _statuses
                    .map((status) => DropdownMenuItem<String>(
                          value: status,
                          child: Text(_statusLabel(status)),
                        ))
                    .toList(),
                onChanged: (value) {
                  if (value == null) return;
                  setState(() {
                    _status = value;
                    _ordersFuture = _fetchOrders();
                  });
                },
              ),
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _refresh,
                child: FutureBuilder<List<LabOrder>>(
                  future: _ordersFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (snapshot.hasError) {
                      return ListView(
                        children: const [
                          SizedBox(height: 180),
                          Center(child: Text('Failed to load orders')),
                        ],
                      );
                    }

                    final orders = snapshot.data ?? <LabOrder>[];
                    if (orders.isEmpty) {
                      return ListView(
                        children: const [
                          SizedBox(height: 180),
                          Center(child: Text('No orders found')),
                        ],
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      itemCount: orders.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: UIConstants.spacingSmall),
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        final isEscalated =
                            order.adminOverride?.isEscalated ?? false;

                        return Stack(
                          children: [
                            Card(
                              child: ListTile(
                                title: Text(
                                    order.patientProfile?.name ?? 'Patient'),
                                subtitle: Text(
                                  '${order.slotDate?.toLocal().toString().split(' ').first ?? 'N/A'} • ${_statusLabel(order.status)}',
                                ),
                                trailing: Text(
                                  '₹${order.amount.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                onTap: () => context.push(
                                  '${AppRoutes.labProviderOrderDetails}?id=${order.id}',
                                ),
                              ),
                            ),
                            if (isEscalated)
                              Positioned(
                                top: 0,
                                right: 0,
                                child: Tooltip(
                                  message:
                                      order.adminOverride?.escalationReason ??
                                          'Order escalated to admin',
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: const BoxDecoration(
                                      color: Colors.orange,
                                      borderRadius: BorderRadius.only(
                                        topRight: Radius.circular(4),
                                        bottomLeft: Radius.circular(8),
                                      ),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.warning_amber,
                                          size: 14,
                                          color: Colors.white,
                                        ),
                                        SizedBox(width: 4),
                                        Text(
                                          'Escalated',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar:
          const LabBottomNav(currentRoute: AppRoutes.labOrders),
    );
  }
}
