# 🧠 Doctor Help - Project Memory

> This file tracks project progress across sessions. AI assistant reads this at `/start-session` and updates at `/end-session`.

---

## 📊 Current Status

**Phase:** Architecture Planning  
**Last Updated:** 2025-12-25

### Progress Summary
| Phase | Status |
|-------|--------|
| Initial Setup | ✅ Complete |
| Architecture Design | ✅ Complete |
| Mobile Restructure | ⏳ Pending |
| Shared Packages | ⏳ Pending |
| API Development | ⏳ Pending |

---

## 🏗️ Architecture Decisions

- **Single mobile app** with role-based access (Patient + Doctor)
- **Separate admin dashboard** (Vite + React)
- **Next.js marketing website** for SEO
- **Shared backend API** (Bun + Elysia)
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
| Mobile | Expo SDK 52, React Native, NativeWind |
| Admin | Next.js 14, TailwindCSS v4 |
| Website | Next.js 14, TailwindCSS |
| Backend | Bun, Elysia, MongoDB |
| AI | Google Gemini SDK |

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
