---
description: Run Flutter mobile app
---

# Run Flutter App

## Prerequisites
- Flutter SDK 3.10+
- Android Studio / Xcode
- Backend API running

## Steps

### 1. Navigate to Flutter app
```bash
cd apps/flutter_app
```

### 2. Get dependencies
```bash
flutter pub get
```

### 3. Run the app

**Android Emulator:**
```bash
flutter run
```

**iOS Simulator:**
```bash
flutter run -d ios
```

**Specific Device:**
```bash
flutter devices  # List devices
flutter run -d <device-id>
```

### 4. Hot Reload
- Press `r` in terminal for hot reload
- Press `R` for hot restart

## Common Issues

### "Connection refused" error
- Make sure backend is running: `cd services/api && npm run dev`
- For emulator, API uses `10.0.2.2:3001` (maps to localhost)

### "No doctors found"
- Seed the database: `cd services/api && npm run seed:doctors`

### Build errors
```bash
flutter clean
flutter pub get
flutter run
```

## Build Commands

```bash
# Android APK (debug)
flutter build apk --debug

# Android APK (release)
flutter build apk --release

# Android App Bundle
flutter build appbundle

# iOS
flutter build ios
```
