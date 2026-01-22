import 'package:freezed_annotation/freezed_annotation.dart';

part 'doctor.freezed.dart';
part 'doctor.g.dart';

@freezed
class Doctor with _$Doctor {
  const factory Doctor({
    required String id,
    required String userId,
    String? doctorId,
    required String specialization,
    required String qualification,
    required int experience,
    required double consultationFee,
    required double rating,
    required int reviewCount,
    required bool isVerified,
    DateTime? verifiedAt,
    String? rejectionReason,
    String? bio,
    String? photoUrl,
    List<String>? documents,
    required List<TimeSlot> availableSlots,
    DateTime? createdAt,
  }) = _Doctor;

  factory Doctor.fromJson(Map<String, dynamic> json) => _$DoctorFromJson(json);
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
