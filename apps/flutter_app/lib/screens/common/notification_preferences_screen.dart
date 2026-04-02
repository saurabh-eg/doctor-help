import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/constants.dart';
import '../../providers/providers.dart';
import '../../services/notification_service.dart';

class NotificationPreferencesScreen extends ConsumerStatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  ConsumerState<NotificationPreferencesScreen> createState() =>
      _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState
    extends ConsumerState<NotificationPreferencesScreen> {
  static const List<String> _allNotificationTypes = [
    'appointment_booked',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_completed',
    'lab_order_created',
    'lab_order_confirmed',
    'lab_order_sample_collected',
    'lab_order_processing',
    'lab_order_report_ready',
    'lab_order_completed',
    'lab_order_cancelled',
    'payment_processed',
    'payment_failed',
    'system_message',
  ];

  NotificationPreferences? _prefs;
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadPreferences);
  }

  String _toLabel(String value) {
    return value
        .split('_')
        .map((part) => part.isEmpty
            ? part
            : '${part[0].toUpperCase()}${part.substring(1)}')
        .join(' ');
  }

  Future<void> _loadPreferences() async {
    setState(() => _isLoading = true);

    final service = ref.read(notificationServiceProvider);
    final response = await service.getNotificationPreferences();

    if (!mounted) return;

    if (response.success && response.data != null) {
      setState(() {
        _prefs = response.data;
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content:
            Text(response.error ?? 'Failed to load notification preferences'),
        backgroundColor: Colors.red,
      ),
    );
  }

  Future<void> _savePreferences() async {
    final prefs = _prefs;
    if (prefs == null) return;

    setState(() => _isSaving = true);

    final service = ref.read(notificationServiceProvider);
    final response = await service.updateNotificationPreferences(prefs);

    if (!mounted) return;

    setState(() => _isSaving = false);

    if (response.success && response.data != null) {
      setState(() => _prefs = response.data);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Notification preferences saved'),
          backgroundColor: Colors.green,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content:
            Text(response.error ?? 'Failed to update notification preferences'),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Preferences'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _isLoading ? null : _loadPreferences,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _prefs == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(UIConstants.spacingLarge),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.error_outline,
                            color: Colors.red[400], size: 40),
                        const SizedBox(height: UIConstants.spacingSmall),
                        Text(
                          'Unable to load preferences',
                          style: theme.textTheme.titleMedium,
                        ),
                        const SizedBox(height: UIConstants.spacingMedium),
                        ElevatedButton(
                          onPressed: _loadPreferences,
                          child: const Text('Try Again'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(UIConstants.spacingLarge),
                  children: [
                    Text(
                      'Categories',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    _buildCategoryTile(
                      title: 'Appointments',
                      value: _prefs!.appointments,
                      onChanged: (value) => setState(
                        () => _prefs = _prefs!.copyWith(appointments: value),
                      ),
                    ),
                    _buildCategoryTile(
                      title: 'Lab Orders',
                      value: _prefs!.labOrders,
                      onChanged: (value) => setState(
                        () => _prefs = _prefs!.copyWith(labOrders: value),
                      ),
                    ),
                    _buildCategoryTile(
                      title: 'Payments',
                      value: _prefs!.payments,
                      onChanged: (value) => setState(
                        () => _prefs = _prefs!.copyWith(payments: value),
                      ),
                    ),
                    _buildCategoryTile(
                      title: 'System',
                      value: _prefs!.system,
                      onChanged: (value) => setState(
                        () => _prefs = _prefs!.copyWith(system: value),
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingLarge),
                    Text(
                      'Quiet Hours',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Enable quiet hours'),
                      subtitle: const Text(
                          'Suppress notifications in selected time window'),
                      value: _prefs!.quietHoursEnabled,
                      onChanged: (value) => setState(
                        () =>
                            _prefs = _prefs!.copyWith(quietHoursEnabled: value),
                      ),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: _buildTimeField(
                            label: 'Start',
                            value: _prefs!.quietStart,
                            onChanged: (value) => setState(
                              () =>
                                  _prefs = _prefs!.copyWith(quietStart: value),
                            ),
                          ),
                        ),
                        const SizedBox(width: UIConstants.spacingMedium),
                        Expanded(
                          child: _buildTimeField(
                            label: 'End',
                            value: _prefs!.quietEnd,
                            onChanged: (value) => setState(
                              () => _prefs = _prefs!.copyWith(quietEnd: value),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    TextFormField(
                      key: ValueKey('timezone-${_prefs!.timezone}'),
                      initialValue: _prefs!.timezone,
                      decoration: const InputDecoration(
                        labelText: 'Timezone',
                        hintText: 'Asia/Kolkata',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => setState(
                        () => _prefs = _prefs!.copyWith(timezone: value),
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingLarge),
                    Text(
                      'Muted Types',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    ..._allNotificationTypes.map(
                      (type) => CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        controlAffinity: ListTileControlAffinity.leading,
                        value: _prefs!.mutedTypes.contains(type),
                        title: Text(_toLabel(type)),
                        onChanged: (checked) {
                          final next = List<String>.from(_prefs!.mutedTypes);
                          if (checked == true) {
                            if (!next.contains(type)) next.add(type);
                          } else {
                            next.remove(type);
                          }
                          setState(() {
                            _prefs = _prefs!.copyWith(mutedTypes: next);
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingLarge),
                    ElevatedButton.icon(
                      onPressed: _isSaving ? null : _savePreferences,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.save_outlined),
                      label: Text(_isSaving ? 'Saving...' : 'Save Preferences'),
                    ),
                  ],
                ),
    );
  }

  Widget _buildCategoryTile({
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title),
      value: value,
      onChanged: onChanged,
    );
  }

  Widget _buildTimeField({
    required String label,
    required String value,
    required ValueChanged<String> onChanged,
  }) {
    return InputDecorator(
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(value),
          IconButton(
            tooltip: 'Pick $label time',
            icon: const Icon(Icons.schedule),
            onPressed: () async {
              final parts = value.split(':');
              final initial = TimeOfDay(
                hour: int.tryParse(parts.first) ?? 22,
                minute: int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0,
              );

              final picked = await showTimePicker(
                context: context,
                initialTime: initial,
              );
              if (picked == null) return;

              final hh = picked.hour.toString().padLeft(2, '0');
              final mm = picked.minute.toString().padLeft(2, '0');
              onChanged('$hh:$mm');
            },
          ),
        ],
      ),
    );
  }
}
