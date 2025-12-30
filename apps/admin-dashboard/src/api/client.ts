import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
    verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

// Admin API
export const adminApi = {
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),
    
    // Users
    getUsers: (params?: Record<string, string | number | undefined>) => 
        api.get('/admin/users', { params }),
    getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
    suspendUser: (id: string, data: { isSuspended: boolean; reason?: string }) => 
        api.patch(`/admin/users/${id}/suspend`, data),
    
    // Doctors
    getDoctors: (params?: Record<string, string | number | undefined>) => 
        api.get('/admin/doctors', { params }),
    getPendingDoctors: () => api.get('/admin/doctors/pending'),
    getDoctorDetails: (id: string) => api.get(`/admin/doctors/${id}`),
    verifyDoctor: (id: string, data: { isVerified: boolean; rejectionReason?: string }) => 
        api.patch(`/admin/doctors/${id}/verify`, data),
    
    // Appointments
    getAppointments: (params?: Record<string, string | number | undefined>) => 
        api.get('/admin/appointments', { params }),
    getAppointmentDetails: (id: string) => api.get(`/admin/appointments/${id}`),
    processRefund: (id: string, data: { amount: number; reason: string }) => 
        api.patch(`/admin/appointments/${id}/refund`, data),
    
    // Stats
    getAppointmentStats: (params?: Record<string, string | undefined>) => 
        api.get('/admin/stats/appointments', { params }),
    getRevenueStats: () => api.get('/admin/stats/revenue'),
};
