import 'package:freezed_annotation/freezed_annotation.dart';

part 'appointment.freezed.dart';
part 'appointment.g.dart';

@freezed
class Appointment with _$Appointment {
  const factory Appointment({
    @JsonKey(name: '_id') required String id,
    required String patientId,
    required String doctorId,
    required DateTime date,
    required AppointmentTimeSlot timeSlot,
    required String type,
    @Default('pending') String status,
    String? symptoms,
    String? notes,
    String? prescription,
    @Default(0.0) double amount,
    @Default('pending') String paymentStatus,
    String? meetingLink,
    DateTime? createdAt,
  }) = _Appointment;

  factory Appointment.fromJson(Map<String, dynamic> json) =>
      _$AppointmentFromJson(json);
}

@freezed
class AppointmentTimeSlot with _$AppointmentTimeSlot {
  const factory AppointmentTimeSlot({
    required String start,
    required String end,
  }) = _AppointmentTimeSlot;

  factory AppointmentTimeSlot.fromJson(Map<String, dynamic> json) =>
      _$AppointmentTimeSlotFromJson(json);
}

@freezed
class DoctorAppointment with _$DoctorAppointment {
  const factory DoctorAppointment({
    @JsonKey(name: '_id') required String id,
    required PatientInfo patientId,
    required String doctorId,
    required DateTime date,
    required AppointmentTimeSlot timeSlot,
    required String type,
    @Default('pending') String status,
    String? symptoms,
    String? notes,
    String? prescription,
    @Default(0.0) double amount,
    @Default('pending') String paymentStatus,
  }) = _DoctorAppointment;

  factory DoctorAppointment.fromJson(Map<String, dynamic> json) =>
      _$DoctorAppointmentFromJson(json);
}

@freezed
class PatientInfo with _$PatientInfo {
  const factory PatientInfo({
    @JsonKey(name: '_id') required String id,
    String? name,
    String? phone,
    String? avatar,
  }) = _PatientInfo;

  factory PatientInfo.fromJson(Map<String, dynamic> json) =>
      _$PatientInfoFromJson(json);
}
