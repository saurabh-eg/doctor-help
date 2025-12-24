---
description: Project overview and context for Doctor Help monorepo
---

# Doctor Help Project Context

## Architecture
```
doctor-help/
├── apps/
│   ├── mobile-patient/    # Expo React Native app for patients
│   └── web-admin/         # Vite React app (mobile UI mockup)
├── services/
│   └── api-gateway/       # Elysia backend API
└── packages/
    └── ui/                # Shared UI components (planned)
```

## Tech Stack

### Mobile Patient App
- **Framework**: Expo SDK 52
- **UI**: React Native + NativeWind (TailwindCSS)
- **Navigation**: Expo Router (file-based)
- **Icons**: @expo/vector-icons (Ionicons)

### Web Admin (UI Prototype)
- **Framework**: Vite + React 19
- **UI**: TailwindCSS v4
- **Navigation**: React Router DOM
- **Icons**: Material Symbols
- **AI**: Google Gemini SDK (for AI Assistant)

### API Gateway
- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: MongoDB (planned)

## Design System

### Colors
- Primary: `#197fe6` (blue)
- Secondary: `#34d399` (emerald)
- Accent: `#f9f506` (yellow)
- Background Light: `#F8FAFC`
- Background Dark: `#0F172A`

### Typography
- Display: Lexend, Spline Sans
- Body: Inter

## Current State

### Mobile App
- Auth flow complete (login + OTP)
- Tab navigation scaffolded
- Screens need content (currently placeholders)

### Web Admin
- Complete UI prototype with 22+ screens
- Use as reference for mobile implementation

### API
- Basic health endpoint only
- Needs full implementation

## Key Files to Know
- `apps/mobile-patient/app/_layout.tsx` - Root navigation
- `apps/mobile-patient/app/(tabs)/_layout.tsx` - Tab config
- `apps/web-admin/src/App.tsx` - All routes defined
- `apps/web-admin/src/index.css` - Design tokens
