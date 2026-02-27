import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../services/api_service.dart';
import '../utils/storage.dart';
import '../config/constants.dart';

/// Auth state model
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;
  final bool isNewUser;

  AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
    this.isNewUser = false,
  });

  // Sentinel object to distinguish "not provided" from "set to null"
  static const _sentinel = Object();

  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isAuthenticated,
    Object? error = _sentinel,
    bool? isNewUser,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: identical(error, _sentinel) ? this.error : error as String?,
      isNewUser: isNewUser ?? this.isNewUser,
    );
  }
}

/// Auth State Notifier
class AuthStateNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final UserService _userService;
  final ApiService _apiService;

  AuthStateNotifier(this._authService, this._userService, this._apiService)
      : super(AuthState()) {
    _checkStoredAuth();
  }

  /// Check if user is already logged in
  Future<void> _checkStoredAuth() async {
    final token = await StorageService.getSecure(AppConstants.storageKeyToken);
    if (token != null) {
      await _apiService.setToken(token);
      try {
        final response = await _authService.getMe();
        if (response.success && response.data != null) {
          state = state.copyWith(
            user: response.data,
            isAuthenticated: true,
            error: null,
          );
        } else {
          await logout();
        }
      } catch (e) {
        await logout();
      }
    }
  }

  /// Send OTP
  Future<bool> sendOtp(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.sendOtp(phone);
      if (response.success) {
        state = state.copyWith(isLoading: false);
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to send OTP',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Verify OTP and login
  Future<bool> verifyOtp(String phone, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.verifyOtp(phone, otp);
      if (response.success && response.data != null) {
        final token = response.data!.token;
        final user = response.data!.user;

        // Save token securely (apiService.setToken already writes to secure storage)
        await _apiService.setToken(token);

        final isNewUser = user.isNewUser ?? false;

        state = state.copyWith(
          user: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isNewUser: isNewUser,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Invalid OTP',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Set user role
  Future<bool> setRole(String role) async {
    if (state.user == null) return false;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _userService.setRole(state.user!.id, role);
      final newRole = response.data;

      if (response.success && newRole != null && newRole.isNotEmpty) {
        state = state.copyWith(
          user: state.user!.copyWith(role: newRole),
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to set role',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Complete profile
  Future<bool> completeProfile({
    required String name,
    String? email,
  }) async {
    if (state.user == null) return false;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _userService.completeProfile(
        state.user!.id,
        name: name,
        email: email,
      );
      if (response.success && response.data != null) {
        state = state.copyWith(
          user: response.data,
          isLoading: false,
          isNewUser: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to complete profile',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await _apiService.clearToken();
    await StorageService.clearSecure();
    await StorageService.clear();
    state = AuthState();
  }

  /// Update user
  void updateUser(User user) {
    state = state.copyWith(user: user);
  }

  /// Refresh user data from backend
  Future<bool> refreshUser() async {
    if (state.user == null) return false;

    try {
      final response = await _authService.getMe();
      if (response.success && response.data != null) {
        state = state.copyWith(
          user: response.data,
          error: null,
        );
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}
