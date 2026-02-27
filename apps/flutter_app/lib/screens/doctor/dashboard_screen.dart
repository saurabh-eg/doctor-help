import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../providers/doctor_provider.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/doctor_bottom_nav.dart';
import '../../utils/extensions.dart';

class DoctorDashboardScreen extends ConsumerStatefulWidget {
  const DoctorDashboardScreen({super.key});

  @override
  ConsumerState<DoctorDashboardScreen> createState() =>
      _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends ConsumerState<DoctorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch doctor profile and appointments on init
    Future.microtask(() {
      ref.read(doctorProvider.notifier).fetchProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final doctorState = ref.watch(doctorProvider);
    final theme = Theme.of(context);
    final user = authState.user;
    final stats = doctorState.stats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: user == null
            ? Center(
                child: Text(
                  'Please log in',
                  style: theme.textTheme.bodyMedium,
                ),
              )
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header with greeting
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
                            'Welcome Back, Dr. ${user.name ?? 'Doctor'}',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            'Here\'s what\'s happening today',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Stats Cards
                    Padding(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Today\'s Overview',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Row(
                            children: [
                              Expanded(
                                child: _StatCard(
                                  icon: Icons.calendar_today,
                                  label: 'Appointments',
                                  value: '${stats.upcomingAppointments}',
                                  color: Colors.blue,
                                ),
                              ),
                              const SizedBox(
                                width: UIConstants.spacingMedium,
                              ),
                              Expanded(
                                child: _StatCard(
                                  icon: Icons.pending_actions,
                                  label: 'Pending',
                                  value: '${stats.pendingAppointments}',
                                  color: Colors.orange,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(
                            height: UIConstants.spacingMedium,
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: _StatCard(
                                  icon: Icons.people,
                                  label: 'Patients',
                                  value: '${stats.totalPatients}',
                                  color: Colors.green,
                                ),
                              ),
                              const SizedBox(
                                width: UIConstants.spacingMedium,
                              ),
                              Expanded(
                                child: _StatCard(
                                  icon: Icons.currency_rupee,
                                  label: 'Earnings',
                                  value: '₹${stats.thisMonthEarnings.toInt()}',
                                  color: Colors.purple,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Upcoming Appointments
                    Padding(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Upcoming Appointments',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              TextButton(
                                onPressed: () =>
                                    context.push(AppRoutes.doctorAppointments),
                                child: const Text('View All'),
                              ),
                            ],
                          ),
                          const SizedBox(
                            height: UIConstants.spacingMedium,
                          ),
                          // Real upcoming appointments
                          if (doctorState.todayAppointments.isEmpty)
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.all(
                                    UIConstants.spacingLarge),
                                child: Text(
                                  'No appointments today',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ),
                            )
                          else
                            ...doctorState.todayAppointments.take(2).map(
                                  (apt) => Padding(
                                    padding: const EdgeInsets.only(
                                      bottom: UIConstants.spacingSmall,
                                    ),
                                    child: _UpcomingAppointmentCard(
                                      patientName:
                                          apt.patientId.name ?? 'Patient',
                                      appointmentTime:
                                          '${apt.timeSlot.start} - ${apt.timeSlot.end}',
                                      consultationType: apt.type.capitalize(),
                                      reasonForVisit:
                                          apt.symptoms ?? 'Consultation',
                                      onTap: () => context
                                          .push(AppRoutes.doctorAppointments),
                                    ),
                                  ),
                                ),
                        ],
                      ),
                    ),

                    // Quick Actions
                    Padding(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Quick Actions',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(
                            height: UIConstants.spacingMedium,
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: _QuickActionButton(
                                  icon: Icons.edit_calendar,
                                  label: 'Update\nAvailability',
                                  onTap: () =>
                                      context.push(AppRoutes.doctorProfile),
                                ),
                              ),
                              const SizedBox(
                                width: UIConstants.spacingMedium,
                              ),
                              Expanded(
                                child: _QuickActionButton(
                                  icon: Icons.trending_up,
                                  label: 'View\nEarnings',
                                  onTap: () =>
                                      context.push(AppRoutes.doctorEarnings),
                                ),
                              ),
                              const SizedBox(
                                width: UIConstants.spacingMedium,
                              ),
                              Expanded(
                                child: _QuickActionButton(
                                  icon: Icons.people,
                                  label: 'My\nPatients',
                                  onTap: () =>
                                      context.push(AppRoutes.doctorPatients),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: UIConstants.spacingLarge),
                  ],
                ),
              ),
      ),
      bottomNavigationBar: const DoctorBottomNav(
        currentRoute: '/doctor/dashboard',
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: UIConstants.spacingSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }
}

class _UpcomingAppointmentCard extends StatelessWidget {
  final String patientName;
  final String appointmentTime;
  final String consultationType;
  final String reasonForVisit;
  final VoidCallback onTap;

  const _UpcomingAppointmentCard({
    required this.patientName,
    required this.appointmentTime,
    required this.consultationType,
    required this.reasonForVisit,
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  patientName,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: UIConstants.spacingSmall,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    consultationType,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.blue,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 8),
                Text(
                  appointmentTime,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.note_outlined,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    reasonForVisit,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
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
          color: theme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
          border: Border.all(
            color: theme.primaryColor.withOpacity(0.3),
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: theme.primaryColor,
              size: 32,
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Text(
              label,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
