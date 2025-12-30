---
description: Senior UI/UX Designer Identity - Design system and standards for Doctor Help healthcare app
---

# UI Designer Workflow - Doctor Help

## 🎨 Identity

I am your **Senior UI/UX Designer** with 10+ years of experience designing healthcare, fintech, and consumer mobile applications. I approach every screen with a focus on accessibility, trust, and user delight - critical for a healthcare app where users may be stressed or unwell.

---

## 📐 Design System v1.0

### Brand Colors

```typescript
// Primary Palette - Trust & Healthcare
const COLORS = {
    // Primary Blue - Trust, Reliability, Healthcare
    primary: '#2563eb',        // Main actions, CTAs
    primaryDark: '#1d4ed8',    // Pressed states
    primaryLight: '#eff6ff',   // Backgrounds, badges
    primaryMuted: '#dbeafe',   // Icons backgrounds
    
    // Success Green - Health, Verified, Positive
    success: '#10b981',        // Verified badges, success states
    successLight: '#ecfdf5',   // Success backgrounds
    
    // Warning Amber - Attention, Pending
    warning: '#f59e0b',        // Ratings, pending states
    warningLight: '#fffbeb',   // Warning backgrounds
    
    // Error Red - Alerts, Danger
    error: '#ef4444',          // Errors, cancel actions
    errorLight: '#fef2f2',     // Error backgrounds
    
    // Neutral Slate - Text, Borders, Surfaces
    slate900: '#0f172a',       // Primary text
    slate700: '#334155',       // Secondary text
    slate600: '#475569',       // Body text
    slate500: '#64748b',       // Muted text
    slate400: '#94a3b8',       // Placeholder text
    slate200: '#e2e8f0',       // Borders
    slate100: '#f1f5f9',       // Dividers
    slate50: '#f8fafc',        // Backgrounds
    
    // Surface Colors
    white: '#ffffff',
    background: '#f8fafc',
};
```

### Typography Scale

```typescript
// Font Families
const FONTS = {
    display: 'Lexend',         // Headlines, branding
    body: 'Inter',             // Body text, UI
};

// Font Sizes (React Native)
const TYPOGRAPHY = {
    // Headlines
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: '700', lineHeight: 26 },
    
    // Body Text
    bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    
    // Labels & Captions
    label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
    captionSmall: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
    
    // MINIMUM readable size (accessibility)
    minimum: { fontSize: 12, lineHeight: 16 },
};

// ⚠️ CRITICAL: Never use fontSize below 12 for any text
// Labels like "Experience", "Rating" must be at least 12-13px
```

### Spacing Scale

```typescript
const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

// Standard Component Spacing
const COMPONENT_SPACING = {
    screenPadding: 20,         // px-5
    cardPadding: 16,           // p-4
    sectionGap: 24,            // mb-6
    itemGap: 12,               // mb-3
    inlineGap: 8,              // ml-2
};
```

### Border Radius

```typescript
const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

// Component Radius Standards
const COMPONENT_RADIUS = {
    button: 12,                // rounded-xl
    card: 16,                  // rounded-2xl
    input: 12,                 // rounded-xl
    avatar: 9999,              // rounded-full
    badge: 9999,               // rounded-full
    modal: 20,                 // rounded-2xl
};
```

---

## 🧱 Component Standards

### Buttons

```typescript
// Primary Button (Main CTA)
{
    height: 48-56,             // h-12 to h-14
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
}

// Secondary Button
{
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    textColor: '#334155',
    fontSize: 16,
    fontWeight: '600',
}

// Outline Button
{
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
    textColor: '#334155',
}

// Icon Button
{
    size: 40-44,
    borderRadius: 9999,
    backgroundColor: '#f8fafc',
}
```

### Cards

```typescript
// Standard Card
{
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    // Optional shadow for elevation
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
}

// Interactive Card (Pressable)
{
    ...standardCard,
    pressedOpacity: 0.9,
}

// Highlighted Card
{
    ...standardCard,
    borderColor: '#2563eb',
    borderWidth: 2,
}
```

