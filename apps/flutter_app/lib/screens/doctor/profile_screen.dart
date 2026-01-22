import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../models/doctor.dart';
import '../../providers/doctor_provider.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/doctor_bottom_nav.dart';

class DoctorProfileScreen extends ConsumerStatefulWidget {
  const DoctorProfileScreen({super.key});

  @override
  ConsumerState<DoctorProfileScreen> createState() =>
      _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends ConsumerState<DoctorProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _licenseController;
  late TextEditingController _qualificationsController;
  late TextEditingController _experienceController;
  late TextEditingController _consultationFeeController;

  bool _isEditing = false;
  bool _isSaving = false;
  String _selectedSpecialization = 'Cardiology';

  final List<String> specializations = [
    'Cardiology',
    'Dermatology',
    'Orthopedic',
    'Neurology',
    'Pediatric',
    'General',
  ];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authStateProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _addressController = TextEditingController(text: user?.address ?? '');
    _licenseController = TextEditingController(text: 'MCI-12345');
    _qualificationsController = TextEditingController(text: 'MD, MBBS');
    _experienceController = TextEditingController(text: '10 years');
    _consultationFeeController = TextEditingController(text: '500');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _licenseController.dispose();
    _qualificationsController.dispose();
    _experienceController.dispose();
    _consultationFeeController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_nameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill all required fields'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final userService = ref.read(userServiceProvider);
      final success = await userService.updateProfile(
        name: _nameController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        address:
            _addressController.text.isNotEmpty ? _addressController.text : null,
      );

      if (!mounted) return;

      if (success) {
        setState(() => _isEditing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update profile'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authStateProvider.notifier).logout();
      if (mounted) {
        context.go(AppRoutes.login);
      }
    }
  }

