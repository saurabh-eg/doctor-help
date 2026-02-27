import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/constants.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  // Notification preferences
  bool _appointmentReminders = true;
  bool _newBookings = true;
  bool _cancellations = true;
  bool _patientMessages = true;
  bool _earningsUpdates = true;
  bool _promotionalUpdates = false;

  bool _isLoading = true;

  // SharedPreferences keys
  static const _keyPrefix = 'doctor_notif_';
  static const _keyAppointmentReminders = '${_keyPrefix}appointment_reminders';
  static const _keyNewBookings = '${_keyPrefix}new_bookings';
  static const _keyCancellations = '${_keyPrefix}cancellations';
  static const _keyPatientMessages = '${_keyPrefix}patient_messages';
  static const _keyEarningsUpdates = '${_keyPrefix}earnings_updates';
  static const _keyPromotionalUpdates = '${_keyPrefix}promotional_updates';

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _appointmentReminders = prefs.getBool(_keyAppointmentReminders) ?? true;
      _newBookings = prefs.getBool(_keyNewBookings) ?? true;
      _cancellations = prefs.getBool(_keyCancellations) ?? true;
      _patientMessages = prefs.getBool(_keyPatientMessages) ?? true;
      _earningsUpdates = prefs.getBool(_keyEarningsUpdates) ?? true;
      _promotionalUpdates = prefs.getBool(_keyPromotionalUpdates) ?? false;
      _isLoading = false;
    });
  }

  Future<void> _savePreference(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(UIConstants.spacingLarge),
              children: [
                Text(
                  'Appointment Notifications',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                _buildToggle(
                  title: 'Appointment Reminders',
                  subtitle: 'Get reminded before upcoming appointments',
                  value: _appointmentReminders,
                  onChanged: (v) {
                    setState(() => _appointmentReminders = v);
                    _savePreference(_keyAppointmentReminders, v);
                  },
                ),
                _buildToggle(
                  title: 'New Bookings',
                  subtitle: 'Notify when a patient books an appointment',
                  value: _newBookings,
                  onChanged: (v) {
                    setState(() => _newBookings = v);
                    _savePreference(_keyNewBookings, v);
                  },
                ),
                _buildToggle(
                  title: 'Cancellations',
                  subtitle: 'Notify when a patient cancels an appointment',
                  value: _cancellations,
                  onChanged: (v) {
                    setState(() => _cancellations = v);
                    _savePreference(_keyCancellations, v);
                  },
                ),
                const SizedBox(height: UIConstants.spacing2XLarge),
                Text(
                  'General Notifications',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                _buildToggle(
                  title: 'Patient Messages',
                  subtitle: 'Receive alerts for new patient messages',
                  value: _patientMessages,
                  onChanged: (v) {
                    setState(() => _patientMessages = v);
                    _savePreference(_keyPatientMessages, v);
                  },
                ),
                _buildToggle(
                  title: 'Earnings Updates',
                  subtitle: 'Get notified about payment and earnings changes',
                  value: _earningsUpdates,
                  onChanged: (v) {
                    setState(() => _earningsUpdates = v);
                    _savePreference(_keyEarningsUpdates, v);
                  },
                ),
                _buildToggle(
                  title: 'Promotional Updates',
                  subtitle: 'Receive news about features and offers',
                  value: _promotionalUpdates,
                  onChanged: (v) {
                    setState(() => _promotionalUpdates = v);
                    _savePreference(_keyPromotionalUpdates, v);
                  },
                ),
              ],
            ),
    );
  }

  Widget _buildToggle({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: UIConstants.spacingSmall),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: SwitchListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: UIConstants.spacingMedium,
          vertical: UIConstants.spacingXSmall,
        ),
        title: Text(
          title,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
        value: value,
        onChanged: onChanged,
        activeColor: theme.primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        ),
      ),
    );
  }
}
