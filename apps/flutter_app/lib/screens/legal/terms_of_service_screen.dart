import 'package:flutter/material.dart';
import '../../config/constants.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Terms of Service',
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
            _buildSection(
              theme,
              '1. Acceptance of Terms',
              'By accessing and using DoctorHelp services, you accept and agree to be bound by '
                  'these Terms of Service.',
            ),
            _buildSection(
              theme,
              '2. Service Description',
              'DoctorHelp provides an online platform connecting patients with verified healthcare '
                  'professionals for medical consultations, appointments, and related healthcare services.',
            ),
            _buildSection(
              theme,
              '3. User Responsibilities',
              'Users agree to:\n\n'
                  '• Provide accurate and complete information\n'
                  '• Maintain the security of their account\n'
                  '• Not misuse the platform or services\n'
                  '• Respect the privacy and rights of others',
            ),
            _buildSection(
              theme,
              '4. Doctor Verification',
              'All doctors on our platform undergo verification of their medical licenses and credentials. '
                  'However, users should exercise their own judgment when selecting healthcare providers.',
            ),
            _buildSection(
              theme,
              '5. Payment Terms',
              '• All fees are clearly displayed before booking\n'
                  '• Payments are processed securely through Cashfree Payment Gateway\n'
                  '• Consultation fees are non-refundable except as specified in our Refund Policy\n'
                  '• Platform may charge service fees separately from consultation fees',
            ),
            _buildSection(
              theme,
              '6. Medical Disclaimer',
              'DoctorHelp is a platform service and does not provide medical advice directly. '
                  'All medical consultations are between users and licensed healthcare providers. '
                  'In case of emergency, call emergency services immediately.',
            ),
            _buildSection(
              theme,
              '7. Limitation of Liability',
              'DoctorHelp is not liable for the quality of medical services provided by healthcare '
                  'professionals. We act solely as a platform facilitating connections.',
            ),
            _buildSection(
              theme,
              '8. Termination',
              'We reserve the right to suspend or terminate accounts that violate these terms.',
            ),
            _buildSection(
              theme,
              '9. Contact',
              'For questions about these terms, contact: legal@doctorhelp.com',
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
