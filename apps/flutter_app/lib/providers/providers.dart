import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../services/doctor_service.dart';
import '../services/appointment_service.dart';
import '../services/review_service.dart';
import '../services/lab_service.dart';
import '../services/lab_registration_service.dart';
import '../services/payment_service.dart';
import '../services/notification_service.dart';
import '../services/notification_realtime_service.dart';
import '../services/push_notification_service.dart';
import '../utils/storage.dart';
import '../config/constants.dart';
import 'auth_provider.dart';
import 'notification_provider.dart';

// Initialize storage provider
final storageProvider = FutureProvider((ref) async {
  await StorageService.init();
  return StorageService;
});

// Shared API Service instance to ensure token is consistent across all services
final _sharedApiService = ApiService();

// API Service provider - returns the shared instance
final apiServiceProvider = Provider((ref) {
  return _sharedApiService;
});

// Auth Service provider
final authServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthService(apiService);
});

// User Service provider
final userServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return UserService(apiService);
});

// Doctor Service provider
final doctorServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return DoctorService(apiService);
});

// Appointment Service provider
final appointmentServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AppointmentService(apiService);
});

// Review Service provider
final reviewServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ReviewService(apiService);
});

// Lab Service provider
final labServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return LabService(apiService);
});

final labRegistrationServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return LabRegistrationService(apiService);
});

final paymentServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return PaymentService(apiService);
});

// Notification Service provider
final notificationServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return NotificationService(apiService);
});

final notificationRealtimeServiceProvider = Provider((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return NotificationRealtimeService(apiService);
});

// Push Notification Service provider
final pushNotificationServiceProvider = Provider((ref) {
  final notificationService = ref.watch(notificationServiceProvider);
  return PushNotificationService(notificationService);
});

// Auth state provider
final authStateProvider =
    StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  final userService = ref.watch(userServiceProvider);
  final apiService = ref.watch(apiServiceProvider);
  return AuthStateNotifier(authService, userService, apiService);
});

// Auth token provider
final authTokenProvider = StateProvider<String?>((ref) {
  return StorageService.getString(AppConstants.storageKeyToken);
});

// Current user provider
final currentUserProvider = StateProvider((ref) {
  return ref.watch(authStateProvider).user;
});

// Lab order polling state - tracks which orders need refresh
final _labOrderRefreshTokenProvider = StateProvider<Map<String, int>>((ref) {
  return {};
});

// Individual lab order refresh trigger
void triggerLabOrderRefresh(WidgetRef ref, String labOrderId) {
  final tokens = ref.read(_labOrderRefreshTokenProvider);
  final newTokens = {...tokens};
  newTokens[labOrderId] = (tokens[labOrderId] ?? 0) + 1;
  ref.read(_labOrderRefreshTokenProvider.notifier).state = newTokens;
}

// Notification initialization and cleanup effect
// Initializes push notifications on auth, cleans up on logout
final notificationInitializationProvider = FutureProvider((ref) async {
  final authState = ref.watch(authStateProvider);
  final pushService = ref.watch(pushNotificationServiceProvider);
  final hasName = (authState.user?.name ?? '').trim().isNotEmpty;
  final onboardingComplete =
      authState.isAuthenticated && (authState.isNewUser == false) && hasName;

  // Initialize notifications only after onboarding is complete.
  if (onboardingComplete) {
    // Use invalidate to refresh notifications without modifying during build
    ref.invalidate(notificationListProvider);
    await pushService.initialize();
  } else if (!authState.isAuthenticated) {
    // Only unregister and dispose when user is actually logged out (not just during onboarding)
    await pushService.unregisterCurrentDevice();
    await pushService.dispose();
  }
  // During onboarding (authenticated but incomplete), don't unregister - let it stay registered
});
