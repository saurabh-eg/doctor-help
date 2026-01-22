import '../models/doctor.dart';
import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Doctor API Service
class DoctorService {
  final ApiService _apiService;

  DoctorService(this._apiService);

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

      final response = await _apiService.get(
        '${ApiEndpoints.listDoctors}?$queryString',
        fromJson: (json) {
          if (json is List) {
            return (json as List)
                .map((item) => Doctor.fromJson(item as Map<String, dynamic>))
                .toList();
          }
          return <Doctor>[];
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
        if (json is List) {
          return (json as List)
              .map((item) => Doctor.fromJson(item as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
  }

  /// Get doctor by ID
  Future<Doctor?> getDoctorById(String doctorId) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.getDoctor.replaceFirst(':id', doctorId),
        fromJson: (json) => Doctor.fromJson(json),
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
      fromJson: (json) => Doctor.fromJson(json),
    );
  }

  /// Register as doctor
  Future<ApiResponse<Doctor>> registerDoctor({
    required String userId,
    required String specialization,
    required String qualification,
    required int experience,
    required double consultationFee,
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
        if (bio != null) 'bio': bio,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (documents != null) 'documents': documents,
      },
      fromJson: (json) => Doctor.fromJson(json),
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
      fromJson: (json) => Doctor.fromJson(json),
    );
  }
}
