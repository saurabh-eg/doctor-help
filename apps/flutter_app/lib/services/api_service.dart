import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import '../config/api_config.dart';
import '../models/api_response.dart';
import '../utils/storage.dart';
import '../config/constants.dart';

final logger = Logger();

/// HTTP API Service
class ApiService {
  static const String _tokenKey = AppConstants.storageKeyToken;
  String? _token;
  bool _isRefreshing = false;

  /// Initialize API service
  ApiService() {
    // Load from legacy SharedPreferences sync; secure storage loaded async
    _loadToken();
    _loadSecureToken();
  }

  /// Load token from SharedPreferences (sync fallback for immediate availability)
  void _loadToken() {
    _token = StorageService.getString(_tokenKey);
  }

  /// Load token from secure storage (async — overrides SharedPreferences value)
  Future<void> _loadSecureToken() async {
    final secureToken = await StorageService.getSecure(_tokenKey);
    if (secureToken != null) {
      _token = secureToken;
      // Migrate: remove from insecure storage
      await StorageService.remove(_tokenKey);
    }
  }

  /// Set auth token (stores in secure storage)
  Future<void> setToken(String token) async {
    _token = token;
    await StorageService.saveSecure(_tokenKey, token);
    // Remove from insecure storage if present (migration)
    await StorageService.remove(_tokenKey);
  }

  /// Get auth token
  String? getToken() => _token;

  /// Clear auth token
  Future<void> clearToken() async {
    _token = null;
    await StorageService.removeSecure(_tokenKey);
    await StorageService.remove(_tokenKey);
  }

  /// Build headers with auth token
  Map<String, String> _buildHeaders({Map<String, String>? additionalHeaders}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }

    if (additionalHeaders != null) {
      headers.addAll(additionalHeaders);
    }