  Future<void> _manageAvailability() async {
    int selectedDay = 0;
    final startController = TextEditingController();
    final endController = TextEditingController();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        final padding = MediaQuery.of(context).viewInsets;
        return Padding(
          padding: EdgeInsets.only(
            bottom: padding.bottom,
            left: UIConstants.spacingLarge,
            right: UIConstants.spacingLarge,
            top: UIConstants.spacingLarge,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Manage Availability',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              DropdownButtonFormField<int>(
                value: selectedDay,
                items: List.generate(
                  AppConstants.daysOfWeek.length,
                  (i) => DropdownMenuItem(
                    value: i,
                    child: Text(AppConstants.daysOfWeek[i]),
                  ),
                ),
                onChanged: (v) {
                  if (v != null) {
                    selectedDay = v;
                  }
                },
                decoration: InputDecoration(
                  labelText: 'Day of Week',
                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(UIConstants.radiusMedium),
                  ),
                ),
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              AppTextField(
                label: 'Start Time (HH:MM)',
                hintText: 'e.g., 09:00',
                controller: startController,
              ),
              const SizedBox(height: UIConstants.spacingMedium),
              AppTextField(
                label: 'End Time (HH:MM)',
                hintText: 'e.g., 12:00',
                controller: endController,
              ),
              const SizedBox(height: UIConstants.spacingLarge),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        final start = startController.text.trim();
                        final end = endController.text.trim();
                        final messenger = ScaffoldMessenger.of(context);
                        final navigator = Navigator.of(context);

                        if (start.isEmpty || end.isEmpty) {
                          messenger.showSnackBar(
                            const SnackBar(
                              content:
                                  Text('Please provide start and end times'),
                              backgroundColor: Colors.red,
                            ),
                          );
                          return;
                        }

                        final doctorState = ref.read(doctorProvider);
                        final existing =
                            doctorState.profile?.availableSlots ?? [];
                        final updated = [
                          ...existing,
                          TimeSlot(
                              day: selectedDay, startTime: start, endTime: end),
                        ];

                        final ok = await ref
                            .read(doctorProvider.notifier)
                            .updateAvailability(updated);

                        if (!mounted) return;

                        if (ok) {
                          navigator.pop();
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text('Availability updated'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        } else {
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text('Failed to update availability'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                      ),
                      child: const Text('Save'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: UIConstants.spacingLarge),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Doctor Profile'),
        centerTitle: true,
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () => setState(() => _isEditing = true),
              tooltip: 'Edit Profile',
            )
          else
            TextButton(
              onPressed: () => setState(() => _isEditing = false),
              child: const Text('Cancel'),
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(UIConstants.spacingLarge),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_isEditing) ...[
                  // Edit Mode
                  Text(
                    'Edit Profile Information',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  // Basic Info
                  AppTextField(
                    label: 'Full Name',
                    hintText: 'Enter your full name',
                    controller: _nameController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Email',
                    hintText: 'Enter your email',
                    controller: _emailController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Phone',
                    hintText: 'Enter your phone number',
                    controller: _phoneController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Address',
                    hintText: 'Enter your address',
                    controller: _addressController,
                    maxLines: 2,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),

                  // Professional Info
                  Text(
                    'Professional Information',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  // Specialization Dropdown
                  DropdownButtonFormField<String>(
                    value: _selectedSpecialization,
                    items: specializations
                        .map((spec) => DropdownMenuItem(
                              value: spec,
                              child: Text(spec),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _selectedSpecialization = value);
                      }
                    },
                    decoration: InputDecoration(
                      labelText: 'Specialization',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'License Number',
                    hintText: 'Enter your medical license number',
                    controller: _licenseController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Qualifications',
                    hintText: 'e.g., MBBS, MD',
                    controller: _qualificationsController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Years of Experience',
                    hintText: 'e.g., 10 years',
                    controller: _experienceController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Consultation Fee (₹)',
                    hintText: 'Enter consultation fee',
                    controller: _consultationFeeController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  AppButton(
                    label: _isSaving ? 'Saving...' : 'Save Changes',
                    onPressed: _isSaving ? null : _saveProfile,
                    isLoading: _isSaving,
                  ),
                ] else ...[
                  // Display Mode
                  // Profile Header
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: theme.primaryColor.withOpacity(0.2),
                          child: Icon(
                            Icons.person,
                            size: 60,
                            color: theme.primaryColor,
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingMedium),
                        Text(
                          user?.name ?? 'Doctor',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: UIConstants.spacingMedium,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Verified Doctor',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.green,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Basic Info
                  Text(
                    'Profile Information',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Email',
                    value: user?.email ?? 'N/A',
                    icon: Icons.email_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Phone',
                    value: user?.phone ?? 'N/A',
                    icon: Icons.phone_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  if (user?.address != null)
                    _ProfileInfoCard(
                      label: 'Address',
                      value: user!.address!,
                      icon: Icons.location_on_outlined,
                    ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Professional Info
                  Text(
                    'Professional Information',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Specialization',
                    value: _selectedSpecialization,
                    icon: Icons.medical_services_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'License',
                    value: _licenseController.text,
                    icon: Icons.badge_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Qualifications',
                    value: _qualificationsController.text,
                    icon: Icons.school_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Experience',
                    value: _experienceController.text,
                    icon: Icons.work_outline,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Consultation Fee',
                    value: '₹${_consultationFeeController.text}',
                    icon: Icons.currency_rupee,
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Account Settings
                  Text(
                    'Account Settings',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _AccountOption(
                    icon: Icons.schedule,
                    label: 'Manage Availability',
                    onTap: _manageAvailability,
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  _AccountOption(
                    icon: Icons.notifications,
                    label: 'Notification Settings',
                    onTap: () {},
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  _AccountOption(
                    icon: Icons.security,
                    label: 'Change Password',
                    onTap: () {},
                  ),
                  const SizedBox(height: UIConstants.spacing2XLarge),

                  // Logout Button
                  ElevatedButton.icon(
                    onPressed: _logout,
                    icon: const Icon(Icons.logout),
                    label: const Text('Logout'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      minimumSize: const Size(double.infinity, 50),
                    ),
                  ),

                  const SizedBox(height: UIConstants.spacingLarge),
                  Center(
                    child: Text(
                      'Doctor Help v1.0.0',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[500],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const DoctorBottomNav(
        currentRoute: '/doctor/profile',
      ),
    );
  }
}

class _ProfileInfoCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _ProfileInfoCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.grey[600],
            size: 24,
          ),
          const SizedBox(width: UIConstants.spacingMedium),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AccountOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _AccountOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      child: Container(
        padding: const EdgeInsets.all(UIConstants.spacingMedium),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: theme.primaryColor,
            ),
            const SizedBox(width: UIConstants.spacingMedium),
            Expanded(
              child: Text(
                label,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }
}