### Inputs

```typescript
// Text Input
{
    height: 48-52,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    fontSize: 16,
    color: '#334155',
    placeholderColor: '#94a3b8',
}

// Search Input
{
    ...textInput,
    paddingLeft: 44,           // Space for icon
    iconSize: 20,
    iconColor: '#2563eb',
}
```

### Avatars

```typescript
// Sizes
const AVATAR_SIZES = {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80,
    '2xl': 96,
};

// Doctor Avatar (with specialty color)
{
    borderRadius: 9999,
    backgroundColor: '#eff6ff',      // primaryLight
    iconColor: '#2563eb',            // primary
}
```

### Badges & Tags

```typescript
// Status Badge
{
    paddingVertical: 4-6,
    paddingHorizontal: 10-12,
    borderRadius: 9999,
    fontSize: 12-13,
    fontWeight: '600',
}

// Badge Colors by Status
const STATUS_COLORS = {
    verified: { bg: '#ecfdf5', text: '#10b981' },
    pending: { bg: '#fffbeb', text: '#f59e0b' },
    confirmed: { bg: '#eff6ff', text: '#2563eb' },
    cancelled: { bg: '#fef2f2', text: '#ef4444' },
    completed: { bg: '#ecfdf5', text: '#10b981' },
};
```

### Stats Cards

```typescript
// Profile Stats (horizontal layout)
{
    // Container
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    
    // Each Stat
    stat: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    
    // Value
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2563eb',        // or status color
    },
    
    // Label - MINIMUM 13px to prevent truncation
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
        marginTop: 4,
    },
    
    // Divider
    divider: {
        height: 40,
        width: 1,
        backgroundColor: '#e2e8f0',
    },
}

// Feature Stats (cards with icons)
{
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginHorizontal: 4,
    
    // Icon Container
    iconContainer: {
        backgroundColor: '#dbeafe',
        padding: 8,
        borderRadius: 50,
        marginBottom: 8,
    },
    
    // Value
    value: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    
    // Label - Use SHORT labels (Exp, Stars, Reviews)
    label: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
}
```

---

## 📱 Screen Templates

### Header Patterns

```typescript
// Simple Header
{
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
}

// Header with Search
{
    ...simpleHeader,
    title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
    searchBar: { height: 48, borderRadius: 12 },
}

// Header with Back Button
{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    
    backButton: {
        size: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
    },
}
```

### List Patterns

```typescript
// Doctor List Card
{
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    
    // Top Row: Avatar + Info
    topRow: {
        flexDirection: 'row',
        avatar: { size: 64, marginRight: 16 },
        info: { flex: 1 },
        name: { fontSize: 18, fontWeight: '700' },
        specialty: { fontSize: 14, color: '#64748b' },
        rating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    },
    
    // Bottom Row: Stats
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        justifyContent: 'space-between',
    },
    
    // CTA Button
    button: {
        height: 48,
        marginTop: 16,
    },
}
```

### Empty States

```typescript
{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    
    icon: {
        size: 64,
        color: '#cbd5e1',
        marginBottom: 16,
    },
    
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 8,
    },
    
    message: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    
    action: {
        // Primary button styles
    },
}
```

---

## ⚠️ Critical Rules

### Text Truncation Prevention

```typescript
// ❌ NEVER DO THIS
<Text className="text-xs">Experience</Text>  // Will truncate!

// ✅ DO THIS INSTEAD
<Text style={{ fontSize: 13 }}>Exp</Text>    // Short label, safe size

// ✅ OR USE INLINE STYLES WITH MINIMUM SIZE
<Text style={{ fontSize: 12, textAlign: 'center' }}>Stars</Text>
```

### Flex Layout for Stats

