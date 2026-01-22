/// App Constants
class AppConstants {
  // User Roles
  static const String rolePatient = 'patient';
  static const String roleDoctor = 'doctor';
  static const String roleAdmin = 'admin';

  // Appointment Status
  static const String appointmentPending = 'pending';
  static const String appointmentConfirmed = 'confirmed';
  static const String appointmentInProgress = 'in-progress';
  static const String appointmentCompleted = 'completed';
  static const String appointmentCancelled = 'cancelled';

  // Consultation Types
  static const String consultationVideo = 'video';
  static const String consultationClinic = 'clinic';
  static const String consultationHome = 'home';

  // Payment Status
  static const String paymentPending = 'pending';
  static const String paymentPaid = 'paid';
  static const String paymentRefunded = 'refunded';

  // Medical Specialties
  static const List<String> specialties = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedist',
    'Neurologist',
    'Psychiatrist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
    'Urologist',
  ];

  // Days of week
  static const List<String> daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Storage keys
  static const String storageKeyToken = 'auth_token';
  static const String storageKeyUser = 'auth_user';
  static const String storageKeyRefreshToken = 'refresh_token';
}

/// UI Constants
class UIConstants {
  // Spacing
  static const double spacingXSmall = 4;
  static const double spacingSmall = 8;
  static const double spacingMedium = 12;
  static const double spacingLarge = 16;
  static const double spacingXLarge = 20;
  static const double spacing2XLarge = 24;
  static const double spacing3XLarge = 32;

  // Border Radius
  static const double radiusSmall = 8;
  static const double radiusMedium = 12;
  static const double radiusLarge = 16;
  static const double radiusXLarge = 20;
  static const double radiusRound = 50;

  // Font Sizes
  static const double fontSmall = 12;
  static const double fontMedium = 14;
  static const double fontLarge = 16;
  static const double fontXLarge = 18;
  static const double font2XLarge = 20;
  static const double font3XLarge = 24;
  static const double font4XLarge = 32;
}
