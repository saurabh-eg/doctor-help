import '../models/doctor.dart';
import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Doctor API Service
class DoctorService {
  final ApiService _apiService;

  DoctorService(this._apiService);

  Map<String, dynamic> _normalizeDoctorJson(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);
    final userIdValue = normalized['userId'];

    if (userIdValue is String) {
      normalized['userId'] = {'_id': userIdValue};
    }

    return normalized;
  }

  /// List all verified doctors with filters
  Future<List<Doctor>> listDoctors({
    String? specialization,
    double? minRating,
    double? maxFee,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (specialization != null) 'specialization': specialization,
        if (minRating != null) 'minRating': minRating,
        if (maxFee != null) 'maxFee': maxFee,
      };

      final queryString =
          params.entries.map((e) => '${e.key}=${e.value}').join('&');

      final response = await _apiService.get<List<Doctor>>(
        '${ApiEndpoints.listDoctors}?$queryString',
        fromJson: (json) {
          // Handle the wrapper format from API service
          final list = json['data'] as List? ?? [];
          return list
              .map((item) => Doctor.fromJson(
                    _normalizeDoctorJson(item as Map<String, dynamic>),
                  ))
              .toList();
        },
      );
      return response.data ?? <Doctor>[];
    } catch (e) {
      return <Doctor>[];
    }
  }

  /// Search doctors by specialization
  Future<ApiResponse<List<Doctor>>> searchDoctors(
    String query, {
    int limit = 10,
  }) {
    return _apiService.get(
      '${ApiEndpoints.searchDoctors}?q=$query&limit=$limit',
      fromJson: (json) {
        // Handle the wrapper format from API service
        final list = json['data'] as List? ?? [];
        return list
            .map((item) => Doctor.fromJson(
                  _normalizeDoctorJson(item as Map<String, dynamic>),
                ))
            .toList();
      },
    );
  }

  /// Get doctor by ID
  Future<Doctor?> getDoctorById(String doctorId) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.getDoctor.replaceFirst(':id', doctorId),
        fromJson: (json) => Doctor.fromJson(_normalizeDoctorJson(json)),
      );
      return response.data;
    } catch (e) {
      return null;
    }
  }

  /// Get doctor by user ID
  Future<ApiResponse<Doctor>> getDoctorByUserId(String userId) {
    return _apiService.get(
      ApiEndpoints.getDoctorByUserId.replaceFirst(':userId', userId),
      fromJson: (json) => Doctor.fromJson(_normalizeDoctorJson(json)),
    );
  }

  /// Register as doctor
  Future<ApiResponse<Doctor>> registerDoctor({
    required String userId,
    required String specialization,
    required String qualification,
    required int experience,
    required double consultationFee,
    String? licenseNumber,
    String? bio,
    String? photoUrl,
    List<String>? documents,
  }) {
    return _apiService.post(
      ApiEndpoints.registerDoctor,
      body: {
        'userId': userId,
        'specialization': specialization,
        'qualification': qualification,
        'experience': experience,
        'consultationFee': consultationFee,
        if (licenseNumber != null && licenseNumber.isNotEmpty)
          'licenseNumber': licenseNumber,
        if (bio != null && bio.isNotEmpty) 'bio': bio,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (documents != null && documents.isNotEmpty) 'documents': documents,
      },
      fromJson: (json) {
        // The API service extracts the 'data' field, so json is already the Doctor object
        return Doctor.fromJson(_normalizeDoctorJson(json));
      },
    );
  }

  /// Update doctor profile (professional fields)
  Future<ApiResponse<Doctor>> updateDoctorProfile(
    String doctorId, {
    String? specialization,
    String? qualification,
    int? experience,
    double? consultationFee,
    String? bio,
  }) {
    return _apiService.patch(
      ApiEndpoints.updateDoctorProfile.replaceFirst(':id', doctorId),
      body: {
        if (specialization != null) 'specialization': specialization,
        if (qualification != null) 'qualification': qualification,
        if (experience != null) 'experience': experience,
        if (consultationFee != null) 'consultationFee': consultationFee,
        if (bio != null) 'bio': bio,
      },
      fromJson: (json) => Doctor.fromJson(_normalizeDoctorJson(json)),
    );
  }

  /// Update doctor availability
  Future<ApiResponse<Doctor>> updateAvailability(
    String doctorId,
    List<TimeSlot> slots,
  ) {
    return _apiService.patch(
      ApiEndpoints.updateAvailability.replaceFirst(':id', doctorId),
      body: {
        'slots': slots.map((s) => s.toJson()).toList(),
      },
      fromJson: (json) => Doctor.fromJson(_normalizeDoctorJson(json)),
    );
  }

  /// Upload document and return the Cloudinary URL
  Future<ApiResponse<String>> uploadDocument(String filePath) {
    return _apiService.uploadFile(
      '/doctors/upload-document',
      filePath: filePath,
      fieldName: 'document',
      fromJson: (json) => json['url']?.toString() ?? '',
    );
  }

  /// Upload profile photo and return the Cloudinary URL
  Future<ApiResponse<String>> uploadPhoto(String filePath) {
    return _apiService.uploadFile(
      ApiEndpoints.uploadProfile,
      filePath: filePath,
      fieldName: 'photo',
      fromJson: (json) => json['url']?.toString() ?? '',
    );
  }
}
