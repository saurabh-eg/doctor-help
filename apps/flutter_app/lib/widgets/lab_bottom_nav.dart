import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../navigation/app_router.dart';
import '../providers/notification_provider.dart';

class LabBottomNav extends ConsumerWidget {
  final String currentRoute;

  const LabBottomNav({
    super.key,
    required this.currentRoute,
  });

  bool _isActive(String route) => currentRoute == route;

  Widget _buildNotificationIcon(WidgetRef ref, ThemeData theme, bool isActive) {
    final unreadCount = ref.watch(unreadCountProvider);
    final isNotificationActive = _isActive(AppRoutes.notifications);

    return Stack(
      children: [
        Icon(
          isNotificationActive
              ? Icons.notifications
              : Icons.notifications_outlined,
          color: isNotificationActive ? theme.primaryColor : Colors.grey[600],
        ),
        if (unreadCount > 0)
          Positioned(
            right: 0,
            top: 0,
            child: Container(
              padding: const EdgeInsets.all(1),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(10),
              ),
              constraints: const BoxConstraints(
                minWidth: 18,
                minHeight: 18,
              ),
              child: Text(
                unreadCount > 99 ? '99+' : unreadCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  int _currentIndex() {
    if (_isActive(AppRoutes.labDashboard)) return 0;
    if (_isActive(AppRoutes.labCatalog)) return 1;
    if (_isActive(AppRoutes.labOrders)) return 2;
    if (_isActive(AppRoutes.labReports)) return 3;
    if (_isActive(AppRoutes.notifications)) return 4;
    if (_isActive(AppRoutes.labProfile)) return 5;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return BottomNavigationBar(
      currentIndex: _currentIndex(),
      type: BottomNavigationBarType.fixed,
      items: [
        BottomNavigationBarItem(
          icon: Icon(
            Icons.dashboard_outlined,
            color: _isActive(AppRoutes.labDashboard)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(Icons.dashboard, color: theme.primaryColor),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.science_outlined,
            color: _isActive(AppRoutes.labCatalog)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(Icons.science, color: theme.primaryColor),
          label: 'Catalog',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.receipt_long_outlined,
            color: _isActive(AppRoutes.labOrders)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(Icons.receipt_long, color: theme.primaryColor),
          label: 'Orders',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.description_outlined,
            color: _isActive(AppRoutes.labReports)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(Icons.description, color: theme.primaryColor),
          label: 'Reports',
        ),
        BottomNavigationBarItem(
          icon: _buildNotificationIcon(
              ref, theme, _isActive(AppRoutes.notifications)),
          label: 'Notifications',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.store_outlined,
            color: _isActive(AppRoutes.labProfile)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(Icons.store, color: theme.primaryColor),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        late String route;
        switch (index) {
          case 0:
            route = AppRoutes.labDashboard;
            break;
          case 1:
            route = AppRoutes.labCatalog;
            break;
          case 2:
            route = AppRoutes.labOrders;
            break;
          case 3:
            route = AppRoutes.labReports;
            break;
          case 4:
            route = AppRoutes.notifications;
            break;
          case 5:
            route = AppRoutes.labProfile;
            break;
        }
        if (route == AppRoutes.notifications) {
          context.go(
            '${AppRoutes.notifications}?from=${Uri.encodeComponent(currentRoute)}',
          );
        } else {
          context.go(route);
        }
      },
    );
  }
}
