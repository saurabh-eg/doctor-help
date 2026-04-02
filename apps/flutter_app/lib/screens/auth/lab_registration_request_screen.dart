import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';

import '../../config/constants.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../utils/validators.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class LabRegistrationRequestScreen extends ConsumerStatefulWidget {
  const LabRegistrationRequestScreen({super.key});

  @override
  ConsumerState<LabRegistrationRequestScreen> createState() =>
      _LabRegistrationRequestScreenState();
}

class _LabRegistrationRequestScreenState
    extends ConsumerState<LabRegistrationRequestScreen> {
  final _formKey = GlobalKey<FormState>();

  final _labNameController = TextEditingController();
  final _contactNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressLineController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _notesController = TextEditingController();

  bool _isNablCertified = false;
  bool _isSubmitting = false;
  bool _isUploadingDocument = false;
  String _selectedDocumentType = 'registration_certificate';
  final List<Map<String, dynamic>> _uploadedDocuments = [];

  static const Map<String, String> _documentTypeLabels = {
    'registration_certificate': 'Lab Registration Certificate',
    'government_id': 'Owner Government ID',
    'nabl_certificate': 'NABL Certificate',
    'pan_card': 'PAN Card',
    'other': 'Other Supporting Document',
  };

  String _maskPhone(String phone) {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length != 10) return phone;
    return '+91 ${digits.substring(0, 2)}******${digits.substring(8)}';
  }

  Future<void> _copyVerifiedPhone(String phone) async {
    await Clipboard.setData(ClipboardData(text: phone.trim()));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Verified phone copied'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  void dispose() {
    _labNameController.dispose();
    _contactNameController.dispose();
    _emailController.dispose();
    _addressLineController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_uploadedDocuments.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Upload at least one verification document for admin verification'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final service = ref.read(labRegistrationServiceProvider);
    final response = await service.submitRegistrationRequest(
      labName: _labNameController.text.trim(),
      contactName: _contactNameController.text.trim(),
      email: _emailController.text.trim().isEmpty
          ? null
          : _emailController.text.trim(),
      addressLine1: _addressLineController.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      pincode: _pincodeController.text.trim(),
      latitude: 0,
      longitude: 0,
      isNablCertified: _isNablCertified,
      verificationDocuments: _uploadedDocuments,
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
    );

    if (!mounted) return;

    setState(() => _isSubmitting = false);

    if (response.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Request submitted. Our admin team will review it soon.'),
          backgroundColor: Colors.green,
        ),
      );

      // This flow is pre-approval onboarding; keep user logged out until admin approval
      // to avoid redirect loops back to role selection for incomplete auth profile.
      await ref.read(authStateProvider.notifier).logout();
      if (!mounted) return;

      context.go(AppRoutes.labPendingApproval);
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content:
            Text(response.error ?? 'Failed to submit registration request'),
        backgroundColor: Colors.red,
      ),
    );
  }

  Future<void> _pickAndUploadDocument() async {
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: <String>['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      withData: false,
    );

    final path = picked?.files.single.path;
    if (path == null || path.isEmpty) return;

    setState(() => _isUploadingDocument = true);

    final service = ref.read(labRegistrationServiceProvider);
    final response = await service.uploadDocument(
      filePath: path,
      documentType: _selectedDocumentType,
    );

    if (!mounted) return;

    setState(() => _isUploadingDocument = false);

    if (!response.success || response.data == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Failed to upload document'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final url = response.data!['url']?.toString();
    final fileName = response.data!['fileName']?.toString();

    if (url == null || url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Document upload failed. Try again.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _uploadedDocuments.add({
        'documentType': _selectedDocumentType,
        'documentUrl': url,
        if (fileName != null && fileName.isNotEmpty)
          'originalFileName': fileName,
        'uploadedAt': DateTime.now().toUtc().toIso8601String(),
      });
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Verification document uploaded'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final verifiedPhone = ref.watch(authStateProvider).user?.phone;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Provider Signup'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(UIConstants.spacingLarge),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Register Your Lab',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                Text(
                  'Submit details once. We will activate login after admin approval.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(UIConstants.spacingSmall),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.06),
                    borderRadius:
                        BorderRadius.circular(UIConstants.radiusSmall),
                    border: Border.all(color: Colors.blue.withOpacity(0.2)),
                  ),
                  child: Text(
                    'Your verified account phone is linked automatically. Add an alternate business number only if needed.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.blue[800],
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                ),
                if (verifiedPhone != null && verifiedPhone.trim().isNotEmpty)
                  Padding(
                    padding:
                        const EdgeInsets.only(top: UIConstants.spacingSmall),
                    child: InkWell(
                      borderRadius:
                          BorderRadius.circular(UIConstants.radiusSmall),
                      onTap: () => _copyVerifiedPhone(verifiedPhone),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(UIConstants.spacingSmall),
                        decoration: BoxDecoration(
                          color: Colors.grey.withOpacity(0.08),
                          borderRadius:
                              BorderRadius.circular(UIConstants.radiusSmall),
                          border:
                              Border.all(color: Colors.grey.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Verified account phone: ${_maskPhone(verifiedPhone)}',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: Colors.black87,
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                            ),
                            const SizedBox(width: UIConstants.spacingSmall),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.copy_rounded,
                                  size: 14,
                                  color: Colors.grey[700],
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Copy',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: Colors.grey[700],
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: UIConstants.spacingXLarge),
                AppTextField(
                  label: 'Lab Name',
                  controller: _labNameController,
                  validator: (value) =>
                      Validators.validateRequired(value, 'Lab name'),
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                AppTextField(
                  label: 'Contact Person Name',
                  controller: _contactNameController,
                  validator: Validators.validateName,
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                AppTextField(
                  label: 'Email (Optional)',
                  keyboardType: TextInputType.emailAddress,
                  controller: _emailController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return null;
                    return Validators.validateEmail(value.trim());
                  },
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                AppTextField(
                  label: 'Address Line',
                  controller: _addressLineController,
                  validator: (value) =>
                      Validators.validateRequired(value, 'Address'),
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        label: 'City',
                        controller: _cityController,
                        validator: (value) =>
                            Validators.validateRequired(value, 'City'),
                      ),
                    ),
                    const SizedBox(width: UIConstants.spacingMedium),
                    Expanded(
                      child: AppTextField(
                        label: 'State',
                        controller: _stateController,
                        validator: (value) =>
                            Validators.validateRequired(value, 'State'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                AppTextField(
                  label: 'Pincode',
                  keyboardType: TextInputType.number,
                  controller: _pincodeController,
                  validator: (value) =>
                      Validators.validateRequired(value, 'Pincode'),
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('NABL Certified'),
                  value: _isNablCertified,
                  onChanged: (value) {
                    setState(() => _isNablCertified = value);
                  },
                ),
                const SizedBox(height: UIConstants.spacingMedium),
                Text(
                  'Verification Documents',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                Text(
                  'Upload valid proof so admin can verify this lab is genuine.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                DropdownButtonFormField<String>(
                  value: _selectedDocumentType,
                  decoration: const InputDecoration(
                    labelText: 'Document Type',
                    border: OutlineInputBorder(),
                  ),
                  items: _documentTypeLabels.entries
                      .map(
                        (entry) => DropdownMenuItem<String>(
                          value: entry.key,
                          child: Text(entry.value),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() => _selectedDocumentType = value);
                  },
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                AppButton(
                  label: 'Upload Document (PDF/Image)',
                  isLoading: _isUploadingDocument,
                  onPressed: _pickAndUploadDocument,
                ),
                const SizedBox(height: UIConstants.spacingSmall),
                if (_uploadedDocuments.isEmpty)
                  Text(
                    'No documents uploaded yet (minimum 1 required).',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.red[700],
                          fontWeight: FontWeight.w600,
                        ),
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _uploadedDocuments.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;
                      final type = _documentTypeLabels[item['documentType']] ??
                          'Document';
                      final fileName = item['originalFileName']?.toString() ??
                          'Uploaded file';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          dense: true,
                          title: Text(type),
                          subtitle: Text(fileName),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline,
                                color: Colors.red),
                            onPressed: () {
                              setState(
                                  () => _uploadedDocuments.removeAt(index));
                            },
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                const SizedBox(height: UIConstants.spacingMedium),
                AppTextField(
                  label: 'Notes (Optional)',
                  minLines: 3,
                  maxLines: 4,
                  controller: _notesController,
                ),
                const SizedBox(height: UIConstants.spacing2XLarge),
                AppButton(
                  label: 'Submit Request',
                  isLoading: _isSubmitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
