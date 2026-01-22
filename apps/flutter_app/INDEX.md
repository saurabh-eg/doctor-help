# 🚀 Flutter Doctor Help - Project Index

## 📂 Complete File Structure

```
flutter_app/
├── 📄 pubspec.yaml                 # Dependencies & project config
├── 📄 README.md                    # Project overview
├── 📄 SETUP_GUIDE.md              # Setup instructions (START HERE!)
│
├── lib/
│   ├── 📄 main.dart               # App entry point with ThemeData
│   │
│   ├── config/
│   │   ├── 📄 api_config.dart     # API URLs & endpoints
│   │   └── 📄 constants.dart      # App constants & design system
│   │
│   ├── models/
│   │   ├── 📄 api_response.dart   # Generic API response wrapper
│   │   ├── 📄 user.dart           # User model (Freezed)
│   │   ├── 📄 doctor.dart         # Doctor & TimeSlot models
│   │   └── 📄 appointment.dart    # Appointment models
│   │
│   ├── services/
│   │   ├── 📄 api_service.dart    # HTTP client with auth
│   │   ├── 📄 auth_service.dart   # Auth endpoints
│   │   ├── 📄 user_service.dart   # User endpoints
│   │   ├── 📄 doctor_service.dart # Doctor endpoints
│   │   └── 📄 appointment_service.dart # Appointment endpoints
│   │
│   ├── providers/
│   │   ├── 📄 providers.dart          # All provider definitions
│   │   ├── 📄 auth_provider.dart      # Auth state & logic
│   │   ├── 📄 patient_provider.dart   # Patient state & logic
│   │   └── 📄 doctor_provider.dart    # Doctor state & logic
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── 📄 login_screen.dart          # OTP login
│   │   │   ├── 📄 verify_otp_screen.dart    # OTP verification
│   │   │   ├── 📄 role_select_screen.dart   # Patient/Doctor selection
│   │   │   └── 📄 profile_setup_screen.dart # Profile completion
│   │   ├── patient/
│   │   │   ├── 📄 (TO IMPLEMENT) home_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) search_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) booking_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) my_bookings_screen.dart
│   │   │   └── 📄 (TO IMPLEMENT) profile_screen.dart
│   │   ├── doctor/
│   │   │   ├── 📄 (TO IMPLEMENT) dashboard_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) appointments_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) patients_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) earnings_screen.dart
│   │   │   ├── 📄 (TO IMPLEMENT) availability_screen.dart
│   │   │   └── 📄 (TO IMPLEMENT) profile_screen.dart
│   │   └── common/
│   │       └── 📄 (TO IMPLEMENT) (shared screens)
│   │
│   ├── widgets/
│   │   ├── 📄 app_button.dart      # Reusable button with loading state
│   │   ├── 📄 app_text_field.dart  # Form input with validation
│   │   └── 📄 doctor_card.dart     # Doctor profile card
│   │
│   ├── navigation/
│   │   └── 📄 app_router.dart      # GoRouter configuration
│   │
│   ├── utils/
│   │   ├── 📄 storage.dart         # SharedPreferences wrapper
│   │   ├── 📄 validators.dart      # Form validators
│   │   └── 📄 extensions.dart      # String, DateTime, Number extensions
│   │
│   ├── theme/
│   │   └── 📄 theme.dart           # Theme constants
│   │
│   └── assets/                      # Images & icons folder
```

---

## 🎯 Key Files Explained

### Core Application
- **main.dart** - Entry point, ThemeData configuration, ProviderScope wrapper
- **pubspec.yaml** - All Flutter dependencies configured

### Configuration
- **api_config.dart** - API base URL, endpoints, timeout settings
- **constants.dart** - App constants, design tokens, API endpoints

