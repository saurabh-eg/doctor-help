import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification.dart' as notif_model;
import '../services/notification_service.dart';
import '../services/notification_realtime_service.dart';
import 'providers.dart';

/// Notification List State
class NotificationListState {
  final List<notif_model.Notification> notifications;
  final int unreadCount;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final int totalPages;

  NotificationListState({
    this.notifications = const [],
    this.unreadCount = 0,
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.totalPages = 1,
  });

  NotificationListState copyWith({
    List<notif_model.Notification>? notifications,
    int? unreadCount,
    bool? isLoading,
    String? error,
    int? currentPage,
    int? totalPages,
  }) {
    return NotificationListState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
    );
  }
}

/// Notification List Notifier
class NotificationListNotifier extends StateNotifier<NotificationListState> {
  final NotificationService notificationService;
  final NotificationRealtimeService notificationRealtimeService;

  bool _realtimeStarted = false;
  Timer? _liveRefreshDebounce;

  NotificationListNotifier(
    this.notificationService,
    this.notificationRealtimeService,
  ) : super(NotificationListState());

  void startRealtime() {
    if (_realtimeStarted) return;
    _realtimeStarted = true;

    notificationRealtimeService.start(onEvent: _handleRealtimeEvent);
  }

  void stopRealtime() {
    if (!_realtimeStarted) return;
    _realtimeStarted = false;

    _liveRefreshDebounce?.cancel();
    _liveRefreshDebounce = null;
    notificationRealtimeService.stop();
  }

  void _handleRealtimeEvent(String event, Map<String, dynamic>? data) {
    // Guard against accessing state after dispose
    try {
      if (event == 'notification.unread_count') {
        final unreadCount = (data?['unreadCount'] as num?)?.toInt();
        if (unreadCount != null) {
          state = state.copyWith(unreadCount: unreadCount);
        }
        return;
      }

      const refreshEvents = {
        'notification.created',
        'notification.read',
        'notification.read_all',
        'notification.deleted',
        'notification.deleted_all',
      };

      if (!refreshEvents.contains(event)) return;

      _liveRefreshDebounce?.cancel();
      _liveRefreshDebounce = Timer(const Duration(milliseconds: 350), () {
        unawaited(fetchNotifications());
      });
    } catch (e) {
      // Notifier may have been disposed; ignore the error
      debugPrint('[Notifications] Error handling realtime event: $e');
    }
  }

  /// Fetch notifications (page 1 to clear and reload)
  Future<void> fetchNotifications({int page = 1, int limit = 20}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await notificationService.getNotifications(
        page: page,
        limit: limit,
      );

      final unreadCountResponse = await notificationService.getUnreadCount();

      if (response.success && response.data != null) {
        state = state.copyWith(
          notifications: response.data!.data,
          unreadCount: unreadCountResponse.data ?? 0,
          currentPage: response.data!.page,
          totalPages: response.data!.pages,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to fetch notifications',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load more notifications (next page)
  Future<void> loadMore({int limit = 20}) async {
    if (state.currentPage >= state.totalPages) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await notificationService.getNotifications(
        page: state.currentPage + 1,
        limit: limit,
      );

      if (response.success && response.data != null) {
        state = state.copyWith(
          notifications: [...state.notifications, ...response.data!.data],
          currentPage: response.data!.page,
          totalPages: response.data!.pages,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.error ?? 'Failed to load more notifications',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Mark single notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      final updatedNotifications = state.notifications.map((notif) {
        if (notif.id == notificationId) {
          return notif.copyWith(isRead: true);
        }
        return notif;
      }).toList();

      final newUnreadCount =
          updatedNotifications.where((notif) => !notif.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      await notificationService.markAllAsRead();

      final updatedNotifications = state.notifications
          .map((notif) => notif.copyWith(isRead: true))
          .toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: 0,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await notificationService.deleteNotification(notificationId);

      final updatedNotifications = state.notifications
          .where((notif) => notif.id != notificationId)
          .toList();

      final newUnreadCount =
          updatedNotifications.where((notif) => !notif.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Delete all notifications
  Future<void> deleteAll() async {
    try {
      await notificationService.deleteAllNotifications();

      state = state.copyWith(
        notifications: [],
        unreadCount: 0,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Just refresh unread count
  Future<void> refreshUnreadCount() async {
    try {
      final unreadCountResponse = await notificationService.getUnreadCount();
      if (unreadCountResponse.success) {
        state = state.copyWith(unreadCount: unreadCountResponse.data ?? 0);
      }
    } catch (e) {
      // Silent fail for unread count
    }
  }

  @override
  void dispose() {
    stopRealtime();
    super.dispose();
  }
}

/// Notification List Provider
final notificationListProvider =
    StateNotifierProvider<NotificationListNotifier, NotificationListState>(
  (ref) {
    final notificationService = ref.watch(notificationServiceProvider);
    final notificationRealtimeService =
        ref.watch(notificationRealtimeServiceProvider);
    final notifier = NotificationListNotifier(
      notificationService,
      notificationRealtimeService,
    );

    ref.listen(authStateProvider, (previous, next) {
      if (next.isAuthenticated) {
        notifier.startRealtime();
        unawaited(notifier.fetchNotifications());
      } else {
        notifier.stopRealtime();
      }
    });

    if (ref.read(authStateProvider).isAuthenticated) {
      notifier.startRealtime();
    }

    return notifier;
  },
);

/// Unread count provider (for badge)
final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationListProvider).unreadCount;
});
