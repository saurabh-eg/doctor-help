# Flutter Doctor Help App

Complete Flutter application for healthcare platform - integrates with Express + MongoDB backend.

## 📱 Features

- ✅ OTP-based authentication
- ✅ Patient & Doctor roles
- ✅ Profile management
- ✅ Appointment booking & management
- ✅ Doctor search & filtering
- ✅ State management with Riverpod
- ✅ Local storage with SharedPreferences
- ✅ Modern UI with Material Design 3

## 🛠️ Tech Stack

- **Framework:** Flutter 3.10+
- **State Management:** Riverpod
- **Navigation:** GoRouter
- **HTTP Client:** http + Dio
- **Local Storage:** SharedPreferences
- **Models:** Freezed (immutable)
- **Backend:** Express + MongoDB

## 📋 Prerequisites

- Flutter SDK 3.10+ ([Install](https://flutter.dev/docs/get-started/install))
- Dart 3.0+
- VS Code / Android Studio
- Emulator or physical device

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd apps/flutter_app
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Generate Code (Freezed models)

```bash
flutter pub run build_runner build
```

### 4. Configure API URL

Edit `lib/config/api_config.dart`:

```dart
static const String baseUrl = 'http://localhost:3001/api';
// Or for different networks:
// static const String baseUrl = 'https://abc123.ngrok.io/api';
```

### 5. Run the App

```bash
flutter run
```

## 📁 Project Structure

```
lib/
├── config/              # Configuration & constants
│   ├── api_config.dart
│   └── constants.dart
├── models/              # Data models (Freezed)
│   ├── user.dart
│   ├── doctor.dart
│   ├── appointment.dart
│   └── api_response.dart
├── services/            # API services
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── user_service.dart
│   ├── doctor_service.dart
│   └── appointment_service.dart
├── providers/           # Riverpod state management
│   ├── providers.dart
│   ├── auth_provider.dart
│   ├── patient_provider.dart
│   └── doctor_provider.dart
├── screens/             # UI screens
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── verify_otp_screen.dart
│   │   ├── role_select_screen.dart
│   │   └── profile_setup_screen.dart
│   ├── patient/
│   ├── doctor/
│   └── common/
├── widgets/             # Reusable components
│   ├── app_button.dart
│   ├── app_text_field.dart
│   └── doctor_card.dart
├── navigation/          # GoRouter configuration
│   └── app_router.dart
├── utils/               # Utilities
│   ├── storage.dart
│   ├── validators.dart
│   └── extensions.dart
├── theme/               # Theme & styling
│   └── theme.dart
└── main.dart            # App entry point
```

## 🔌 API Integration

All API calls are handled through service classes:

### Auth Service
```dart
final authService = ref.watch(authServiceProvider);
await authService.sendOtp('9876543210');
await authService.verifyOtp('9876543210', '123456');
```

### Doctor Service
```dart
final doctorService = ref.watch(doctorServiceProvider);
final doctors = await doctorService.listDoctors();
final doctor = await doctorService.getDoctor(doctorId);
```

### Appointment Service
```dart
final appointmentService = ref.watch(appointmentServiceProvider);
await appointmentService.createAppointment(
  patientId: userId,
  doctorId: doctorId,
  date: DateTime.now(),
  startTime: '10:00',
  endTime: '10:30',
  type: 'video',
);
```

## 🎨 Design System

Colors defined in `lib/config/constants.dart`:
- **Primary:** `#2563eb` (Blue)
- **Secondary:** `#34d399` (Green)
- **Accent:** `#f9f506` (Yellow)

Font families:
- **Display:** Lexend
- **Body:** Inter

## 🔐 Authentication Flow

1. User enters phone number → `sendOtp()`
2. Receives 6-digit OTP → `verifyOtp()`
3. Gets JWT token + User info
4. Token stored locally in SharedPreferences
5. Included in all subsequent API calls

## 📝 Environment Configuration

For different environments, create `.env` files and use them:

```bash
# Development
flutter run --dart-define=API_URL=http://localhost:3001/api

# Production
flutter run --dart-define=API_URL=https://api.production.com
```

## 🧪 Testing

Generate code before running tests:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

Run tests:
```bash
flutter test
```

## 📦 Building for Release

### Android
```bash
flutter build apk --split-per-abi
# or
flutter build appbundle
```

### iOS
```bash
flutter build ios
```

## 🐛 Debugging

Enable debug mode in API config:
```dart
static const bool debugMode = true;
```

View logs in console (all API calls will be logged).

## 📚 Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Riverpod Guide](https://riverpod.dev)
- [GoRouter Documentation](https://pub.dev/packages/go_router)
- [Freezed Package](https://pub.dev/packages/freezed)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

Proprietary - All rights reserved