    return headers;
  }

  /// Attempt to refresh the token on 401. Returns true if token was refreshed.
  Future<bool> _attemptTokenRefresh() async {
    if (_isRefreshing || _token == null) return false;
    _isRefreshing = true;
    try {
      final url =
          Uri.parse('${ApiConfig.getBaseUrl()}${ApiEndpoints.refreshToken}');
      final response = await http
          .post(url, headers: _buildHeaders())
          .timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newToken = data['data']?['token'] as String?;
        if (newToken != null) {
          await setToken(newToken);
          return true;
        }
      }
      // Refresh failed — clear auth
      await clearToken();
      return false;
    } catch (e) {
      logger.e('Token refresh failed: $e');
      await clearToken();
      return false;
    } finally {
      _isRefreshing = false;
    }
  }

  /// GET request
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');

      if (ApiConfig.debugMode) {
        logger.i('GET: $url');
      }

      var response = await http
          .get(url, headers: _buildHeaders())
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      // Retry once on 401 with refreshed token
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await http
            .get(url, headers: _buildHeaders())
            .timeout(ApiConfig.timeout);
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('GET Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// POST request
  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');
      final encodedBody = body != null ? jsonEncode(body) : null;

      if (ApiConfig.debugMode) {
        logger.i('POST: $url');
        logger.i('Body: $encodedBody');
        logger.i('Token present: ${_token != null}');
      }

      var response = await http
          .post(url, headers: _buildHeaders(), body: encodedBody)
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      // Retry once on 401 with refreshed token
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await http
            .post(url, headers: _buildHeaders(), body: encodedBody)
            .timeout(ApiConfig.timeout);
      }

      if (ApiConfig.debugMode) {
        logger.i('Response status: ${response.statusCode}');
        logger.i('Response body: ${response.body}');
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('POST Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// PATCH request
  Future<ApiResponse<T>> patch<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');
      final encodedBody = body != null ? jsonEncode(body) : null;

      if (ApiConfig.debugMode) {
        logger.i('PATCH: $url');
        logger.i('Body: $encodedBody');
      }

      var response = await http
          .patch(url, headers: _buildHeaders(), body: encodedBody)
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      // Retry once on 401 with refreshed token
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await http
            .patch(url, headers: _buildHeaders(), body: encodedBody)
            .timeout(ApiConfig.timeout);
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('PATCH Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// PUT request
  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');
      final encodedBody = body != null ? jsonEncode(body) : null;

      if (ApiConfig.debugMode) {
        logger.i('PUT: $url');
        logger.i('Body: $encodedBody');
      }

      var response = await http
          .put(url, headers: _buildHeaders(), body: encodedBody)
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      // Retry once on 401 with refreshed token
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await http
            .put(url, headers: _buildHeaders(), body: encodedBody)
            .timeout(ApiConfig.timeout);
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('PUT Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Multipart POST request (for file uploads)
  Future<ApiResponse<T>> uploadFile<T>(
    String endpoint, {
    required String filePath,
    required String fieldName,
    Map<String, String>? additionalFields,
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');

      if (ApiConfig.debugMode) {
        logger.i('UPLOAD: $url');
      }

      // Ensure secure token load has had a chance before first multipart call.
      if (_token == null) {
        await _loadSecureToken();
      }

      if (_token == null || _token!.trim().isEmpty) {
        return ApiResponse<T>(
          success: false,
          error: 'Authentication token not available. Please login again.',
        );
      }

      Future<http.Response> sendMultipartRequest() async {
        final request = http.MultipartRequest('POST', url);

        request.headers['Authorization'] = 'Bearer $_token';

        request.files.add(
          await http.MultipartFile.fromPath(fieldName, filePath),
        );

        if (additionalFields != null) {
          request.fields.addAll(additionalFields);
        }

        final streamResponse = await request.send().timeout(ApiConfig.timeout);
        return http.Response.fromStream(streamResponse);
      }

      var response = await sendMultipartRequest();

      // Retry once on 401 with refreshed token (parity with get/post/patch/delete)
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await sendMultipartRequest();
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('UPLOAD Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// DELETE request
  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.getBaseUrl()}$endpoint');

      if (ApiConfig.debugMode) {
        logger.i('DELETE: $url');
      }

      var response = await http
          .delete(url, headers: _buildHeaders())
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      // Retry once on 401 with refreshed token
      if (response.statusCode == 401 && await _attemptTokenRefresh()) {
        response = await http
            .delete(url, headers: _buildHeaders())
            .timeout(ApiConfig.timeout);
      }

      return _handleResponse(response, fromJson, endpoint);
    } catch (e) {
      logger.e('DELETE Error: $e');
      return ApiResponse<T>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Handle API response
  ApiResponse<T> _handleResponse<T>(
    http.Response response,
    T Function(Map<String, dynamic>)? fromJson, [
    String? endpoint,
  ]) {
    if (ApiConfig.debugMode) {
      logger.i('Status Code: ${response.statusCode}');
      logger.i('Response: ${response.body}');
    }

    try {
      final trimmedBody = response.body.trim();
      final decoded = trimmedBody.isNotEmpty ? jsonDecode(trimmedBody) : null;
      final json =
          decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
      final plainTextBody = trimmedBody.isNotEmpty ? trimmedBody : null;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = json['data'];
        // If no parser provided, just return raw map (or null)
        if (fromJson == null) {
          return ApiResponse<T>(
            success: true,
            data: data as T?,
            message: json['message']?.toString(),
          );
        }

        // Handle Map response
        if (data is Map<String, dynamic>) {
          return ApiResponse<T>(
            success: true,
            data: fromJson(data),
            message: json['message']?.toString(),
          );
        }

        // Handle List response - pass the whole json to fromJson
        if (data is List) {
          try {
            // Preserve list and pagination fields for paginated parsers.
            final result = fromJson({
              'data': data,
              'pagination': json['pagination'],
            });
            return ApiResponse<T>(
              success: true,
              data: result,
              message: json['message']?.toString(),
            );
          } catch (e) {
            logger.e('List Parse Error: $e');
            return ApiResponse<T>(
              success: true,
              data: null,
              message: json['message']?.toString(),
            );
          }
        }

        // If backend returns null data
        return ApiResponse<T>(
          success: true,
          data: null,
          message: json['message']?.toString(),
        );
      } else if (response.statusCode == 401) {
        // Keep the token intact here; background requests can fail with 401
        // during onboarding or when a token is temporarily unavailable.
        // Refresh logic in the HTTP methods already handles recoverable auth.
        return ApiResponse<T>(
          success: false,
          error: json['error']?.toString() ?? 'Unauthorized',
        );
      } else if (response.statusCode == 429) {
        return ApiResponse<T>(
          success: false,
          error: json['error']?.toString() ??
              plainTextBody ??
              'Too many requests, please try again later.',
        );
      } else {
        String errorMessage =
            json['error']?.toString() ?? plainTextBody ?? 'An error occurred';

        final details = json['details'];
        if (details is List && details.isNotEmpty) {
          final first = details.first;
          if (first is Map<String, dynamic>) {
            final detailMessage = first['message']?.toString();
            if (detailMessage != null && detailMessage.trim().isNotEmpty) {
              errorMessage = '$errorMessage: ${detailMessage.trim()}';
            }
          }
        }

        return ApiResponse<T>(
          success: false,
          error: errorMessage,
        );
      }
    } catch (e) {
      logger.e('Parse Error: $e');
      return ApiResponse<T>(
        success: false,
        error: 'Failed to parse response',
      );
    }
  }
}
