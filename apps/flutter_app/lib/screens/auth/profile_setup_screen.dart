import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../providers/providers.dart';
import '../../utils/validators.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleComplete() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authStateProvider.notifier);
    final emailText = _emailController.text.trim();
    final success = await authNotifier.completeProfile(
      name: _nameController.text,
      email: emailText.isEmpty ? null : emailText,
    );

    if (!mounted) return;

    if (success) {
      final authState = ref.read(authStateProvider);
      if (authState.user?.role == AppConstants.rolePatient) {
        context.go(AppRoutes.patientHome);
      } else if (authState.user?.role == AppConstants.roleDoctor) {
        context.go(AppRoutes.doctorDashboard);
      }
    } else {
      final error = ref.read(authStateProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to complete profile'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Profile'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(UIConstants.spacingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: UIConstants.spacingLarge),
              Text(
                'Let us know more about you',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: UIConstants.spacingSmall),
              Text(
                'This helps us personalize your experience',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: UIConstants.spacing3XLarge),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    AppTextField(
                      label: 'Full Name',
                      hintText: 'John Doe',
                      controller: _nameController,
                      validator: Validators.validateName,
                      prefixIcon: const Icon(Icons.person),
                    ),
                    const SizedBox(height: UIConstants.spacing2XLarge),
                    AppTextField(
                      label: 'Email (Optional)',
                      hintText: 'john@example.com',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value != null && value.isNotEmpty) {
                          return Validators.validateEmail(value);
                        }
                        return null;
                      },
                      prefixIcon: const Icon(Icons.email),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: UIConstants.spacing3XLarge),
              AppButton(
                label: 'Continue',
                isLoading: authState.isLoading,
                onPressed: _handleComplete,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
