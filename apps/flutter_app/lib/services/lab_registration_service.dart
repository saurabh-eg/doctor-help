import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Public service for lab self-registration requests.
class LabRegistrationService {
  final ApiService _apiService;

  LabRegistrationService(this._apiService);

  List<Map<String, dynamic>> _normalizeVerificationDocuments(
    List<Map<String, dynamic>> verificationDocuments,
  ) {
    return verificationDocuments.map((document) {
      final normalized = Map<String, dynamic>.from(document);
      final uploadedAt = normalized['uploadedAt'];

      if (uploadedAt is DateTime) {
        normalized['uploadedAt'] = uploadedAt.toUtc().toIso8601String();
      } else if (uploadedAt is String && uploadedAt.trim().isNotEmpty) {
        final parsed = DateTime.tryParse(uploadedAt);
        if (parsed != null) {
          normalized['uploadedAt'] = parsed.toUtc().toIso8601String();
        }
      }

      return normalized;
    }).toList(growable: false);
  }

  Future<ApiResponse<Map<String, dynamic>>> uploadDocument({
    required String filePath,
    required String documentType,
  }) {
    return _apiService.uploadFile(
      ApiEndpoints.uploadLabRegistrationDocument,
      filePath: filePath,
      fieldName: 'document',
      additionalFields: {
        'documentType': documentType,
      },
      fromJson: (json) => json,
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> submitRegistrationRequest({
    required String labName,
    required String contactName,
    String? email,
    required String addressLine1,
    required String city,
    required String state,
    required String pincode,
    required double latitude,
    required double longitude,
    required bool isNablCertified,
    required List<Map<String, dynamic>> verificationDocuments,
    String? notes,
  }) {
    final normalizedVerificationDocuments =
        _normalizeVerificationDocuments(verificationDocuments);

    return _apiService.post(
      ApiEndpoints.createLabRegistrationRequest,
      body: {
        'labName': labName,
        'contactName': contactName,
        if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
        'address': {
          'line1': addressLine1,
          'city': city,
          'state': state,
          'pincode': pincode,
        },
        'location': {
          'type': 'Point',
          // GeoJSON order is [longitude, latitude]
          'coordinates': [longitude, latitude],
        },
        'isNablCertified': isNablCertified,
        'verificationDocuments': normalizedVerificationDocuments,
        if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      },
      fromJson: (json) => json,
    );
  }
}
