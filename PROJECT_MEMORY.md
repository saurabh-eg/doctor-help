# 🧠 Doctor Help - Project Memory

> This file tracks project progress across sessions. AI assistant reads this at `/start-session` and updates at `/end-session`.

---

## 📊 Current Status

**Phase:** Mobile App Backend Integration  
**Last Updated:** 2025-12-30
**Deadline:** ~13 days (Production delivery for real client)

### Progress Summary
| Phase | Status |
|-------|--------|
| Initial Setup | ✅ Complete |
| Architecture Design | ✅ Complete |
| Mobile Restructure | ✅ Complete |
| Shared Packages | ✅ Complete |
| API Development (Elysia) | ✅ Complete |
| Mobile API Integration | ✅ Complete |
| API Migration to Express | ✅ Complete |
| Mobile App UI/UX Fixes | ✅ Complete |
| Backend Wiring (Contexts) | ✅ Complete |

### User Preferences
- **Expo Tunnel Mode**: Always use `--tunnel` flag (different networks)

---

## 🏗️ Architecture Decisions

- **Single mobile app** with role-based access (Patient + Doctor)
- **Separate admin dashboard** (Vite + React)
- **Next.js marketing website** for SEO
- **Shared backend API** (Node.js + Express)
- **Monorepo** with Turborepo for build orchestration
- **Shared packages:** types, constants, utils, api-client

---

## 📁 Project Structure

```
doctor-help/
├── apps/
│   ├── mobile/          # Expo (Patient + Doctor)
│   ├── admin/           # Next.js (Admin Dashboard)
│   └── web/             # Next.js (Website)
├── services/
│   └── api/             # Express Backend
└── packages/
    ├── types/
    ├── constants/
    ├── utils/
    └── api-client/
```

---

## 📝 Session History

### Session: 2025-12-25 (Initial)

**What Was Done:**
- Analyzed existing codebase structure
- Created 5 workflow files in `.agent/workflows/`
- Discovered web-admin is a mobile UI prototype (not real admin)
- Designed scalable monorepo architecture
- Created implementation plan with 6 phases
- Set up start/end session workflows
- Created PROJECT_MEMORY.md

**Key Decisions:**
- Single mobile app for patients AND doct
**Key Files Created/Modified:**
- `services/api/src/` - Complete modular API
- `packages/api-client/src/index.ts` - API client
- `apps/mobile/contexts/AuthContext.tsx` - Auth state management
- `apps/mobile/.env` - Environment config
- `apps/mobile/app.config.js` - Expo config

**Current Blocker:**
- NativeWind/react-native-css-interop error after SDK upgrade (needs debugging)

**Next Steps:**
- Fix NativeWind compatibility with SDK 54
- Test complete auth flow on device
- Polish UI with loading/error states

---

### Session: 2025-12-26 (Night)

**What Was Done:**
- Fixed React hooks error by adding npm overrides for React 19.1.0
- Identified Node.js 22 + Expo Windows ESM issue
- Fixed partial TypeScript errors in auth/routes.ts and users/routes.ts
- Created `who-am-i.md` workflow defining senior developer standards
- Created 15-day delivery task.md with 4 phases
- Decided to migrate API from Bun + Elysia to Node.js + Express
- Created implementation plan for Express migration with jose, Zod, helmet

**Key Decisions:**
- **Switch to Express** for production stability and ecosystem support
- Use **jose** for JWT (modern, secure, TypeScript-native)
- Use **Zod** for validation (better TypeScript integration)
- Add **helmet** and **express-rate-limit** for security
- **This is a real client project** with 15-day production deadline

**Current Blocker:**
- Node.js 22 + Expo on Windows (need to downgrade to Node 20 LTS)

**Next Steps:**
- Execute API migration to Express
- Downgrade Node.js to v20 LTS
- Complete mobile app screens

---

### Session: 2025-12-30 (Morning)

**What Was Done:**
- Debugged and fixed "My Bookings" screen data population issues (nested `doctorId.userId`).
- Resolved navigation context errors by replacing NativeWind `className` on `Pressable` with standard `StyleSheet` and `TouchableOpacity`.
- Cleaned up bottom navigation by hiding unnecessary tabs.
- Corrected appointment display logic to properly categorize "Today" vs "Upcoming".
- Fixed UI text truncation issues (e.g., "Clinic Visit") and text overlap.
- Optimized "Search" screen layout causing spacing issues.

