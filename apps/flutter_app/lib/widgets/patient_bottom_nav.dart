import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../navigation/app_router.dart';
import '../providers/notification_provider.dart';

/// Patient Bottom Navigation Bar
class PatientBottomNav extends ConsumerWidget {
  final String currentRoute;

  const PatientBottomNav({
    super.key,
    required this.currentRoute,
  });

  bool _isActive(String route) {
    return currentRoute == route;
  }

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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return BottomNavigationBar(
      currentIndex: _getCurrentIndex(),
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
      elevation: 8,
      items: [
        BottomNavigationBarItem(
          icon: Icon(
            Icons.home_outlined,
            color: _isActive(AppRoutes.patientHome)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.home,
            color: theme.primaryColor,
          ),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.search_outlined,
            color: _isActive(AppRoutes.patientSearch)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.search,
            color: theme.primaryColor,
          ),
          label: 'Search',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.calendar_today_outlined,
            color: _isActive(AppRoutes.patientBookings)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.calendar_today,
            color: theme.primaryColor,
          ),
          label: 'Bookings',
        ),
        BottomNavigationBarItem(
          icon: _buildNotificationIcon(
              ref, theme, _isActive(AppRoutes.notifications)),
          label: 'Notifications',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.person_outline,
            color: _isActive(AppRoutes.patientProfile)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.person,
            color: theme.primaryColor,
          ),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        final routes = [
          AppRoutes.patientHome,
          AppRoutes.patientSearch,
          AppRoutes.patientBookings,
          AppRoutes.notifications,
          AppRoutes.patientProfile,
        ];

        if (index < routes.length && routes[index] != currentRoute) {
          if (routes[index] == AppRoutes.notifications) {
            context.go(
              '${AppRoutes.notifications}?from=${Uri.encodeComponent(currentRoute)}',
            );
          } else {
            context.go(routes[index]);
          }
        }
      },
    );
  }

  int _getCurrentIndex() {
    final routes = [
      AppRoutes.patientHome,
      AppRoutes.patientSearch,
      AppRoutes.patientBookings,
      AppRoutes.notifications,
      AppRoutes.patientProfile,
    ];

    final index = routes.indexOf(currentRoute);
    return index >= 0 ? index : 0;
  }
}
