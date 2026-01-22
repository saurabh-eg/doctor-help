// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'appointment.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Appointment _$AppointmentFromJson(Map<String, dynamic> json) {
  return _Appointment.fromJson(json);
}

/// @nodoc
mixin _$Appointment {
  String get id => throw _privateConstructorUsedError;
  String get patientId => throw _privateConstructorUsedError;
  String get doctorId => throw _privateConstructorUsedError;
  DateTime get date => throw _privateConstructorUsedError;
  AppointmentTimeSlot get timeSlot => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get symptoms => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get prescription => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String get paymentStatus => throw _privateConstructorUsedError;
  String? get meetingLink => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Appointment to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppointmentCopyWith<Appointment> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppointmentCopyWith<$Res> {
  factory $AppointmentCopyWith(
          Appointment value, $Res Function(Appointment) then) =
      _$AppointmentCopyWithImpl<$Res, Appointment>;
  @useResult
  $Res call(
      {String id,
      String patientId,
      String doctorId,
      DateTime date,
      AppointmentTimeSlot timeSlot,
      String type,
      String status,
      String? symptoms,
      String? notes,
      String? prescription,
      double amount,
      String paymentStatus,
      String? meetingLink,
      DateTime? createdAt});

  $AppointmentTimeSlotCopyWith<$Res> get timeSlot;
}

/// @nodoc
class _$AppointmentCopyWithImpl<$Res, $Val extends Appointment>
    implements $AppointmentCopyWith<$Res> {
  _$AppointmentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? date = null,
    Object? timeSlot = null,
    Object? type = null,
    Object? status = null,
    Object? symptoms = freezed,
    Object? notes = freezed,
    Object? prescription = freezed,
    Object? amount = null,
    Object? paymentStatus = null,
    Object? meetingLink = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as String,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _value.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      timeSlot: null == timeSlot
          ? _value.timeSlot
          : timeSlot // ignore: cast_nullable_to_non_nullable
              as AppointmentTimeSlot,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      symptoms: freezed == symptoms
          ? _value.symptoms
          : symptoms // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      prescription: freezed == prescription
          ? _value.prescription
          : prescription // ignore: cast_nullable_to_non_nullable
              as String?,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      paymentStatus: null == paymentStatus
          ? _value.paymentStatus
          : paymentStatus // ignore: cast_nullable_to_non_nullable
              as String,
      meetingLink: freezed == meetingLink
          ? _value.meetingLink
          : meetingLink // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $AppointmentTimeSlotCopyWith<$Res> get timeSlot {
    return $AppointmentTimeSlotCopyWith<$Res>(_value.timeSlot, (value) {
      return _then(_value.copyWith(timeSlot: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$AppointmentImplCopyWith<$Res>
    implements $AppointmentCopyWith<$Res> {
  factory _$$AppointmentImplCopyWith(
          _$AppointmentImpl value, $Res Function(_$AppointmentImpl) then) =
      __$$AppointmentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String patientId,
      String doctorId,
      DateTime date,
      AppointmentTimeSlot timeSlot,
      String type,
      String status,
      String? symptoms,
      String? notes,
      String? prescription,
      double amount,
      String paymentStatus,
      String? meetingLink,
      DateTime? createdAt});

  @override
  $AppointmentTimeSlotCopyWith<$Res> get timeSlot;
}

/// @nodoc
class __$$AppointmentImplCopyWithImpl<$Res>
    extends _$AppointmentCopyWithImpl<$Res, _$AppointmentImpl>
    implements _$$AppointmentImplCopyWith<$Res> {
  __$$AppointmentImplCopyWithImpl(
      _$AppointmentImpl _value, $Res Function(_$AppointmentImpl) _then)
      : super(_value, _then);

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? date = null,
    Object? timeSlot = null,
    Object? type = null,
    Object? status = null,
    Object? symptoms = freezed,
    Object? notes = freezed,
    Object? prescription = freezed,
    Object? amount = null,
    Object? paymentStatus = null,
    Object? meetingLink = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_$AppointmentImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as String,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _value.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      timeSlot: null == timeSlot
          ? _value.timeSlot
          : timeSlot // ignore: cast_nullable_to_non_nullable
              as AppointmentTimeSlot,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      symptoms: freezed == symptoms
          ? _value.symptoms
          : symptoms // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      prescription: freezed == prescription
          ? _value.prescription
          : prescription // ignore: cast_nullable_to_non_nullable
              as String?,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      paymentStatus: null == paymentStatus
          ? _value.paymentStatus
          : paymentStatus // ignore: cast_nullable_to_non_nullable
              as String,
      meetingLink: freezed == meetingLink
          ? _value.meetingLink
          : meetingLink // ignore: cast_nullable_to_non_nullable
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
class _$AppointmentImpl implements _Appointment {
  const _$AppointmentImpl(
      {required this.id,
      required this.patientId,
      required this.doctorId,
      required this.date,
      required this.timeSlot,
      required this.type,
      required this.status,
      this.symptoms,
      this.notes,
      this.prescription,
      required this.amount,
      required this.paymentStatus,
      this.meetingLink,
      this.createdAt});

  factory _$AppointmentImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppointmentImplFromJson(json);

  @override
  final String id;
  @override
  final String patientId;
  @override
  final String doctorId;
  @override
  final DateTime date;
  @override
  final AppointmentTimeSlot timeSlot;
  @override
  final String type;
  @override
  final String status;
  @override
  final String? symptoms;
  @override
  final String? notes;
  @override
  final String? prescription;
  @override
  final double amount;
  @override
  final String paymentStatus;
  @override
  final String? meetingLink;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'Appointment(id: $id, patientId: $patientId, doctorId: $doctorId, date: $date, timeSlot: $timeSlot, type: $type, status: $status, symptoms: $symptoms, notes: $notes, prescription: $prescription, amount: $amount, paymentStatus: $paymentStatus, meetingLink: $meetingLink, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppointmentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.patientId, patientId) ||
                other.patientId == patientId) &&
            (identical(other.doctorId, doctorId) ||
                other.doctorId == doctorId) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.timeSlot, timeSlot) ||
                other.timeSlot == timeSlot) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.symptoms, symptoms) ||
                other.symptoms == symptoms) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.prescription, prescription) ||
                other.prescription == prescription) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.meetingLink, meetingLink) ||
                other.meetingLink == meetingLink) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      patientId,
      doctorId,
      date,
      timeSlot,
      type,
      status,
      symptoms,
      notes,
      prescription,
      amount,
      paymentStatus,
      meetingLink,
      createdAt);

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppointmentImplCopyWith<_$AppointmentImpl> get copyWith =>
      __$$AppointmentImplCopyWithImpl<_$AppointmentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AppointmentImplToJson(
      this,
    );
  }
}

