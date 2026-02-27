// User types
export interface User {
    id: string;
    phone: string;
    name: string;
    email?: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export interface Patient extends User {
    role: 'patient';
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    emergencyContact?: string;
}

export interface Doctor extends User {
    role: 'doctor';
    specialization: string;
    qualification: string;
    experience: number; // years
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    availableSlots?: TimeSlot[];
}

// Appointment types
export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    date: Date;
    timeSlot: TimeSlot;
    type: 'video' | 'clinic' | 'home';
    status: AppointmentStatus;
    symptoms?: string;
    notes?: string;
    prescription?: string;
    amount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    createdAt: Date;
}

export type AppointmentStatus =
    | 'pending'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';

export interface TimeSlot {
    start: string; // HH:mm format
    end: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
}
