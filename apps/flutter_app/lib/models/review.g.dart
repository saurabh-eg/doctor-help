// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ReviewImpl _$$ReviewImplFromJson(Map<String, dynamic> json) => _$ReviewImpl(
      id: json['_id'] as String,
      appointmentId: json['appointmentId'] as String,
      patientId: ReviewUser.fromJson(json['patientId'] as Map<String, dynamic>),
      doctorId: json['doctorId'] as String,
      rating: (json['rating'] as num).toInt(),
      comment: json['comment'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$ReviewImplToJson(_$ReviewImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'appointmentId': instance.appointmentId,
      'patientId': instance.patientId,
      'doctorId': instance.doctorId,
      'rating': instance.rating,
      'comment': instance.comment,
      'createdAt': instance.createdAt?.toIso8601String(),
    };

_$ReviewUserImpl _$$ReviewUserImplFromJson(Map<String, dynamic> json) =>
    _$ReviewUserImpl(
      id: json['_id'] as String,
      name: json['name'] as String?,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$$ReviewUserImplToJson(_$ReviewUserImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
    };

_$ReviewCheckResponseImpl _$$ReviewCheckResponseImplFromJson(
        Map<String, dynamic> json) =>
    _$ReviewCheckResponseImpl(
      hasReview: json['hasReview'] as bool,
      review: json['review'] == null
          ? null
          : Review.fromJson(json['review'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$ReviewCheckResponseImplToJson(
        _$ReviewCheckResponseImpl instance) =>
    <String, dynamic>{
      'hasReview': instance.hasReview,
      'review': instance.review,
    };
