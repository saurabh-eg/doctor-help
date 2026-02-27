import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/verify_otp_screen.dart';
import '../screens/auth/role_select_screen.dart';
import '../screens/auth/profile_setup_screen.dart';
import '../screens/auth/doctor_verification_screen.dart';
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
import '../screens/legal/privacy_policy_screen.dart';
import '../screens/legal/terms_of_service_screen.dart';
import '../screens/legal/refund_policy_screen.dart';
import '../screens/legal/contact_us_screen.dart';
import '../screens/doctor/notification_settings_screen.dart';
import '../screens/doctor/change_password_screen.dart';
import '../screens/patient/write_review_screen.dart';
import '../providers/providers.dart';

/// Bridges Riverpod auth state changes to GoRouter's [refreshListenable]
/// so the router re-evaluates its redirect without being recreated.
class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (_, __) {
      notifyListeners();
    });
  }
}

/// App Routes
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String verifyOtp = '/verify-otp';
  static const String roleSelect = '/role-select';
  static const String profileSetup = '/profile-setup';
  static const String doctorVerification = '/doctor-verification';
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

  // Doctor settings routes
  static const String doctorNotificationSettings =
      '/doctor/notification-settings';
  static const String doctorChangePassword = '/doctor/change-password';

  // Review route
  static const String writeReview = '/write-review';

  // Legal routes
  static const String privacyPolicy = '/privacy-policy';
  static const String termsOfService = '/terms-of-service';
  static const String refundPolicy = '/refund-policy';
  static const String contactUs = '/contact-us';
}

// Routes that don't require authentication
const _publicRoutes = {
  AppRoutes.login,
  AppRoutes.verifyOtp,
  AppRoutes.privacyPolicy,
  AppRoutes.termsOfService,
  AppRoutes.refundPolicy,
  AppRoutes.contactUs,
};

// Routes for authenticated users navigating onboarding
const _onboardingRoutes = {
  AppRoutes.roleSelect,
  AppRoutes.profileSetup,
  AppRoutes.doctorVerification,
};

/// App Router Provider — created once; re-evaluates redirect via refreshListenable
final appRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = _AuthRefreshNotifier(ref);

  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final authState = ref.read(authStateProvider);
      final isAuthenticated = authState.isAuthenticated;
      final currentPath = state.matchedLocation;
      final isPublicRoute = _publicRoutes.contains(currentPath);
      final isOnboardingRoute = _onboardingRoutes.contains(currentPath);

      // Not authenticated — only allow public + onboarding routes
      if (!isAuthenticated) {
        if (isPublicRoute || isOnboardingRoute) return null;
        return AppRoutes.login;
      }

      // Authenticated — redirect away from login
      if (currentPath == AppRoutes.login) {
        final role = authState.user?.role;
        if (role == 'doctor') return AppRoutes.doctorDashboard;
        return AppRoutes.patientHome;
      }

      // Authenticated — allow all routes (role-level enforcement is optional)
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
      GoRoute(
        path: AppRoutes.doctorVerification,
        builder: (context, state) => const DoctorVerificationScreen(),
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
        builder: (context, state) =>
            const patient_profile.PatientProfileScreen(),
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
      // Doctor settings routes
      GoRoute(
        path: AppRoutes.doctorNotificationSettings,
        builder: (context, state) => const NotificationSettingsScreen(),
      ),
      GoRoute(
        path: AppRoutes.doctorChangePassword,
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.writeReview,
        builder: (context, state) {
          final appointmentId = state.uri.queryParameters['appointmentId'] ?? '';
          final doctorName = state.uri.queryParameters['doctorName'] ?? 'Doctor';
          return WriteReviewScreen(
            appointmentId: appointmentId,
            doctorName: doctorName,
          );
        },
      ),
      // Legal routes
      GoRoute(
        path: AppRoutes.privacyPolicy,
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: AppRoutes.termsOfService,
        builder: (context, state) => const TermsOfServiceScreen(),
      ),
      GoRoute(
        path: AppRoutes.refundPolicy,
        builder: (context, state) => const RefundPolicyScreen(),
      ),
      GoRoute(
        path: AppRoutes.contactUs,
        builder: (context, state) => const ContactUsScreen(),
      ),
    ],
  );
});
