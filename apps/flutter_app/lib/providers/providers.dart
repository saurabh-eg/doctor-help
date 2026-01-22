import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../services/doctor_service.dart';
import '../services/appointment_service.dart';
import '../utils/storage.dart';
import '../config/constants.dart';
import 'auth_provider.dart';

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
