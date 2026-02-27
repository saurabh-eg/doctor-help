# Add Logo to Flutter App

## Steps to add your logo:

1. **Save your logo file:**
   - Save the logo image as `logo.png`
   - Place it in: `apps/flutter_app/assets/images/logo.png`

2. **The logo is already configured in `pubspec.yaml`:**
   ```yaml
   assets:
     - assets/images/
   ```

3. **Logo is now being used in:**
   - ✅ Login screen (120x120 px)
   - ✅ Home screen header (40x40 px in navbar)
   - ✅ Any screen can now use the `AppLogo()` widget

## Using the Logo Widget

Import and use anywhere in your app:

```dart
import '../../widgets/app_logo.dart';

// With text
AppLogo(size: 100, showText: true)

// Icon only
AppLogo(size: 40, showText: false)
```

## Fallback Behavior

If the logo image is not found, it automatically shows the hospital icon as a fallback, so the app won't break.
