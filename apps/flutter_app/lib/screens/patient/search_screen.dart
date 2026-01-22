import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/providers.dart';
import '../../config/constants.dart';
import '../../widgets/doctor_card.dart';
import '../../widgets/patient_bottom_nav.dart';
import '../../models/doctor.dart';
import 'package:go_router/go_router.dart';
import '../../navigation/app_router.dart';

class PatientSearchScreen extends ConsumerStatefulWidget {
  const PatientSearchScreen({super.key});

  @override
  ConsumerState<PatientSearchScreen> createState() =>
      _PatientSearchScreenState();
}

class _PatientSearchScreenState extends ConsumerState<PatientSearchScreen> {
  final _searchController = TextEditingController();
  String? selectedSpecialization;
  String? selectedSortBy = 'rating';
  double? minFee;
  double? maxFee;
  double minRating = 0;
  List<String> availableSpecializations = [];

  @override
  void initState() {
    super.initState();
    _loadSpecializations();
  }

  Future<void> _loadSpecializations() async {
    try {
      final doctors = await ref.read(doctorServiceProvider).listDoctors();
      final specs = doctors.map((d) => d.specialization).toSet().toList()
        ..sort();
      setState(() {
        availableSpecializations = specs;
      });
    } catch (e) {
      // Handle error silently
    }
  }

