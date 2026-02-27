import 'package:flutter/material.dart';
import '../../config/constants.dart';

class RefundPolicyScreen extends StatelessWidget {
  const RefundPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Refund Policy'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Refund Policy',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Text(
              'Last Updated: February 2, 2026',
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
            Container(
              padding: const EdgeInsets.all(UIConstants.spacingMedium),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                border: Border.all(color: Colors.amber[300]!, width: 1),
                borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
              ),
              child: Text(
                'Quick Summary: Cancel 24+ hours before = Full refund. Cancel within 24 hours = '
                    'No refund. Doctor cancellation = Full refund.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
            _buildSection(
              theme,
              '1. Cancellation by Patient',
              'Full Refund (100%):\n'
                  '• Cancellation made more than 24 hours before scheduled appointment\n'
                  '• Technical issues preventing consultation (verified by support team)\n'
                  '• Doctor unavailability or cancellation\n\n'
                  'No Refund:\n'
                  '• Cancellation within 24 hours of scheduled appointment\n'
                  '• Patient no-show (missed appointment without cancellation)\n'
                  '• Consultation already completed',
            ),
            _buildSection(
              theme,
              '2. Cancellation by Doctor',
              'If a doctor cancels an appointment for any reason:\n\n'
                  '• 100% refund processed automatically\n'
                  '• Option to reschedule with same or different doctor\n'
                  '• Refund credited to original payment method within 5-7 business days',
            ),
            _buildSection(
              theme,
              '3. Refund Processing Time',
              '• Wallet/UPI: Instant to 24 hours\n'
                  '• Credit/Debit Card: 5-7 business days\n'
                  '• Net Banking: 5-7 business days',
            ),
            _buildSection(
              theme,
              '4. Partial Consultation',
              'If a consultation is interrupted or incomplete due to technical issues:\n\n'
                  '• Report within 1 hour of scheduled time\n'
                  '• Support team reviews case\n'
                  '• Partial or full refund based on consultation duration\n'
                  '• Alternative: Free rescheduling',
            ),
            _buildSection(
              theme,
              '5. How to Request Refund',
              '1. Go to "My Appointments" in the app\n'
                  '2. Select the appointment\n'
                  '3. Tap "Request Refund"\n'
                  '4. Provide reason (if required)\n'
                  '5. Submit request',
            ),
            _buildSection(
              theme,
              '6. Non-Refundable Items',
              '• Platform service fees (if applicable)\n'
                  '• Payment gateway charges\n'
                  '• Promotional discounts (credited back as platform credits)',
            ),
            _buildSection(
              theme,
              '7. Dispute Resolution',
              'If you have concerns about a refund:\n\n'
                  '• Email: refunds@doctorhelp.com\n'
                  '• Response time: Within 48 hours\n'
                  '• Resolution time: 5-7 business days',
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(ThemeData theme, String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.primaryColor,
          ),
        ),
        const SizedBox(height: UIConstants.spacingMedium),
        Text(
          content,
          style: theme.textTheme.bodyMedium?.copyWith(
            height: 1.6,
          ),
        ),
        const SizedBox(height: UIConstants.spacing2XLarge),
      ],
    );
  }
}
