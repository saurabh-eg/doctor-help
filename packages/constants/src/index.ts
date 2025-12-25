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

// Colors (Design System)
export const COLORS = {
    primary: '#197fe6',
    primaryDark: '#1466b8',
    primaryLight: '#eaf4ff',
    secondary: '#34d399',
    accent: '#f9f506',
    backgroundLight: '#F8FAFC',
    backgroundDark: '#0F172A',
    surfaceLight: '#ffffff',
    surfaceDark: '#1E293B',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
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