abstract class _Appointment implements Appointment {
  const factory _Appointment(
      {required final String id,
      required final String patientId,
      required final String doctorId,
      required final DateTime date,
      required final AppointmentTimeSlot timeSlot,
      required final String type,
      required final String status,
      final String? symptoms,
      final String? notes,
      final String? prescription,
      required final double amount,
      required final String paymentStatus,
      final String? meetingLink,
      final DateTime? createdAt}) = _$AppointmentImpl;

  factory _Appointment.fromJson(Map<String, dynamic> json) =
      _$AppointmentImpl.fromJson;

  @override
  String get id;
  @override
  String get patientId;
  @override
  String get doctorId;
  @override
  DateTime get date;
  @override
  AppointmentTimeSlot get timeSlot;
  @override
  String get type;
  @override
  String get status;
  @override
  String? get symptoms;
  @override
  String? get notes;
  @override
  String? get prescription;
  @override
  double get amount;
  @override
  String get paymentStatus;
  @override
  String? get meetingLink;
  @override
  DateTime? get createdAt;

  /// Create a copy of Appointment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppointmentImplCopyWith<_$AppointmentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AppointmentTimeSlot _$AppointmentTimeSlotFromJson(Map<String, dynamic> json) {
  return _AppointmentTimeSlot.fromJson(json);
}

