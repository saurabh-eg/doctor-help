# 🏥 Doctor Help

A modern healthcare platform connecting patients with doctors through video consultations, appointment booking, and AI-powered assistance.

## 📱 Project Structure

```
doctor-help/
├── apps/
│   ├── mobile/              # 📱 Expo app (Patient + Doctor)
│   ├── admin/               # 🖥️ Next.js admin dashboard
│   └── web/                 # 🌐 Next.js marketing website
├── services/
│   └── api/                 # ⚡ Elysia backend API
└── packages/
    ├── types/               # 🔷 Shared TypeScript types
    ├── constants/           # 📋 Shared constants
    └── utils/               # 🛠️ Shared utilities
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Expo SDK 52, React Native, NativeWind |
| **Admin** | Next.js 14, TailwindCSS v4 |
| **Website** | Next.js 14, TailwindCSS |
| **Backend** | Bun, Elysia, MongoDB |
| **AI** | Google Gemini SDK |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Bun runtime (for API)
- Expo Go app (for mobile testing)

### Installation

```bash
npm install
```

### Running Apps

```bash
# Mobile app (Patient + Doctor)
npm run dev:mobile

# Admin dashboard
npm run dev:admin

# Marketing website
npm run dev:web

# Backend API
npm run dev:api
```

## 📱 Mobile App Structure

```
apps/mobile/app/
├── (auth)/          # Login, OTP verification
├── (patient)/       # Patient tab screens
├── (doctor)/        # Doctor tab screens
└── (common)/        # Shared screens (video call, chat)
```

## 📦 Shared Packages

| Package | Usage |
|---------|-------|
| `@doctor-help/types` | User, Doctor, Appointment types |
| `@doctor-help/constants` | Roles, colors, API endpoints |
| `@doctor-help/utils` | Date, currency, validation helpers |

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#197fe6` |
| Secondary | `#34d399` |
| Font Display | Lexend |
| Font Body | Inter |

## 🔄 Development Workflows

| Command | Description |
|---------|-------------|
| `/start-session` | Load project context |
| `/end-session` | Save progress to memory |
| `/convert-screen` | Convert web→mobile screen |
| `/run-mobile` | Start mobile app |

## 📝 Current Status

| Phase | Status |
|-------|--------|
| Architecture Restructure | ✅ Complete |
| Shared Packages | ✅ Complete |
| Mobile Screens | 🔄 In Progress |
| API Development | ⏳ Pending |
| Admin Dashboard | ⏳ Pending |

## 📄 License

Private - All rights reserved
