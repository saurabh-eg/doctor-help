import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../navigation/app_router.dart';

/// Doctor Bottom Navigation Bar
class DoctorBottomNav extends StatelessWidget {
  final String currentRoute;

  const DoctorBottomNav({
    super.key,
    required this.currentRoute,
  });

  bool _isActive(String route) {
    return currentRoute == route;
  }

  int _getCurrentIndex() {
    if (_isActive(AppRoutes.doctorDashboard)) return 0;
    if (_isActive(AppRoutes.doctorAppointments)) return 1;
    if (_isActive(AppRoutes.doctorPatients)) return 2;
    if (_isActive(AppRoutes.doctorEarnings)) return 3;
    if (_isActive(AppRoutes.doctorProfile)) return 4;
    return 0;
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
            route = AppRoutes.doctorProfile;
            break;
        }
        context.go(route);
      },
    );
  }
}
