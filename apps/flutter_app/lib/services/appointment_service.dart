import '../models/appointment.dart';
import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Appointment API Service
class AppointmentService {
  final ApiService _apiService;

  AppointmentService(this._apiService);

  /// Create appointment
  Future<ApiResponse<Appointment>> createAppointment({
    required String patientId,
    required String doctorId,
    required DateTime date,
    required String startTime,
    required String endTime,
    required String type,
    String? symptoms,
  }) {
    return _apiService.post(
      ApiEndpoints.createAppointment,
      body: {
        'patientId': patientId,
        'doctorId': doctorId,
        'date':
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        'timeSlot': {
          'start': startTime,
          'end': endTime,
        },
        'type': type,
        if (symptoms != null) 'symptoms': symptoms,
      },
      fromJson: (json) => Appointment.fromJson(json),
    );
  }

  /// Get patient appointments
  Future<ApiResponse<List<Appointment>>> getPatientAppointments(
    String patientId, {
    String? status,
    bool? upcoming,
  }) {
    final params = <String, dynamic>{
      if (status != null) 'status': status,
      if (upcoming != null) 'upcoming': upcoming,
    };

    final queryString = params.entries.isNotEmpty
        ? '?${params.entries.map((e) => '${e.key}=${e.value}').join('&')}'
        : '';

    return _apiService.get(
      '${ApiEndpoints.getPatientAppointments.replaceFirst(':patientId', patientId)}$queryString',
      fromJson: (json) {
        // Handle the wrapper format from API service
        final list = json['data'] as List? ?? [];
        return list
            .map((item) => Appointment.fromJson(item as Map<String, dynamic>))
            .toList();
      },
    );
  }

  /// Get doctor appointments
  Future<ApiResponse<List<DoctorAppointment>>> getDoctorAppointments(
    String doctorId, {
    String? status,
    DateTime? date,
  }) {
    final params = <String, dynamic>{
      if (status != null) 'status': status,
      if (date != null) 'date': date.toIso8601String(),
    };

    final queryString = params.entries.isNotEmpty
        ? '?${params.entries.map((e) => '${e.key}=${e.value}').join('&')}'
        : '';

    return _apiService.get(
      '${ApiEndpoints.getDoctorAppointments.replaceFirst(':doctorId', doctorId)}$queryString',
      fromJson: (json) {
        // Handle the wrapper format from API service
        final list = json['data'] as List? ?? [];
        return list
            .map((item) =>
                DoctorAppointment.fromJson(item as Map<String, dynamic>))
            .toList();
      },
    );
  }

  /// Update appointment status
  Future<ApiResponse<Appointment>> updateStatus(
    String appointmentId,
    String status,
  ) {
    return _apiService.patch(
      ApiEndpoints.updateAppointmentStatus.replaceFirst(':id', appointmentId),
      body: {'status': status},
      fromJson: (json) => Appointment.fromJson(json),
    );
  }

  /// Cancel appointment
  Future<ApiResponse<Appointment>> cancelAppointment(String appointmentId) {
    return _apiService.post(
      ApiEndpoints.cancelAppointment.replaceFirst(':id', appointmentId),
      fromJson: (json) => Appointment.fromJson(json),
    );
  }

  /// Book appointment (delegates to createAppointment)
  Future<ApiResponse<Appointment>> bookAppointment({
    required String doctorId,
    required String patientId,
    required DateTime date,
    required String time,
    required String endTime,
    required String reason,
    String type = 'clinic',
    String? notes,
  }) async {
    return createAppointment(
      patientId: patientId,
      doctorId: doctorId,
      date: date,
      startTime: time,
      endTime: endTime,
      type: type,
      symptoms: reason,
    );
  }

  /// Reschedule appointment (update date and time slot)
  Future<ApiResponse<Appointment>> rescheduleAppointment({
    required String appointmentId,
    required DateTime date,
    required String startTime,
    required String endTime,
  }) {
    return _apiService.patch(
      ApiEndpoints.updateAppointmentTimeSlot.replaceFirst(':id', appointmentId),
      body: {
        'date': date.toIso8601String(),
        'timeSlot': {
          'start': startTime,
          'end': endTime,
        },
      },
      fromJson: (json) => Appointment.fromJson(json),
    );
  }
}
