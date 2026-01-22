import 'package:intl/intl.dart';

/// String extensions
extension StringExtensions on String {
  /// Capitalize first letter
  String capitalize() {
    return isNotEmpty ? '${this[0].toUpperCase()}${substring(1)}' : '';
  }

  /// Check if email is valid
  bool isValidEmail() {
    final RegExp emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Check if phone is valid (10 digits)
  bool isValidPhone() {
    return RegExp(r'^[0-9]{10}$').hasMatch(this);
  }

  /// Check if OTP is valid (6 digits)
  bool isValidOtp() {
    return RegExp(r'^[0-9]{6}$').hasMatch(this);
  }
}

/// DateTime extensions
extension DateTimeExtensions on DateTime {
  /// Format as 'MMM dd, yyyy'
  String formatDate() {
    return DateFormat('MMM dd, yyyy').format(this);
  }

  /// Format as 'dd MMM yyyy'
  String formatDateShort() {
    return DateFormat('dd MMM yyyy').format(this);
  }

  /// Format as 'hh:mm a'
  String formatTime() {
    return DateFormat('hh:mm a').format(this);
  }

  /// Format as 'MMM dd, yyyy - hh:mm a'
  String formatDateTime() {
    return DateFormat('MMM dd, yyyy - hh:mm a').format(this);
  }

  /// Get relative time (e.g., "2 hours ago")
  String toRelativeTime() {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return formatDate();
    }
  }

  /// Check if date is today
  bool isToday() {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Check if date is tomorrow
  bool isTomorrow() {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Get day name (Monday, Tuesday, etc.)
  String getDayName() {
    const List<String> daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return daysOfWeek[weekday % 7];
  }
}

/// TimeOfDay extensions
extension TimeOfDayExtensions on String {
  /// Convert "HH:mm" format to readable time (e.g., "2:30 PM")
  String formatTimeFromString() {
    try {
      final parts = split(':');
      if (parts.length != 2) return this;

      final hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);

      final ampm = hour >= 12 ? 'PM' : 'AM';
      final displayHour = hour % 12 == 0 ? 12 : hour % 12;

      return '$displayHour:${minute.toString().padLeft(2, '0')} $ampm';
    } catch (e) {
      return this;
    }
  }
}

/// Num extensions
extension NumExtensions on num {
  /// Format as currency (₹)
  String formatCurrency() {
    final format = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );
    return format.format(this);
  }

  /// Format as currency with decimal
  String formatCurrencyDecimal() {
    final format = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );
    return format.format(this);
  }
}
