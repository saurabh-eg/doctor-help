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
    sendOtp: (phone: string) => api.post('/auth/send-otp', { mobile: phone }),
    verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { mobile: phone, otp }),
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

    // Lab Orders
    getLabOrders: (params?: Record<string, string | number | undefined>) =>
        api.get('/admin/lab-orders', { params }),
    getLabOrderDetails: (id: string) => api.get(`/admin/lab-orders/${id}`),
    updateLabOrderStatus: (id: string, data: { status: string; overrideReason: string }) =>
        api.patch(`/admin/lab-orders/${id}/status`, data),
    assignLabCollector: (
        id: string,
        data: { collectorName: string; collectorPhone: string; collectorEta?: string; overrideReason: string }
    ) => api.patch(`/admin/lab-orders/${id}/collector`, data),
    uploadLabReport: (id: string, file: File, overrideReason: string) => {
        const formData = new FormData();
        formData.append('report', file);
        formData.append('overrideReason', overrideReason);
        return api.post(`/admin/lab-orders/${id}/report`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getLabs: (params?: Record<string, string | number | undefined>) =>
        api.get('/admin/labs', { params }),
    updateLabStatus: (id: string, data: { isActive: boolean }) =>
        api.patch(`/admin/labs/${id}/status`, data),

    // Lab Registration Requests
    getLabRegistrationRequests: (params?: Record<string, string | number | undefined>) =>
        api.get('/admin/lab-registration-requests', { params }),
    reviewLabRegistrationRequest: (
        id: string,
        data: { decision: 'approve' | 'reject'; rejectionReason?: string }
    ) => api.patch(`/admin/lab-registration-requests/${id}/decision`, data),

    // Demo Payments
    initiateDemoPayment: (data: {
        appointmentId?: string;
        amount: number;
        currency?: string;
        purpose?: string;
    }) => api.post('/payments/initiate', data),
    getPaymentStatus: (paymentId: string) => api.get(`/payments/${paymentId}`),

    // Notifications
    getNotifications: (params?: Record<string, string | number | boolean | undefined>) =>
        api.get('/notifications', { params }),
    getNotificationsUnreadCount: () => api.get('/notifications/unread-count'),
    markNotificationAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllNotificationsAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
    deleteAllNotifications: () => api.delete('/notifications'),
    getNotificationPreferences: () => api.get('/notifications/preferences'),
    updateNotificationPreferences: (data: {
        categories?: {
            appointments?: boolean;
            labOrders?: boolean;
            payments?: boolean;
            system?: boolean;
        };
        quietHours?: {
            enabled?: boolean;
            start?: string;
            end?: string;
            timezone?: string;
        };
        mutedTypes?: string[];
    }) => api.put('/notifications/preferences', data),
    
    // Stats
    getAppointmentStats: (params?: Record<string, string | undefined>) => 
        api.get('/admin/stats/appointments', { params }),
    getRevenueStats: () => api.get('/admin/stats/revenue'),
};
