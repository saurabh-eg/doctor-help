import 'package:flutter/material.dart';
import '../../config/constants.dart';

class ContactUsScreen extends StatelessWidget {
  const ContactUsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact Us'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(UIConstants.spacingLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Get in Touch',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Text(
              'We\'re here to help! Reach out through any of these channels:',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
            _buildContactCard(
              theme,
              '📧 Email Support',
              'General Inquiries:  Support@doctorhelp.in\n'
                  'Refunds: Support@doctorhelp.in\n',
            ),
            _buildContactCard(
              theme,
              '📞 Phone Support',
              'Toll-Free: +91-8603-342-657\n'
                  'Hours: 24/7 (All days)',
            ),
            _buildContactCard(
              theme,
              '💬 Live Chat',
              'Available in the mobile app and web dashboard\n\n'
                  'Response Time: Within 5 minutes',
            ),
            _buildContactCard(
              theme,
              '📍 Business Address',
              'DoctorHelp Healthcare Platform\n'
                  'FORBESGANJ BHAGKOHALIA WARD NO 7 MITHILA COLONY\n'
                  'FORBESGANJ, BIHAR - 854318\n'
                  'India',
            ),
            _buildContactCard(
              theme,
              '🏥 For Healthcare Professionals',
              'Interested in joining our platform as a doctor?\n\n'
                  'Email: doctors@doctorhelp.in',
            ),
            _buildContactCard(
              theme,
              '🔐 Security Issues',
              'Found a security vulnerability?\n\n'
                  'Email: hello@doctorhelp.in',
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
            Container(
              padding: const EdgeInsets.all(UIConstants.spacingMedium),
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Average Response Times',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _buildResponseTime(theme, 'Live Chat', '5 minutes'),
                  _buildResponseTime(theme, 'Email', '24 hours'),
                  _buildResponseTime(theme, 'Phone', '15 minutes'),
                  _buildResponseTime(theme, 'Support Ticket', '2-4 hours'),
                ],
              ),
            ),
            const SizedBox(height: UIConstants.spacing2XLarge),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(ThemeData theme, String title, String content) {
    return Container(
      margin: const EdgeInsets.only(bottom: UIConstants.spacing2XLarge),
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Column(
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
        ],
      ),
    );
  }

  Widget _buildResponseTime(ThemeData theme, String service, String time) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          service,
          style: theme.textTheme.bodyMedium,
        ),
        Text(
          time,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.primaryColor,
          ),
        ),
      ],
    );
  }
}
