import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/patient_bottom_nav.dart';

class LabSearchScreen extends ConsumerStatefulWidget {
  const LabSearchScreen({super.key});

  @override
  ConsumerState<LabSearchScreen> createState() => _LabSearchScreenState();
}

class _LabSearchScreenState extends ConsumerState<LabSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  bool _isLoading = false;
  String? _error;
  List<LabSummary> _labs = <LabSummary>[];

  @override
  void initState() {
    super.initState();
    _loadLabs();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadLabs({String? search}) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final service = ref.read(labServiceProvider);
      final data = await service.listLabs(search: search);
      if (!mounted) return;
      setState(() {
        _labs = data;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Failed to load labs';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      final query = value.trim();
      if (query.isNotEmpty) {
        _loadLabs(search: query);
      } else {
        _loadLabs();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Tests & Packages'),
      ),
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: InputDecoration(
                  hintText: 'Search by lab name, city, state, or pincode',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            _loadLabs();
                          },
                        )
                      : null,
                ),
              ),
            ),
            if (_isLoading)
              const Expanded(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              Expanded(
                child: Center(
                  child: Text(
                    _error!,
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
              )
            else
              Expanded(
                child: _labs.isEmpty
                    ? const Center(child: Text('No labs available'))
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(
                          horizontal: UIConstants.spacingLarge,
                          vertical: UIConstants.spacingMedium,
                        ),
                        itemCount: _labs.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: UIConstants.spacingMedium),
                        itemBuilder: (context, index) {
                          final lab = _labs[index];
                          return Card(
                            child: ListTile(
                              title: Text(lab.name),
                              subtitle: Text(
                                '${lab.address.city}, ${lab.address.state}\n⭐ ${lab.rating.toStringAsFixed(1)}${lab.isNablCertified ? ' • NABL' : ''}',
                              ),
                              isThreeLine: true,
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                context.push(
                                    '${AppRoutes.labBooking}?labId=${lab.id}');
                              },
                            ),
                          );
                        },
                      ),
              ),
          ],
        ),
      ),
      bottomNavigationBar:
          const PatientBottomNav(currentRoute: '/patient/search'),
    );
  }
}
