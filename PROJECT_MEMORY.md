# 🧠 Doctor Help - Project Memory

> This file tracks project progress across sessions. AI assistant reads this at `/start-session` and updates at `/end-session`.

---

## 📊 Current Status

**Phase:** Mobile App Features  
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
| Mobile App UI/UX Fixes | ✅ In Progress |

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

### Session: 2025-12-30

**What Was Done:**
- Debugged and fixed "My Bookings" screen data population issues (nested `doctorId.userId`).
- Resolved navigation context errors by replacing NativeWind `className` on `Pressable` with standard `StyleSheet` and `TouchableOpacity`.
- Cleaned up bottom navigation by hiding unnecessary tabs.
- Corrected appointment display logic to properly categorize "Today" vs "Upcoming".
- Fixed UI text truncation issues (e.g., "Clinic Visit") and text overlap.
- Optimized "Search" screen layout causing spacing issues.

**Key Decisions:**
- Addressed NativeWind compatibility issues with `Pressable` by reverting to standard React Native styling for specific responsive components.

**Next Steps:**
- Continue verifying Doctor profile flow.
- Complete remaining mobile app screens.
- Verify production build requirements.

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
