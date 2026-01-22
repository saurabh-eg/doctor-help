# 🏥 Doctor Help

A modern healthcare platform connecting patients with doctors through appointment booking, consultations, and seamless healthcare management.

## 📱 Project Structure

```
doctor-help/
├── apps/
│   ├── flutter_app/         # 📱 Flutter mobile app (Patient + Doctor)
│   └── admin-dashboard/     # 🖥️ Vite + React admin dashboard
├── services/
│   └── api/                 # ⚡ Express.js backend API
└── packages/
    ├── types/               # 🔷 Shared TypeScript types (for admin)
    ├── constants/           # 📋 Shared constants (for admin)
    └── utils/               # 🛠️ Shared utilities (for admin)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Flutter 3.10+, Dart, Riverpod, GoRouter |
| **Admin** | Vite, React, TailwindCSS |
| **Backend** | Node.js, Express, MongoDB, Zod |
| **Security** | JWT (jose), Helmet, Rate Limiting |
| **Image Upload** | Cloudinary |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- Flutter 3.10+
- MongoDB (local or Atlas)
- Android Studio / Xcode (for mobile development)

### Backend Setup

```bash
cd services/api
npm install
cp .env.example .env  # Configure MongoDB URI, JWT secrets
npm run dev           # Starts on http://localhost:3001
```

### Seed Sample Data

```bash
cd services/api
npm run seed:doctors  # Seeds sample doctors
npm run seed:admin    # Seeds admin user
```

### Flutter App Setup

```bash
cd apps/flutter_app
flutter pub get
flutter run           # Run on connected device/emulator
```

### Admin Dashboard

```bash
cd apps/admin-dashboard
npm install
npm run dev           # Starts on http://localhost:5173
```

## 📱 Flutter App Structure

```
apps/flutter_app/lib/
├── config/           # API config, constants
├── models/           # Freezed models (User, Doctor, Appointment)
├── services/         # API services (auth, doctor, appointment)
├── providers/        # Riverpod state management
├── screens/
│   ├── auth/         # Login, OTP, Role selection, Profile setup
│   ├── patient/      # Home, Search, Bookings, Profile
│   └── doctor/       # Dashboard, Appointments, Patients, Earnings
├── widgets/          # Reusable UI components
└── navigation/       # GoRouter configuration
```

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/send-otp` | Send OTP to phone |
| `POST /api/auth/verify-otp` | Verify OTP and login |
| `GET /api/doctors` | List verified doctors |
| `GET /api/doctors/:id` | Get doctor details |
| `POST /api/appointments` | Create appointment |
| `GET /api/appointments/patient/:id` | Patient appointments |
| `GET /api/appointments/doctor/:id` | Doctor appointments |

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#2563eb` |
| Secondary | `#34d399` |
| Accent | `#f9f506` |
| Font | Inter, Lexend |

## 📝 Development

### Running Backend + Flutter Together

1. **Start MongoDB** (local or use Atlas URI)
2. **Start Backend**: `cd services/api && npm run dev`
3. **Run Flutter**: `cd apps/flutter_app && flutter run`

### For Android Emulator
The Flutter app is configured to use `10.0.2.2:3001` which maps to your host's `localhost:3001`.

### For Physical Device
Update `apps/flutter_app/lib/config/api_config.dart` with your computer's IP address.

## 📊 Current Status

| Feature | Status |
|---------|--------|
| OTP Authentication | ✅ Complete |
| Role Selection | ✅ Complete |
| Patient Screens | ✅ Complete |
| Doctor Screens | ✅ Complete |
| API Integration | ✅ Complete |
| Doctor Verification | 🔄 In Progress |
| Payment Integration | 📋 Planned |
| Push Notifications | 📋 Planned |

## 📄 License

Private - All rights reserved.
