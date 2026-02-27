import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/appointment.dart';
import '../config/constants.dart';
import '../services/appointment_service.dart';
import '../providers/providers.dart';

/// Patient state model
class PatientState {
  final List<Appointment> appointments;
  final List<Appointment> upcomingAppointments;
  final List<Appointment> pastAppointments;
  final bool isLoading;
  final String? error;
  final PatientStats stats;

  PatientState({
    this.appointments = const [],
    this.upcomingAppointments = const [],
    this.pastAppointments = const [],
    this.isLoading = false,
    this.error,
    this.stats = const PatientStats(),
  });

  // Sentinel object to distinguish "not provided" from "set to null"
  static const _sentinel = Object();

  PatientState copyWith({
    List<Appointment>? appointments,
    List<Appointment>? upcomingAppointments,
    List<Appointment>? pastAppointments,
    bool? isLoading,
    Object? error = _sentinel,
    PatientStats? stats,
  }) {
    return PatientState(
      appointments: appointments ?? this.appointments,
      upcomingAppointments: upcomingAppointments ?? this.upcomingAppointments,
      pastAppointments: pastAppointments ?? this.pastAppointments,
      isLoading: isLoading ?? this.isLoading,
      error: identical(error, _sentinel) ? this.error : error as String?,
      stats: stats ?? this.stats,
    );
  }
}

/// Patient stats
class PatientStats {
  final int totalBookings;
  final int upcomingBookings;
  final int completedConsultations;
  final double totalSpent;
  final double savedAmount;

  const PatientStats({
    this.totalBookings = 0,
    this.upcomingBookings = 0,
    this.completedConsultations = 0,
    this.totalSpent = 0,
    this.savedAmount = 0,
  });

  PatientStats copyWith({
    int? totalBookings,
    int? upcomingBookings,
    int? completedConsultations,
    double? totalSpent,
    double? savedAmount,
  }) {
    return PatientStats(
      totalBookings: totalBookings ?? this.totalBookings,
      upcomingBookings: upcomingBookings ?? this.upcomingBookings,
      completedConsultations:
          completedConsultations ?? this.completedConsultations,
      totalSpent: totalSpent ?? this.totalSpent,
      savedAmount: savedAmount ?? this.savedAmount,
    );
  }
}

/// Patient State Notifier
class PatientStateNotifier extends StateNotifier<PatientState> {
  final AppointmentService _appointmentService;
  final String _patientId;

  PatientStateNotifier(this._appointmentService, this._patientId)
      : super(PatientState());

  /// Fetch appointments
  Future<void> fetchAppointments() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response =
          await _appointmentService.getPatientAppointments(_patientId);
      if (response.success && response.data != null) {
        final appointments = response.data!;
        final now = DateTime.now();

        final upcomingAppointments = appointments
            .where((a) => DateTime.parse(a.date.toString()).isAfter(now))
            .toList();
        final pastAppointments = appointments
            .where((a) => DateTime.parse(a.date.toString()).isBefore(now))
            .toList();

        // Calculate stats
        final completed = appointments
            .where((a) => a.status == AppConstants.appointmentCompleted)
            .length;
        final totalSpent = appointments
            .where((a) => a.paymentStatus == AppConstants.paymentPaid)
            .fold<double>(0, (sum, a) => sum + a.amount);

        final stats = PatientStats(
          totalBookings: appointments.length,
          upcomingBookings: upcomingAppointments.length,
          completedConsultations: completed,
          totalSpent: totalSpent,
          savedAmount: 0,
        );

        state = state.copyWith(
          appointments: appointments,
          upcomingAppointments: upcomingAppointments,
          pastAppointments: pastAppointments,
          stats: stats,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to fetch appointments',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Cancel appointment
  Future<bool> cancelAppointment(String appointmentId) async {
    try {
      final response =
          await _appointmentService.cancelAppointment(appointmentId);
      if (response.success) {
        await fetchAppointments();
        return true;
      } else {
        state = state.copyWith(
            error: response.error ?? 'Failed to cancel appointment');
        return false;
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

/// Patient provider
final patientProvider =
    StateNotifierProvider.autoDispose<PatientStateNotifier, PatientState>(
  (ref) {
    final currentUser = ref.watch(currentUserProvider);
    final appointmentService = ref.watch(appointmentServiceProvider);

    if (currentUser == null) {
      return PatientStateNotifier(appointmentService, '');
    }

    return PatientStateNotifier(appointmentService, currentUser.id);
  },
);
