import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../models/appointment.dart';
import '../../navigation/app_router.dart';

class AppointmentDetailsScreen extends StatelessWidget {
  final Appointment appointment;
  final bool isUpcoming;

  const AppointmentDetailsScreen({
    super.key,
    required this.appointment,
    required this.isUpcoming,
  });

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  Color _paymentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return Colors.green;
      case 'failed':
        return Colors.red;
      case 'refunded':
        return Colors.deepPurple;
      default:
        return Colors.orange;
    }
  }

  String _paymentStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'PAID';
      case 'failed':
        return 'FAILED';
      case 'refunded':
        return 'REFUNDED';
      default:
        return 'PENDING';
    }
  }

  bool _canRetryPayment() {
    final paymentStatus = appointment.paymentStatus.toLowerCase();
    final appointmentStatus = appointment.status.toLowerCase();

    return isUpcoming &&
        appointmentStatus != 'cancelled' &&
        (paymentStatus == 'pending' || paymentStatus == 'failed') &&
        appointment.amount > 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final doctorName = appointment.doctorId.userId?.name ?? 'Doctor';
    final paymentColor = _paymentStatusColor(appointment.paymentStatus);
    final paymentLabel = _paymentStatusLabel(appointment.paymentStatus);

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          return;
        }
        if (context.canPop()) {
          context.pop();
        } else {
          context.go(AppRoutes.patientBookings);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Appointment Details'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go(AppRoutes.patientBookings);
              }
            },
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.all(UIConstants.spacingLarge),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dr. $doctorName',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Type: ${appointment.type}'),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Date: ${_formatDate(appointment.date)}'),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Time: ${appointment.timeSlot.start}'),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Fee: ₹${appointment.amount.toStringAsFixed(0)}'),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Row(
                      children: [
                        const Text('Payment: '),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: paymentColor.withOpacity(0.12),
                            borderRadius:
                                BorderRadius.circular(UIConstants.radiusRound),
                          ),
                          child: Text(
                            paymentLabel,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: paymentColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text('Status: ${appointment.status}'),
                    if ((appointment.symptoms ?? '').isNotEmpty) ...[
                      const SizedBox(height: UIConstants.spacingSmall),
                      Text('Reason: ${appointment.symptoms}'),
                    ],
                  ],
                ),
              ),
            ),
            if (_canRetryPayment()) ...[
              const SizedBox(height: UIConstants.spacingLarge),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.push(
                      '${AppRoutes.patientPayment}?appointmentId=${appointment.id}&amount=${appointment.amount}&doctorName=${Uri.encodeComponent(doctorName)}',
                    );
                  },
                  icon: const Icon(Icons.payment_outlined, size: 18),
                  label: const Text('Retry Payment'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.orange[800],
                    side: BorderSide(color: Colors.orange[700]!),
                  ),
                ),
              ),
            ],
            if (!isUpcoming &&
                appointment.status.toLowerCase() == 'completed') ...[
              const SizedBox(height: UIConstants.spacingSmall),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.push(
                      '${AppRoutes.writeReview}?appointmentId=${appointment.id}&doctorName=${Uri.encodeComponent(doctorName)}',
                    );
                  },
                  icon: const Icon(Icons.rate_review_outlined, size: 18),
                  label: const Text('Write a Review'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.amber[800],
                    side: BorderSide(color: Colors.amber[800]!),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
