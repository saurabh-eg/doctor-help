---
description: Run the mobile Expo app locally with tunnel for cross-network access
---

# Run Mobile App

// turbo-all

## Quick Start (Tunnel Mode)
```bash
npm run dev:mobile
```

This starts Expo with **tunnel mode** enabled, allowing access from any network.

## Steps

1. Start the mobile app with tunnel
```bash
cd apps/mobile && npm start -- --tunnel
```

2. Scan the QR code with Expo Go app on your phone

3. The tunnel URL works across different networks (phone on 4G, PC on WiFi)

## API Connection

The mobile app connects to the API at `http://localhost:3001/api`. 
When using tunnel, you may need to update `contexts/AuthContext.tsx` with:
- For local testing: `http://localhost:3001/api` (web)
- For device testing: Use ngrok or a public API URL

## Shortcuts
- Press `w` for web browser
- Press `a` for Android emulator
- Press `r` to reload
- Press `j` to open debugger

## Troubleshooting

### Tunnel connection issues
```bash
npx expo start --tunnel --clear
```

### Metro bundler issues
```bash
npm start -- --clear
```

### Reinstall dependencies
```bash
rm -rf node_modules && npm install
```
