import '../models/user.dart';
import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Auth API Service
class AuthService {
  final ApiService _apiService;

  AuthService(this._apiService);

  /// Send OTP to phone number
  Future<ApiResponse<Map<String, dynamic>>> sendOtp(String phone) {
    return _apiService.post(
      ApiEndpoints.sendOtp,
      body: {'phone': phone},
    );
  }

  /// Verify OTP and get token
  Future<ApiResponse<VerifyOtpResponse>> verifyOtp(String phone, String otp) {
    return _apiService.post(
      ApiEndpoints.verifyOtp,
      body: {'phone': phone, 'otp': otp},
      fromJson: (json) => VerifyOtpResponse.fromJson(json),
    );
  }

  /// Refresh token
  Future<ApiResponse<RefreshTokenResponse>> refreshToken() {
    return _apiService.post(
      ApiEndpoints.refreshToken,
      fromJson: (json) => RefreshTokenResponse.fromJson(json),
    );
  }

  /// Get current user
  Future<ApiResponse<User>> getMe() {
    return _apiService.get(
      ApiEndpoints.getMe,
      fromJson: (json) => User.fromJson(json),
    );
  }
}

/// Response models
class VerifyOtpResponse {
  final String token;
  final User user;

  VerifyOtpResponse({
    required this.token,
    required this.user,
  });

  factory VerifyOtpResponse.fromJson(Map<String, dynamic> json) {
    return VerifyOtpResponse(
      token: json['token'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class RefreshTokenResponse {
  final String token;

  RefreshTokenResponse({required this.token});

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      token: json['token'] as String,
    );
  }
}
