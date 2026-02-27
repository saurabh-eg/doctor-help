// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'review.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Review _$ReviewFromJson(Map<String, dynamic> json) {
  return _Review.fromJson(json);
}

/// @nodoc
mixin _$Review {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String get appointmentId => throw _privateConstructorUsedError;
  ReviewUser get patientId => throw _privateConstructorUsedError;
  String get doctorId => throw _privateConstructorUsedError;
  int get rating => throw _privateConstructorUsedError;
  String? get comment => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Review to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReviewCopyWith<Review> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReviewCopyWith<$Res> {
  factory $ReviewCopyWith(Review value, $Res Function(Review) then) =
      _$ReviewCopyWithImpl<$Res, Review>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String appointmentId,
      ReviewUser patientId,
      String doctorId,
      int rating,
      String? comment,
      DateTime? createdAt});

  $ReviewUserCopyWith<$Res> get patientId;
}

/// @nodoc
class _$ReviewCopyWithImpl<$Res, $Val extends Review>
    implements $ReviewCopyWith<$Res> {
  _$ReviewCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? appointmentId = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? rating = null,
    Object? comment = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      appointmentId: null == appointmentId
          ? _value.appointmentId
          : appointmentId // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as ReviewUser,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      rating: null == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as int,
      comment: freezed == comment
          ? _value.comment
          : comment // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ReviewUserCopyWith<$Res> get patientId {
    return $ReviewUserCopyWith<$Res>(_value.patientId, (value) {
      return _then(_value.copyWith(patientId: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ReviewImplCopyWith<$Res> implements $ReviewCopyWith<$Res> {
  factory _$$ReviewImplCopyWith(
          _$ReviewImpl value, $Res Function(_$ReviewImpl) then) =
      __$$ReviewImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String appointmentId,
      ReviewUser patientId,
      String doctorId,
      int rating,
      String? comment,
      DateTime? createdAt});

  @override
  $ReviewUserCopyWith<$Res> get patientId;
}

/// @nodoc
class __$$ReviewImplCopyWithImpl<$Res>
    extends _$ReviewCopyWithImpl<$Res, _$ReviewImpl>
    implements _$$ReviewImplCopyWith<$Res> {
  __$$ReviewImplCopyWithImpl(
      _$ReviewImpl _value, $Res Function(_$ReviewImpl) _then)
      : super(_value, _then);

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? appointmentId = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? rating = null,
    Object? comment = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_$ReviewImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      appointmentId: null == appointmentId
          ? _value.appointmentId
          : appointmentId // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as ReviewUser,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      rating: null == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as int,
      comment: freezed == comment
          ? _value.comment
          : comment // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReviewImpl implements _Review {
  const _$ReviewImpl(
      {@JsonKey(name: '_id') required this.id,
      required this.appointmentId,
      required this.patientId,
      required this.doctorId,
      required this.rating,
      this.comment,
      this.createdAt});

  factory _$ReviewImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReviewImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String appointmentId;
  @override
  final ReviewUser patientId;
  @override
  final String doctorId;
  @override
  final int rating;
  @override
  final String? comment;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'Review(id: $id, appointmentId: $appointmentId, patientId: $patientId, doctorId: $doctorId, rating: $rating, comment: $comment, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReviewImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.appointmentId, appointmentId) ||
                other.appointmentId == appointmentId) &&
            (identical(other.patientId, patientId) ||
                other.patientId == patientId) &&
            (identical(other.doctorId, doctorId) ||
                other.doctorId == doctorId) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.comment, comment) || other.comment == comment) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, appointmentId, patientId,
      doctorId, rating, comment, createdAt);

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReviewImplCopyWith<_$ReviewImpl> get copyWith =>
      __$$ReviewImplCopyWithImpl<_$ReviewImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReviewImplToJson(
      this,
    );
  }
}

