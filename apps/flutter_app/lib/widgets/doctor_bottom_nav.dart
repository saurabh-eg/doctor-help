import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../navigation/app_router.dart';
import '../providers/notification_provider.dart';

/// Doctor Bottom Navigation Bar
class DoctorBottomNav extends ConsumerWidget {
  final String currentRoute;

  const DoctorBottomNav({
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

  int _getCurrentIndex() {
    if (_isActive(AppRoutes.doctorDashboard)) return 0;
    if (_isActive(AppRoutes.doctorAppointments)) return 1;
    if (_isActive(AppRoutes.doctorPatients)) return 2;
    if (_isActive(AppRoutes.doctorEarnings)) return 3;
    if (_isActive(AppRoutes.notifications)) return 4;
    if (_isActive(AppRoutes.doctorProfile)) return 5;
    return 0;
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
            Icons.dashboard_outlined,
            color: _isActive(AppRoutes.doctorDashboard)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.dashboard,
            color: theme.primaryColor,
          ),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.calendar_today_outlined,
            color: _isActive(AppRoutes.doctorAppointments)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.calendar_today,
            color: theme.primaryColor,
          ),
          label: 'Appointments',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.people_outline,
            color: _isActive(AppRoutes.doctorPatients)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.people,
            color: theme.primaryColor,
          ),
          label: 'Patients',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.trending_up_outlined,
            color: _isActive(AppRoutes.doctorEarnings)
                ? theme.primaryColor
                : Colors.grey[600],
          ),
          activeIcon: Icon(
            Icons.trending_up,
            color: theme.primaryColor,
          ),
          label: 'Earnings',
        ),
        BottomNavigationBarItem(
          icon: _buildNotificationIcon(
              ref, theme, _isActive(AppRoutes.notifications)),
          label: 'Notifications',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            Icons.person_outline,
            color: _isActive(AppRoutes.doctorProfile)
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
        late String route;
        switch (index) {
          case 0:
            route = AppRoutes.doctorDashboard;
            break;
          case 1:
            route = AppRoutes.doctorAppointments;
            break;
          case 2:
            route = AppRoutes.doctorPatients;
            break;
          case 3:
            route = AppRoutes.doctorEarnings;
            break;
          case 4:
            route = AppRoutes.notifications;
            break;
          case 5:
            route = AppRoutes.doctorProfile;
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