**Key Decisions:**
- Addressed NativeWind compatibility issues with `Pressable` by reverting to standard React Native styling for specific responsive components.

---

### Session: 2025-12-30 (Evening) - Backend Integration

**What Was Done:**

1. **Fixed OTP Resend Timer** - Added inline styles to ensure timer visibility on verify-otp screen

2. **Created DoctorContext** (`apps/mobile/contexts/DoctorContext.tsx`)
   - Central state management for doctor profile, appointments, stats
   - Functions: `fetchProfile`, `fetchAppointments`, `fetchStats`, `updateAppointmentStatus`, `updateAvailability`, `refreshAll`
   - Auto-calculates stats from appointments data (totalPatients, earnings, etc.)

3. **Created PatientContext** (`apps/mobile/contexts/PatientContext.tsx`)
   - Central state management for patient appointments and stats
   - Functions: `fetchAppointments`, `cancelAppointment`, `bookAppointment`, `refreshAll`
   - Separates upcoming/past appointments automatically
   - Tracks stats: totalBookings, savedAmount, doctorsConsulted

4. **Updated Root Layout** (`apps/mobile/app/_layout.tsx`)
   - Wrapped app with DoctorProvider and PatientProvider

5. **Rewired All Doctor Screens to API:**
   - `dashboard.tsx` - Real stats, today's appointments, next appointment card
   - `appointments.tsx` - Week picker, real appointments list, status updates (confirm/complete)
   - `patients.tsx` - Unique patients extracted from appointment history
   - `earnings.tsx` - Earnings calculated from paid appointments
   - `profile.tsx` - Real profile data, verification status, stats display

6. **Rewired All Patient Screens to API:**
   - `home.tsx` - Real stats and upcoming appointments from PatientContext
   - `bookings.tsx` - Appointments with cancel functionality, tabs for upcoming/past
   - `profile.tsx` - Real stats (totalBookings, savedAmount, doctorsConsulted), guest mode handling

7. **Fixed Expo Package Compatibility:**
   - Downgraded `expo-document-picker` to ~13.0.3
   - Downgraded `expo-image-picker` to ~16.0.6

**Key Files Created/Modified:**
- `apps/mobile/contexts/DoctorContext.tsx` (NEW)
- `apps/mobile/contexts/PatientContext.tsx` (NEW)
- `apps/mobile/app/_layout.tsx` (MODIFIED - added providers)
- `apps/mobile/app/(doctor)/dashboard.tsx` (REWRITTEN)
- `apps/mobile/app/(doctor)/appointments.tsx` (REWRITTEN)
- `apps/mobile/app/(doctor)/patients.tsx` (REWRITTEN)
- `apps/mobile/app/(doctor)/earnings.tsx` (REWRITTEN)
- `apps/mobile/app/(doctor)/profile.tsx` (REWRITTEN)
- `apps/mobile/app/(patient)/home.tsx` (REWRITTEN)
- `apps/mobile/app/(patient)/bookings.tsx` (REWRITTEN)
- `apps/mobile/app/(patient)/profile.tsx` (REWRITTEN)

**Key Decisions:**
- Use inline styles for critical UI elements (Design System v1.0 standard)
- Calculate stats client-side from appointments data (reduces API calls)
- Pull-to-refresh with RefreshControl on all main screens
- Alert confirmations for destructive actions (logout, cancel appointment)
- Guest mode in patient profile with registration benefits display

**Already Wired (no changes needed):**
- `search.tsx` - Already fetches from `/doctors` endpoint
- `doctor-profile.tsx` - Already fetches from `/doctors/:id`
- `slot-selection.tsx` - Already fetches doctor slots
- `review-pay.tsx` - Already creates appointments via API

**Next Steps:**
- Test complete patient booking flow end-to-end
- Test doctor verification and onboarding
- Add doctor verification screen wiring
- Production build configuration

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#197fe6` |
| Secondary | `#34d399` |
| Accent | `#f9f506` |
| Font Display | Lexend |
| Font Body | Inter |

---

## 📌 Important Files

- Architecture Plan: `.gemini/antigravity/brain/.../implementation_plan.md`
- Task Tracker: `.gemini/antigravity/brain/.../task.md`
- Workflows: `.agent/workflows/`
- Web UI Reference: `apps/web-admin/src/screens/`
