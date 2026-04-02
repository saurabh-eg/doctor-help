import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/app_logo.dart';
import '../../providers/providers.dart';
import '../../utils/validators.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  static const _dailyHealthQuotes = [
    'A 20-minute walk every day can improve mood, sleep, and heart health.',
    'Hydration matters: drinking enough water helps energy and focus.',
    'Small consistent habits beat intense routines done once in a while.',
    'Quality sleep is a health tool, not a luxury.',
    'Preventive checkups help catch issues before they become serious.',
    'Balanced meals with fiber and protein keep blood sugar steadier.',
    'Deep breathing for a few minutes can reduce stress response quickly.',
  ];

  String _getDailyHealthQuote() {
    final baseDate = DateTime(2024, 1, 1);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dayIndex = today.difference(baseDate).inDays;
    return _dailyHealthQuotes[dayIndex % _dailyHealthQuotes.length];
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authStateProvider.notifier);
    final success = await authNotifier.sendOtp(_phoneController.text);

    if (!mounted) return;

    if (success) {
      context.push('${AppRoutes.verifyOtp}?phone=${_phoneController.text}');
    } else {
      final error = ref.read(authStateProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to send OTP'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final theme = Theme.of(context);
    final dailyQuote = _getDailyHealthQuote();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(
                  UIConstants.spacingLarge,
                  UIConstants.spacingLarge,
                  UIConstants.spacingLarge,
                  UIConstants.spacingSmall,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: UIConstants.spacingMedium),
                    Center(
                      child: Column(
                        children: [
                          const AppLogo(
                            size: 110,
                            showText: false,
                          ),
                          const SizedBox(height: UIConstants.spacingLarge),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: UIConstants.spacingMedium,
                              vertical: UIConstants.spacingXSmall,
                            ),
                            decoration: BoxDecoration(
                              color: theme.primaryColor.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(
                                UIConstants.radiusRound,
                              ),
                            ),
                            child: Text(
                              'Trusted Care, Faster Access',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.primaryColor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Text(
                            'Welcome Back',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            'Sign in with your mobile number to continue',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacing2XLarge),
                    Container(
                      padding: const EdgeInsets.all(UIConstants.spacingLarge),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusXLarge,
                        ),
                        border: Border.all(
                          color: Colors.black.withOpacity(0.05),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Form(
                            key: _formKey,
                            child: AppTextField(
                              label: 'Mobile Number',
                              hintText: '98765 43210',
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              maxLength: 10,
                              validator: Validators.validatePhone,
                              textAlign: TextAlign.start,
                              prefixIcon: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const SizedBox(width: 12),
                                  Text(
                                    '+91',
                                    style: theme.textTheme.bodyLarge?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingLarge),
                          ValueListenableBuilder<TextEditingValue>(
                            valueListenable: _phoneController,
                            builder: (context, value, _) {
                              return AppButton(
                                label: 'Get OTP',
                                isLoading: authState.isLoading,
                                isDisabled: value.text.length != 10,
                                onPressed: _handleSendOtp,
                              );
                            },
                          ),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Text(
                            'One-time passcode will be sent to this number',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.spacingLarge,
                UIConstants.spacingXSmall,
                UIConstants.spacingLarge,
                UIConstants.spacingMedium,
              ),
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(UIConstants.spacingMedium),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.06),
                      borderRadius:
                          BorderRadius.circular(UIConstants.radiusLarge),
                      border: Border.all(
                        color: theme.primaryColor.withOpacity(0.15),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.lightbulb_outline,
                          color: theme.primaryColor,
                          size: 20,
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Health Tip of the Day',
                                style: theme.textTheme.labelLarge?.copyWith(
                                  color: theme.primaryColor,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                dailyQuote,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.black87,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Center(
                    child: Wrap(
                      alignment: WrapAlignment.center,
                      children: [
                        Text(
                          'By continuing, you agree to our ',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.termsOfService),
                          child: Text(
                            'Terms',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                        Text(
                          ' & ',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.privacyPolicy),
                          child: Text(
                            'Privacy Policy',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Center(
                    child: Wrap(
                      alignment: WrapAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.refundPolicy),
                          child: Text(
                            'Refund Policy',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.w500,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                        Text(
                          ' • ',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.contactUs),
                          child: Text(
                            'Contact Us',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.primaryColor,
                              fontWeight: FontWeight.w500,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
