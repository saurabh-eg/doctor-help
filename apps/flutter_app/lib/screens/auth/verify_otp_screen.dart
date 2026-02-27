import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../providers/providers.dart';
import '../../utils/validators.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';

class VerifyOtpScreen extends ConsumerStatefulWidget {
  final String phone;

  const VerifyOtpScreen({super.key, required this.phone});

  @override
  ConsumerState<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends ConsumerState<VerifyOtpScreen> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  static const int _resendCooldown = 60;
  int _secondsRemaining = _resendCooldown;
  Timer? _timer;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startCooldownTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _startCooldownTimer() {
    setState(() {
      _secondsRemaining = _resendCooldown;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        if (mounted) {
          setState(() {
            _secondsRemaining = 0;
            _canResend = true;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _secondsRemaining--;
          });
        }
      }
    });
  }

  Future<void> _handleResendOtp() async {
    if (!_canResend) return;

    final authNotifier = ref.read(authStateProvider.notifier);
    final success = await authNotifier.sendOtp(widget.phone);

    if (!mounted) return;

    if (success) {
      _startCooldownTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP resent successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      final error = ref.read(authStateProvider).error;
      // Check if it's a cooldown error from backend
      if (error != null && error.contains('wait')) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Colors.orange,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to resend OTP'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleVerifyOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authStateProvider.notifier);
    final success =
        await authNotifier.verifyOtp(widget.phone, _otpController.text);

    if (!mounted) return;

    if (success) {
      final authState = ref.read(authStateProvider);
      if (authState.isNewUser) {
        context.go(AppRoutes.roleSelect);
      } else {
        // Navigate based on role
        if (authState.user?.role == AppConstants.rolePatient) {
          context.go(AppRoutes.patientHome);
        } else if (authState.user?.role == AppConstants.roleDoctor) {
          context.go(AppRoutes.doctorDashboard);
        }
      }
    } else {
      final error = ref.read(authStateProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to verify OTP'),
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Verify OTP'),
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
              // Header
              Center(
                child: Column(
                  children: [
                    Text(
                      'Enter OTP',
                      style:
                          Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text(
                      'We sent a 6-digit code to +91${widget.phone}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: UIConstants.spacing3XLarge),
              // Form
              Form(
                key: _formKey,
                child: AppTextField(
                  label: 'OTP',
                  hintText: '000000',
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  validator: Validators.validateOtp,
                ),
              ),
              const SizedBox(height: UIConstants.spacing2XLarge),
              // Verify Button
              AppButton(
                label: 'Verify OTP',
                isLoading: authState.isLoading,
                onPressed: _handleVerifyOtp,
              ),
              const SizedBox(height: UIConstants.spacingLarge),
              // Resend OTP with cooldown
              Center(
                child: _canResend
                    ? TextButton(
                        onPressed: _handleResendOtp,
                        child: Text(
                          'Resend OTP',
                          style: TextStyle(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.timer_outlined,
                            size: 16,
                            color: Colors.grey[500],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Resend OTP in ${_secondsRemaining}s',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[500],
                                    ),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
