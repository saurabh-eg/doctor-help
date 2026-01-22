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

  /// Initialize API service
  ApiService() {
    _loadToken();
  }

  /// Load token from storage
  Future<void> _loadToken() async {
    _token = StorageService.getString(_tokenKey);
  }

  /// Set auth token
  Future<void> setToken(String token) async {
    _token = token;
    await StorageService.saveString(_tokenKey, token);
  }

  /// Get auth token
  String? getToken() => _token;

  /// Clear auth token
  Future<void> clearToken() async {
    _token = null;
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

      final response = await http
          .get(
        url,
        headers: _buildHeaders(),
      )
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      return _handleResponse(response, fromJson);
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

      if (ApiConfig.debugMode) {
        logger.i('POST: $url');
        logger.i('Body: ${jsonEncode(body)}');
      }

      final response = await http
          .post(
        url,
        headers: _buildHeaders(),
        body: body != null ? jsonEncode(body) : null,
      )
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      return _handleResponse(response, fromJson);
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

      if (ApiConfig.debugMode) {
        logger.i('PATCH: $url');
        logger.i('Body: ${jsonEncode(body)}');
      }

      final response = await http
          .patch(
        url,
        headers: _buildHeaders(),
        body: body != null ? jsonEncode(body) : null,
      )
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      return _handleResponse(response, fromJson);
    } catch (e) {
      logger.e('PATCH Error: $e');
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

      final response = await http
          .delete(
        url,
        headers: _buildHeaders(),
      )
          .timeout(ApiConfig.timeout, onTimeout: () {
        throw Exception('Request timeout');
      });

      return _handleResponse(response, fromJson);
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
    T Function(Map<String, dynamic>)? fromJson,
  ) {
    if (ApiConfig.debugMode) {
      logger.i('Status Code: ${response.statusCode}');
      logger.i('Response: ${response.body}');
    }

    try {
      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Response is not a JSON object');
      }

      final json = decoded;

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
            // Create a wrapper map with the list data for the parser
            final result = fromJson({'data': data});
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
        clearToken();
        return ApiResponse<T>(
          success: false,
          error: json['error']?.toString() ?? 'Unauthorized',
        );
      } else {
        return ApiResponse<T>(
          success: false,
          error: json['error']?.toString() ?? 'An error occurred',
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