### Data Layer
- **models/** - Freezed immutable models with JSON serialization
- **services/** - API clients for each domain (Auth, User, Doctor, Appointment)
- **api_service.dart** - Core HTTP client with auth token handling

### State Management
- **providers/providers.dart** - All Riverpod provider definitions
- **auth_provider.dart** - Authentication state & logic
- **patient_provider.dart** - Patient state, appointments, stats
- **doctor_provider.dart** - Doctor state, profile, appointments

### UI Layer
- **screens/auth/** - Login → OTP → Role → Profile flow (READY)
- **screens/patient/** - Patient user flows (TO BUILD)
- **screens/doctor/** - Doctor user flows (TO BUILD)
- **widgets/** - Reusable UI components

### Navigation
- **app_router.dart** - GoRouter configuration with routes

### Utilities
- **storage.dart** - LocalStorage (SharedPreferences) wrapper
- **validators.dart** - Form field validators
- **extensions.dart** - Helper methods for String, DateTime, Number

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────┐
│        UI Screens                   │
│  (auth, patient, doctor)            │
└────────────┬────────────────────────┘
             │ Uses
┌────────────▼────────────────────────┐
│     Riverpod Providers              │
│  (auth, patient, doctor)            │
└────────────┬────────────────────────┘
             │ Calls
┌────────────▼────────────────────────┐
│        Service Layer                │
│  (AuthService, DoctorService, etc)  │
└────────────┬────────────────────────┘
             │ Uses
┌────────────▼────────────────────────┐
│       ApiService                    │
│   (HTTP client + Auth)              │
└────────────┬────────────────────────┘
             │ Makes
┌────────────▼────────────────────────┐
│   Express Backend API               │
│   (localhost:3001/api)              │
└─────────────────────────────────────┘
```

---

## ✅ What's Ready to Use

### ✅ Complete (Production-Ready)
- [x] Authentication flow (OTP login)
- [x] API client with token management
- [x] Riverpod state management setup
- [x] Form validation utilities
- [x] Local storage service
- [x] All data models with JSON serialization
- [x] Theme & design system
- [x] Navigation routing
- [x] Reusable UI widgets

### ⏳ To Implement
- [ ] Patient Home Screen
- [ ] Patient Search Screen
- [ ] Patient Booking Flow
- [ ] Patient My Bookings
- [ ] Patient Profile
- [ ] Doctor Dashboard
- [ ] Doctor Appointments
- [ ] Doctor Patients List
- [ ] Doctor Earnings
- [ ] Doctor Availability Setup
- [ ] Error handling screens
- [ ] Loading states

---

## 🚀 Quick Start Commands

```bash
# 1. Navigate to project
cd apps/flutter_app

# 2. Install dependencies
flutter pub get

# 3. Generate code (models, serializers)
flutter pub run build_runner build --delete-conflicting-outputs

# 4. Run app
flutter run

# 5. View logs
flutter logs
```

---

## 📚 Usage Examples

### Using Providers in a Screen

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MyScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch state
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    
    // Call notifier
    final authNotifier = ref.read(authStateProvider.notifier);
    
    return Scaffold(
      body: user == null 
        ? const Text('Not logged in')
        : Text('Hello ${user.name}'),
    );
  }
}
```

### Calling API Through Service

```dart
final doctorService = ref.watch(doctorServiceProvider);
final response = await doctorService.searchDoctors('Cardiologist');

if (response.success && response.data != null) {
  final doctors = response.data!;
  // Use doctors
}
```

### Form Validation

```dart
AppTextField(
  label: 'Email',
  validator: Validators.validateEmail,
  onChanged: (value) => email = value,
)
```

### Local Storage

```dart
// Save
await StorageService.saveString('user_id', userId);

// Retrieve
final id = StorageService.getString('user_id');

// Remove
await StorageService.remove('user_id');
```

---

## 🔐 Authentication Flow

1. **LoginScreen** → User enters phone
2. **API Call** → `authService.sendOtp(phone)`
3. **VerifyOtpScreen** → User enters 6-digit OTP
4. **API Call** → `authService.verifyOtp(phone, otp)`
5. **Response** → Token saved to SharedPreferences
6. **RoleSelectScreen** → User selects Patient/Doctor
7. **API Call** → `userService.setRole(userId, role)`
8. **ProfileSetupScreen** → User enters name, email
9. **API Call** → `userService.completeProfile(userId, name, email)`
10. **Navigation** → Route to Patient Home or Doctor Dashboard

---

## 🎨 Design System

**Colors:**
- Primary: `#2563eb` (Blue)
- Secondary: `#34d399` (Green)
- Accent: `#f9f506` (Yellow)

**Typography:**
- Display: Lexend (headings)
- Body: Inter (content)

**Spacing:**
- Small: 8px
- Medium: 12px
- Large: 16px
- XLarge: 20px
- 2XLarge: 24px
- 3XLarge: 32px

**Border Radius:**
- Small: 8px
- Medium: 12px
- Large: 16px
- XLarge: 20px

---

## 📞 API Endpoints Mapped

| Endpoint | Service Method | Status |
|----------|---|---|
| `POST /auth/send-otp` | `authService.sendOtp()` | ✅ Ready |
| `POST /auth/verify-otp` | `authService.verifyOtp()` | ✅ Ready |
| `POST /users/:id/role` | `userService.setRole()` | ✅ Ready |
| `POST /users/:id/complete-profile` | `userService.completeProfile()` | ✅ Ready |
| `GET /doctors` | `doctorService.listDoctors()` | ✅ Ready |
| `GET /doctors/search` | `doctorService.searchDoctors()` | ✅ Ready |
| `GET /doctors/:id` | `doctorService.getDoctor()` | ✅ Ready |
| `GET /doctors/user/:userId` | `doctorService.getDoctorByUserId()` | ✅ Ready |
| `POST /appointments` | `appointmentService.createAppointment()` | ✅ Ready |
| `GET /appointments/patient/:id` | `appointmentService.getPatientAppointments()` | ✅ Ready |
| `GET /appointments/doctor/:id` | `appointmentService.getDoctorAppointments()` | ✅ Ready |
| `PATCH /appointments/:id/status` | `appointmentService.updateStatus()` | ✅ Ready |
| `DELETE /appointments/:id` | `appointmentService.cancelAppointment()` | ✅ Ready |

---

## 🆘 Common Tasks

### Add a new screen
1. Create file in `screens/{role}/{name}_screen.dart`
2. Create model in `models/` if needed
3. Use `ConsumerWidget` from Riverpod
4. Watch providers in build method
5. Add route to `app_router.dart`

### Add a new API endpoint
1. Add method to corresponding service (e.g., `user_service.dart`)
2. Use `_apiService.get()`, `.post()`, `.patch()`, or `.delete()`
3. Call from provider or directly in screen

### Add local storage
1. Use `StorageService.saveString()`, `.saveInt()`, etc.
2. Load with `StorageService.getString()`, `.getInt()`, etc.

### Add form validation
1. Create validator function in `utils/validators.dart`
2. Use in `AppTextField` validator prop
3. Returns `null` if valid, error string if invalid

---

## 📖 Documentation Links

- [Flutter Docs](https://flutter.dev/docs)
- [Riverpod Docs](https://riverpod.dev)
- [GoRouter Docs](https://pub.dev/packages/go_router)
- [Freezed Docs](https://pub.dev/packages/freezed)
- [HTTP Package](https://pub.dev/packages/http)

---

## ✨ Next Steps

1. **Read** `SETUP_GUIDE.md` for detailed setup
2. **Run** the app with `flutter run`
3. **Implement** patient home screen
4. **Test** OTP login flow
5. **Build** remaining screens

---

**You're all set! Happy coding! 🎉**