/// @nodoc
mixin _$AppointmentTimeSlot {
  String get start => throw _privateConstructorUsedError;
  String get end => throw _privateConstructorUsedError;

  /// Serializes this AppointmentTimeSlot to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AppointmentTimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppointmentTimeSlotCopyWith<AppointmentTimeSlot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppointmentTimeSlotCopyWith<$Res> {
  factory $AppointmentTimeSlotCopyWith(
          AppointmentTimeSlot value, $Res Function(AppointmentTimeSlot) then) =
      _$AppointmentTimeSlotCopyWithImpl<$Res, AppointmentTimeSlot>;
  @useResult
  $Res call({String start, String end});
}

/// @nodoc
class _$AppointmentTimeSlotCopyWithImpl<$Res, $Val extends AppointmentTimeSlot>
    implements $AppointmentTimeSlotCopyWith<$Res> {
  _$AppointmentTimeSlotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppointmentTimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? start = null,
    Object? end = null,
  }) {
    return _then(_value.copyWith(
      start: null == start
          ? _value.start
          : start // ignore: cast_nullable_to_non_nullable
              as String,
      end: null == end
          ? _value.end
          : end // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AppointmentTimeSlotImplCopyWith<$Res>
    implements $AppointmentTimeSlotCopyWith<$Res> {
  factory _$$AppointmentTimeSlotImplCopyWith(_$AppointmentTimeSlotImpl value,
          $Res Function(_$AppointmentTimeSlotImpl) then) =
      __$$AppointmentTimeSlotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String start, String end});
}

/// @nodoc
class __$$AppointmentTimeSlotImplCopyWithImpl<$Res>
    extends _$AppointmentTimeSlotCopyWithImpl<$Res, _$AppointmentTimeSlotImpl>
    implements _$$AppointmentTimeSlotImplCopyWith<$Res> {
  __$$AppointmentTimeSlotImplCopyWithImpl(_$AppointmentTimeSlotImpl _value,
      $Res Function(_$AppointmentTimeSlotImpl) _then)
      : super(_value, _then);

  /// Create a copy of AppointmentTimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? start = null,
    Object? end = null,
  }) {
    return _then(_$AppointmentTimeSlotImpl(
      start: null == start
          ? _value.start
          : start // ignore: cast_nullable_to_non_nullable
              as String,
      end: null == end
          ? _value.end
          : end // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AppointmentTimeSlotImpl implements _AppointmentTimeSlot {
  const _$AppointmentTimeSlotImpl({required this.start, required this.end});

  factory _$AppointmentTimeSlotImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppointmentTimeSlotImplFromJson(json);

  @override
  final String start;
  @override
  final String end;

  @override
  String toString() {
    return 'AppointmentTimeSlot(start: $start, end: $end)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppointmentTimeSlotImpl &&
            (identical(other.start, start) || other.start == start) &&
            (identical(other.end, end) || other.end == end));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, start, end);

  /// Create a copy of AppointmentTimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppointmentTimeSlotImplCopyWith<_$AppointmentTimeSlotImpl> get copyWith =>
      __$$AppointmentTimeSlotImplCopyWithImpl<_$AppointmentTimeSlotImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AppointmentTimeSlotImplToJson(
      this,
    );
  }
}

abstract class _AppointmentTimeSlot implements AppointmentTimeSlot {
  const factory _AppointmentTimeSlot(
      {required final String start,
      required final String end}) = _$AppointmentTimeSlotImpl;

  factory _AppointmentTimeSlot.fromJson(Map<String, dynamic> json) =
      _$AppointmentTimeSlotImpl.fromJson;