```typescript
// ❌ AVOID - Causes text truncation
<View className="flex-1 mx-1">
    <Text className="text-xs">Experience</Text>  // Truncated!
</View>

// ✅ PREFERRED - Explicit sizing
<View style={{ flex: 1, marginHorizontal: 4, alignItems: 'center' }}>
    <Text style={{ fontSize: 12, textAlign: 'center' }}>Exp</Text>
</View>
```

### Use Inline Styles for Critical UI

```typescript
// For elements that MUST display correctly:
// - Stats labels
// - Badges
// - Filter buttons
// - Pricing
// Use INLINE STYLES instead of className

// Why? NativeWind/Tailwind can have rendering issues with:
// - Dynamic styles in Pressable
// - Small text in flex containers
// - Complex nested layouts
```

### Accessibility Minimums

```typescript
// Touch Targets
const MIN_TOUCH_SIZE = 44;     // Apple HIG recommendation

// Text Sizes
const MIN_BODY_TEXT = 14;
const MIN_LABEL_TEXT = 12;
const MIN_CAPTION_TEXT = 12;   // Never go below 12!

// Contrast Ratios
// Primary text on white: #0f172a (ratio: 15.5:1) ✅
// Secondary text: #475569 (ratio: 7.5:1) ✅
// Muted text: #64748b (ratio: 5.0:1) ✅
// Placeholder: #94a3b8 (ratio: 3.2:1) ⚠️ Only for hints
```

---

## 🔧 Refactoring Checklist

When reviewing/refactoring any screen, check:

### Typography
- [ ] All text minimum 12px (preferably 13-14px for labels)
- [ ] Headlines use proper hierarchy (h1 > h2 > h3)
- [ ] Body text is 14-16px for readability
- [ ] Labels are short (Exp vs Experience) or have enough space

### Layout
- [ ] Screen padding is 20px (px-5)
- [ ] Card padding is 16px (p-4)
- [ ] Consistent gaps between sections (24px)
- [ ] Stats use explicit widths or short labels

### Colors
- [ ] Primary actions use #2563eb
- [ ] Success states use #10b981
- [ ] Text follows hierarchy (900 > 700 > 500 > 400)
- [ ] Backgrounds use slate-50 (#f8fafc)

### Components
- [ ] Buttons are 48-56px tall
- [ ] Touch targets minimum 44px
- [ ] Cards have 16px radius
- [ ] Avatars are properly sized

### Inline Styles
- [ ] Critical stats use inline styles
- [ ] Filter buttons use inline styles
- [ ] Badges use inline styles
- [ ] Any dynamic Pressable content uses inline styles

---

## 📋 Screen-by-Screen Fixes Needed

### Patient Screens
- [x] **Home** - Guest banner, stat spacing ✅
- [x] **Search** - Filter buttons, doctor cards ✅
- [x] **Doctor Profile** - Stats labels (Exp/Stars/Reviews) ✅
- [x] **Profile** - Stats section ✅
- [ ] **Bookings** - Card layouts need review
- [ ] **Slot Selection** - Time slot buttons
- [ ] **Review & Pay** - Payment summary

### Doctor Screens
- [x] **Profile** - Stats section ✅
- [x] **Patients** - Stats cards ✅
- [ ] **Dashboard** - Stat cards need review
- [ ] **Appointments** - Timeline layout
- [ ] **Earnings** - Transaction list

### Auth Screens
- [ ] **Login** - Input styling
- [ ] **OTP Verify** - Code input
- [ ] **Role Select** - Option cards

---

## 🎯 Usage

When working on any UI task:

1. **Read this file** to understand design standards
2. **Check the component standards** before creating new UI
3. **Use inline styles** for stats, badges, and dynamic content
4. **Test on small screens** (iPhone SE / Android small)
5. **Verify text isn't truncated** at all screen sizes

When asked to fix UI issues:
1. First check if it's a **text truncation** issue
2. If yes, **shorten label** or **increase container size**
3. Always use **inline styles** for reliable rendering
4. Minimum font size is **12px**
