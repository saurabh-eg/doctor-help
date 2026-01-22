# Flutter App Setup - Complete Guide

## ✅ What's Included

Your Flutter boilerplate includes:

### 📦 Configuration
- ✅ `pubspec.yaml` - All dependencies configured
- ✅ `lib/config/api_config.dart` - API endpoints & settings
- ✅ `lib/config/constants.dart` - App constants & design system

### 🏗️ Architecture
- ✅ **Services Layer** - API clients for each domain
- ✅ **Providers** - Riverpod state management
- ✅ **Models** - Freezed immutable models with JSON serialization
- ✅ **Navigation** - GoRouter with type-safe routing

### 🎨 UI Components
- ✅ `AppButton` - Customizable button widget
- ✅ `AppTextField` - Form input with validation
- ✅ `DoctorCard` - Doctor profile card
- ✅ Theme configuration with Material Design 3

### 🔐 Auth Screens (Ready to Use!)
- ✅ Login Screen (Phone OTP)
- ✅ Verify OTP Screen
- ✅ Role Selection Screen
- ✅ Profile Setup Screen

### 🛠️ Utilities
- ✅ Local storage service
- ✅ Form validators
- ✅ Date/Time/Currency extensions
- ✅ String utilities

## 🚀 Next Steps

### Step 1: Set Up Flutter Environment

```bash
# Check Flutter installation
flutter doctor

# Get pub dependencies
cd apps/flutter_app
flutter pub get
```

### Step 2: Generate Code (IMPORTANT!)

Freezed models need code generation:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

This generates:
- `*.freezed.dart` files (immutable models)
- `*.g.dart` files (JSON serialization)

### Step 3: Update API URL

Edit `lib/config/api_config.dart`:

```dart
// For local development:
static const String baseUrl = 'http://localhost:3001/api';

// For ngrok (different networks):
// Run: npx ngrok http 3001
// static const String baseUrl = 'https://abc123.ngrok.io/api';
```

### Step 4: Run the App

```bash
# Start your Express API first!
cd services/api
npm run dev

# In another terminal, run Flutter
cd apps/flutter_app
flutter run

# Or on specific device:
flutter run -d chrome  # Web
flutter run -d emulator-5554  # Android Emulator
```

## 📱 App Flow

```
Login Screen
    ↓ (send OTP)
Verify OTP Screen
    ↓ (verify OTP)
Role Select Screen (new user only)
    ↓ (select patient/doctor)
Profile Setup Screen
    ↓ (complete name, email)
Patient Home / Doctor Dashboard
```

## 🔌 API Integration Status

All endpoints are connected:

### ✅ Ready to Implement
- [ ] Patient Home Screen (fetch appointments, display stats)
- [ ] Doctor Dashboard (fetch appointments, display stats)
- [ ] Search Screen (list doctors)
- [ ] Booking Screen (create appointment)
- [ ] My Bookings / Appointments (list & cancel)
- [ ] Doctor Profile Management
- [ ] Availability Setup

## 📂 Sample Code to Implement Next

### Example: Patient Home Screen

```dart
// lib/screens/patient/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PatientHomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Get current user
    final user = ref.watch(currentUserProvider);
    
    // Get patient data
    final patientState = ref.watch(patientProvider);
    
    return Scaffold(
      body: patientState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                // Header with greeting
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Hello, ${user?.name}'),
                ),
                // Stats cards
                // Upcoming appointments
                // Browse doctors button
              ],
            ),
    );
  }
}
```

## 🎯 Key Providers Available

```dart
// Auth
ref.watch(authStateProvider)        // Current auth state
ref.watch(currentUserProvider)      // Current user

// Patient
ref.watch(patientProvider)          // Patient appointments & stats

// Doctor
ref.watch(doctorProvider)           // Doctor profile & appointments

// Services
ref.watch(authServiceProvider)      // Auth service
ref.watch(doctorServiceProvider)    // Doctor service
ref.watch(appointmentServiceProvider) // Appointment service
```

## 💾 Storage Service

For local storage (SharedPreferences):

```dart
import 'utils/storage.dart';

// Save
await StorageService.saveString('key', 'value');

// Get
final value = StorageService.getString('key');

// Remove
await StorageService.remove('key');

// Clear all
await StorageService.clear();
```

## ✨ Form Validation Examples

```dart
import 'utils/validators.dart';

// Phone validation
Validators.validatePhone('9876543210')  // returns null if valid

// Email validation
Validators.validateEmail('user@example.com')

// OTP validation
Validators.validateOtp('123456')

// Name validation
Validators.validateName('John Doe')
```

## 🎨 Using Extensions

```dart
import 'utils/extensions.dart';

// String extensions
'john@example.com'.isValidEmail()
'9876543210'.isValidPhone()

// DateTime extensions
DateTime.now().formatDate()              // "Jan 20, 2026"
DateTime.now().formatTime()              // "10:30 AM"
DateTime.now().isToday()                 // true/false
DateTime.now().isTomorrow()              // true/false
DateTime.now().getDayName()              // "Monday"
DateTime.now().toRelativeTime()          // "2 hours ago"

// Number extensions
1000.formatCurrency()                    // "₹1000"
1000.5.formatCurrencyDecimal()           // "₹1,000.50"

// Time string formatting
'10:30'.formatTimeFromString()           // "10:30 AM"
```

## 📤 Building for Release

### Android
```bash
flutter build apk
flutter build appbundle  # For Play Store
```

### iOS
```bash
flutter build ios
```

### Web
```bash
flutter build web
```

## 🐛 Common Issues & Fixes

### Issue: Models not generated
```bash
# Solution: Run build runner
flutter pub run build_runner build --delete-conflicting-outputs
```

### Issue: API connection refused
```bash
# Make sure Express API is running
cd services/api
npm run dev
```

### Issue: "No such file: lib/models/user.freezed.dart"
```bash
# Generate all code
flutter pub run build_runner build
```

## 📚 Next Screens to Implement

1. **Patient Home** - Display upcoming appointments and stats
2. **Search** - List and search doctors
3. **Doctor Profile** - Show doctor details
4. **Booking** - Create appointment
5. **My Bookings** - List patient appointments
6. **Doctor Dashboard** - Show doctor appointments
7. **Appointment Details** - View appointment info

## ✅ Implementation Checklist

- [x] Project structure created
- [x] Dependencies configured
- [x] API service setup
- [x] State management (Riverpod) setup
- [x] Auth screens implemented
- [x] Navigation configured
- [x] UI components created
- [x] Models & types created
- [ ] Patient screens (to implement)
- [ ] Doctor screens (to implement)
- [ ] Error handling (enhance)
- [ ] Push notifications (future)
- [ ] Video call integration (future - Phase 2)

## 📞 Support

All core architecture is in place. You can now:

1. ✅ Modify existing screens
2. ✅ Create new screens using the provided patterns
3. ✅ Call any Express API endpoint
4. ✅ Manage state with Riverpod
5. ✅ Handle local storage

Happy coding! 🎉
