import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
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
  late TextEditingController _qualificationsController;
  late TextEditingController _experienceController;
  late TextEditingController _consultationFeeController;

  bool _isEditing = false;
  bool _isSaving = false;
  bool _isUploadingPhoto = false;
  String _selectedSpecialization = 'General Physician';

  // Use canonical list from AppConstants
  List<String> get specializations => AppConstants.specialties;

  String _normalizeSpecialization(String? value) {
    if (value == null || value.trim().isEmpty) {
      return specializations.first;
    }

    final normalized = value.trim();
    final match = specializations.firstWhere(
      (item) => item.toLowerCase() == normalized.toLowerCase(),
      orElse: () => specializations.first,
    );

    return match;
  }

  Future<void> _openDocument(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid document link'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => DocumentViewerScreen(
          documentUrl: url,
          title: 'License Document',
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final user = ref.read(authStateProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _addressController = TextEditingController(text: user?.address ?? '');
    _qualificationsController = TextEditingController(text: '');
    _experienceController = TextEditingController(text: '');
    _consultationFeeController = TextEditingController(text: '');

    // Fetch fresh user data and doctor profile
    Future.microtask(() async {
      await ref.read(authStateProvider.notifier).refreshUser();
      await ref.read(doctorProvider.notifier).fetchProfile();

      // Update controllers with refreshed data
      if (mounted) {
        final refreshedUser = ref.read(authStateProvider).user;
        _nameController.text = refreshedUser?.name ?? '';
        _emailController.text = refreshedUser?.email ?? '';
        _phoneController.text = refreshedUser?.phone ?? '';
        _addressController.text = refreshedUser?.address ?? '';
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _qualificationsController.dispose();
    _experienceController.dispose();
    _consultationFeeController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadPhoto() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    final picked =
        await picker.pickImage(source: source, maxWidth: 800, imageQuality: 85);
    if (picked == null) return;

    setState(() => _isUploadingPhoto = true);

    try {
      final doctorService = ref.read(doctorServiceProvider);
      final response = await doctorService.uploadPhoto(picked.path);

      if (!mounted) return;

      if (response.success &&
          response.data != null &&
          response.data!.isNotEmpty) {
        // Refresh doctor profile to get updated photoUrl
        await ref.read(doctorProvider.notifier).fetchProfile();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile photo updated'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error ?? 'Failed to upload photo'),
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
        setState(() => _isUploadingPhoto = false);
      }
    }
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
      // 1. Update basic user profile
      final userService = ref.read(userServiceProvider);
      final response = await userService.updateProfile(
        name: _nameController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        address:
            _addressController.text.isNotEmpty ? _addressController.text : null,
      );

      if (!mounted) return;

      if (response.success && response.data != null) {
        ref.read(authStateProvider.notifier).updateUser(response.data!);
        _nameController.text = response.data!.name ?? '';
        _emailController.text = response.data!.email ?? '';
        _phoneController.text = response.data!.phone;
        _addressController.text = response.data!.address ?? '';
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update profile'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // 2. Update professional doctor fields
      final doctorState = ref.read(doctorProvider);
      final doctorProfile = doctorState.profile;
      if (doctorProfile != null) {
        final doctorService = ref.read(doctorServiceProvider);
        final expValue = int.tryParse(_experienceController.text);
        final feeValue = double.tryParse(_consultationFeeController.text);

        final doctorResponse = await doctorService.updateDoctorProfile(
          doctorProfile.id,
          specialization: _selectedSpecialization,
          qualification: _qualificationsController.text.isNotEmpty
              ? _qualificationsController.text
              : null,
          experience: expValue,
          consultationFee: feeValue,
        );

        if (!mounted) return;

        if (doctorResponse.success && doctorResponse.data != null) {
          // Refresh doctor profile in state
          await ref.read(doctorProvider.notifier).fetchProfile();
        }
      }

      if (!mounted) return;
      setState(() => _isEditing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: Colors.green,
        ),
      );
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
    final doctorState = ref.watch(doctorProvider);
    final doctorProfile = doctorState.profile;
    final theme = Theme.of(context);

    // Update professional controllers when doctor profile loads
    if (doctorProfile != null && _qualificationsController.text.isEmpty) {
      _selectedSpecialization =
          _normalizeSpecialization(doctorProfile.specialization);
      _qualificationsController.text = doctorProfile.qualification;
      _experienceController.text = '${doctorProfile.experience}';
      _consultationFeeController.text =
          doctorProfile.consultationFee.toString();
    }

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
                    value: _normalizeSpecialization(_selectedSpecialization),
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
                    label: 'Qualifications',
                    hintText: 'e.g., MBBS, MD',
                    controller: _qualificationsController,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Years of Experience',
                    hintText: 'e.g., 10',
                    controller: _experienceController,
                    keyboardType: TextInputType.number,
                    enabled: _isEditing && !_isSaving,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),

                  AppTextField(
                    label: 'Consultation Fee (₹)',
                    hintText: 'Enter consultation fee',
                    controller: _consultationFeeController,
                    keyboardType: TextInputType.number,
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
                        GestureDetector(
                          onTap: _isUploadingPhoto ? null : _pickAndUploadPhoto,
                          child: Stack(
                            children: [
                              CircleAvatar(
                                radius: 50,
                                backgroundColor:
                                    theme.primaryColor.withOpacity(0.2),
                                backgroundImage:
                                    doctorProfile?.photoUrl != null &&
                                            doctorProfile!.photoUrl!.isNotEmpty
                                        ? NetworkImage(doctorProfile.photoUrl!)
                                        : null,
                                child: doctorProfile?.photoUrl != null &&
                                        doctorProfile!.photoUrl!.isNotEmpty
                                    ? null
                                    : Icon(
                                        Icons.person,
                                        size: 60,
                                        color: theme.primaryColor,
                                      ),
                              ),
                              if (_isUploadingPhoto)
                                Positioned.fill(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.4),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Center(
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 3,
                                      ),
                                    ),
                                  ),
                                )
                              else
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: theme.primaryColor,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                          color: Colors.white, width: 2),
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                            ],
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
                            color: (doctorProfile?.isVerified ?? false)
                                ? Colors.green.withOpacity(0.1)
                                : Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            (doctorProfile?.isVerified ?? false)
                                ? 'Verified Doctor'
                                : 'Pending Verification',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: (doctorProfile?.isVerified ?? false)
                                  ? Colors.green
                                  : Colors.orange,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        // Show verification pending notice
                        if (!(doctorProfile?.isVerified ?? false)) ...[
                          const SizedBox(height: UIConstants.spacingMedium),
                          Container(
                            padding:
                                const EdgeInsets.all(UIConstants.spacingMedium),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(
                                  UIConstants.radiusMedium),
                              border: Border.all(
                                color: Colors.orange.withOpacity(0.3),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.info_outline,
                                      color: Colors.orange,
                                      size: 20,
                                    ),
                                    const SizedBox(
                                        width: UIConstants.spacingMedium),
                                    Expanded(
                                      child: Text(
                                        'Your profile is pending verification by our admin team.',
                                        style:
                                            theme.textTheme.bodySmall?.copyWith(
                                          color: Colors.orange[800],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(
                                    height: UIConstants.spacingSmall),
                                Text(
                                  'You will be able to accept appointments once your profile is verified.',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.orange[700],
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
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
                    value: doctorProfile?.specialization ?? 'N/A',
                    icon: Icons.medical_services_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  if (doctorProfile != null &&
                      doctorProfile.documents.isNotEmpty)
                    _ProfileInfoCard(
                      label: 'License',
                      value: 'Tap to view your document',
                      icon: Icons.badge_outlined,
                      onTap: () => _openDocument(
                        doctorProfile.documents.first,
                      ),
                    ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Qualifications',
                    value: doctorProfile?.qualification ?? 'N/A',
                    icon: Icons.school_outlined,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Experience',
                    value: doctorProfile != null
                        ? '${doctorProfile.experience} years'
                        : 'N/A',
                    icon: Icons.work_outline,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  _ProfileInfoCard(
                    label: 'Consultation Fee',
                    value: doctorProfile != null
                        ? '₹${doctorProfile.consultationFee.toStringAsFixed(0)}'
                        : 'N/A',
                    icon: Icons.currency_rupee,
                  ),
                  if (doctorProfile?.bio != null &&
                      doctorProfile!.bio!.isNotEmpty) ...[
                    const SizedBox(height: UIConstants.spacingMedium),
                    _ProfileInfoCard(
                      label: 'Bio',
                      value: doctorProfile.bio!,
                      icon: Icons.description_outlined,
                    ),
                  ],
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
                    onTap: () =>
                        context.push(AppRoutes.doctorNotificationSettings),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  _AccountOption(
                    icon: Icons.phone_android,
                    label: 'Change Phone Number',
                    onTap: () => context.push(AppRoutes.doctorChangePassword),
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
        currentRoute: AppRoutes.doctorProfile,
      ),
    );
  }
}

class _ProfileInfoCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final VoidCallback? onTap;

  const _ProfileInfoCard({
    required this.label,
    required this.value,
    required this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final content = Container(
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
          if (onTap != null)
            Icon(
              Icons.open_in_new,
              color: Colors.grey[500],
              size: 18,
            ),
        ],
      ),
    );

    if (onTap == null) {
      return content;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      child: content,
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

class DocumentViewerScreen extends StatelessWidget {
  final String documentUrl;
  final String title;

  const DocumentViewerScreen({
    super.key,
    required this.documentUrl,
    required this.title,
  });

  bool _isPdf(String url) {
    final path = Uri.tryParse(url)?.path.toLowerCase() ?? '';
    return path.endsWith('.pdf');
  }

  bool _isImage(String url) {
    final path = Uri.tryParse(url)?.path.toLowerCase() ?? '';
    return path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.gif') ||
        path.endsWith('.webp');
  }

  @override
  Widget build(BuildContext context) {
    final isPdf = _isPdf(documentUrl);
    final isImage = _isImage(documentUrl);

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: SafeArea(
        child: Builder(
          builder: (context) {
            if (isPdf) {
              return SfPdfViewer.network(documentUrl);
            }

            if (isImage) {
              return InteractiveViewer(
                child: Center(
                  child: Image.network(
                    documentUrl,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const Text(
                      'Failed to load image',
                    ),
                  ),
                ),
              );
            }

            return Center(
              child: Padding(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.insert_drive_file, size: 48),
                    const SizedBox(height: UIConstants.spacingMedium),
                    const Text(
                      'Preview not supported for this file type.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    ElevatedButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse(documentUrl);
                        await launchUrl(
                          uri,
                          mode: LaunchMode.externalApplication,
                        );
                      },
                      icon: const Icon(Icons.open_in_new),
                      label: const Text('Open Externally'),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
