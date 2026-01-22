// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['_id'] as String,
      phone: json['phone'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      avatar: json['avatar'] as String?,
      address: json['address'] as String?,
      role: json['role'] as String,
      isPhoneVerified: json['isPhoneVerified'] as bool,
      isProfileComplete: json['isProfileComplete'] as bool,
      userId: (json['userId'] as num?)?.toInt(),
      isNewUser: json['isNewUser'] as bool?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'phone': instance.phone,
      'name': instance.name,
      'email': instance.email,
      'avatar': instance.avatar,
      'address': instance.address,
      'role': instance.role,
      'isPhoneVerified': instance.isPhoneVerified,
      'isProfileComplete': instance.isProfileComplete,
      'userId': instance.userId,
      'isNewUser': instance.isNewUser,
      'createdAt': instance.createdAt?.toIso8601String(),
    };
