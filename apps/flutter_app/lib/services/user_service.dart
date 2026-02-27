import '../models/user.dart';
import '../models/api_response.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// User API Service
class UserService {
  final ApiService _apiService;

  UserService(this._apiService);

  /// Get user by ID
  Future<ApiResponse<User>> getUser(String userId) {
    return _apiService.get(
      '${ApiEndpoints.getUser}/$userId',
      fromJson: (json) => User.fromJson(json),
    );
  }

  /// Set user role
  /// Returns the new role string from the API response.
  Future<ApiResponse<String>> setRole(String userId, String role) {
    return _apiService.post(
      ApiEndpoints.setUserRole.replaceFirst(':id', userId),
      body: {'role': role},
      fromJson: (json) => json['role']?.toString() ?? '',
    );
  }

  /// Complete user profile
  Future<ApiResponse<User>> completeProfile(
    String userId, {
    required String name,
    String? email,
  }) {
    return _apiService.post(
      ApiEndpoints.completeProfile.replaceFirst(':id', userId),
      body: {
        'name': name,
        if (email != null && email.isNotEmpty) 'email': email,
      },
      fromJson: (json) => User.fromJson(json),
    );
  }

  /// Update user profile and return updated user
  Future<ApiResponse<User>> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? address,
    String? avatar,
  }) {
    return _apiService.patch(
      // Use 'me' so backend resolves authenticated user id
      ApiEndpoints.updateProfile.replaceFirst(':id', 'me'),
      body: {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (address != null) 'address': address,
        if (avatar != null) 'avatar': avatar,
      },
      fromJson: (json) => User.fromJson(json),
    );
  }

  /// Upload avatar photo and return the Cloudinary URL
  Future<ApiResponse<String>> uploadAvatar(String filePath) {
    return _apiService.uploadFile(
      ApiEndpoints.uploadAvatar,
      filePath: filePath,
      fieldName: 'photo',
      fromJson: (json) => json['url']?.toString() ?? '',
    );
  }
}
