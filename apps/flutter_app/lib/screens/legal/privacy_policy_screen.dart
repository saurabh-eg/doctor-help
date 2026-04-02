import 'package:flutter/material.dart';
import '../../config/constants.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Privacy Policy',
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
              '1. Information We Collect',
              'We collect the information you provide directly and information generated through app usage, including:\n\n'
                  '• Account details such as name, phone number, email address, and role\n'
                  '• Profile details, appointment details, lab booking details, and chat or support messages\n'
                  '• Health-related information you choose to provide, such as symptoms, prescriptions, reports, and consultation notes\n'
                  '• Uploaded documents such as identity or verification documents for doctors and labs\n'
                  '• Device and usage data, such as app version, device model, and crash logs\n'
                  '• Payment and transaction details, such as payment status, order reference, and gateway transaction identifiers',
            ),
            _buildSection(
              theme,
              '2. How We Use Your Information',
              'We use your information to:\n\n'
                  '• Create and manage accounts\n'
                  '• Schedule and manage appointments, lab bookings, and related notifications\n'
                  '• Process payments and refunds\n'
                  '• Verify doctors and labs\n'
                  '• Provide customer support and service updates\n'
                  '• Improve app performance, safety, and reliability\n'
                  '• Comply with legal, tax, audit, and regulatory obligations',
            ),
            _buildSection(
              theme,
              '3. Data Security',
              'We use reasonable administrative, technical, and physical safeguards to protect your data. '
                  'Sensitive payment details are handled by third-party payment processors and are not stored as raw card or UPI credentials in the app. '
                  'No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
            ),
            _buildSection(
              theme,
              '4. Sharing of Information',
              'We do not sell your personal information. We may share your information only when necessary with:\n\n'
                  '• Doctors, labs, and support staff involved in your booking or care\n'
                  '• Payment gateways such as PhonePe or another payment provider for transaction processing\n'
                  '• Cloud hosting, analytics, messaging, and notification service providers\n'
                  '• Law enforcement or government authorities when required by law\n'
                  '• Professional advisors or auditors when needed for compliance',
            ),
            _buildSection(
              theme,
              '5. Data Retention',
              'We keep your information for as long as needed to provide the services, resolve disputes, comply with legal obligations, and enforce agreements. '
                  'If you request account deletion, some information may still be retained where required by law or for legitimate business reasons such as fraud prevention or financial recordkeeping.',
            ),
            _buildSection(
              theme,
              '6. Your Rights and Choices',
              'Depending on your local law, you may be able to access, correct, or delete certain personal information, and you may be able to opt out of some communications. '
                  'You can also control notifications and can uninstall the app at any time to stop further collection through the app.',
            ),
            _buildSection(
              theme,
              '7. Children’s Privacy',
              'The app is not intended for children below the age allowed by applicable law to create an account on their own. '
                  'If you believe a child has provided us with personal information without appropriate consent, contact us so we can review and delete it where required.',
            ),
            _buildSection(
              theme,
              '8. Changes to This Policy',
              'We may update this Privacy Policy from time to time. The updated policy will be posted in the app with a revised date. '
                  'Continued use of the app after changes means you accept the updated policy.',
            ),
            _buildSection(
              theme,
              '9. Contact Us',
              'For privacy-related questions or requests, contact us at:\n'
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
