import 'package:flutter/foundation.dart';
import 'api_service.dart';
import '../config/api_config.dart';
import '../models/notification.dart';
import '../models/api_response.dart';

class NotificationPreferences {
  final bool appointments;
  final bool labOrders;
  final bool payments;
  final bool system;
  final bool quietHoursEnabled;
  final String quietStart;
  final String quietEnd;
  final String timezone;
  final List<String> mutedTypes;

  NotificationPreferences({
    required this.appointments,
    required this.labOrders,
    required this.payments,
    required this.system,
    required this.quietHoursEnabled,
    required this.quietStart,
    required this.quietEnd,
    required this.timezone,
    required this.mutedTypes,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    final categories =
        (json['categories'] as Map<String, dynamic>?) ?? <String, dynamic>{};
    final quietHours =
        (json['quietHours'] as Map<String, dynamic>?) ?? <String, dynamic>{};

    return NotificationPreferences(
      appointments: categories['appointments'] != false,
      labOrders: categories['labOrders'] != false,
      payments: categories['payments'] != false,
      system: categories['system'] != false,
      quietHoursEnabled: quietHours['enabled'] == true,
      quietStart: (quietHours['start'] ?? '22:00').toString(),
      quietEnd: (quietHours['end'] ?? '07:00').toString(),
      timezone: (quietHours['timezone'] ?? 'Asia/Kolkata').toString(),
      mutedTypes: ((json['mutedTypes'] as List?) ?? const <dynamic>[])
          .map((e) => e.toString())
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'categories': {
        'appointments': appointments,
        'labOrders': labOrders,
        'payments': payments,
        'system': system,
      },
      'quietHours': {
        'enabled': quietHoursEnabled,
        'start': quietStart,
        'end': quietEnd,
        'timezone': timezone,
      },
      'mutedTypes': mutedTypes,
    };
  }

  NotificationPreferences copyWith({
    bool? appointments,
    bool? labOrders,
    bool? payments,
    bool? system,
    bool? quietHoursEnabled,
    String? quietStart,
    String? quietEnd,
    String? timezone,
    List<String>? mutedTypes,
  }) {
    return NotificationPreferences(
      appointments: appointments ?? this.appointments,
      labOrders: labOrders ?? this.labOrders,
      payments: payments ?? this.payments,
      system: system ?? this.system,
      quietHoursEnabled: quietHoursEnabled ?? this.quietHoursEnabled,
      quietStart: quietStart ?? this.quietStart,
      quietEnd: quietEnd ?? this.quietEnd,
      timezone: timezone ?? this.timezone,
      mutedTypes: mutedTypes ?? this.mutedTypes,
    );
  }
}

class PaginatedResponse<T> {
  final List<T> data;
  final int page;
  final int limit;
  final int total;
  final int pages;

  PaginatedResponse({
    required this.data,
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    return PaginatedResponse<T>(
      data: (json['data'] as List?)
              ?.map((e) => fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      page: json['pagination']['page'] as int? ?? 1,
      limit: json['pagination']['limit'] as int? ?? 10,
      total: json['pagination']['total'] as int? ?? 0,
      pages: json['pagination']['pages'] as int? ?? 1,
    );
  }
}

class NotificationService {
  final ApiService _apiService;

  NotificationService(this._apiService);

  Future<ApiResponse<NotificationPreferences>>
      getNotificationPreferences() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        ApiEndpoints.notificationsPreferences,
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        return ApiResponse<NotificationPreferences>(
          success: true,
          data: NotificationPreferences.fromJson(response.data!),
        );
      }

      return ApiResponse<NotificationPreferences>(
        success: false,
        error: response.error ?? 'Failed to fetch notification preferences',
      );
    } catch (e) {
      debugPrint('Error fetching notification preferences: $e');
      return ApiResponse<NotificationPreferences>(
        success: false,
        error: e.toString(),
      );
    }
  }

  Future<ApiResponse<NotificationPreferences>> updateNotificationPreferences(
      NotificationPreferences preferences) async {
    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        ApiEndpoints.notificationsPreferences,
        body: preferences.toJson(),
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        return ApiResponse<NotificationPreferences>(
          success: true,
          data: NotificationPreferences.fromJson(response.data!),
        );
      }

