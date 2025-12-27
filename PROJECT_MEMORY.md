# 🧠 Doctor Help - Project Memory

> This file tracks project progress across sessions. AI assistant reads this at `/start-session` and updates at `/end-session`.

---

## 📊 Current Status

**Phase:** API Migration (Bun → Express)  
**Last Updated:** 2025-12-26
**Deadline:** 15 days (Production delivery for real client)

### Progress Summary
| Phase | Status |
|-------|--------|
| Initial Setup | ✅ Complete |
| Architecture Design | ✅ Complete |
| Mobile Restructure | ✅ Complete |
| Shared Packages | ✅ Complete |
| API Development (Elysia) | ✅ Complete |
| Mobile API Integration | ✅ Complete |
| API Migration to Express | 🔄 In Progress |

### User Preferences
- **Expo Tunnel Mode**: Always use `--tunnel` flag (different networks)

---

## 🏗️ Architecture Decisions

- **Single mobile app** with role-based access (Patient + Doctor)
- **Separate admin dashboard** (Vite + React)
- **Next.js marketing website** for SEO
- **Shared backend API** (Node.js + Express) ← *Migrating from Bun + Elysia*
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
│   └── api/             # Elysia Backend
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
- Single mobile app for patients AND doctors
- Role-based routing: `(patient)/`, `(doctor)/`, `(common)/`
- Rename `mobile-patient` → `mobile`
- Keep `web-admin` as reference only

**Next Steps:**
- Approve architecture plan
- Restructure mobile app with role-based routing
- Create shared packages

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo SDK 54, React Native, NativeWind |
| Admin | Next.js 14, TailwindCSS v4 |
| Website | Next.js 14, TailwindCSS |
| Backend | Node.js, Express, jose, Zod, MongoDB |
| AI | Google Gemini SDK |

---

### Session: 2025-12-25 (Evening)

**What Was Done:**
- Upgraded Expo SDK from 52 → 54 for Expo Go compatibility
- Set up testing infrastructure (Jest + ts-jest, 10 tests passing)
- Created complete API backend with 4 modules:
  - Auth (OTP, JWT)
  - Users (profile CRUD, role assignment)
  - Doctors (search, register, availability)
  - Appointments (CRUD, status, notes)
- Created 3 MongoDB models: User, Doctor, Appointment
- Created `packages/api-client` for type-safe API calls
- Created `AuthContext` with AsyncStorage for token persistence
- Connected all mobile auth screens to API
- Set up ngrok for cross-network API access
- Updated workflows for tunnel mode

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
