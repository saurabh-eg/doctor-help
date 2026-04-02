import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';

/// Loading screen that fetches appointment by ID and navigates to details
class AppointmentDetailsLoaderScreen extends ConsumerStatefulWidget {
  final String appointmentId;

  const AppointmentDetailsLoaderScreen({
    super.key,
    required this.appointmentId,
  });

  @override
  ConsumerState<AppointmentDetailsLoaderScreen> createState() =>
      _AppointmentDetailsLoaderScreenState();
}

class _AppointmentDetailsLoaderScreenState
    extends ConsumerState<AppointmentDetailsLoaderScreen> {
  @override
  void initState() {
    super.initState();
    _loadAppointment();
  }

  Future<void> _loadAppointment() async {
    try {
      final appointmentService = ref.read(appointmentServiceProvider);
      final response =
          await appointmentService.getAppointment(widget.appointmentId);

      if (!mounted) return;

      if (response.success && response.data != null) {
        final appointment = response.data!;
        final isUpcoming = appointment.date.isAfter(DateTime.now());

        context.go(
          AppRoutes.patientAppointmentDetails,
          extra: {
            'appointment': appointment,
            'isUpcoming': isUpcoming,
          },
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.error ?? 'Failed to load appointment'),
            backgroundColor: Colors.red,
          ),
        );
        if (mounted) {
          context.pop();
        }
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading appointment: $error'),
          backgroundColor: Colors.red,
        ),
      );
      if (mounted) {
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
