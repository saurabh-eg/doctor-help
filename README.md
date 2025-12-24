# 🏥 Doctor Help

A modern healthcare platform connecting patients with doctors through video consultations, appointment booking, and AI-powered assistance.

## 📱 Project Structure

```
doctor-help/
├── apps/
│   ├── mobile-patient/     # 📱 Patient mobile app (Expo + React Native)
│   └── web-admin/          # 🌐 UI prototype (Vite + React)
├── services/
│   └── api-gateway/        # ⚡ Backend API (Bun + Elysia)
└── packages/
    └── ui/                 # 🎨 Shared components (planned)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Expo SDK 52, React Native, NativeWind |
| **Web** | Vite, React 19, TailwindCSS v4 |
| **Backend** | Bun, Elysia, MongoDB |
| **AI** | Google Gemini SDK |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Bun runtime (for API)
- Expo Go app (for mobile testing)

### Installation

```bash
# Install root dependencies
npm install

# Install app dependencies
cd apps/mobile-patient && npm install
cd ../web-admin && npm install
cd ../../services/api-gateway && bun install
```

### Running the Apps

**Mobile Patient App:**
```bash
cd apps/mobile-patient
npm start
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

**Web Admin (UI Prototype):**
```bash
cd apps/web-admin
npm run dev
# Open http://localhost:5173
```

**API Gateway:**
```bash
cd services/api-gateway
bun run index.ts
# Server runs at http://localhost:3001
```

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#197fe6` |
| Secondary | `#34d399` |
| Accent | `#f9f506` |
| Font Display | Lexend |
| Font Body | Inter |

## 📁 App Features

### Patient App (`mobile-patient`)
- 🔐 Phone + OTP Authentication
- 🏠 Dashboard with upcoming appointments
- 🔍 Doctor & Lab search
- 📅 Appointment booking
- 💰 Wallet & payments
- 📋 Medical records
- 🤖 AI Health Assistant

### Doctor Portal (`web-admin`)
- 📊 Dashboard & analytics
- 📆 Calendar management
- ✅ Verification flow
- 💵 Earnings tracking

## 🔄 Development Workflows

Use these commands in chat with AI assistant:
- `/run-mobile` - Start mobile app
- `/run-web` - Start web admin
- `/run-api` - Start backend
- `/convert-screen` - Convert web→mobile screen
- `/project-context` - View full project context

## 📝 Current Status

| Component | Status |
|-----------|--------|
| Mobile Auth | ✅ Complete |
| Mobile Navigation | ✅ Complete |
| Mobile Screens | 🔄 In Progress |
| Web UI Prototype | ✅ Complete |
| API Backend | ⏳ Planned |

## 🤝 Contributing

1. Check `.agent/workflows/` for development procedures
2. Follow the component mapping in `/convert-screen` workflow
3. Maintain design system consistency across apps

## 📄 License

Private - All rights reserved