abstract class _Review implements Review {
  const factory _Review(
      {@JsonKey(name: '_id') required final String id,
      required final String appointmentId,
      required final ReviewUser patientId,
      required final String doctorId,
      required final int rating,
      final String? comment,
      final DateTime? createdAt}) = _$ReviewImpl;

  factory _Review.fromJson(Map<String, dynamic> json) = _$ReviewImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String get appointmentId;
  @override
  ReviewUser get patientId;
  @override
  String get doctorId;
  @override
  int get rating;
  @override
  String? get comment;
  @override
  DateTime? get createdAt;

  /// Create a copy of Review
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReviewImplCopyWith<_$ReviewImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ReviewUser _$ReviewUserFromJson(Map<String, dynamic> json) {
  return _ReviewUser.fromJson(json);
}

/// @nodoc
mixin _$ReviewUser {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String? get name => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;

  /// Serializes this ReviewUser to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ReviewUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReviewUserCopyWith<ReviewUser> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReviewUserCopyWith<$Res> {
  factory $ReviewUserCopyWith(
          ReviewUser value, $Res Function(ReviewUser) then) =
      _$ReviewUserCopyWithImpl<$Res, ReviewUser>;
  @useResult
  $Res call({@JsonKey(name: '_id') String id, String? name, String? avatar});
}

/// @nodoc
class _$ReviewUserCopyWithImpl<$Res, $Val extends ReviewUser>
    implements $ReviewUserCopyWith<$Res> {
  _$ReviewUserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ReviewUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? avatar = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _value.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ReviewUserImplCopyWith<$Res>
    implements $ReviewUserCopyWith<$Res> {
  factory _$$ReviewUserImplCopyWith(
          _$ReviewUserImpl value, $Res Function(_$ReviewUserImpl) then) =
      __$$ReviewUserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({@JsonKey(name: '_id') String id, String? name, String? avatar});
}

/// @nodoc
class __$$ReviewUserImplCopyWithImpl<$Res>
    extends _$ReviewUserCopyWithImpl<$Res, _$ReviewUserImpl>
    implements _$$ReviewUserImplCopyWith<$Res> {
  __$$ReviewUserImplCopyWithImpl(
      _$ReviewUserImpl _value, $Res Function(_$ReviewUserImpl) _then)
      : super(_value, _then);

  /// Create a copy of ReviewUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? avatar = freezed,
  }) {
    return _then(_$ReviewUserImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _value.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReviewUserImpl implements _ReviewUser {
  const _$ReviewUserImpl(
      {@JsonKey(name: '_id') required this.id, this.name, this.avatar});

  factory _$ReviewUserImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReviewUserImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String? name;
  @override
  final String? avatar;

  @override
  String toString() {
    return 'ReviewUser(id: $id, name: $name, avatar: $avatar)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReviewUserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  /// Create a copy of ReviewUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReviewUserImplCopyWith<_$ReviewUserImpl> get copyWith =>
      __$$ReviewUserImplCopyWithImpl<_$ReviewUserImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReviewUserImplToJson(
      this,
    );
  }
}

abstract class _ReviewUser implements ReviewUser {
  const factory _ReviewUser(
      {@JsonKey(name: '_id') required final String id,
      final String? name,
      final String? avatar}) = _$ReviewUserImpl;

  factory _ReviewUser.fromJson(Map<String, dynamic> json) =
      _$ReviewUserImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String? get name;
  @override
  String? get avatar;

  /// Create a copy of ReviewUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReviewUserImplCopyWith<_$ReviewUserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ReviewCheckResponse _$ReviewCheckResponseFromJson(Map<String, dynamic> json) {
  return _ReviewCheckResponse.fromJson(json);
}

/// @nodoc
mixin _$ReviewCheckResponse {
  bool get hasReview => throw _privateConstructorUsedError;
  Review? get review => throw _privateConstructorUsedError;

  /// Serializes this ReviewCheckResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReviewCheckResponseCopyWith<ReviewCheckResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReviewCheckResponseCopyWith<$Res> {
  factory $ReviewCheckResponseCopyWith(
          ReviewCheckResponse value, $Res Function(ReviewCheckResponse) then) =
      _$ReviewCheckResponseCopyWithImpl<$Res, ReviewCheckResponse>;
  @useResult
  $Res call({bool hasReview, Review? review});

  $ReviewCopyWith<$Res>? get review;
}

/// @nodoc
class _$ReviewCheckResponseCopyWithImpl<$Res, $Val extends ReviewCheckResponse>
    implements $ReviewCheckResponseCopyWith<$Res> {
  _$ReviewCheckResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? hasReview = null,
    Object? review = freezed,
  }) {
    return _then(_value.copyWith(
      hasReview: null == hasReview
          ? _value.hasReview
          : hasReview // ignore: cast_nullable_to_non_nullable
              as bool,
      review: freezed == review
          ? _value.review
          : review // ignore: cast_nullable_to_non_nullable
              as Review?,
    ) as $Val);
  }

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ReviewCopyWith<$Res>? get review {
    if (_value.review == null) {
      return null;
    }

    return $ReviewCopyWith<$Res>(_value.review!, (value) {
      return _then(_value.copyWith(review: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ReviewCheckResponseImplCopyWith<$Res>
    implements $ReviewCheckResponseCopyWith<$Res> {
  factory _$$ReviewCheckResponseImplCopyWith(_$ReviewCheckResponseImpl value,
          $Res Function(_$ReviewCheckResponseImpl) then) =
      __$$ReviewCheckResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool hasReview, Review? review});

  @override
  $ReviewCopyWith<$Res>? get review;
}

/// @nodoc
class __$$ReviewCheckResponseImplCopyWithImpl<$Res>
    extends _$ReviewCheckResponseCopyWithImpl<$Res, _$ReviewCheckResponseImpl>
    implements _$$ReviewCheckResponseImplCopyWith<$Res> {
  __$$ReviewCheckResponseImplCopyWithImpl(_$ReviewCheckResponseImpl _value,
      $Res Function(_$ReviewCheckResponseImpl) _then)
      : super(_value, _then);

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? hasReview = null,
    Object? review = freezed,
  }) {
    return _then(_$ReviewCheckResponseImpl(
      hasReview: null == hasReview
          ? _value.hasReview
          : hasReview // ignore: cast_nullable_to_non_nullable
              as bool,
      review: freezed == review
          ? _value.review
          : review // ignore: cast_nullable_to_non_nullable
              as Review?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReviewCheckResponseImpl implements _ReviewCheckResponse {
  const _$ReviewCheckResponseImpl({required this.hasReview, this.review});

  factory _$ReviewCheckResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReviewCheckResponseImplFromJson(json);

  @override
  final bool hasReview;
  @override
  final Review? review;

  @override
  String toString() {
    return 'ReviewCheckResponse(hasReview: $hasReview, review: $review)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReviewCheckResponseImpl &&
            (identical(other.hasReview, hasReview) ||
                other.hasReview == hasReview) &&
            (identical(other.review, review) || other.review == review));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, hasReview, review);

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReviewCheckResponseImplCopyWith<_$ReviewCheckResponseImpl> get copyWith =>
      __$$ReviewCheckResponseImplCopyWithImpl<_$ReviewCheckResponseImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReviewCheckResponseImplToJson(
      this,
    );
  }
}

abstract class _ReviewCheckResponse implements ReviewCheckResponse {
  const factory _ReviewCheckResponse(
      {required final bool hasReview,
      final Review? review}) = _$ReviewCheckResponseImpl;

  factory _ReviewCheckResponse.fromJson(Map<String, dynamic> json) =
      _$ReviewCheckResponseImpl.fromJson;

  @override
  bool get hasReview;
  @override
  Review? get review;

  /// Create a copy of ReviewCheckResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReviewCheckResponseImplCopyWith<_$ReviewCheckResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
