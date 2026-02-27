// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'doctor.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DoctorImpl _$$DoctorImplFromJson(Map<String, dynamic> json) => _$DoctorImpl(
      id: json['_id'] as String,
      userId: DoctorUser.fromJson(json['userId'] as Map<String, dynamic>),
      doctorId: _stringFromAny(json['doctorId']),
      specialization: json['specialization'] as String,
      qualification: json['qualification'] as String,
      experience: (json['experience'] as num).toInt(),
      consultationFee: (json['consultationFee'] as num).toDouble(),
      licenseNumber: json['licenseNumber'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      isVerified: json['isVerified'] as bool? ?? false,
      verifiedAt: json['verifiedAt'] == null
          ? null
          : DateTime.parse(json['verifiedAt'] as String),
      rejectionReason: json['rejectionReason'] as String?,
      bio: json['bio'] as String?,
      photoUrl: json['photoUrl'] as String?,
      documents: (json['documents'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      availableSlots: (json['availableSlots'] as List<dynamic>?)
              ?.map((e) => TimeSlot.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$DoctorImplToJson(_$DoctorImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'doctorId': _stringToAny(instance.doctorId),
      'specialization': instance.specialization,
      'qualification': instance.qualification,
      'experience': instance.experience,
      'consultationFee': instance.consultationFee,
      'licenseNumber': instance.licenseNumber,
      'rating': instance.rating,
      'reviewCount': instance.reviewCount,
      'isVerified': instance.isVerified,
      'verifiedAt': instance.verifiedAt?.toIso8601String(),
      'rejectionReason': instance.rejectionReason,
      'bio': instance.bio,
      'photoUrl': instance.photoUrl,
      'documents': instance.documents,
      'availableSlots': instance.availableSlots,
      'createdAt': instance.createdAt?.toIso8601String(),
    };

_$DoctorUserImpl _$$DoctorUserImplFromJson(Map<String, dynamic> json) =>
    _$DoctorUserImpl(
      id: json['_id'] as String,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$$DoctorUserImplToJson(_$DoctorUserImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'avatar': instance.avatar,
    };

_$TimeSlotImpl _$$TimeSlotImplFromJson(Map<String, dynamic> json) =>
    _$TimeSlotImpl(
      day: (json['day'] as num).toInt(),
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
    );

Map<String, dynamic> _$$TimeSlotImplToJson(_$TimeSlotImpl instance) =>
    <String, dynamic>{
      'day': instance.day,
      'startTime': instance.startTime,
      'endTime': instance.endTime,
    };
