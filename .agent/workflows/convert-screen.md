---
description: Convert web-admin React screen to React Native for mobile-patient app
---

# Screen Conversion Workflow (Web → React Native)

## Prerequisites
- Source screen exists in `apps/web-admin/src/screens/`
- Target location determined in `apps/mobile-patient/app/`

## Conversion Steps

### 1. Analyze Source Screen
- Read the web-admin screen file
- Identify all UI components and their structure
- Note any navigation, state, or API calls

### 2. Component Mapping
Replace HTML elements with React Native equivalents:

| Web (React)          | Mobile (React Native)        |
|----------------------|------------------------------|
| `<div>`              | `<View>`                     |
| `<span>`, `<p>`, `<h1-6>` | `<Text>`                |
| `<button>`           | `<TouchableOpacity>`         |
| `<img>`              | `<Image>`                    |
| `<input>`            | `<TextInput>`                |
| `<a>`, `<Link>`      | `<Link>` (expo-router)       |
| `onClick`            | `onPress`                    |

### 3. Styling Conversion
- Keep TailwindCSS classes (NativeWind compatible)
- Replace web-only classes:
  - `hover:*` → remove (no hover on mobile)
  - `cursor-pointer` → remove
  - `backdrop-blur-*` → may not work, use opacity instead
- Add `className` to `<Text>` components for text styling

### 4. Icon Replacement
Replace Material Symbols with Expo Vector Icons:
```tsx
// Web
<span className="material-symbols-outlined">home</span>

// Mobile
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="home" size={24} color="#197fe6" />
```

### 5. Navigation Conversion
```tsx
// Web
import { useNavigate, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate('/patient/home');

// Mobile
import { useRouter, Link } from 'expo-router';
const router = useRouter();
router.push('/(tabs)/home');
```

### 6. Required Imports Template
```tsx
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
```

### 7. Wrap with SafeAreaView
Always wrap screen content:
```tsx
<SafeAreaView className="flex-1 bg-slate-50">
  {/* Screen content */}
</SafeAreaView>
```

### 8. Verify & Test
// turbo
- Run `cd apps/mobile-patient && npm start`
- Check for TypeScript errors
- Verify visual appearance matches web version
