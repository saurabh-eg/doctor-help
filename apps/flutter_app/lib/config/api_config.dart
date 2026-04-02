import 'package:flutter/foundation.dart';

/// API Configuration
class ApiConfig {
  // Base URL - Change based on environment
  // Development: Use 10.0.2.2 for Android emulator (maps to host localhost)
  // Example: https://abc123.ngrok.io/api
  static const String baseUrl = 'http://10.0.2.2:3001/api';

  // API Timeouts
  static const Duration timeout = Duration(seconds: 30);
  static const Duration connectTimeout = Duration(seconds: 15);

  // Development mode - Only true in debug builds
  static const bool debugMode = kDebugMode;

  /// Get API URL from environment or use default
  static String getBaseUrl() {
    // Can be overridden with environment variables
    return const String.fromEnvironment(
      'API_URL',
      defaultValue: baseUrl,
    );
  }
}

/// App Configuration
class AppConfig {
  // App name
  static const String appName = 'Doctor Help';

  // Version
  static const String version = '1.0.0';

  // Design System Colors
  static const int primaryColor = 0xFF2563eb;
  static const int secondaryColor = 0xFF34d399;
  static const int accentColor = 0xFFf9f506;

  // Design System
  static const String fontFamily = 'Inter';
  static const String displayFontFamily = 'Lexend';
}

/// API Endpoints
class ApiEndpoints {
  // Auth
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String refreshToken = '/auth/refresh';
  static const String getMe = '/auth/me';

  // Users
  static const String getUser = '/users';
  static const String setUserRole = '/users/:id/role';
  static const String completeProfile = '/users/:id/complete-profile';
  static const String updateProfile = '/users/:id';

  // Doctors
  static const String listDoctors = '/doctors';
  static const String searchDoctors = '/doctors/search';
  static const String getDoctor = '/doctors/:id';
  static const String getDoctorByUserId = '/doctors/user/:userId';
  static const String registerDoctor = '/doctors/register';
  static const String updateDoctorProfile = '/doctors/:id/profile';
  static const String updateAvailability = '/doctors/:id/availability';
  static const String uploadProfile = '/doctors/upload-photo';
  static const String uploadAvatar = '/users/upload-avatar';

  // Appointments
  static const String createAppointment = '/appointments';
  static const String getPatientAppointments =
      '/appointments/patient/:patientId';
  static const String getDoctorAppointments = '/appointments/doctor/:doctorId';
  static const String getAppointment = '/appointments/:id';
  static const String updateAppointmentStatus = '/appointments/:id/status';
  static const String updateAppointmentTimeSlot =
      '/appointments/:id/reschedule';
  // Cancel appointment (POST)
  static const String cancelAppointment = '/appointments/:id/cancel';

  // Payments
  static const String initiatePayment = '/payments/initiate';
  static const String getPaymentStatus = '/payments/:paymentId';

  // Admin
  static const String getDashboardStats = '/admin/dashboard';
  static const String getUsers = '/admin/users';
  static const String getPendingDoctors = '/admin/doctors/pending';
  static const String verifyDoctor = '/admin/doctors/:id/verify';

  // Reviews
  static const String createReview = '/reviews';
  static const String getDoctorReviews = '/reviews/doctor/:doctorId';
  static const String checkReviewExists = '/reviews/check/:appointmentId';

  // Labs and diagnostics
  static const String listLabs = '/labs';
  static const String compareLabTests = '/labs/compare/tests/:testName';
  static const String getLabCatalog = '/labs/:id/catalog';
  static const String createLabOrder = '/lab-orders';
  static const String getMyLabOrders = '/lab-orders/my';
  static const String getLabOrderById = '/lab-orders/:id';
  static const String cancelLabOrder = '/lab-orders/:id/cancel';
  static const String uploadLabPrescription = '/lab-orders/upload-prescription';

  // Lab self-registration
  static const String createLabRegistrationRequest =
      '/lab-registrations/request';
  static const String uploadLabRegistrationDocument =
      '/lab-registrations/upload-document';

  // Lab provider module
  static const String getLabProviderProfile = '/lab-provider/profile';
  static const String updateLabProviderProfile = '/lab-provider/profile';
  static const String getLabProviderDashboard = '/lab-provider/dashboard';
  static const String getLabProviderCatalog = '/lab-provider/catalog';
  static const String createLabProviderTest = '/lab-provider/catalog/tests';
  static const String updateLabProviderTest = '/lab-provider/catalog/tests/:id';
  static const String createLabProviderPackage =
      '/lab-provider/catalog/packages';
  static const String updateLabProviderPackage =
      '/lab-provider/catalog/packages/:id';
  static const String getLabProviderOrders = '/lab-provider/orders';
  static const String getLabProviderOrderById = '/lab-provider/orders/:id';
  static const String updateLabProviderOrderStatus =
      '/lab-provider/orders/:id/status';
  static const String assignLabProviderOrderCollector =
      '/lab-provider/orders/:id/collector';
  static const String escalateLabProviderOrder =
      '/lab-provider/orders/:id/escalate';
  static const String uploadLabProviderOrderReport =
      '/lab-provider/orders/:id/report';

  // Notifications realtime stream (SSE)
  static const String notificationsStream = '/notifications/stream';
  static const String notificationsPreferences = '/notifications/preferences';
  static const String notificationsRegisterDevice =
      '/notifications/devices/register';
  static const String notificationsUnregisterDevice =
      '/notifications/devices/unregister';
}
