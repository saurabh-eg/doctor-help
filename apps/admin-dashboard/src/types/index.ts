// User types
export interface User {
    _id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'admin' | 'lab';
    isVerified: boolean;
    isSuspended?: boolean;
    suspendedReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LabRegistrationDocument {
    documentType:
        | 'registration_certificate'
        | 'government_id'
        | 'nabl_certificate'
        | 'pan_card'
        | 'other';
    documentUrl: string;
    originalFileName?: string;
    uploadedAt?: string;
}

export interface LabRegistrationRequest {
    _id: string;
    labName: string;
    contactName: string;
    phone: string;
    alternateContactPhone?: string;
    email?: string;
    address: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    isNablCertified: boolean;
    verificationDocuments: LabRegistrationDocument[];
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    decidedBy?: string;
    decidedAt?: string;
    approvedUserId?: string;
    approvedLabId?: string;
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
    documents?: string[]; // Array of document URLs
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
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
    symptoms?: string;
    notes?: string;
    prescription?: string;
    amount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    meetingLink?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LabOrderPatientProfile {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    relationship?: string;
}

export interface LabOrderItem {
    itemType: 'test' | 'package';
    itemId: string;
    name: string;
    price: number;
}

export interface LabOrder {
    _id: string;
    userId: string;
    labId: {
        _id: string;
        name: string;
        phone?: string;
        address?: {
            line1?: string;
            city?: string;
            state?: string;
            pincode?: string;
        };
    };
    patientProfile: LabOrderPatientProfile;
    items: LabOrderItem[];
    prescriptionUrl?: string;
    preparationInstructions: string[];
    collector?: {
        name: string;
        phone: string;
        eta?: string;
        assignedAt?: string;
    };
    sampleCollectedAt?: string;
    reportUrl?: string;
    reportUploadedAt?: string;
    slotDate: string;
    slotTime: string;
    homeCollection: boolean;
    address: string;
    amount: number;
    status:
        | 'created'
        | 'payment_pending'
        | 'confirmed'
        | 'collector_assigned'
        | 'collector_on_the_way'
        | 'sample_collected'
        | 'processing'
        | 'report_ready'
        | 'completed'
        | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface AdminLab {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    address: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    rating: number;
    ratingCount: number;
    isNablCertified: boolean;
    isActive: boolean;
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

export interface AdminNotification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    relatedId?: string;
    relatedModel?: 'Appointment' | 'LabOrder' | 'Payment';
    createdAt: string;
    updatedAt: string;
}

export interface NotificationPreferences {
    _id?: string;
    userId?: string;
    categories: {
        appointments: boolean;
        labOrders: boolean;
        payments: boolean;
        system: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
    };
    mutedTypes: string[];
    createdAt?: string;
    updatedAt?: string;
}
