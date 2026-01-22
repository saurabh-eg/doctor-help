import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/doctor_card.dart';
import '../../widgets/patient_bottom_nav.dart';
import '../../models/doctor.dart';

class PatientHomeScreen extends ConsumerStatefulWidget {
  const PatientHomeScreen({super.key});

  @override
  ConsumerState<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends ConsumerState<PatientHomeScreen> {
  final List<String> specializations = [
    'Cardiology',
    'Dermatology',
    'Orthopedic',
    'Neurology',
    'Pediatric',
    'General',
  ];

  String selectedSpecialization = 'All';

  @override
  void initState() {
    super.initState();
    // Fetch doctors on init
    Future.microtask(() {
      ref.read(doctorServiceProvider).listDoctors();
    });
  }

  @override
  Widget build(BuildContext context) {
    final doctorService = ref.read(doctorServiceProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with greeting and search
              Container(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor,
                      theme.primaryColor.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome Back',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text(
                      'Find and book your doctor',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingLarge),
                    // Search Bar
                    GestureDetector(
                      onTap: () => context.push(AppRoutes.patientSearch),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: UIConstants.spacingMedium,
                          vertical: UIConstants.spacingSmall,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(
                            UIConstants.radiusMedium,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.search,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: UIConstants.spacingMedium),
                            Text(
                              'Search doctors, specialization...',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Specializations
              Padding(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Specializations',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _SpecializationChip(
                            label: 'All',
                            isSelected: selectedSpecialization == 'All',
                            onTap: () {
                              setState(() {
                                selectedSpecialization = 'All';
                              });
                            },
                          ),
                          ...specializations.map(
                            (spec) => _SpecializationChip(
                              label: spec,
                              isSelected: selectedSpecialization == spec,
                              onTap: () {
                                setState(() {
                                  selectedSpecialization = spec;
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Featured/Top Rated Doctors
              Padding(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Top Rated Doctors',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.patientSearch),
                          child: Text(
                            'View All',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    FutureBuilder<List<Doctor>>(
                      future: doctorService.listDoctors(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        }

                        if (snapshot.hasError) {
                          return Center(
                            child: Text(
                              'Error loading doctors',
                              style: theme.textTheme.bodyMedium,
                            ),
                          );
                        }

                        final doctors = snapshot.data ?? <Doctor>[];
                        if (doctors.isEmpty) {
                          return Center(
                            child: Text(
                              'No doctors found',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.grey,
                              ),
                            ),
                          );
                        }

                        // Filter by specialization if selected
                        final filteredDoctors = selectedSpecialization == 'All'
                            ? doctors
                            : doctors
                                .where((d) =>
                                    d.specialization == selectedSpecialization)
                                .toList();

                        return ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: filteredDoctors.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: UIConstants.spacingMedium),
                          itemBuilder: (context, index) {
                            final doctor = filteredDoctors[index];
                            return DoctorCard(
                              doctor: doctor,
                              onTap: () {
                                context.push(
                                  '${AppRoutes.doctorProfile}?id=${doctor.id}',
                                );
                              },
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar:
          const PatientBottomNav(currentRoute: '/patient/home'),
    );
  }
}

class _SpecializationChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _SpecializationChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(right: UIConstants.spacingSmall),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: UIConstants.spacingMedium,
            vertical: UIConstants.spacingSmall,
          ),
          decoration: BoxDecoration(
            color: isSelected ? theme.primaryColor : Colors.grey[200],
            borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
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
      ),
    );
  }
}
