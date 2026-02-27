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
              'We collect information you provide directly to us, including:\n\n'
                  '• Personal information (name, email, phone number)\n'
                  '• Medical history and health records\n'
                  '• Payment information (processed securely through Cashfree)\n'
                  '• Appointment and consultation data',
            ),
            _buildSection(
              theme,
              '2. How We Use Your Information',
              'We use the information we collect to:\n\n'
                  '• Provide, maintain, and improve our services\n'
                  '• Process transactions and send related information\n'
                  '• Send technical notices and support messages\n'
                  '• Respond to your comments and questions\n'
                  '• Comply with legal obligations',
            ),
            _buildSection(
              theme,
              '3. Data Security',
              'We implement appropriate security measures to protect your personal information. '
                  'All payment transactions are processed through secure payment gateways with '
                  'PCI-DSS compliance.',
            ),
            _buildSection(
              theme,
              '4. HIPAA Compliance',
              'We are committed to protecting your health information in accordance with HIPAA '
                  'regulations and applicable data protection laws.',
            ),
            _buildSection(
              theme,
              '5. Data Sharing',
              'We do not sell your personal information. We may share your information with:\n\n'
                  '• Healthcare providers for consultation purposes\n'
                  '• Service providers who assist in our operations\n'
                  '• Legal authorities when required by law',
            ),
            _buildSection(
              theme,
              '6. Your Rights',
              'You have the right to:\n\n'
                  '• Access your personal information\n'
                  '• Correct inaccurate data\n'
                  '• Request deletion of your data\n'
                  '• Withdraw consent',
            ),
            _buildSection(
              theme,
              '7. Contact Us',
              'For privacy-related questions, contact us at:\n'
                  'Email: privacy@doctorhelp.com',
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
