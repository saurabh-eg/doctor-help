import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../navigation/app_router.dart';

/// Patient Bottom Navigation Bar
class PatientBottomNav extends StatelessWidget {
  final String currentRoute;

  const PatientBottomNav({
    super.key,
    required this.currentRoute,
  });

  bool _isActive(String route) {
    return currentRoute == route;
  }

  @override
  Widget build(BuildContext context) {
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
          AppRoutes.patientProfile,
        ];

        if (index < routes.length && routes[index] != currentRoute) {
          context.go(routes[index]);
        }
      },
    );
  }

  int _getCurrentIndex() {
    final routes = [
      AppRoutes.patientHome,
      AppRoutes.patientSearch,
      AppRoutes.patientBookings,
      AppRoutes.patientProfile,
    ];

    final index = routes.indexOf(currentRoute);
    return index >= 0 ? index : 0;
  }
}
