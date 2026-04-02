import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/app_button.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String appointmentId;
  final double amount;
  final String doctorName;

  const PaymentScreen({
    super.key,
    required this.appointmentId,
    required this.amount,
    required this.doctorName,
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  bool _isPaying = false;
  String _selectedMethod = 'upi';

  Future<void> _handlePay() async {
    setState(() => _isPaying = true);

    final paymentService = ref.read(paymentServiceProvider);
    final response = await paymentService.initiateDemoPayment(
      appointmentId: widget.appointmentId,
      amount: widget.amount,
    );

    if (!mounted) return;
    setState(() => _isPaying = false);

    if (!response.success || response.data == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Payment failed. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final transactionId = response.data!['transactionId']?.toString() ??
        response.data!['paymentId']?.toString() ??
        'DEMO-TXN';

    if (!mounted) return;

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Payment Successful'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Booking confirmed successfully.'),
            const SizedBox(height: UIConstants.spacingSmall),
            Text('Txn ID: $transactionId'),
            Text('Amount: ₹${widget.amount.toStringAsFixed(0)}'),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );

    if (!mounted) return;
    context.go(AppRoutes.patientBookings);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Payment'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(UIConstants.spacingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Consultation Fee',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text(
                      '₹${widget.amount.toStringAsFixed(0)}',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Doctor: ${widget.doctorName}'),
                  ],
                ),
              ),
              const SizedBox(height: UIConstants.spacing2XLarge),
              Text(
                'Select Payment Method',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              RadioListTile<String>(
                value: 'upi',
                groupValue: _selectedMethod,
                title: const Text('UPI'),
                subtitle: const Text('Pay using any UPI app'),
                onChanged: (value) => setState(() => _selectedMethod = value!),
              ),
              RadioListTile<String>(
                value: 'card',
                groupValue: _selectedMethod,
                title: const Text('Card'),
                subtitle: const Text('Credit / Debit Card'),
                onChanged: (value) => setState(() => _selectedMethod = value!),
              ),
              RadioListTile<String>(
                value: 'netbanking',
                groupValue: _selectedMethod,
                title: const Text('Net Banking'),
                subtitle: const Text('All major banks supported'),
                onChanged: (value) => setState(() => _selectedMethod = value!),
              ),
              const SizedBox(height: UIConstants.spacing2XLarge),
              Text(
                'Demo Note: This flow simulates gateway success for approval and testing.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: UIConstants.spacingLarge),
              AppButton(
                label: 'Pay ₹${widget.amount.toStringAsFixed(0)}',
                isLoading: _isPaying,
                onPressed: _handlePay,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