      return ApiResponse<NotificationPreferences>(
        success: false,
        error: response.error ?? 'Failed to update notification preferences',
      );
    } catch (e) {
      debugPrint('Error updating notification preferences: $e');
      return ApiResponse<NotificationPreferences>(
        success: false,
        error: e.toString(),
      );
    }
  }

  Future<ApiResponse<bool>> registerPushDevice({
    required String token,
    required String platform,
    String? appVersion,
  }) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        ApiEndpoints.notificationsRegisterDevice,
        body: {
          'token': token,
          'platform': platform,
          if (appVersion != null && appVersion.trim().isNotEmpty)
            'appVersion': appVersion.trim(),
        },
        fromJson: (json) => json,
      );

      return ApiResponse<bool>(
        success: response.success,
        data: response.success,
        error: response.error,
      );
    } catch (e) {
      debugPrint('Error registering push device: $e');
      return ApiResponse<bool>(success: false, error: e.toString());
    }
  }

  Future<ApiResponse<bool>> unregisterPushDevice({
    required String token,
  }) async {
    try {
      // Logout can clear auth token before cleanup runs; skip remote unregister
      // in that case to avoid noisy 401 logs.
      final authToken = _apiService.getToken();
      if (authToken == null || authToken.isEmpty) {
        return const ApiResponse<bool>(success: true, data: true);
      }

      final response = await _apiService.post<Map<String, dynamic>>(
        ApiEndpoints.notificationsUnregisterDevice,
        body: {'token': token},
        fromJson: (json) => json,
      );

      // Even if unregister fails (e.g., 401, endpoint not found), treat as success
      // to avoid clearing main auth token. This is a cleanup endpoint.
      if (!response.success) {
        debugPrint(
            'Push device unregister failed (non-critical): ${response.error}');
        return const ApiResponse<bool>(success: true, data: true);
      }

      return ApiResponse<bool>(
        success: response.success,
        data: response.success,
        error: response.error,
      );
    } catch (e) {
      debugPrint('Error unregistering push device: $e');
      // Treat errors as non-critical - don't cascade
      return const ApiResponse<bool>(success: true, data: true);
    }
  }

  /// Get paginated notifications
  Future<ApiResponse<PaginatedResponse<Notification>>> getNotifications({
    int page = 1,
    int limit = 10,
    bool? isRead,
  }) async {
    try {
      final Map<String, String> params = {
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (isRead != null) {
        params['isRead'] = isRead.toString();
      }

      final queryString =
          params.entries.map((e) => '${e.key}=${e.value}').join('&');
      final endpoint = '/notifications?$queryString';

      final response = await _apiService.get<Map<String, dynamic>>(
        endpoint,
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        final paginatedResponse = PaginatedResponse<Notification>.fromJson(
          response.data!,
          (json) => Notification.fromApiJson(json),
        );
        return ApiResponse<PaginatedResponse<Notification>>(
          success: true,
          data: paginatedResponse,
        );
      }

      return ApiResponse<PaginatedResponse<Notification>>(
        success: false,
        error: response.error ?? 'Failed to fetch notifications',
      );
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      return ApiResponse<PaginatedResponse<Notification>>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get unread count
  Future<ApiResponse<int>> getUnreadCount() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '/notifications/unread-count',
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        final unreadCount = response.data!['unreadCount'] as int? ?? 0;
        return ApiResponse<int>(
          success: true,
          data: unreadCount,
        );
      }

      return ApiResponse<int>(
        success: false,
        error: response.error ?? 'Failed to fetch unread count',
      );
    } catch (e) {
      debugPrint('Error fetching unread count: $e');
      return ApiResponse<int>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Get single notification
  Future<ApiResponse<Notification>> getNotificationById(String id) async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '/notifications/$id',
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        final notification =
            Notification.fromApiJson(response.data!['data'] ?? response.data!);
        return ApiResponse<Notification>(
          success: true,
          data: notification,
        );
      }

      return ApiResponse<Notification>(
        success: false,
        error: response.error ?? 'Notification not found',
      );
    } catch (e) {
      debugPrint('Error fetching notification: $e');
      return ApiResponse<Notification>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Mark notification as read
  Future<ApiResponse<Notification>> markAsRead(String id) async {
    try {
      final response = await _apiService.patch<Map<String, dynamic>>(
        '/notifications/$id/read',
        fromJson: (json) => json,
      );

      if (response.success && response.data != null) {
        final notification =
            Notification.fromApiJson(response.data!['data'] ?? response.data!);
        return ApiResponse<Notification>(
          success: true,
          data: notification,
        );
      }

      return ApiResponse<Notification>(
        success: false,
        error: response.error ?? 'Failed to mark as read',
      );
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
      return ApiResponse<Notification>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Mark all notifications as read
  Future<ApiResponse<bool>> markAllAsRead() async {
    try {
      final response = await _apiService.patch<Map<String, dynamic>>(
        '/notifications/read-all',
        fromJson: (json) => json,
      );

      if (response.success) {
        return const ApiResponse<bool>(
          success: true,
          data: true,
        );
      }

      return ApiResponse<bool>(
        success: false,
        error: response.error ?? 'Failed to mark all as read',
      );
    } catch (e) {
      debugPrint('Error marking all notifications as read: $e');
      return ApiResponse<bool>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete notification
  Future<ApiResponse<bool>> deleteNotification(String id) async {
    try {
      final response = await _apiService.delete<Map<String, dynamic>>(
        '/notifications/$id',
        fromJson: (json) => json,
      );

      if (response.success) {
        return const ApiResponse<bool>(
          success: true,
          data: true,
        );
      }

      return ApiResponse<bool>(
        success: false,
        error: response.error ?? 'Failed to delete notification',
      );
    } catch (e) {
      debugPrint('Error deleting notification: $e');
      return ApiResponse<bool>(
        success: false,
        error: e.toString(),
      );
    }
  }

  /// Delete all notifications
  Future<ApiResponse<bool>> deleteAllNotifications() async {
    try {
      final response = await _apiService.delete<Map<String, dynamic>>(
        '/notifications',
        fromJson: (json) => json,
      );

      if (response.success) {
        return const ApiResponse<bool>(
          success: true,
          data: true,
        );
      }

      return ApiResponse<bool>(
        success: false,
        error: response.error ?? 'Failed to delete all notifications',
      );
    } catch (e) {
      debugPrint('Error deleting all notifications: $e');
      return ApiResponse<bool>(
        success: false,
        error: e.toString(),
      );
    }
  }
}
