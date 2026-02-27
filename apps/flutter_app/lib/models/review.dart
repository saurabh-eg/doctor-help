// ignore_for_file: invalid_annotation_target
import 'package:freezed_annotation/freezed_annotation.dart';

part 'review.freezed.dart';
part 'review.g.dart';

@freezed
class Review with _$Review {
  const factory Review({
    @JsonKey(name: '_id') required String id,
    required String appointmentId,
    required ReviewUser patientId,
    required String doctorId,
    required int rating,
    String? comment,
    DateTime? createdAt,
  }) = _Review;

  factory Review.fromJson(Map<String, dynamic> json) => _$ReviewFromJson(json);
}

@freezed
class ReviewUser with _$ReviewUser {
  const factory ReviewUser({
    @JsonKey(name: '_id') required String id,
    String? name,
    String? avatar,
  }) = _ReviewUser;

  factory ReviewUser.fromJson(Map<String, dynamic> json) =>
      _$ReviewUserFromJson(json);
}

@freezed
class ReviewCheckResponse with _$ReviewCheckResponse {
  const factory ReviewCheckResponse({
    required bool hasReview,
    Review? review,
  }) = _ReviewCheckResponse;

  factory ReviewCheckResponse.fromJson(Map<String, dynamic> json) =>
      _$ReviewCheckResponseFromJson(json);
}
