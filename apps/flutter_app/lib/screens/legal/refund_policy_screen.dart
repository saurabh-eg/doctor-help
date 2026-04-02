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
                'Quick Summary: Eligible cancellations may receive a full refund. Once a consultation, lab sample collection, or service is completed, refunds are usually not available except where required by law or due to an error on our side.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
            _buildSection(
              theme,
              '1. Appointment Refunds',
              'Patient cancellations may be eligible for a refund when the cancellation is made before the consultation begins and before the healthcare provider has started service. '
                  'Refund eligibility depends on the booking type, timing, and whether the service was already initiated. '
                  'Once a consultation is completed or marked as attended, refunds are normally not available.',
            ),
            _buildSection(
              theme,
              '2. Lab Booking and Sample Collection Refunds',
              'For lab-related bookings, refund eligibility is limited once a sample has been collected, a test has been initiated, or a report has been generated. '
                  'If a lab booking is cancelled before the service starts, you may be eligible for a refund according to the case reviewed by our support team.',
            ),
            _buildSection(
              theme,
              '3. Cancellation by Doctor or Lab Provider',
              'If a doctor or lab provider cancels a booking before service delivery, the customer will generally receive a full refund to the original payment method or may be offered a reschedule, depending on the situation.',
            ),
            _buildSection(
              theme,
              '4. Payment Gateway Processing',
              'Payments are processed by third-party payment gateways such as PhonePe or another approved provider. '
                  'Refunds, when approved, are sent back to the original payment method subject to the gateway and banking timelines. '
                  'Processing times usually depend on the bank, payment method, and gateway rules.',
            ),
            _buildSection(
              theme,
              '5. Refund Request Procedure',
              'To request a refund, contact our support team with your order ID, registered phone number, booking date, and reason for the request. '
                  'We may ask for supporting details before reviewing the request. All refund decisions are made after verification of the booking status and service progress.',
            ),
            _buildSection(
              theme,
              '6. Non-Refundable Items',
              'Refunds are generally not provided for:\n\n'
                  '• Completed consultations\n'
                  '• Services already started or fulfilled\n'
                  '• Missed appointments or no-shows by the user\n'
                  '• Payment gateway convenience charges, where non-refundable by the gateway\n'
                  '• Promotional or coupon amounts, unless required by law or by the payment processor’s rules',
            ),
            _buildSection(
              theme,
              '7. Refund Timeline',
              'Approved refunds are usually initiated within a reasonable period after review. '
                  'Actual credit time may vary based on the payment method, bank, and payment gateway. '
                  'If a refund is delayed, contact support with your transaction reference number.',
            ),
            _buildSection(
              theme,
              '8. Changes to This Policy',
              'We may update this Refund Policy from time to time. The revised version will be posted in the app with a new date. '
                  'Continued use of the app means you accept the updated policy.',
            ),
            _buildSection(
              theme,
              '9. Contact Us',
              'For refund questions or disputes, contact us at:\n'
                  'Email: support@doctorhelp.in\n'
                  'Phone: +91-8603-342-657\n'
                  'Address: Forbesganj, Bihar, India',
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