  final List<String> sortOptions = [
    'rating',
    'experience',
    'fee_low_to_high',
    'fee_high_to_low',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doctorService = ref.read(doctorServiceProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Doctors'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search and Filter Section
            Padding(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              child: Column(
                children: [
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Search by name, specialization...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {});
                              },
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusMedium),
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  // Filters Row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FilterButton(
                          label: 'Specialization',
                          icon: Icons.medical_services_outlined,
                          onTap: () => _showSpecializationFilter(context),
                          isActive: selectedSpecialization != null,
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        _FilterButton(
                          label: 'Sort',
                          icon: Icons.sort,
                          onTap: () => _showSortOptions(context),
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        _FilterButton(
                          label: 'Rating',
                          icon: Icons.star_rounded,
                          onTap: () => _showRatingFilter(context),
                          isActive: minRating > 0,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Active Filters Display
            if (selectedSpecialization != null ||
                minRating > 0 ||
                minFee != null ||
                maxFee != null)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: UIConstants.spacingLarge,
                ),
                child: Wrap(
                  spacing: UIConstants.spacingSmall,
                  children: [
                    if (selectedSpecialization != null)
                      _FilterChip(
                        label: selectedSpecialization!,
                        onRemove: () => setState(() {
                          selectedSpecialization = null;
                        }),
                      ),
                    if (minRating > 0)
                      _FilterChip(
                        label: '★ ${minRating.toStringAsFixed(1)}+',
                        onRemove: () => setState(() {
                          minRating = 0;
                        }),
                      ),
                    if (minFee != null || maxFee != null)
                      _FilterChip(
                        label:
                            '₹${minFee?.toInt() ?? 0}-${maxFee?.toInt() ?? 'Any'}',
                        onRemove: () => setState(() {
                          minFee = null;
                          maxFee = null;
                        }),
                      ),
                  ],
                ),
              ),
            const SizedBox(height: UIConstants.spacingMedium),
            // Doctors List
            Expanded(
              child: FutureBuilder<List<Doctor>>(
                future: doctorService.listDoctors(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
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
                            'Error loading doctors',
                            style: theme.textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    );
                  }

                  List<Doctor> doctors = snapshot.data ?? [];

                  // Apply search filter
                  if (_searchController.text.isNotEmpty) {
                    final query = _searchController.text.toLowerCase();
                    doctors = doctors
                        .where((d) =>
                            d.specialization.toLowerCase().contains(query))
                        .toList();
                  }

                  // Apply specialization filter
                  if (selectedSpecialization != null) {
                    doctors = doctors
                        .where(
                            (d) => d.specialization == selectedSpecialization)
                        .toList();
                  }

                  // Apply rating filter
                  if (minRating > 0) {
                    doctors =
                        doctors.where((d) => d.rating >= minRating).toList();
                  }

                  // Apply fee filter
                  if (minFee != null) {
                    doctors = doctors
                        .where((d) => d.consultationFee >= minFee!)
                        .toList();
                  }
                  if (maxFee != null) {
                    doctors = doctors
                        .where((d) => d.consultationFee <= maxFee!)
                        .toList();
                  }

                  // Apply sorting
                  if (selectedSortBy == 'rating') {
                    doctors.sort((a, b) => b.rating.compareTo(a.rating));
                  } else if (selectedSortBy == 'experience') {
                    doctors
                        .sort((a, b) => b.experience.compareTo(a.experience));
                  } else if (selectedSortBy == 'fee_low_to_high') {
                    doctors.sort(
                      (a, b) => a.consultationFee.compareTo(b.consultationFee),
                    );
                  } else if (selectedSortBy == 'fee_high_to_low') {
                    doctors.sort(
                      (a, b) => b.consultationFee.compareTo(a.consultationFee),
                    );
                  }

                  if (doctors.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person_search_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Text(
                            'No doctors found',
                            style: theme.textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: UIConstants.spacingLarge,
                      vertical: UIConstants.spacingMedium,
                    ),
                    itemCount: doctors.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: UIConstants.spacingMedium),
                    itemBuilder: (context, index) {
                      final doctor = doctors[index];
                      return DoctorCard(
                        doctor: doctor,
                        onTap: () {
                          context.push(
                            '${AppRoutes.doctorViewProfile}?id=${doctor.id}',
                          );
                        },
                      );
                    },
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

  void _showSpecializationFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Specialization',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: UIConstants.spacingMedium),
            Wrap(
              spacing: UIConstants.spacingSmall,
              runSpacing: UIConstants.spacingSmall,
              children: availableSpecializations.map((spec) {
                final isSelected = selectedSpecialization == spec;
                return FilterChip(
                  label: Text(spec),
                  selected: isSelected,
                  onSelected: (selected) {
                    Navigator.pop(context);
                    setState(() {
                      selectedSpecialization = selected ? spec : null;
                    });
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  void _showSortOptions(BuildContext context) {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sort By',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: UIConstants.spacingMedium),
            ...sortOptions.map(
              (option) {
                final label = option == 'rating'
                    ? 'Highest Rating'
                    : option == 'experience'
                        ? 'Most Experience'
                        : option == 'fee_low_to_high'
                            ? 'Fee: Low to High'
                            : 'Fee: High to Low';

                return ListTile(
                  title: Text(label),
                  trailing: selectedSortBy == option
                      ? Icon(
                          Icons.check,
                          color: theme.primaryColor,
                        )
                      : null,
                  onTap: () {
                    Navigator.pop(context);
                    setState(() {
                      selectedSortBy = option;
                    });
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showRatingFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Minimum Rating',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: UIConstants.spacingLarge),
            Slider(
              value: minRating,
              min: 0,
              max: 5,
              divisions: 10,
              label: minRating.toStringAsFixed(1),
              onChanged: (value) {
                setState(() {
                  minRating = value;
                });
              },
            ),
            const SizedBox(height: UIConstants.spacingLarge),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Apply'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool isActive;

  const _FilterButton({
    required this.label,
    required this.icon,
    required this.onTap,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: UIConstants.spacingMedium,
            vertical: UIConstants.spacingSmall,
          ),
          decoration: BoxDecoration(
            border: Border.all(
              color: isActive ? theme.primaryColor : Colors.grey[300]!,
            ),
            borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 18,
                color: isActive ? theme.primaryColor : Colors.grey[600],
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isActive ? theme.primaryColor : Colors.grey[600],
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;

  const _FilterChip({
    required this.label,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Chip(
      label: Text(label),
      onDeleted: onRemove,
      backgroundColor: theme.primaryColor.withOpacity(0.1),
      labelStyle: TextStyle(color: theme.primaryColor),
    );
  }
}
