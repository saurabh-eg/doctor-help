// ignore_for_file: invalid_annotation_target

import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    @JsonKey(name: '_id') required String id,
    required String phone,
    String? name,
    String? email,
    String? avatar,
    String? address,
    required String role,
    required bool isPhoneVerified,
    required bool isProfileComplete,
    int? userId,
    bool? isNewUser,
    DateTime? createdAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
