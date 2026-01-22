import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/constants.dart';
import '../../providers/doctor_provider.dart';
import '../../models/appointment.dart';
import '../../widgets/doctor_bottom_nav.dart';

class DoctorPatientsScreen extends ConsumerStatefulWidget {
  const DoctorPatientsScreen({super.key});

  @override
  ConsumerState<DoctorPatientsScreen> createState() =>
      _DoctorPatientsScreenState();
}

class _DoctorPatientsScreenState extends ConsumerState<DoctorPatientsScreen> {
  final _searchController = TextEditingController();
  String _selectedFilter = 'all'; // all, active, inactive

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doctorState = ref.watch(doctorProvider);
    // Derive unique patients from appointments
    final Map<String, List<DoctorAppointment>> byPatient = {};
    for (final apt in doctorState.appointments) {
      byPatient.putIfAbsent(apt.patientId.id, () => []).add(apt);
    }
    // Build list of patient info with stats
    final patients = byPatient.entries.map((e) {
      final appts = e.value;
      appts.sort((a, b) => a.date.compareTo(b.date));
      final last = appts.isNotEmpty ? appts.last.date : null;
      return (
        id: e.key,
        info: appts.first.patientId,
        lastVisit: last,
        visitCount: appts.length,
      );
    }).where((p) {
      final q = _searchController.text.trim().toLowerCase();
      return q.isEmpty || (p.info.name?.toLowerCase().contains(q) ?? false);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Patients'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search and Filter
            Padding(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              child: Column(
                children: [
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Search patients...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: UIConstants.spacingMedium,
                        vertical: UIConstants.spacingSmall,
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  // Filter Chips (placeholder for future active/inactive)
                  Row(
                    children: [
                      _FilterChip(
                        label: 'All',
                        isSelected: _selectedFilter == 'all',
                        onTap: () => setState(() => _selectedFilter = 'all'),
                      ),
                      const SizedBox(width: UIConstants.spacingSmall),
                      _FilterChip(
                        label: 'Active',
                        isSelected: _selectedFilter == 'active',
                        onTap: () => setState(() => _selectedFilter = 'active'),
                      ),
                      const SizedBox(width: UIConstants.spacingSmall),
                      _FilterChip(
                        label: 'Inactive',
                        isSelected: _selectedFilter == 'inactive',
                        onTap: () =>
                            setState(() => _selectedFilter = 'inactive'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Patients List
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await ref.read(doctorProvider.notifier).fetchProfile();
                },
                child: patients.isEmpty
                    ? ListView(
                        padding: const EdgeInsets.all(UIConstants.spacingLarge),
                        children: const [
                          Center(child: Text('No patients yet')),
                        ],
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(
                          horizontal: UIConstants.spacingLarge,
                          vertical: UIConstants.spacingMedium,
                        ),
                        itemCount: patients.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: UIConstants.spacingMedium),
                        itemBuilder: (context, index) {
                          final p = patients[index];
                          final lastVisit = p.lastVisit != null
                              ? '${p.lastVisit!.day}/${p.lastVisit!.month}/${p.lastVisit!.year}'
                              : 'N/A';
                          return _PatientCard(
                            patientName: p.info.name ?? 'Patient',
                            phone: p.info.phone ?? 'N/A',
                            lastVisit: lastVisit,
                            visitCount: p.visitCount.toString(),
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                builder: (context) {
                                  return Padding(
                                    padding: const EdgeInsets.all(
                                        UIConstants.spacingLarge),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          p.info.name ?? 'Patient',
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleMedium
                                              ?.copyWith(
                                                  fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(
                                            height: UIConstants.spacingSmall),
                                        Text('Phone: ${p.info.phone ?? 'N/A'}'),
                                        const SizedBox(
                                            height: UIConstants.spacingSmall),
                                        Text('Last visit: $lastVisit'),
                                        const SizedBox(
                                            height: UIConstants.spacingSmall),
                                        Text('Total visits: ${p.visitCount}'),
                                        const SizedBox(
                                            height: UIConstants.spacingLarge),
                                        Align(
                                          alignment: Alignment.centerRight,
                                          child: ElevatedButton(
                                            onPressed: () =>
                                                Navigator.pop(context),
                                            child: const Text('Close'),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
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
      bottomNavigationBar: const DoctorBottomNav(
        currentRoute: '/doctor/patients',
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusLarge),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.spacingMedium,
          vertical: UIConstants.spacingSmall,
        ),
        decoration: BoxDecoration(
          color: isSelected ? theme.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(UIConstants.radiusLarge),
          border: Border.all(
            color: isSelected ? theme.primaryColor : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _PatientCard extends StatelessWidget {
  final String patientName;
  final String phone;
  final String lastVisit;
  final String visitCount;
  final VoidCallback onTap;

  const _PatientCard({
    required this.patientName,
    required this.phone,
    required this.lastVisit,
    required this.visitCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      child: Container(
        padding: const EdgeInsets.all(UIConstants.spacingMedium),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        ),
        child: Row(
          children: [
            // Patient Avatar
            CircleAvatar(
              radius: 28,
              backgroundColor: theme.primaryColor.withOpacity(0.2),
              child: Icon(
                Icons.person,
                color: theme.primaryColor,
                size: 32,
              ),
            ),
            const SizedBox(width: UIConstants.spacingMedium),

            // Patient Info
            Expanded(
              child: Column(
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
                    phone,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 14,
                        color: Colors.grey[500],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Last visit: $lastVisit',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Visit Count Badge
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: UIConstants.spacingSmall,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                children: [
                  Text(
                    visitCount,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  Text(
                    'visits',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 10,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: UIConstants.spacingSmall),
            Icon(
              Icons.chevron_right,
              color: Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }
}
