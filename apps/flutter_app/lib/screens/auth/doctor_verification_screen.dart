import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

/// Doctor Verification/Registration Screen
/// Allows new doctors to complete their profile with professional details and upload documents
class DoctorVerificationScreen extends ConsumerStatefulWidget {
  const DoctorVerificationScreen({super.key});

  @override
  ConsumerState<DoctorVerificationScreen> createState() =>
      _DoctorVerificationScreenState();
}

class _DoctorVerificationScreenState
    extends ConsumerState<DoctorVerificationScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isUploadingDocuments = false;
  bool _documentsUploaded = false;
  List<String> _uploadedDocumentUrls = [];

  // Form controllers
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _qualificationsController;
  late TextEditingController _experienceController;
  late TextEditingController _consultationFeeController;
  late TextEditingController _bioController;
  late TextEditingController _licenseNumberController;
  late TextEditingController _documentNameController;

  String _selectedSpecialization = 'General Physician';
  final List<Map<String, dynamic>> _uploadedDocuments =
      []; // Store document info: name + file path

  // Available specializations from backend
  final List<String> specializations = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedist',
    'Neurologist',
    'Psychiatrist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
    'Urologist',
  ];

  @override
  void initState() {
    super.initState();

    // Initialize empty controllers - doctor will fill in all details for the first time
    final user = ref.read(authStateProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _qualificationsController = TextEditingController();
    _experienceController = TextEditingController();
    _consultationFeeController = TextEditingController();
    _bioController = TextEditingController();
    _licenseNumberController = TextEditingController();
    _documentNameController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _qualificationsController.dispose();
    _experienceController.dispose();
    _consultationFeeController.dispose();
    _bioController.dispose();
    _licenseNumberController.dispose();
    _documentNameController.dispose();
    super.dispose();
  }

  /// Pick and add a document file
  Future<void> _addDocument() async {
    try {
      // Pick file
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
        allowMultiple: false,
      );

      if (result == null || result.files.isEmpty) {
        // User canceled the picker
        return;
      }

      final file = result.files.first;
      final fileName = file.name;
      final filePath = file.path;

      if (filePath == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to access file'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // Check for duplicates by file name
      final isDuplicate = _uploadedDocuments.any(
        (doc) => doc['name'] == fileName,
      );

      if (isDuplicate) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('This document is already uploaded'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      // Add document to list
      setState(() {
        _uploadedDocuments.add({
          'name': fileName,
          'path': filePath,
          'size': file.size,
        });
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$fileName added successfully'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error picking file: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Remove a document from the list
  void _removeDocument(Map<String, dynamic> doc) {
    setState(() {
      _uploadedDocuments.remove(doc);
      // Reset upload state when documents are removed
      _documentsUploaded = false;
      _uploadedDocumentUrls = [];
    });
  }

  /// Upload all documents to Cloudinary
  Future<void> _uploadDocuments() async {
    if (_uploadedDocuments.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add at least one document first'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isUploadingDocuments = true);

    try {
      final doctorService = ref.read(doctorServiceProvider);
      final documentUrls = <String>[];

      for (final doc in _uploadedDocuments) {
        final filePath = doc['path'] as String;
        final fileName = doc['name'] as String;

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Uploading $fileName...'),
            duration: const Duration(seconds: 30),
          ),
        );

        final uploadResponse = await doctorService.uploadDocument(filePath);

        if (!uploadResponse.success || uploadResponse.data == null) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content:
                  Text('Failed to upload $fileName: ${uploadResponse.error}'),
              backgroundColor: Colors.red,
            ),
          );
          setState(() => _isUploadingDocuments = false);
          return;
        }

        documentUrls.add(uploadResponse.data!);
      }

      if (!mounted) return;
      _uploadedDocumentUrls = documentUrls;
      setState(() {
        _isUploadingDocuments = false;
        _documentsUploaded = true;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).removeCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Documents uploaded successfully! Now submit for verification.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 3),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error uploading documents: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() => _isUploadingDocuments = false);
    }
  }

  Future<void> _handleVerification() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_documentsUploaded || _uploadedDocumentUrls.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload documents first'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authState = ref.read(authStateProvider);
      final user = authState.user;

      if (user == null) {
        throw Exception('User not found');
      }

      final nameText = _nameController.text.trim();
      final emailText = _emailController.text.trim();

      // Update user profile so name/email show immediately after registration
      final userService = ref.read(userServiceProvider);
      final userResponse = await userService.updateProfile(
        name: nameText,
        email: emailText.isNotEmpty ? emailText : null,
      );

      if (!userResponse.success || userResponse.data == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(userResponse.error ?? 'Failed to update profile'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      ref.read(authStateProvider.notifier).updateUser(userResponse.data!);

      final doctorService = ref.read(doctorServiceProvider);

      // Parse experience to int
      final experience = int.tryParse(_experienceController.text) ?? 0;
      final fee = double.tryParse(_consultationFeeController.text) ?? 0;

      // Register doctor with verification details and pre-uploaded document URLs
      final response = await doctorService.registerDoctor(
        userId: user.id,
        specialization: _selectedSpecialization,
        qualification: _qualificationsController.text.trim(),
        experience: experience,
        consultationFee: fee,
        licenseNumber: _licenseNumberController.text.trim().isEmpty
            ? null
            : _licenseNumberController.text.trim(),
        bio: _bioController.text.trim().isEmpty
            ? null
            : _bioController.text.trim(),
        documents: _uploadedDocumentUrls,
      );

      if (!mounted) return;

      if (response.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Registration submitted successfully!\nAwaiting admin verification.',
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );

        // Navigate to dashboard after brief delay
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          context.go(AppRoutes.doctorDashboard);
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              response.error ?? 'Failed to register as doctor',
            ),
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
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Doctor Verification'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(UIConstants.spacingLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'Complete Your Profile',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: UIConstants.spacingSmall),
              Text(
                'Provide your professional details for verification',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: UIConstants.spacing3XLarge),

              // Form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Personal Information Section
                    const _SectionHeader(title: 'Personal Information'),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Full Name',
                      hintText: 'Enter your full name',
                      controller: _nameController,
                      enabled: true,
                      prefixIcon: const Icon(Icons.person),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Name is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Email',
                      hintText: 'Enter your email address',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      enabled: true,
                      prefixIcon: const Icon(Icons.email),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Email is required';
                        }
                        if (!RegExp(
                                r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
                            .hasMatch(value)) {
                          return 'Invalid email format';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    // Professional Information Section
                    const _SectionHeader(title: 'Professional Information'),
                    const SizedBox(height: UIConstants.spacingMedium),

                    // Specialization Dropdown
                    DropdownButtonFormField<String>(
                      value: _selectedSpecialization,
                      decoration: InputDecoration(
                        label: const Text('Specialization'),
                        hintText: 'Select specialization',
                        prefixIcon: const Icon(Icons.medical_services),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(
                            UIConstants.radiusMedium,
                          ),
                        ),
                      ),
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
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Specialization is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Qualifications',
                      hintText: 'e.g., MBBS, MD, DM',
                      controller: _qualificationsController,
                      prefixIcon: const Icon(Icons.school),
                      maxLines: 2,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Qualifications are required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Years of Experience',
                      hintText: 'e.g., 10',
                      controller: _experienceController,
                      keyboardType: TextInputType.number,
                      prefixIcon: const Icon(Icons.timeline),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Experience is required';
                        }
                        if (int.tryParse(value) == null) {
                          return 'Please enter a valid number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Medical License Number',
                      hintText: 'e.g., MCI-12345678',
                      controller: _licenseNumberController,
                      prefixIcon: const Icon(Icons.badge),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'License number is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    // Consultation Fee Section
                    const _SectionHeader(title: 'Practice Information'),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Consultation Fee (₹)',
                      hintText: 'e.g., 500',
                      controller: _consultationFeeController,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      prefixIcon: const Icon(Icons.currency_rupee),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Consultation fee is required';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Please enter a valid amount';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),

                    AppTextField(
                      label: 'Bio (Optional)',
                      hintText:
                          'Tell patients about your experience and approach',
                      controller: _bioController,
                      maxLines: 4,
                      prefixIcon: const Icon(Icons.description),
                    ),
                    const SizedBox(height: UIConstants.spacing2XLarge),

                    // Document Upload Section
                    const _SectionHeader(title: 'Documents'),
                    const SizedBox(height: UIConstants.spacingMedium),

                    Container(
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                        border: Border.all(
                          color: Colors.blue.withOpacity(0.2),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Upload Medical Documents',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '*Required',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.red,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            'e.g., Degree Certificate, License, Registration, Specialization Certificate',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingMedium),

                          // Upload Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _addDocument,
                              icon: const Icon(Icons.upload_file),
                              label: const Text('Choose File to Upload'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: UIConstants.spacingMedium,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                    UIConstants.radiusMedium,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            'Allowed: PDF, JPG, PNG, DOC, DOCX',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                              fontStyle: FontStyle.italic,
                            ),
                          ),

                          // Uploaded documents list
                          if (_uploadedDocuments.isNotEmpty) ...[
                            const SizedBox(height: UIConstants.spacingMedium),
                            Text(
                              'Selected Documents (${_uploadedDocuments.length})',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[700],
                              ),
                            ),
                            const SizedBox(height: UIConstants.spacingSmall),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _uploadedDocuments.length,
                              separatorBuilder: (_, __) => const SizedBox(
                                  height: UIConstants.spacingSmall),
                              itemBuilder: (context, index) {
                                final doc = _uploadedDocuments[index];
                                final fileName = doc['name'] as String;
                                final fileSize = doc['size'] as int;
                                final fileSizeKB =
                                    (fileSize / 1024).toStringAsFixed(1);

                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: UIConstants.spacingMedium,
                                    vertical: UIConstants.spacingSmall,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _documentsUploaded
                                        ? Colors.green.withOpacity(0.1)
                                        : Colors.blue.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(
                                      UIConstants.radiusSmall,
                                    ),
                                    border: Border.all(
                                      color: _documentsUploaded
                                          ? Colors.green.withOpacity(0.3)
                                          : Colors.blue.withOpacity(0.3),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        _documentsUploaded
                                            ? Icons.check_circle
                                            : Icons.description,
                                        color: _documentsUploaded
                                            ? Colors.green
                                            : Colors.blue,
                                        size: 20,
                                      ),
                                      const SizedBox(
                                          width: UIConstants.spacingSmall),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              fileName,
                                              style: theme.textTheme.bodySmall
                                                  ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            Text(
                                              '$fileSizeKB KB',
                                              style: theme.textTheme.bodySmall
                                                  ?.copyWith(
                                                color: Colors.grey[600],
                                                fontSize: 11,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(
                                          width: UIConstants.spacingSmall),
                                      if (!_isUploadingDocuments)
                                        GestureDetector(
                                          onTap: () => _removeDocument(doc),
                                          child: const Icon(
                                            Icons.close,
                                            color: Colors.red,
                                            size: 18,
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ],

                          // Upload button (visible when documents are selected but not uploaded)
                          if (_uploadedDocuments.isNotEmpty &&
                              !_documentsUploaded) ...[
                            const SizedBox(height: UIConstants.spacingMedium),
                            if (_isUploadingDocuments)
                              Column(
                                children: [
                                  Center(
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        theme.primaryColor,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(
                                      height: UIConstants.spacingSmall),
                                  Center(
                                    child: Text(
                                      'Uploading documents...',
                                      style:
                                          theme.textTheme.bodySmall?.copyWith(
                                        color: theme.primaryColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            else
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: _uploadDocuments,
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: UIConstants.spacingMedium,
                                    ),
                                    backgroundColor: theme.primaryColor,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.cloud_upload),
                                      const SizedBox(
                                          width: UIConstants.spacingSmall),
                                      Text(
                                        'Upload Documents',
                                        style: theme.textTheme.labelMedium
                                            ?.copyWith(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],

                          // Success indicator (visible when uploaded)
                          if (_documentsUploaded &&
                              _isUploadingDocuments == false) ...[
                            const SizedBox(height: UIConstants.spacingMedium),
                            Container(
                              padding: const EdgeInsets.all(
                                  UIConstants.spacingSmall),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(
                                  UIConstants.radiusSmall,
                                ),
                                border: Border.all(
                                  color: Colors.green.withOpacity(0.3),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.check_circle,
                                    color: Colors.green,
                                    size: 20,
                                  ),
                                  const SizedBox(
                                      width: UIConstants.spacingSmall),
                                  Expanded(
                                    child: Text(
                                      'Documents uploaded successfully!',
                                      style:
                                          theme.textTheme.bodySmall?.copyWith(
                                        color: Colors.green,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacing3XLarge),

                    // Submit Button
                    AppButton(
                      label: 'Submit for Verification',
                      isLoading: _isLoading,
                      onPressed:
                          _documentsUploaded ? _handleVerification : null,
                    ),

                    // Message when documents not uploaded
                    if (!_documentsUploaded &&
                        _uploadedDocuments.isNotEmpty) ...[
                      const SizedBox(height: UIConstants.spacingMedium),
                      Container(
                        padding:
                            const EdgeInsets.all(UIConstants.spacingMedium),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(
                            UIConstants.radiusMedium,
                          ),
                          border: Border.all(
                            color: Colors.orange.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.info,
                              color: Colors.orange[800],
                              size: 20,
                            ),
                            const SizedBox(width: UIConstants.spacingSmall),
                            Expanded(
                              child: Text(
                                'Upload documents first to enable the Submit button',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.orange[800],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: UIConstants.spacingMedium),

                    // Info Text
                    Container(
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                      ),
                      child: Text(
                        'Your profile will be reviewed by our admin team. You\'ll receive confirmation once verified.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.primaryColor,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Section header widget for grouping form fields
class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }
}