  @override
  String get start;
  @override
  String get end;

  /// Create a copy of AppointmentTimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppointmentTimeSlotImplCopyWith<_$AppointmentTimeSlotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DoctorAppointment _$DoctorAppointmentFromJson(Map<String, dynamic> json) {
  return _DoctorAppointment.fromJson(json);
}

/// @nodoc
mixin _$DoctorAppointment {
  String get id => throw _privateConstructorUsedError;
  PatientInfo get patientId => throw _privateConstructorUsedError;
  String get doctorId => throw _privateConstructorUsedError;
  DateTime get date => throw _privateConstructorUsedError;
  AppointmentTimeSlot get timeSlot => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get symptoms => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get prescription => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String get paymentStatus => throw _privateConstructorUsedError;

  /// Serializes this DoctorAppointment to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DoctorAppointmentCopyWith<DoctorAppointment> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DoctorAppointmentCopyWith<$Res> {
  factory $DoctorAppointmentCopyWith(
          DoctorAppointment value, $Res Function(DoctorAppointment) then) =
      _$DoctorAppointmentCopyWithImpl<$Res, DoctorAppointment>;
  @useResult
  $Res call(
      {String id,
      PatientInfo patientId,
      String doctorId,
      DateTime date,
      AppointmentTimeSlot timeSlot,
      String type,
      String status,
      String? symptoms,
      String? notes,
      String? prescription,
      double amount,
      String paymentStatus});

  $PatientInfoCopyWith<$Res> get patientId;
  $AppointmentTimeSlotCopyWith<$Res> get timeSlot;
}

