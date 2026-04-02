import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';

class RoleSelectScreen extends ConsumerWidget {
  const RoleSelectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Your Role'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Text(
                'Who are you?',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Choose your role to get started',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 40),
              _RoleCard(
                icon: Icons.person,
                title: 'I am a Patient',
                description: 'Book appointments and consult with doctors',
                onTap: () async {
                  final success = await ref
                      .read(authStateProvider.notifier)
                      .setRole(AppConstants.rolePatient);
                  if (!context.mounted) return;

                  if (success) {
                    context.go(AppRoutes.profileSetup);
                    return;
                  }

                  final error =
                      ref.read(authStateProvider).error ?? 'Failed to set role';
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(error),
                      backgroundColor: Colors.red,
                    ),
                  );

                  final lower = error.toLowerCase();
                  if (lower.contains('unauthorized') ||
                      lower.contains('no token')) {
                    context.go(AppRoutes.login);
                  }
                },
              ),
              const SizedBox(height: 16),
              _RoleCard(
                icon: Icons.medical_services,
                title: 'I am a Doctor',
                description: 'Manage consultations and build your practice',
                onTap: () async {
                  final success = await ref
                      .read(authStateProvider.notifier)
                      .setRole(AppConstants.roleDoctor);
                  if (!context.mounted) return;

                  if (success) {
                    context.go(AppRoutes.doctorVerification);
                    return;
                  }

                  final error =
                      ref.read(authStateProvider).error ?? 'Failed to set role';
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(error),
                      backgroundColor: Colors.red,
                    ),
                  );

                  final lower = error.toLowerCase();
                  if (lower.contains('unauthorized') ||
                      lower.contains('no token')) {
                    context.go(AppRoutes.login);
                  }
                },
              ),
              const SizedBox(height: 16),
              _RoleCard(
                icon: Icons.biotech,
                title: 'I run a Lab',
                description:
                    'Submit your lab details for approval and onboarding',
                onTap: () {
                  final isAuthenticated =
                      ref.read(authStateProvider).isAuthenticated;
                  if (!isAuthenticated) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Session expired. Please login again.'),
                        backgroundColor: Colors.red,
                      ),
                    );
                    context.go(AppRoutes.login);
                    return;
                  }
                  context.push(AppRoutes.labRegistrationRequest);
                },
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    await ref.read(authStateProvider.notifier).logout();
                    if (context.mounted) {
                      context.go(AppRoutes.login);
                    }
                  },
                  icon: const Icon(Icons.phone),
                  label: const Text('Use a Different Phone Number'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: Theme.of(context).primaryColor,
                size: 32,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.grey[400],
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
