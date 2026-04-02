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
              'By downloading, accessing, registering for, or using DoctorHelp, you agree to these Terms of Service. '
                  'If you do not agree, do not use the app or any related services.',
            ),
            _buildSection(
              theme,
              '2. Service Description',
              'DoctorHelp is a digital healthcare platform that helps patients book appointments, communicate with healthcare '
                  'providers, view bookings, receive notifications, and access related services such as lab bookings and reports. '
                  'We also provide separate access for doctors and lab providers to manage their services through the platform.',
            ),
            _buildSection(
              theme,
              '3. User Eligibility and Accounts',
              'You must provide accurate, current, and complete information when creating an account. '
                  'You are responsible for maintaining the confidentiality of your login details and for all activity under your account. '
                  'You must be at least the legal age required by your local law to use the service, or use the app through a parent or guardian if applicable.',
            ),
            _buildSection(
              theme,
              '4. Healthcare Provider Verification',
              'We may verify doctors and lab providers using credentials, registration documents, and related checks. '
                  'Verification does not guarantee service quality, availability, or outcomes. Users should make their own informed decisions before booking.',
            ),
            _buildSection(
              theme,
              '5. Services, Bookings, and Payments',
              '• Service fees, consultation charges, lab booking charges, and any platform fees are shown before payment.\n'
                  '• Payments are processed through third-party payment gateways such as PhonePe or another approved provider.\n'
                  '• We do not store card numbers, UPI PINs, or banking passwords on our servers.\n'
                  '• A booking is confirmed only after successful payment or confirmation from the relevant service flow.\n'
                  '• Prices, fees, and availability may change without prior notice, but confirmed bookings will be honored subject to these Terms and the Refund Policy.',
            ),
            _buildSection(
              theme,
              '6. Medical Disclaimer',
              'DoctorHelp is an intermediary platform and does not itself provide medical diagnosis, treatment, or emergency care. '
                  'All medical decisions are made by the healthcare professional. If you are experiencing a medical emergency, call emergency services immediately and do not rely on this app for urgent care.',
            ),
            _buildSection(
              theme,
              '7. User Conduct',
              'You agree not to misuse the app, upload unlawful or harmful content, attempt unauthorized access, interfere with security, impersonate another person, or use the platform for fraudulent activity. '
                  'We may suspend or terminate accounts that violate these Terms.',
            ),
            _buildSection(
              theme,
              '8. Intellectual Property',
              'All app content, branding, design, text, graphics, and software are owned by DoctorHelp or its licensors and are protected by applicable intellectual property laws. '
                  'You may not copy, modify, distribute, or reverse engineer the app except where permitted by law.',
            ),
            _buildSection(
              theme,
              '9. Limitation of Liability',
              'To the maximum extent permitted by law, DoctorHelp is not responsible for the acts, omissions, advice, or treatment provided by doctors, labs, or other third parties. '
                  'We are also not liable for delays caused by network issues, payment gateway outages, or service interruptions beyond our control.',
            ),
            _buildSection(
              theme,
              '10. Changes to the Service and Terms',
              'We may update the app or these Terms from time to time. The updated version will be posted in the app with a revised date. '
                  'Continued use of the app after changes means you accept the updated Terms.',
            ),
            _buildSection(
              theme,
              '11. Contact Us',
              'For questions about these Terms, contact us at:\n'
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
