import 'package:freezed_annotation/freezed_annotation.dart';

part 'appointment.freezed.dart';
part 'appointment.g.dart';

@freezed
class Appointment with _$Appointment {
  const factory Appointment({
    required String id,
    required String patientId,
    required String doctorId,
    required DateTime date,
    required AppointmentTimeSlot timeSlot,
    required String type,
    required String status,
    String? symptoms,
    String? notes,
    String? prescription,
    required double amount,
    required String paymentStatus,
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
    required String id,
    required PatientInfo patientId,
    required String doctorId,
    required DateTime date,
    required AppointmentTimeSlot timeSlot,
    required String type,
    required String status,
    String? symptoms,
    String? notes,
    String? prescription,
    required double amount,
    required String paymentStatus,
  }) = _DoctorAppointment;

  factory DoctorAppointment.fromJson(Map<String, dynamic> json) =>
      _$DoctorAppointmentFromJson(json);
}

@freezed
class PatientInfo with _$PatientInfo {
  const factory PatientInfo({
    required String id,
    required String name,
    required String phone,
    String? avatar,
  }) = _PatientInfo;

  factory PatientInfo.fromJson(Map<String, dynamic> json) =>
      _$PatientInfoFromJson(json);
}
