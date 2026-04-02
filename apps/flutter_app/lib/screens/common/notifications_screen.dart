import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/notification.dart' as notif_model;
import '../../providers/providers.dart';
import '../../providers/notification_provider.dart';
import '../../config/constants.dart';
import '../../navigation/app_router.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    // Fetch notifications on screen load
    Future.microtask(() {
      ref.read(notificationListProvider.notifier).fetchNotifications();
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      // Load more when reaching bottom
      ref.read(notificationListProvider.notifier).loadMore();
    }
  }

  Future<void> _refreshNotifications() async {
    await ref.read(notificationListProvider.notifier).fetchNotifications();
  }

  Future<void> _onNotificationTap(notif_model.Notification notification) async {
    if (!notification.isRead) {
      await ref
          .read(notificationListProvider.notifier)
          .markAsRead(notification.id);
    }

    if (!mounted) return;

    final role =
        (ref.read(authStateProvider).user?.role ?? '').trim().toLowerCase();
    final relatedId = (notification.relatedId ?? '').trim();
    final relatedModel = (notification.relatedModel ?? '').trim().toLowerCase();
    final type = notification.type.toLowerCase();

    final isAppointment =
        relatedModel == 'appointment' || type.contains('appointment');
    final isLabOrder = relatedModel == 'laborder' ||
        type.contains('lab_order') ||
        type.contains('lab');
    final isPayment = relatedModel == 'payment' || type.contains('payment');

    if (isAppointment) {
      if (role == AppConstants.roleDoctor) {
        context.go(AppRoutes.doctorAppointments);
        return;
      }
      // Patient - if we have relatedId, show specific appointment detail
      if (relatedId.isNotEmpty) {
        final encodedId = Uri.encodeComponent(relatedId);
        context
            .push('${AppRoutes.patientAppointmentDetailsById}?id=$encodedId');
        return;
      }
      // Fallback to bookings list if no ID
      context.go(AppRoutes.patientBookings);
      return;
    }

    if (isLabOrder && relatedId.isNotEmpty) {
      final encodedId = Uri.encodeComponent(relatedId);
      if (role == AppConstants.roleLab) {
        context.push('${AppRoutes.labProviderOrderDetails}?id=$encodedId');
      } else {
        context.push('${AppRoutes.labOrderDetails}?id=$encodedId');
      }
      return;
    }

    if (isPayment) {
      if (role == AppConstants.roleDoctor) {
        context.go(AppRoutes.doctorEarnings);
      } else if (role == AppConstants.roleLab) {
        context.go(AppRoutes.labOrders);
      } else {
        context.go(AppRoutes.patientBookings);
      }
      return;
    }

    if (relatedId.isNotEmpty && role == AppConstants.roleLab) {
      final encodedId = Uri.encodeComponent(relatedId);
      context.push('${AppRoutes.labProviderOrderDetails}?id=$encodedId');
      return;
    }

    if (relatedId.isNotEmpty && role == AppConstants.rolePatient) {
      final encodedId = Uri.encodeComponent(relatedId);
      context.push('${AppRoutes.labOrderDetails}?id=$encodedId');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('No linked details available for this notification.')),
    );
  }

  void _handleBackPressed() {
    final navigator = Navigator.of(context);
    if (navigator.canPop()) {
      navigator.pop();
      return;
    }

    final fromRoute = GoRouterState.of(context).uri.queryParameters['from'];
    if (fromRoute != null &&
        fromRoute.isNotEmpty &&
        fromRoute != AppRoutes.notifications) {
      context.go(fromRoute);
      return;
    }

    final role =
        (ref.read(authStateProvider).user?.role ?? '').trim().toLowerCase();
    if (role == AppConstants.roleDoctor) {
      context.go(AppRoutes.doctorDashboard);
      return;
    }
    if (role == AppConstants.roleLab) {
      context.go(AppRoutes.labDashboard);
      return;
    }

    context.go(AppRoutes.patientHome);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notificationState = ref.watch(notificationListProvider);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _handleBackPressed();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Back',
            onPressed: _handleBackPressed,
          ),
          title: const Text('Notifications'),
          centerTitle: true,
          elevation: 0,
          actions: [
            if (notificationState.notifications.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.done_all),
                tooltip: 'Mark all as read',
                onPressed: () async {
                  await ref
                      .read(notificationListProvider.notifier)
                      .markAllAsRead();
                },
              ),
            if (notificationState.notifications.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.delete_sweep),
                tooltip: 'Delete all',
                onPressed: () {
                  _showDeleteAllDialog(context);
                },
              ),
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              tooltip: 'Notification preferences',
              onPressed: () {
                context.push(AppRoutes.notificationPreferences);
              },
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: _refreshNotifications,
          child: notificationState.isLoading &&
                  notificationState.notifications.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : notificationState.notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none_outlined,
                              size: 64, color: Colors.grey[400]),
                          const SizedBox(height: UIConstants.spacingMedium),
                          Text(
                            'No notifications',
                            style: theme.textTheme.titleMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      itemCount: notificationState.notifications.length + 1,
                      itemBuilder: (context, index) {
                        if (index == notificationState.notifications.length) {
                          return notificationState.isLoading
                              ? const Padding(
                                  padding:
                                      EdgeInsets.all(UIConstants.spacingMedium),
                                  child: Center(
                                      child: CircularProgressIndicator()),
                                )
                              : const SizedBox();
                        }

                        final notification =
                            notificationState.notifications[index];
                        return _NotificationTile(
                          notification: notification,
                          onTap: () => _onNotificationTap(notification),
                          onMarkAsRead: () {
                            ref
                                .read(notificationListProvider.notifier)
                                .markAsRead(notification.id);
                          },
                          onDelete: () {
                            ref
                                .read(notificationListProvider.notifier)
                                .deleteNotification(notification.id);
                          },
                        );
                      },
                    ),
        ),
      ),
    );
  }

  void _showDeleteAllDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete All Notifications'),
        content: const Text(
            'Are you sure you want to delete all notifications? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              ref.read(notificationListProvider.notifier).deleteAll();
              Navigator.pop(context);
            },
            child: const Text('Delete All'),
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final notif_model.Notification notification;
  final VoidCallback onTap;
  final VoidCallback onMarkAsRead;
  final VoidCallback onDelete;

  const _NotificationTile({
    required this.notification,
    required this.onTap,
    required this.onMarkAsRead,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final typeLabel =
        notif_model.NotificationTypeLabel.getLabel(notification.type);
    final iconMapping =
        notif_model.NotificationTypeLabel.getIcon(notification.type);
    final timeAgo = _formatTimeAgo(notification.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: UIConstants.spacingMedium),
      decoration: BoxDecoration(
        color:
            notification.isRead ? Colors.white : Colors.blue.withOpacity(0.05),
        border: Border.all(
          color: notification.isRead ? Colors.grey[200]! : Colors.blue[200]!,
        ),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Theme(
        data: theme.copyWith(
          expansionTileTheme: ExpansionTileThemeData(
            backgroundColor: Colors.transparent,
            collapsedBackgroundColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
            ),
            collapsedShape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
            ),
          ),
        ),
        child: ExpansionTile(
          title: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: _buildTitle(theme, typeLabel),
          ),
          subtitle: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: _buildSubtitle(theme, timeAgo),
          ),
          expandedAlignment: Alignment.centerLeft,
          leading: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: _buildIcon(iconMapping),
          ),
          trailing: _buildTrailing(context),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.spacingLarge,
                UIConstants.spacingSmall,
                UIConstants.spacingLarge,
                UIConstants.spacingMedium,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.message,
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: UIConstants.spacingMedium),
                  Row(
                    children: [
                      if (!notification.isRead)
                        ElevatedButton.icon(
                          icon: const Icon(Icons.done, size: 18),
                          label: const Text('Mark as Read'),
                          onPressed: onMarkAsRead,
                        ),
                      const SizedBox(width: UIConstants.spacingSmall),
                      TextButton.icon(
                        icon: const Icon(Icons.delete, size: 18),
                        label: const Text('Delete'),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.red,
                        ),
                        onPressed: onDelete,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitle(ThemeData theme, String typeLabel) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          notification.title,
          style: theme.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: notification.isRead ? Colors.black : Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildSubtitle(ThemeData theme, String timeAgo) {
    return Row(
      children: [
        Chip(
          label: Text(
            notif_model.NotificationTypeLabel.getLabel(notification.type),
            style: const TextStyle(fontSize: 11),
          ),
          backgroundColor: _getTypeColor().withOpacity(0.2),
          labelStyle: TextStyle(
            color: _getTypeColor(),
            fontWeight: FontWeight.w600,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        ),
        const SizedBox(width: UIConstants.spacingSmall),
        Text(
          timeAgo,
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildIcon(notif_model.IconMapping iconMapping) {
    return Container(
      decoration: BoxDecoration(
        color: _getTypeColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(UIConstants.radiusSmall),
      ),
      padding: const EdgeInsets.all(8),
      child: Icon(
        _getIconData(iconMapping),
        color: _getTypeColor(),
        size: 24,
      ),
    );
  }

  Widget _buildTrailing(BuildContext context) {
    return PopupMenuButton(
      itemBuilder: (context) => [
        PopupMenuItem(
          onTap: onTap,
          child: const Row(
            children: [
              Icon(Icons.open_in_new, size: 18),
              SizedBox(width: 12),
              Text('Open'),
            ],
          ),
        ),
        if (!notification.isRead)
          PopupMenuItem(
            onTap: onMarkAsRead,
            child: const Row(
              children: [
                Icon(Icons.done, size: 18),
                SizedBox(width: 12),
                Text('Mark as read'),
              ],
            ),
          ),
        PopupMenuItem(
          onTap: onDelete,
          child: const Row(
            children: [
              Icon(Icons.delete, size: 18, color: Colors.red),
              SizedBox(width: 12),
              Text('Delete', style: TextStyle(color: Colors.red)),
            ],
          ),
        ),
      ],
    );
  }

  Color _getTypeColor() {
    if (notification.type.contains('appointment')) {
      return Colors.blue;
    } else if (notification.type.contains('lab')) {
      return Colors.purple;
    } else if (notification.type.contains('payment')) {
      return Colors.green;
    } else if (notification.type.contains('cancelled')) {
      return Colors.red;
    } else if (notification.type.contains('error') ||
        notification.type.contains('failed')) {
      return Colors.red;
    }
    return Colors.grey;
  }

  IconData _getIconData(notif_model.IconMapping iconMapping) {
    switch (iconMapping) {
      case notif_model.IconMapping.appointment:
        return Icons.calendar_today_outlined;
      case notif_model.IconMapping.labOrder:
        return Icons.science_outlined;
      case notif_model.IconMapping.payment:
        return Icons.payment_outlined;
      case notif_model.IconMapping.cancelled:
        return Icons.cancel_outlined;
      case notif_model.IconMapping.error:
        return Icons.error_outline;
      case notif_model.IconMapping.info:
        return Icons.info_outline;
    }
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d, yyyy').format(dateTime);
    }
  }
}