/// @nodoc
class _$DoctorAppointmentCopyWithImpl<$Res, $Val extends DoctorAppointment>
    implements $DoctorAppointmentCopyWith<$Res> {
  _$DoctorAppointmentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? date = null,
    Object? timeSlot = null,
    Object? type = null,
    Object? status = null,
    Object? symptoms = freezed,
    Object? notes = freezed,
    Object? prescription = freezed,
    Object? amount = null,
    Object? paymentStatus = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as PatientInfo,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _value.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      timeSlot: null == timeSlot
          ? _value.timeSlot
          : timeSlot // ignore: cast_nullable_to_non_nullable
              as AppointmentTimeSlot,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      symptoms: freezed == symptoms
          ? _value.symptoms
          : symptoms // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      prescription: freezed == prescription
          ? _value.prescription
          : prescription // ignore: cast_nullable_to_non_nullable
              as String?,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      paymentStatus: null == paymentStatus
          ? _value.paymentStatus
          : paymentStatus // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PatientInfoCopyWith<$Res> get patientId {
    return $PatientInfoCopyWith<$Res>(_value.patientId, (value) {
      return _then(_value.copyWith(patientId: value) as $Val);
    });
  }

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $AppointmentTimeSlotCopyWith<$Res> get timeSlot {
    return $AppointmentTimeSlotCopyWith<$Res>(_value.timeSlot, (value) {
      return _then(_value.copyWith(timeSlot: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$DoctorAppointmentImplCopyWith<$Res>
    implements $DoctorAppointmentCopyWith<$Res> {
  factory _$$DoctorAppointmentImplCopyWith(_$DoctorAppointmentImpl value,
          $Res Function(_$DoctorAppointmentImpl) then) =
      __$$DoctorAppointmentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      PatientInfo patientId,
      String doctorId,
      DateTime date,
      AppointmentTimeSlot timeSlot,
      String type,
      String status,
      String? symptoms,
      String? notes,
      String? prescription,
      double amount,
      String paymentStatus});

  @override
  $PatientInfoCopyWith<$Res> get patientId;
  @override
  $AppointmentTimeSlotCopyWith<$Res> get timeSlot;
}

/// @nodoc
class __$$DoctorAppointmentImplCopyWithImpl<$Res>
    extends _$DoctorAppointmentCopyWithImpl<$Res, _$DoctorAppointmentImpl>
    implements _$$DoctorAppointmentImplCopyWith<$Res> {
  __$$DoctorAppointmentImplCopyWithImpl(_$DoctorAppointmentImpl _value,
      $Res Function(_$DoctorAppointmentImpl) _then)
      : super(_value, _then);

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? patientId = null,
    Object? doctorId = null,
    Object? date = null,
    Object? timeSlot = null,
    Object? type = null,
    Object? status = null,
    Object? symptoms = freezed,
    Object? notes = freezed,
    Object? prescription = freezed,
    Object? amount = null,
    Object? paymentStatus = null,
  }) {
    return _then(_$DoctorAppointmentImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      patientId: null == patientId
          ? _value.patientId
          : patientId // ignore: cast_nullable_to_non_nullable
              as PatientInfo,
      doctorId: null == doctorId
          ? _value.doctorId
          : doctorId // ignore: cast_nullable_to_non_nullable
              as String,
      date: null == date
          ? _value.date
          : date // ignore: cast_nullable_to_non_nullable
              as DateTime,
      timeSlot: null == timeSlot
          ? _value.timeSlot
          : timeSlot // ignore: cast_nullable_to_non_nullable
              as AppointmentTimeSlot,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      symptoms: freezed == symptoms
          ? _value.symptoms
          : symptoms // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      prescription: freezed == prescription
          ? _value.prescription
          : prescription // ignore: cast_nullable_to_non_nullable
              as String?,
      amount: null == amount
          ? _value.amount
          : amount // ignore: cast_nullable_to_non_nullable
              as double,
      paymentStatus: null == paymentStatus
          ? _value.paymentStatus
          : paymentStatus // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DoctorAppointmentImpl implements _DoctorAppointment {
  const _$DoctorAppointmentImpl(
      {required this.id,
      required this.patientId,
      required this.doctorId,
      required this.date,
      required this.timeSlot,
      required this.type,
      required this.status,
      this.symptoms,
      this.notes,
      this.prescription,
      required this.amount,
      required this.paymentStatus});

  factory _$DoctorAppointmentImpl.fromJson(Map<String, dynamic> json) =>
      _$$DoctorAppointmentImplFromJson(json);

  @override
  final String id;
  @override
  final PatientInfo patientId;
  @override
  final String doctorId;
  @override
  final DateTime date;
  @override
  final AppointmentTimeSlot timeSlot;
  @override
  final String type;
  @override
  final String status;
  @override
  final String? symptoms;
  @override
  final String? notes;
  @override
  final String? prescription;
  @override
  final double amount;
  @override
  final String paymentStatus;

  @override
  String toString() {
    return 'DoctorAppointment(id: $id, patientId: $patientId, doctorId: $doctorId, date: $date, timeSlot: $timeSlot, type: $type, status: $status, symptoms: $symptoms, notes: $notes, prescription: $prescription, amount: $amount, paymentStatus: $paymentStatus)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DoctorAppointmentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.patientId, patientId) ||
                other.patientId == patientId) &&
            (identical(other.doctorId, doctorId) ||
                other.doctorId == doctorId) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.timeSlot, timeSlot) ||
                other.timeSlot == timeSlot) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.symptoms, symptoms) ||
                other.symptoms == symptoms) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.prescription, prescription) ||
                other.prescription == prescription) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      patientId,
      doctorId,
      date,
      timeSlot,
      type,
      status,
      symptoms,
      notes,
      prescription,
      amount,
      paymentStatus);

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DoctorAppointmentImplCopyWith<_$DoctorAppointmentImpl> get copyWith =>
      __$$DoctorAppointmentImplCopyWithImpl<_$DoctorAppointmentImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DoctorAppointmentImplToJson(
      this,
    );
  }
}

