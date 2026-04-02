import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/lab_bottom_nav.dart';

class LabDashboardScreen extends ConsumerStatefulWidget {
  const LabDashboardScreen({super.key});

  @override
  ConsumerState<LabDashboardScreen> createState() => _LabDashboardScreenState();
}

class _LabDashboardScreenState extends ConsumerState<LabDashboardScreen> {
  late Future<LabProviderDashboard?> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = ref.read(labServiceProvider).getLabProviderDashboard();
  }

  Future<void> _refresh() async {
    final next = ref.read(labServiceProvider).getLabProviderDashboard();
    setState(() {
      _dashboardFuture = next;
    });
    await next;
  }

  Widget _statCard(BuildContext context, String label, String value,
      IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: UIConstants.spacingSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
          ),
          const SizedBox(height: 2),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    return status
        .replaceAll('_', ' ')
        .split(' ')
        .map((p) => p.isEmpty ? p : '${p[0].toUpperCase()}${p.substring(1)}')
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Dashboard'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<LabProviderDashboard?>(
            future: _dashboardFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError || snapshot.data == null) {
                return ListView(
                  children: const [
                    SizedBox(height: 200),
                    Center(child: Text('Unable to load lab dashboard')),
                  ],
                );
              }

              final dashboard = snapshot.data!;
              final stats = dashboard.stats;

              return ListView(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                children: [
                  Text(
                    dashboard.lab?.name ?? 'My Lab',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Text(
                    dashboard.lab?.isNablCertified == true
                        ? 'NABL Certified'
                        : 'Verification in progress',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[700],
                        ),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: UIConstants.spacingMedium,
                    mainAxisSpacing: UIConstants.spacingMedium,
                    physics: const NeverScrollableScrollPhysics(),
                    shrinkWrap: true,
                    childAspectRatio: 1.55,
                    children: [
                      _statCard(context, 'Total Orders', '${stats.totalOrders}',
                          Icons.receipt_long, Colors.blue),
                      _statCard(context, 'Pending', '${stats.pendingOrders}',
                          Icons.pending_actions, Colors.orange),
                      _statCard(
                          context,
                          'In Progress',
                          '${stats.inProgressOrders}',
                          Icons.biotech,
                          Colors.indigo),
                      _statCard(
                          context,
                          'Reports Ready',
                          '${stats.reportsReady}',
                          Icons.description,
                          Colors.green),
                    ],
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _statCard(
                    context,
                    'Total Revenue',
                    '₹${stats.totalRevenue.toStringAsFixed(0)}',
                    Icons.currency_rupee,
                    Colors.purple,
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Orders',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      TextButton(
                        onPressed: () => context.go(AppRoutes.labOrders),
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  if (dashboard.recentOrders.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(UIConstants.spacingLarge),
                        child: Text('No orders yet.'),
                      ),
                    )
                  else
                    ...dashboard.recentOrders.map(
                      (order) => Card(
                        child: ListTile(
                          title: Text(order.patientProfile?.name ?? 'Patient'),
                          subtitle: Text(
                              '₹${order.amount.toStringAsFixed(0)} • ${_statusLabel(order.status)}'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => context.push(
                            '${AppRoutes.labProviderOrderDetails}?id=${order.id}',
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
      bottomNavigationBar:
          const LabBottomNav(currentRoute: AppRoutes.labDashboard),
    );
  }
}
