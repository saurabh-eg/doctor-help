// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'appointment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AppointmentImpl _$$AppointmentImplFromJson(Map<String, dynamic> json) =>
    _$AppointmentImpl(
      id: json['_id'] as String,
      patientId: json['patientId'] as String,
      doctorId: json['doctorId'] as String,
      date: DateTime.parse(json['date'] as String),
      timeSlot: AppointmentTimeSlot.fromJson(
          json['timeSlot'] as Map<String, dynamic>),
      type: json['type'] as String,
      status: json['status'] as String? ?? 'pending',
      symptoms: json['symptoms'] as String?,
      notes: json['notes'] as String?,
      prescription: json['prescription'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
      meetingLink: json['meetingLink'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$AppointmentImplToJson(_$AppointmentImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'patientId': instance.patientId,
      'doctorId': instance.doctorId,
      'date': instance.date.toIso8601String(),
      'timeSlot': instance.timeSlot,
      'type': instance.type,
      'status': instance.status,
      'symptoms': instance.symptoms,
      'notes': instance.notes,
      'prescription': instance.prescription,
      'amount': instance.amount,
      'paymentStatus': instance.paymentStatus,
      'meetingLink': instance.meetingLink,
      'createdAt': instance.createdAt?.toIso8601String(),
    };

_$AppointmentTimeSlotImpl _$$AppointmentTimeSlotImplFromJson(
        Map<String, dynamic> json) =>
    _$AppointmentTimeSlotImpl(
      start: json['start'] as String,
      end: json['end'] as String,
    );

Map<String, dynamic> _$$AppointmentTimeSlotImplToJson(
        _$AppointmentTimeSlotImpl instance) =>
    <String, dynamic>{
      'start': instance.start,
      'end': instance.end,
    };

_$DoctorAppointmentImpl _$$DoctorAppointmentImplFromJson(
        Map<String, dynamic> json) =>
    _$DoctorAppointmentImpl(
      id: json['_id'] as String,
      patientId:
          PatientInfo.fromJson(json['patientId'] as Map<String, dynamic>),
      doctorId: json['doctorId'] as String,
      date: DateTime.parse(json['date'] as String),
      timeSlot: AppointmentTimeSlot.fromJson(
          json['timeSlot'] as Map<String, dynamic>),
      type: json['type'] as String,
      status: json['status'] as String? ?? 'pending',
      symptoms: json['symptoms'] as String?,
      notes: json['notes'] as String?,
      prescription: json['prescription'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
    );

Map<String, dynamic> _$$DoctorAppointmentImplToJson(
        _$DoctorAppointmentImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'patientId': instance.patientId,
      'doctorId': instance.doctorId,
      'date': instance.date.toIso8601String(),
      'timeSlot': instance.timeSlot,
      'type': instance.type,
      'status': instance.status,
      'symptoms': instance.symptoms,
      'notes': instance.notes,
      'prescription': instance.prescription,
      'amount': instance.amount,
      'paymentStatus': instance.paymentStatus,
    };

_$PatientInfoImpl _$$PatientInfoImplFromJson(Map<String, dynamic> json) =>
    _$PatientInfoImpl(
      id: json['_id'] as String,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$$PatientInfoImplToJson(_$PatientInfoImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'avatar': instance.avatar,
    };