abstract class _DoctorAppointment implements DoctorAppointment {
  const factory _DoctorAppointment(
      {required final String id,
      required final PatientInfo patientId,
      required final String doctorId,
      required final DateTime date,
      required final AppointmentTimeSlot timeSlot,
      required final String type,
      required final String status,
      final String? symptoms,
      final String? notes,
      final String? prescription,
      required final double amount,
      required final String paymentStatus}) = _$DoctorAppointmentImpl;

  factory _DoctorAppointment.fromJson(Map<String, dynamic> json) =
      _$DoctorAppointmentImpl.fromJson;

  @override
  String get id;
  @override
  PatientInfo get patientId;
  @override
  String get doctorId;
  @override
  DateTime get date;
  @override
  AppointmentTimeSlot get timeSlot;
  @override
  String get type;
  @override
  String get status;
  @override
  String? get symptoms;
  @override
  String? get notes;
  @override
  String? get prescription;
  @override
  double get amount;
  @override
  String get paymentStatus;

  /// Create a copy of DoctorAppointment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DoctorAppointmentImplCopyWith<_$DoctorAppointmentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PatientInfo _$PatientInfoFromJson(Map<String, dynamic> json) {
  return _PatientInfo.fromJson(json);
}

/// @nodoc
mixin _$PatientInfo {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get phone => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;

  /// Serializes this PatientInfo to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PatientInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PatientInfoCopyWith<PatientInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PatientInfoCopyWith<$Res> {
  factory $PatientInfoCopyWith(
          PatientInfo value, $Res Function(PatientInfo) then) =
      _$PatientInfoCopyWithImpl<$Res, PatientInfo>;
  @useResult
  $Res call({String id, String name, String phone, String? avatar});
}

/// @nodoc
class _$PatientInfoCopyWithImpl<$Res, $Val extends PatientInfo>
    implements $PatientInfoCopyWith<$Res> {
  _$PatientInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PatientInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? phone = null,
    Object? avatar = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      phone: null == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _value.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PatientInfoImplCopyWith<$Res>
    implements $PatientInfoCopyWith<$Res> {
  factory _$$PatientInfoImplCopyWith(
          _$PatientInfoImpl value, $Res Function(_$PatientInfoImpl) then) =
      __$$PatientInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String name, String phone, String? avatar});
}

/// @nodoc
class __$$PatientInfoImplCopyWithImpl<$Res>
    extends _$PatientInfoCopyWithImpl<$Res, _$PatientInfoImpl>
    implements _$$PatientInfoImplCopyWith<$Res> {
  __$$PatientInfoImplCopyWithImpl(
      _$PatientInfoImpl _value, $Res Function(_$PatientInfoImpl) _then)
      : super(_value, _then);

  /// Create a copy of PatientInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? phone = null,
    Object? avatar = freezed,
  }) {
    return _then(_$PatientInfoImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      phone: null == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _value.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PatientInfoImpl implements _PatientInfo {
  const _$PatientInfoImpl(
      {required this.id, required this.name, required this.phone, this.avatar});

  factory _$PatientInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$PatientInfoImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String phone;
  @override
  final String? avatar;

  @override
  String toString() {
    return 'PatientInfo(id: $id, name: $name, phone: $phone, avatar: $avatar)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PatientInfoImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, phone, avatar);

  /// Create a copy of PatientInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PatientInfoImplCopyWith<_$PatientInfoImpl> get copyWith =>
      __$$PatientInfoImplCopyWithImpl<_$PatientInfoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PatientInfoImplToJson(
      this,
    );
  }
}

abstract class _PatientInfo implements PatientInfo {
  const factory _PatientInfo(
      {required final String id,
      required final String name,
      required final String phone,
      final String? avatar}) = _$PatientInfoImpl;

  factory _PatientInfo.fromJson(Map<String, dynamic> json) =
      _$PatientInfoImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get phone;
  @override
  String? get avatar;

  /// Create a copy of PatientInfo
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PatientInfoImplCopyWith<_$PatientInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
