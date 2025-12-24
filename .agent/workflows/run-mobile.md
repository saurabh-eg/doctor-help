---
description: Run the mobile-patient Expo app locally
---

# Run Mobile Patient App

// turbo-all

## Steps

1. Navigate to mobile app directory
```bash
cd apps/mobile-patient
```

2. Install dependencies (if needed)
```bash
npm install
```

3. Start Expo development server
```bash
npm start
```

4. Choose platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator  
   - Press `w` for web browser
   - Scan QR with Expo Go app for physical device

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### Dependency issues
```bash
rm -rf node_modules
npm install
```

### Expo cache issues
```bash
npx expo start -c
```
