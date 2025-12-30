import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl
    || process.env.EXPO_PUBLIC_API_URL
    || 'http://localhost:3001/api';

// ============ TYPES ============

export interface Doctor {
    _id: string;
    userId: {
        _id: string;
        name: string;
        phone: string;
        avatar?: string;
    };
    doctorId?: number;
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    bio?: string;
    photoUrl?: string;
    availableSlots: {
        day: number;
        startTime: string;
        endTime: string;
    }[];
}

export interface PatientAppointment {
    _id: string;
    patientId: string;
    doctorId: {
        _id: string;
        userId: {
            _id: string;
            name: string;
            phone: string;
        };
        specialization: string;
        photoUrl?: string;
        consultationFee: number;
    };
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
}

export interface PatientStats {
    totalBookings: number;
    upcomingBookings: number;
    completedConsultations: number;
    totalSpent: number;
    savedAmount: number;
    doctorsConsulted: number;
}

interface PatientContextType {
    appointments: PatientAppointment[];
    upcomingAppointments: PatientAppointment[];
    pastAppointments: PatientAppointment[];
    stats: PatientStats;
    isLoading: boolean;
    error: string | null;
    fetchAppointments: () => Promise<void>;
    cancelAppointment: (id: string) => Promise<boolean>;
    bookAppointment: (data: BookingData) => Promise<{ success: boolean; data?: PatientAppointment; error?: string }>;
    refreshAll: () => Promise<void>;
}

interface BookingData {
    doctorId: string;
    date: string;
    timeSlot: { start: string; end: string };
    type: 'video' | 'clinic' | 'home';
    symptoms?: string;
}

const defaultStats: PatientStats = {
    totalBookings: 0,
    upcomingBookings: 0,
    completedConsultations: 0,
    totalSpent: 0,
    savedAmount: 0,
    doctorsConsulted: 0,
};

const PatientContext = createContext<PatientContextType | null>(null);

export const usePatient = () => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatient must be used within PatientProvider');
    }
    return context;
};

interface PatientProviderProps {
    children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
    const { user, token, isAuthenticated, isGuest } = useAuth();
    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [stats, setStats] = useState<PatientStats>(defaultStats);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API request helper
    const apiRequest = useCallback(async <T,>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Patient API Error:', err);
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // Fetch all appointments
    const fetchAppointments = useCallback(async () => {
        if (!user?.id || isGuest) return;

        setIsLoading(true);
        const result = await apiRequest<PatientAppointment[]>(`/appointments/patient/${user.id}`);
        
        if (result.success && result.data) {
            setAppointments(result.data);
            
            // Calculate stats
            const now = new Date();
            const upcoming = result.data.filter(a => 
                new Date(a.date) >= now && 
                a.status !== 'cancelled' && 
                a.status !== 'completed'
            );
            const completed = result.data.filter(a => a.status === 'completed');
            const uniqueDoctors = new Set(result.data.map(a => a.doctorId._id));
            const totalSpent = result.data
                .filter(a => a.paymentStatus === 'paid')
                .reduce((sum, a) => sum + a.amount, 0);

            setStats({
                totalBookings: result.data.length,
                upcomingBookings: upcoming.length,
                completedConsultations: completed.length,
                totalSpent,
                savedAmount: 0, // Can calculate discounts if applicable
                doctorsConsulted: uniqueDoctors.size,
            });
        }
        setIsLoading(false);
    }, [user?.id, isGuest, apiRequest]);

    // Get upcoming appointments
    const upcomingAppointments = appointments.filter(a => {
        const aptDate = new Date(a.date);
        const now = new Date();
        return aptDate >= now && a.status !== 'cancelled' && a.status !== 'completed';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get past appointments
    const pastAppointments = appointments.filter(a => {
        const aptDate = new Date(a.date);
        const now = new Date();
        return aptDate < now || a.status === 'completed' || a.status === 'cancelled';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Cancel appointment
    const cancelAppointment = useCallback(async (id: string): Promise<boolean> => {
        const result = await apiRequest(`/appointments/${id}/cancel`, {
            method: 'POST',
        });

        if (result.success) {
            setAppointments(prev => prev.map(a => 
                a._id === id ? { ...a, status: 'cancelled' as const } : a
            ));
            return true;
        }
        return false;
    }, [apiRequest]);

    // Book new appointment
    const bookAppointment = useCallback(async (data: BookingData): Promise<{ success: boolean; data?: PatientAppointment; error?: string }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await apiRequest<PatientAppointment>('/appointments', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                patientId: user.id,
            }),
        });

        if (result.success && result.data) {
            // Refresh appointments list
            await fetchAppointments();
        }

        return result;
    }, [user?.id, apiRequest, fetchAppointments]);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await fetchAppointments();
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [fetchAppointments]);

    // Load appointments when user changes
    useEffect(() => {
        if (isAuthenticated && !isGuest && user?.role === 'patient') {
            refreshAll();
        } else {
            setAppointments([]);
            setStats(defaultStats);
        }
    }, [isAuthenticated, isGuest, user?.role, user?.id]);

    return (
        <PatientContext.Provider
            value={{
                appointments,
                upcomingAppointments,
                pastAppointments,
                stats,
                isLoading,
                error,
                fetchAppointments,
                cancelAppointment,
                bookAppointment,
                refreshAll,
            }}
        >
            {children}
        </PatientContext.Provider>
    );
};
