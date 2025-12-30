// User Roles
export const USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Appointment Status
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
} as const;

// Consultation Types
export const CONSULTATION_TYPES = {
    VIDEO: 'video',
    CLINIC: 'clinic',
    HOME: 'home',
} as const;

// Medical Specialties
export const SPECIALTIES = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedist',
    'Neurologist',
    'Psychiatrist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
    'Urologist',
] as const;

// ============================================
// DESIGN SYSTEM v1.0
// ============================================

// Colors - Complete Design System Palette
export const COLORS = {
    // Primary Blue - Trust, Healthcare
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryMuted: '#dbeafe',
    
    // Legacy (for backward compatibility)
    primaryOld: '#197fe6',
    primaryDarkOld: '#1466b8',
    
    // Success Green - Health, Verified
    success: '#10b981',
    successLight: '#ecfdf5',
    
    // Warning Amber - Pending, Attention
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    
    // Error Red - Danger, Cancel
    error: '#ef4444',
    errorLight: '#fef2f2',
    
    // Secondary (Accent)
    secondary: '#34d399',
    accent: '#f9f506',
    
    // Neutral Slate Scale
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate600: '#475569',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9',
    slate50: '#f8fafc',
    
    // Surface Colors
    white: '#ffffff',
    background: '#f8fafc',
    backgroundDark: '#0F172A',
    surface: '#ffffff',
    surfaceDark: '#1E293B',
    
    // Text Colors (semantic)
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textPlaceholder: '#94a3b8',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
    // Headlines
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26 },
    
    // Body
    bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    
    // Labels & Captions
    label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
    caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
    captionSmall: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// Spacing Scale
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
} as const;

// Border Radius
export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
} as const;

// Component Sizes
export const SIZES = {
    // Touch targets (minimum 44px for accessibility)
    touchMin: 44,
    
    // Buttons
    buttonSm: 40,
    buttonMd: 48,
    buttonLg: 56,
    
    // Inputs
    inputHeight: 48,
    searchHeight: 48,
    
    // Avatars
    avatarXs: 32,
    avatarSm: 40,
    avatarMd: 48,
    avatarLg: 64,
    avatarXl: 80,
    avatar2xl: 96,
    
    // Icons
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    iconXl: 32,
} as const;

// Status Badge Colors
export const STATUS_COLORS = {
    verified: { bg: '#ecfdf5', text: '#10b981', border: '#10b981' },
    pending: { bg: '#fffbeb', text: '#f59e0b', border: '#f59e0b' },
    confirmed: { bg: '#eff6ff', text: '#2563eb', border: '#2563eb' },
    cancelled: { bg: '#fef2f2', text: '#ef4444', border: '#ef4444' },
    completed: { bg: '#ecfdf5', text: '#10b981', border: '#10b981' },
    inProgress: { bg: '#eff6ff', text: '#2563eb', border: '#2563eb' },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        REFRESH: '/auth/refresh',
    },
    USERS: {
        PROFILE: '/users/profile',
        UPDATE: '/users/update',
    },
    DOCTORS: {
        LIST: '/doctors',
        DETAIL: '/doctors/:id',
        SEARCH: '/doctors/search',
    },
    APPOINTMENTS: {
        CREATE: '/appointments',
        LIST: '/appointments',
        DETAIL: '/appointments/:id',
        CANCEL: '/appointments/:id/cancel',
    },
} as const;
