import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/lab_bottom_nav.dart';

class LabReportsScreen extends ConsumerStatefulWidget {
  const LabReportsScreen({super.key});

  @override
  ConsumerState<LabReportsScreen> createState() => _LabReportsScreenState();
}

class _LabReportsScreenState extends ConsumerState<LabReportsScreen> {
  late Future<List<LabOrder>> _reportsFuture;

  @override
  void initState() {
    super.initState();
    _reportsFuture = _fetchReportOrders();
  }

  Future<List<LabOrder>> _fetchReportOrders() async {
    final orders = await ref.read(labServiceProvider).getLabProviderOrders(
          status: 'all',
          limit: 100,
        );
    return orders
        .where((o) =>
            o.status == 'processing' ||
            o.status == 'report_ready' ||
            o.status == 'completed')
        .toList();
  }

  Future<void> _refresh() async {
    final next = _fetchReportOrders();
    setState(() {
      _reportsFuture = next;
    });
    await next;
  }

  Future<void> _uploadReport(LabOrder order) async {
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const <String>['pdf'],
      withData: false,
    );

    final path = picked?.files.single.path;
    if (path == null || path.isEmpty) return;

    final response = await ref
        .read(labServiceProvider)
        .uploadLabProviderReport(order.id, filePath: path);

    if (!mounted) return;

    if (response == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to upload report'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Report uploaded successfully'),
        backgroundColor: Colors.green,
      ),
    );

    await _refresh();
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
        title: const Text('Reports'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<List<LabOrder>>(
            future: _reportsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError) {
                return ListView(
                  children: const [
                    SizedBox(height: 180),
                    Center(child: Text('Failed to load report queue')),
                  ],
                );
              }

              final orders = snapshot.data ?? <LabOrder>[];
              if (orders.isEmpty) {
                return ListView(
                  children: const [
                    SizedBox(height: 180),
                    Center(child: Text('No report-related orders yet')),
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
                  final canUpload = order.status == 'processing';

                  return Card(
                    child: ListTile(
                      title: Text(order.patientProfile?.name ?? 'Patient'),
                      subtitle: Text(_statusLabel(order.status)),
                      trailing: canUpload
                          ? TextButton(
                              onPressed: () => _uploadReport(order),
                              child: const Text('Upload PDF'),
                            )
                          : const Icon(Icons.description_outlined),
                      onTap: () => context.push(
                        '${AppRoutes.labProviderOrderDetails}?id=${order.id}',
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ),
      bottomNavigationBar:
          const LabBottomNav(currentRoute: AppRoutes.labReports),
    );
  }
}
