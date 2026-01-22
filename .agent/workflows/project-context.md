---
description: Project architecture and technical context for Doctor Help
---

# Project Context - Doctor Help

## 🏗️ Architecture Overview

**Type:** Healthcare Platform (Doctor-Patient Appointments)  
**Mobile:** Flutter (Dart)  
**Backend:** Express.js (Node.js)  
**Database:** MongoDB  
**Admin:** Vite + React

## 📁 Project Structure

```
doctor-help/
├── apps/
│   ├── flutter_app/         # Flutter mobile app
│   │   └── lib/
│   │       ├── config/      # API config, constants
│   │       ├── models/      # Freezed models
│   │       ├── services/    # API services
│   │       ├── providers/   # Riverpod state
│   │       ├── screens/     # UI screens
│   │       ├── widgets/     # Reusable widgets
│   │       └── navigation/  # GoRouter
│   └── admin-dashboard/     # Admin panel (Vite + React)
├── services/
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── modules/     # Auth, Users, Doctors, Appointments
│       │   ├── middleware/  # Auth, validation, errors
│       │   └── models/      # MongoDB schemas
│       └── scripts/         # Seed scripts
└── packages/                # Shared packages (admin only)
```

## 🔧 Tech Stack

### Flutter App
- **State Management:** Riverpod
- **Navigation:** GoRouter
- **Models:** Freezed + json_serializable
- **HTTP:** http package with custom ApiService
- **Storage:** SharedPreferences

### Backend API
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with jose
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit
- **Upload:** Cloudinary

## 🔌 API Base URLs

| Environment | URL |
|-------------|-----|
| Android Emulator | `http://10.0.2.2:3001/api` |
| iOS Simulator | `http://localhost:3001/api` |
| Physical Device | `http://<your-ip>:3001/api` |
| Production | TBD |

## 📱 App Screens

### Auth Flow
1. Login (phone input)
2. Verify OTP
3. Role Selection (Patient/Doctor)
4. Profile Setup

### Patient Screens
- Home (doctor list, specializations)
- Search (filter doctors)
- Doctor Profile (details, booking)
- Book Appointment
- My Bookings
- Profile

### Doctor Screens
- Dashboard (stats, today's appointments)
- Appointments (manage, filter)
- Patients (from appointments)
- Earnings
- Profile

## 🔐 Authentication Flow

1. User enters phone number
2. Backend sends OTP (console in dev)
3. User enters OTP
4. Backend returns JWT + user data
5. If new user → Role selection → Profile setup
6. If existing → Navigate to role-based home

## 📊 Key Models

### User
- id, phone, name, email, role, isPhoneVerified, isProfileComplete

### Doctor
- id, userId, specialization, qualification, experience, consultationFee, rating, availability

### Appointment
- id, patientId, doctorId, date, timeSlot, status, type

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | #2563eb |
| Secondary | #34d399 |
| Accent | #f9f506 |
| Fonts | Inter, Lexend |

## 🚀 Quick Commands

```bash
# Backend
cd services/api && npm run dev

# Flutter
cd apps/flutter_app && flutter run

# Seed data
cd services/api && npm run seed:doctors

# Analyze Flutter
cd apps/flutter_app && flutter analyze
```
