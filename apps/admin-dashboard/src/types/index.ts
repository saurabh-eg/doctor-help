// User types
export interface User {
    _id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'admin';
    isVerified: boolean;
    isSuspended?: boolean;
    suspendedReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Doctor types
export interface Doctor {
    _id: string;
    userId: User;
    doctorId?: number;
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    verifiedAt?: string;
    rejectionReason?: string;
    bio?: string;
    photoUrl?: string;
    documents?: string[];
    availableSlots: {
        day: number;
        startTime: string;
        endTime: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

// Appointment types
export interface Appointment {
    _id: string;
    patientId: User;
    doctorId: Doctor;
    date: string;
    timeSlot: {
        start: string;
        end: string;
    };
    type: 'video' | 'clinic' | 'home';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    symptoms?: string;
    notes?: string;
    prescription?: string;
    amount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    meetingLink?: string;
    createdAt: string;
    updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
    users: {
        total: number;
        patients: number;
        doctors: number;
    };
    doctors: {
        total: number;
        verified: number;
        pendingVerification: number;
    };
    appointments: {
        total: number;
        today: number;
        thisMonth: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
    };
    revenue: {
        thisMonth: number;
        lastMonth: number;
        growth: string | number;
    };
    recentAppointments: Appointment[];
}

// Pagination
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// API Response
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: Pagination;
}
