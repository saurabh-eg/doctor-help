import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/lab_bottom_nav.dart';

class LabProfileScreen extends ConsumerStatefulWidget {
  const LabProfileScreen({super.key});

  @override
  ConsumerState<LabProfileScreen> createState() => _LabProfileScreenState();
}

class _LabProfileScreenState extends ConsumerState<LabProfileScreen> {
  late Future<LabSummary?> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = ref.read(labServiceProvider).getLabProviderProfile();
  }

  Future<void> _refresh() async {
    final next = ref.read(labServiceProvider).getLabProviderProfile();
    setState(() {
      _profileFuture = next;
    });
    await next;
  }

  Future<void> _openDocument(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  String _documentLabel(String type) {
    switch (type) {
      case 'registration_certificate':
        return 'Lab Registration Certificate';
      case 'government_id':
        return 'Owner Government ID';
      case 'nabl_certificate':
        return 'NABL Certificate';
      case 'pan_card':
        return 'PAN Card';
      default:
        return 'Supporting Document';
    }
  }

  Future<void> _showEditProfileDialog(LabSummary lab) async {
    final authUser = ref.read(authStateProvider).user;
    final contactNameController =
        TextEditingController(text: lab.contactName ?? authUser?.name ?? '');
    final labNameController = TextEditingController(text: lab.name);
    final phoneController = TextEditingController(text: lab.phone);
    final emailController = TextEditingController(text: lab.email);
    final addressLineController =
        TextEditingController(text: lab.address.line1);
    final cityController = TextEditingController(text: lab.address.city);
    final stateController = TextEditingController(text: lab.address.state);
    final pincodeController = TextEditingController(text: lab.address.pincode);

    bool isUpdating = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Edit Lab Profile'),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: contactNameController,
                    decoration:
                        const InputDecoration(labelText: 'Contact Person'),
                  ),
                  TextField(
                    controller: labNameController,
                    decoration: const InputDecoration(labelText: 'Lab Name'),
                  ),
                  TextField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                    decoration:
                        const InputDecoration(labelText: 'Business Phone'),
                  ),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email'),
                  ),
                  TextField(
                    controller: addressLineController,
                    decoration:
                        const InputDecoration(labelText: 'Address Line'),
                  ),
                  TextField(
                    controller: cityController,
                    decoration: const InputDecoration(labelText: 'City'),
                  ),
                  TextField(
                    controller: stateController,
                    decoration: const InputDecoration(labelText: 'State'),
                  ),
                  TextField(
                    controller: pincodeController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Pincode'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed:
                  isUpdating ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isUpdating
                  ? null
                  : () async {
                      final messenger = ScaffoldMessenger.of(this.context);

                      if (contactNameController.text.trim().isEmpty ||
                          labNameController.text.trim().isEmpty ||
                          phoneController.text.trim().isEmpty ||
                          addressLineController.text.trim().isEmpty ||
                          cityController.text.trim().isEmpty ||
                          stateController.text.trim().isEmpty ||
                          pincodeController.text.trim().isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Please fill all required fields'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      setDialogState(() => isUpdating = true);
                      final updated = await ref
                          .read(labServiceProvider)
                          .updateLabProviderProfile(
                            contactName: contactNameController.text.trim(),
                            labName: labNameController.text.trim(),
                            phone: phoneController.text.trim(),
                            email: emailController.text.trim(),
                            addressLine1: addressLineController.text.trim(),
                            city: cityController.text.trim(),
                            state: stateController.text.trim(),
                            pincode: pincodeController.text.trim(),
                          );

                      if (!mounted) return;

                      if (updated == null) {
                        if (dialogContext.mounted) {
                          setDialogState(() => isUpdating = false);
                        }
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Failed to update profile'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      setState(() {
                        _profileFuture = Future<LabSummary?>.value(updated);
                      });

                      if (!dialogContext.mounted) return;
                      Navigator.of(dialogContext).pop();

                      messenger.showSnackBar(
                        const SnackBar(
                          content: Text('Profile updated successfully'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
              child: isUpdating
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(authStateProvider.notifier).logout();
    if (!mounted) return;
    context.go(AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Profile'),
        centerTitle: true,
        actions: [
          FutureBuilder<LabSummary?>(
            future: _profileFuture,
            builder: (context, snapshot) {
              final lab = snapshot.data;
              return IconButton(
                tooltip: 'Edit Profile',
                onPressed:
                    lab == null ? null : () => _showEditProfileDialog(lab),
                icon: const Icon(Icons.edit_outlined),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<LabSummary?>(
            future: _profileFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError || snapshot.data == null) {
                return ListView(
                  children: const [
                    SizedBox(height: 200),
                    Center(child: Text('Unable to load lab profile')),
                  ],
                );
              }

              final lab = snapshot.data!;
              return ListView(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                children: [
                  Text(
                    lab.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Text(
                    lab.isNablCertified ? 'NABL Certified Lab' : 'Non-NABL Lab',
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.grey[700]),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.person_outline),
                      title: const Text('Contact Person'),
                      subtitle: Text(lab.contactName ?? 'Not set'),
                    ),
                  ),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.phone_outlined),
                      title: const Text('Phone'),
                      subtitle: Text(lab.phone),
                    ),
                  ),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.email_outlined),
                      title: const Text('Email'),
                      subtitle: Text(lab.email.isEmpty ? 'Not set' : lab.email),
                    ),
                  ),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.location_on_outlined),
                      title: const Text('Address'),
                      subtitle: Text(
                        '${lab.address.line1}, ${lab.address.city}, ${lab.address.state} ${lab.address.pincode}',
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Verification Documents',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          if (lab.verificationDocuments.isEmpty)
                            const Text('No verification documents found')
                          else
                            ...lab.verificationDocuments.map(
                              (doc) => ListTile(
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.description_outlined),
                                title: Text(_documentLabel(doc.documentType)),
                                subtitle: Text(
                                  doc.originalFileName ?? 'Open document',
                                ),
                                trailing:
                                    const Icon(Icons.open_in_new, size: 18),
                                onTap: doc.documentUrl.isEmpty
                                    ? null
                                    : () => _openDocument(doc.documentUrl),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.notifications_outlined),
                      title: const Text('Notification Preferences'),
                      subtitle: const Text(
                          'Manage alerts, quiet hours and muted types'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () =>
                          context.push(AppRoutes.notificationPreferences),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingLarge),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                          vertical: UIConstants.spacingMedium),
                    ),
                    onPressed: _logout,
                    icon: const Icon(Icons.logout),
                    label: const Text('Logout'),
                  ),
                ],
              );
            },
          ),
        ),
      ),
      bottomNavigationBar:
          const LabBottomNav(currentRoute: AppRoutes.labProfile),
    );
  }
}
