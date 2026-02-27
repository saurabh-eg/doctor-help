import '../models/review.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class ReviewService {
  final ApiService _apiService;

  ReviewService(this._apiService);

  /// Submit a review for a completed appointment
  Future<Review> createReview({
    required String appointmentId,
    required int rating,
    String? comment,
  }) async {
    final response = await _apiService.post(
      ApiEndpoints.createReview,
      body: {
        'appointmentId': appointmentId,
        'rating': rating,
        if (comment != null && comment.trim().isNotEmpty) 'comment': comment.trim(),
      },
    );

    if (response.success && response.data != null) {
      return Review.fromJson(response.data as Map<String, dynamic>);
    }
    throw Exception(response.error ?? 'Failed to create review');
  }

  /// Get all reviews for a doctor
  Future<List<Review>> getDoctorReviews(String doctorId, {int page = 1, int limit = 10}) async {
    final endpoint = ApiEndpoints.getDoctorReviews.replaceAll(':doctorId', doctorId);
    final response = await _apiService.get('$endpoint?page=$page&limit=$limit');

    if (response.success && response.data != null) {
      final List<dynamic> list = response.data as List<dynamic>;
      return list.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception(response.error ?? 'Failed to fetch reviews');
  }

  /// Check if a review exists for an appointment
  Future<ReviewCheckResponse> checkReviewExists(String appointmentId) async {
    final endpoint = ApiEndpoints.checkReviewExists.replaceAll(':appointmentId', appointmentId);
    final response = await _apiService.get(endpoint);

    if (response.success && response.data != null) {
      return ReviewCheckResponse.fromJson(response.data as Map<String, dynamic>);
    }
    throw Exception(response.error ?? 'Failed to check review');
  }
}
