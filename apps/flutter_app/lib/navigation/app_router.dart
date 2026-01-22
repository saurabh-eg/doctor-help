import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/verify_otp_screen.dart';
import '../screens/auth/role_select_screen.dart';
import '../screens/auth/profile_setup_screen.dart';
import '../screens/patient/home_screen.dart';
import '../screens/patient/search_screen.dart';
import '../screens/patient/doctor_profile_screen.dart';
import '../screens/patient/book_appointment_screen.dart';
import '../screens/patient/bookings_screen.dart';
import '../screens/patient/profile_screen.dart' as patient_profile;
import '../screens/doctor/dashboard_screen.dart';
import '../screens/doctor/appointments_screen.dart';
import '../screens/doctor/patients_screen.dart';
import '../screens/doctor/earnings_screen.dart';
import '../screens/doctor/profile_screen.dart' as doctor_profile;

/// App Routes
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String verifyOtp = '/verify-otp';
  static const String roleSelect = '/role-select';
  static const String profileSetup = '/profile-setup';
  static const String patientHome = '/patient/home';
  static const String patientSearch = '/patient/search';
  static const String patientBookings = '/patient/bookings';
  static const String patientProfile = '/patient/profile';
  static const String doctorViewProfile = '/doctor/profile';
  static const String bookAppointment = '/book-appointment';
  static const String doctorDashboard = '/doctor/dashboard';
  static const String doctorAppointments = '/doctor/appointments';
  static const String doctorPatients = '/doctor/patients';
  static const String doctorEarnings = '/doctor/earnings';
  static const String doctorProfile = '/doctor/profile-settings';
}

/// App Router Configuration
final appRouter = GoRouter(
  initialLocation: AppRoutes.login,
  redirect: (context, state) {
    // Auth redirect will be handled by listening to authStateProvider in main.dart
    return null;
  },
  routes: [
    GoRoute(
      path: AppRoutes.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: AppRoutes.verifyOtp,
      builder: (context, state) {
        final phone = state.uri.queryParameters['phone'] ?? '';
        return VerifyOtpScreen(phone: phone);
      },
    ),
    GoRoute(
      path: AppRoutes.roleSelect,
      builder: (context, state) => const RoleSelectScreen(),
    ),
    GoRoute(
      path: AppRoutes.profileSetup,
      builder: (context, state) => const ProfileSetupScreen(),
    ),
    // Patient routes
    GoRoute(
      path: AppRoutes.patientHome,
      builder: (context, state) => const PatientHomeScreen(),
    ),
    GoRoute(
      path: AppRoutes.patientSearch,
      builder: (context, state) => const PatientSearchScreen(),
    ),
    GoRoute(
      path: AppRoutes.doctorViewProfile,
      builder: (context, state) {
        final doctorId = state.uri.queryParameters['id'] ?? '';
        return DoctorProfileScreen(doctorId: doctorId);
      },
    ),
    GoRoute(
      path: AppRoutes.bookAppointment,
      builder: (context, state) {
        final doctorId = state.uri.queryParameters['doctorId'] ?? '';
        return BookAppointmentScreen(doctorId: doctorId);
      },
    ),
    GoRoute(
      path: AppRoutes.patientBookings,
      builder: (context, state) => const PatientBookingsScreen(),
    ),
    GoRoute(
      path: AppRoutes.patientProfile,
      builder: (context, state) => const patient_profile.PatientProfileScreen(),
    ),
    // Doctor routes
    GoRoute(
      path: AppRoutes.doctorDashboard,
      builder: (context, state) => const DoctorDashboardScreen(),
    ),
    GoRoute(
      path: AppRoutes.doctorAppointments,
      builder: (context, state) => const DoctorAppointmentsScreen(),
    ),
    GoRoute(
      path: AppRoutes.doctorPatients,
      builder: (context, state) => const DoctorPatientsScreen(),
    ),
    GoRoute(
      path: AppRoutes.doctorEarnings,
      builder: (context, state) => const DoctorEarningsScreen(),
    ),
    GoRoute(
      path: AppRoutes.doctorProfile,
      builder: (context, state) => const doctor_profile.DoctorProfileScreen(),
    ),
  ],
);
