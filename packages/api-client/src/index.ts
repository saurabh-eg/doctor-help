// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic API response type
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Request options
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

// Token storage (will be set by the app)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

// Base fetch function with error handling
async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (authToken) {
        requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();
        return data as ApiResponse<T>;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// ============ AUTH ENDPOINTS ============

export interface SendOtpResponse {
    debug_otp?: string; // Only in development
}

export interface VerifyOtpResponse {
    token: string;
    user: {
        id: string;
        phone: string;
        name?: string;
        role: 'patient' | 'doctor' | 'admin';
        isNewUser: boolean;
    };
}

export const authApi = {
    sendOtp: (phone: string) =>
        apiRequest<SendOtpResponse>('/auth/send-otp', {
            method: 'POST',
            body: { phone },
        }),

    verifyOtp: (phone: string, otp: string) =>
        apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
            method: 'POST',
            body: { phone, otp },
        }),

    refreshToken: () =>
        apiRequest<{ token: string }>('/auth/refresh', { method: 'POST' }),

    getMe: () =>
        apiRequest<VerifyOtpResponse['user']>('/auth/me'),
};

// ============ USERS ENDPOINTS ============

export interface User {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'admin';
}

export const usersApi = {
    getProfile: (userId: string) =>
        apiRequest<User>(`/users/${userId}`),

    updateProfile: (userId: string, data: Partial<User>) =>
        apiRequest<User>(`/users/${userId}`, {
            method: 'PATCH',
            body: data,
        }),

    setRole: (userId: string, role: 'patient' | 'doctor') =>
        apiRequest<{ role: string }>(`/users/${userId}/role`, {
            method: 'POST',
            body: { role },
        }),
};

// ============ DOCTORS ENDPOINTS ============

export interface Doctor {
    _id: string;
    userId: User;
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    bio?: string;
    availableSlots: {
        day: number;
        startTime: string;
        endTime: string;
    }[];
}

export interface DoctorListParams {
    specialization?: string;
    minRating?: string;
    maxFee?: string;
    page?: string;
    limit?: string;
}

export const doctorsApi = {
    list: (params?: DoctorListParams) => {
        const query = params
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : '';
        return apiRequest<Doctor[]>(`/doctors${query}`);
    },

    search: (q: string, limit = 10) =>
        apiRequest<Doctor[]>(`/doctors/search?q=${q}&limit=${limit}`),

    getById: (doctorId: string) =>
        apiRequest<Doctor>(`/doctors/${doctorId}`),

    register: (data: {
        userId: string;
        specialization: string;
        qualification: string;
        experience: number;
        consultationFee: number;
        bio?: string;
    }) =>
        apiRequest<Doctor>('/doctors/register', {
            method: 'POST',
            body: data,
        }),

    updateAvailability: (doctorId: string, slots: Doctor['availableSlots']) =>
        apiRequest<{ availableSlots: Doctor['availableSlots'] }>(
            `/doctors/${doctorId}/availability`,
            { method: 'PATCH', body: { slots } }
        ),

    getSpecializations: () =>
        apiRequest<string[]>('/doctors/meta/specializations'),
};

// ============ APPOINTMENTS ENDPOINTS ============

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
}

export const appointmentsApi = {
    create: (data: {
        patientId: string;
        doctorId: string;
        date: string;
        timeSlot: { start: string; end: string };
        type: 'video' | 'clinic' | 'home';
        symptoms?: string;
    }) =>
        apiRequest<Appointment>('/appointments', {
            method: 'POST',
            body: data,
        }),

    getForPatient: (patientId: string, upcoming = true) =>
        apiRequest<Appointment[]>(
            `/appointments/patient/${patientId}?upcoming=${upcoming}`
        ),

    getForDoctor: (doctorId: string, date?: string) => {
        const query = date ? `?date=${date}` : '';
        return apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}${query}`);
    },

    getById: (appointmentId: string) =>
        apiRequest<Appointment>(`/appointments/${appointmentId}`),

    updateStatus: (appointmentId: string, status: Appointment['status']) =>
        apiRequest<Appointment>(`/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            body: { status },
        }),

    addNotes: (appointmentId: string, notes?: string, prescription?: string) =>
        apiRequest<Appointment>(`/appointments/${appointmentId}/notes`, {
            method: 'PATCH',
            body: { notes, prescription },
        }),

    cancel: (appointmentId: string) =>
        apiRequest<void>(`/appointments/${appointmentId}/cancel`, {
            method: 'POST',
        }),
};

// Export all APIs
export const api = {
    auth: authApi,
    users: usersApi,
    doctors: doctorsApi,
    appointments: appointmentsApi,
    setToken: setAuthToken,
    getToken: getAuthToken,
};

export default api;
