# 🧠 Doctor Help - Project Memory

> This file tracks project progress across sessions. AI assistant reads this at session start.

---

## 📊 Current Status

**Phase:** Flutter App - Doctor Verification with Documents  
**Last Updated:** 2026-01-22  
**Stack:** Flutter + Express.js + MongoDB

### Progress Summary

| Phase | Status |
| ------- | -------- |
| React Native to Flutter Migration | ✅ Complete |
| Flutter App Architecture | ✅ Complete |
| Authentication Flow | ✅ Complete |
| Patient Screens | ✅ Complete |
| Doctor Screens | ✅ Complete |
| Backend API (Express) | ✅ Complete |
| API Integration | ✅ Complete |
| Doctor Verification Screen | ✅ Complete |
| Document Upload for Verification | ✅ Complete |

---

## 🏗️ Architecture

### Current Structure

```text
doctor-help/
├── apps/
│   ├── flutter_app/         # 📱 Flutter mobile app
│   └── admin-dashboard/     # 🖥️ Vite + React admin
├── services/
│   └── api/                 # ⚡ Express.js backend
└── packages/
    ├── types/               # TypeScript types (admin only)
    ├── constants/           # Shared constants (admin only)
    └── utils/               # Utilities (admin only)
```

### Deleted Folders (React Native Migration)

- `apps/mobile/` - Old Expo/React Native app
- `apps/web-admin/` - Old prototype
- `packages/api-client/` - Old RN API client

---

## 🔧 Key Technical Decisions

1. **Flutter over React Native** - Better performance, single codebase
2. **Riverpod** - State management (over Provider/Bloc)
3. **GoRouter** - Declarative routing
4. **Freezed** - Immutable models with JSON serialization
5. **Express.js** - Production-ready backend (migrated from Elysia)
6. **jose** - JWT handling (modern, TypeScript-native)
7. **Zod** - Request validation

---

## 📁 Flutter App Structure

```text
apps/flutter_app/lib/
├── config/
│   ├── api_config.dart      # API URLs, endpoints
│   └── constants.dart       # UI constants
├── models/
│   ├── user.dart            # User model (Freezed)
│   ├── doctor.dart          # Doctor model (Freezed)
│   └── appointment.dart     # Appointment model (Freezed)
├── services/
│   ├── api_service.dart     # HTTP client with auth
│   ├── auth_service.dart    # Auth endpoints
│   ├── user_service.dart    # User endpoints
│   ├── doctor_service.dart  # Doctor endpoints
│   └── appointment_service.dart
├── providers/
│   ├── providers.dart       # All provider definitions
│   ├── auth_provider.dart   # Auth state
│   ├── patient_provider.dart
│   └── doctor_provider.dart
├── screens/
│   ├── auth/                # Login, OTP, Role, Profile Setup
│   ├── patient/             # Home, Search, Bookings, Profile
│   └── doctor/              # Dashboard, Appointments, etc.
├── widgets/                 # Reusable components
└── navigation/
    └── app_router.dart      # GoRouter config
```

---

## 🔌 API Configuration

**Development (Android Emulator):**

```dart
static const String baseUrl = 'http://10.0.2.2:3001/api';
```

**For Physical Device:**
Replace with your computer's IP address.

---

## 📝 Recent Session 2026-01-22

### What Was Done

1. Analyzed complete codebase structure
2. Identified React Native folders to delete
3. Fixed API response parsing for list endpoints
4. Updated DoctorService and AppointmentService to handle list data
5. Updated README.md for Flutter stack
6. Updated task.md with current status
7. Cleaned up obsolete folders

### Issues Fixed

- `listDoctors` returning empty - Fixed wrapper format parsing
- `getPatientAppointments` returning empty - Fixed list parsing
- Role selection parse error - Fixed in previous session

### Next Steps

1. Seed doctors in database: `npm run seed:doctors`
2. Test complete patient booking flow
3. Implement Doctor Verification screen
4. Add Doctor Availability management

---

## 🎯 Development Commands

### Backend

```bash
cd services/api
npm run dev           # Start development server
npm run seed:doctors  # Seed sample doctors
npm run seed:admin    # Seed admin user
```

### Flutter

```bash
cd apps/flutter_app
flutter pub get       # Install dependencies
flutter run           # Run on device/emulator
flutter analyze       # Check for errors
flutter build apk     # Build Android APK
```

---

## ⚠️ Important Notes

1. **OTP in Development**: OTP is logged to console, not sent via SMS
2. **Android Emulator**: Uses `10.0.2.2` to reach host localhost
3. **Doctors list empty**: Run `npm run seed:doctors` to populate
4. **Backend must be running**: Start API before testing app
