// ignore_for_file: invalid_annotation_target
import 'package:freezed_annotation/freezed_annotation.dart';

part 'doctor.freezed.dart';
part 'doctor.g.dart';

@freezed
class Doctor with _$Doctor {
  const factory Doctor({
    @JsonKey(name: '_id') required String id,
    required DoctorUser userId,
    String? doctorId,
    required String specialization,
    required String qualification,
    required int experience,
    required double consultationFee,
    @Default(0.0) double rating,
    @Default(0) int reviewCount,
    @Default(false) bool isVerified,
    DateTime? verifiedAt,
    String? rejectionReason,
    String? bio,
    String? photoUrl,
    @Default([]) List<String> documents,
    @Default([]) List<TimeSlot> availableSlots,
    DateTime? createdAt,
  }) = _Doctor;

  factory Doctor.fromJson(Map<String, dynamic> json) => _$DoctorFromJson(json);
}

/// Nested user info from populated userId
@freezed
class DoctorUser with _$DoctorUser {
  const factory DoctorUser({
    @JsonKey(name: '_id') required String id,
    String? name,
    String? phone,
    String? avatar,
  }) = _DoctorUser;

  factory DoctorUser.fromJson(Map<String, dynamic> json) =>
      _$DoctorUserFromJson(json);
}

@freezed
class TimeSlot with _$TimeSlot {
  const factory TimeSlot({
    required int day,
    required String startTime,
    required String endTime,
  }) = _TimeSlot;

  factory TimeSlot.fromJson(Map<String, dynamic> json) =>
      _$TimeSlotFromJson(json);
}
