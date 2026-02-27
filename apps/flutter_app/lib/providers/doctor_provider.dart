import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/doctor.dart';
import '../models/appointment.dart';
import '../config/constants.dart';
import '../services/doctor_service.dart';
import '../services/appointment_service.dart';
import '../providers/providers.dart';

/// Doctor state model
class DoctorState {
  final Doctor? profile;
  final List<DoctorAppointment> appointments;
  final List<DoctorAppointment> todayAppointments;
  final bool isLoading;
  final String? error;
  final DoctorStats stats;

  DoctorState({
    this.profile,
    this.appointments = const [],
    this.todayAppointments = const [],
    this.isLoading = false,
    this.error,
    this.stats = const DoctorStats(),
  });

  // Sentinel object to distinguish "not provided" from "set to null"
  static const _sentinel = Object();

  DoctorState copyWith({
    Doctor? profile,
    List<DoctorAppointment>? appointments,
    List<DoctorAppointment>? todayAppointments,
    bool? isLoading,
    Object? error = _sentinel,
    DoctorStats? stats,
  }) {
    return DoctorState(
      profile: profile ?? this.profile,
      appointments: appointments ?? this.appointments,
      todayAppointments: todayAppointments ?? this.todayAppointments,
      isLoading: isLoading ?? this.isLoading,
      error: identical(error, _sentinel) ? this.error : error as String?,
      stats: stats ?? this.stats,
    );
  }
}

/// Doctor stats
class DoctorStats {
  final int totalPatients;
  final int todayAppointments;
  final int pendingAppointments;
  final int upcomingAppointments;
  final double totalEarnings;
  final double thisMonthEarnings;
  final int completedAppointments;

  const DoctorStats({
    this.totalPatients = 0,
    this.todayAppointments = 0,
    this.pendingAppointments = 0,
    this.upcomingAppointments = 0,
    this.totalEarnings = 0,
    this.thisMonthEarnings = 0,
    this.completedAppointments = 0,
  });

  DoctorStats copyWith({
    int? totalPatients,
    int? todayAppointments,
    int? pendingAppointments,
    int? upcomingAppointments,
    double? totalEarnings,
    double? thisMonthEarnings,
    int? completedAppointments,
  }) {
    return DoctorStats(
      totalPatients: totalPatients ?? this.totalPatients,
      todayAppointments: todayAppointments ?? this.todayAppointments,
      pendingAppointments: pendingAppointments ?? this.pendingAppointments,
      upcomingAppointments: upcomingAppointments ?? this.upcomingAppointments,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      thisMonthEarnings: thisMonthEarnings ?? this.thisMonthEarnings,
      completedAppointments:
          completedAppointments ?? this.completedAppointments,
    );
  }
}

/// Doctor State Notifier
class DoctorStateNotifier extends StateNotifier<DoctorState> {
  final DoctorService _doctorService;
  final AppointmentService _appointmentService;
  final String _userId;

  DoctorStateNotifier(
    this._doctorService,
    this._appointmentService,
    this._userId,
  ) : super(DoctorState());

  /// Fetch doctor profile
  Future<void> fetchProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _doctorService.getDoctorByUserId(_userId);
      if (response.success && response.data != null) {
        state = state.copyWith(
          profile: response.data,
          isLoading: false,
        );
        await _fetchAppointments();
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to fetch profile',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Fetch appointments
  Future<void> _fetchAppointments() async {
    if (state.profile == null) return;

    try {
      final response = await _appointmentService.getDoctorAppointments(
        state.profile!.id,
      );
      if (response.success && response.data != null) {
        final appointments = response.data!;
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);

        final todayAppointments = appointments.where((a) {
          final aptDate = DateTime.parse(a.date.toString());
          final aptDay = DateTime(aptDate.year, aptDate.month, aptDate.day);
          return aptDay == today;
        }).toList();

        // Calculate stats
        final uniquePatients = <String>{};
        for (var apt in appointments) {
          uniquePatients.add(apt.patientId.id);
        }

        final pendingCount = appointments
                .where((a) => a.status == AppConstants.appointmentPending)
                .length;

        final upcomingCount = appointments
                .where((a) =>
                    a.status == AppConstants.appointmentPending ||
                    a.status == AppConstants.appointmentConfirmed ||
                    a.status == AppConstants.appointmentInProgress)
                .length;

        final completed = appointments
            .where((a) => a.status == AppConstants.appointmentCompleted)
            .length;

        final totalEarnings = appointments
            .where((a) => a.paymentStatus == AppConstants.paymentPaid)
            .fold<double>(0, (sum, a) => sum + a.amount);

        final thisMonthEarnings = appointments.where((a) {
          final aptDate = DateTime.parse(a.date.toString());
          return aptDate.month == now.month && aptDate.year == now.year;
        }).fold<double>(0, (sum, a) => sum + a.amount);

        final stats = DoctorStats(
          totalPatients: uniquePatients.length,
          todayAppointments: todayAppointments.length,
          pendingAppointments: pendingCount,
          upcomingAppointments: upcomingCount,
          totalEarnings: totalEarnings,
          thisMonthEarnings: thisMonthEarnings,
          completedAppointments: completed,
        );

        state = state.copyWith(
          appointments: appointments,
          todayAppointments: todayAppointments,
          stats: stats,
        );
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Update appointment status
  Future<bool> updateAppointmentStatus(
      String appointmentId, String status) async {
    try {
      final response =
          await _appointmentService.updateStatus(appointmentId, status);
      if (response.success) {
        await _fetchAppointments();
        return true;
      } else {
        state =
            state.copyWith(error: response.error ?? 'Failed to update status');
        return false;
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Update availability
  Future<bool> updateAvailability(List<TimeSlot> slots) async {
    if (state.profile == null) return false;

    try {
      final response = await _doctorService.updateAvailability(
        state.profile!.id,
        slots,
      );
      if (response.success && response.data != null) {
        state = state.copyWith(profile: response.data);
        return true;
      } else {
        state = state.copyWith(
            error: response.error ?? 'Failed to update availability');
        return false;
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Reschedule appointment
  Future<bool> rescheduleAppointment({
    required String appointmentId,
    required DateTime date,
    required String startTime,
    required String endTime,
  }) async {
    try {
      final response = await _appointmentService.rescheduleAppointment(
        appointmentId: appointmentId,
        date: date,
        startTime: startTime,
        endTime: endTime,
      );
      if (response.success) {
        await _fetchAppointments();
        return true;
      } else {
        state = state.copyWith(
          error: response.error ?? 'Failed to reschedule appointment',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

/// Doctor provider
final doctorProvider =
    StateNotifierProvider.autoDispose<DoctorStateNotifier, DoctorState>(
  (ref) {
    final currentUser = ref.watch(currentUserProvider);
    final doctorService = ref.watch(doctorServiceProvider);
    final appointmentService = ref.watch(appointmentServiceProvider);

    if (currentUser == null) {
      return DoctorStateNotifier(doctorService, appointmentService, '');
    }

    return DoctorStateNotifier(
        doctorService, appointmentService, currentUser.id);
  },
);
