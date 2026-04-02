import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification.freezed.dart';
part 'notification.g.dart';

@freezed
class Notification with _$Notification {
  const factory Notification({
    required String id,
    required String title,
    required String message,
    required String type,
    required bool isRead,
    String? relatedId,
    String? relatedModel,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Notification;

  factory Notification.fromJson(Map<String, dynamic> json) =>
      _$NotificationFromJson(json);

  factory Notification.fromApiJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic value) {
      if (value is String && value.isNotEmpty) {
        return DateTime.tryParse(value) ?? DateTime.now();
      }
      return DateTime.now();
    }

    final id = (json['id'] ?? json['_id'] ?? '').toString();
    final title =
        (json['title'] ?? json['subject'] ?? 'Notification').toString();
    final message =
        (json['message'] ?? json['body'] ?? json['content'] ?? '').toString();
    final type = (json['type'] ?? 'system_message').toString();
    final isRead = json['isRead'] == true;

    return Notification(
      id: id,
      title: title,
      message: message,
      type: type,
      isRead: isRead,
      relatedId: json['relatedId']?.toString(),
      relatedModel: json['relatedModel']?.toString(),
      createdAt: parseDate(json['createdAt']),
      updatedAt: parseDate(json['updatedAt']),
    );
  }
}

class NotificationTypeLabel {
  static const Map<String, String> labels = {
    'appointment_booked': 'Appointment Booked',
    'appointment_confirmed': 'Appointment Confirmed',
    'appointment_cancelled': 'Appointment Cancelled',
    'appointment_completed': 'Appointment Completed',
    'lab_order_created': 'Lab Order Created',
    'lab_order_confirmed': 'Lab Order Confirmed',
    'lab_order_sample_collected': 'Sample Collected',
    'lab_order_processing': 'Processing',
    'lab_order_report_ready': 'Report Ready',
    'lab_order_completed': 'Lab Order Completed',
    'lab_order_cancelled': 'Lab Order Cancelled',
    'payment_processed': 'Payment Processed',
    'payment_failed': 'Payment Failed',
    'system_message': 'System Message',
  };

  static String getLabel(String type) {
    return labels[type] ?? type;
  }

  static IconMapping getIcon(String type) {
    switch (type.toLowerCase()) {
      case 'appointment_booked':
      case 'appointment_confirmed':
      case 'appointment_completed':
        return IconMapping.appointment;
      case 'appointment_cancelled':
        return IconMapping.cancelled;
      case 'lab_order_created':
      case 'lab_order_confirmed':
      case 'lab_order_sample_collected':
      case 'lab_order_processing':
      case 'lab_order_report_ready':
      case 'lab_order_completed':
        return IconMapping.labOrder;
      case 'lab_order_cancelled':
        return IconMapping.cancelled;
      case 'payment_processed':
        return IconMapping.payment;
      case 'payment_failed':
        return IconMapping.error;
      default:
        return IconMapping.info;
    }
  }
}

enum IconMapping {
  appointment,
  labOrder,
  payment,
  cancelled,
  error,
  info,
}
