import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl
    || process.env.EXPO_PUBLIC_API_URL
    || 'http://localhost:3001/api';

// ============ TYPES ============

export interface DoctorProfile {
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
    documents?: string[];
    availableSlots: {
        day: number;
        startTime: string;
        endTime: string;
    }[];
}

export interface DoctorAppointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        phone: string;
        avatar?: string;
    };
    doctorId: string;
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

export interface DoctorStats {
    totalPatients: number;
    todayAppointments: number;
    pendingAppointments: number;
    totalEarnings: number;
    thisMonthEarnings: number;
    completedAppointments: number;
}

interface DoctorContextType {
    profile: DoctorProfile | null;
    appointments: DoctorAppointment[];
    todayAppointments: DoctorAppointment[];
    stats: DoctorStats;
    isLoading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    fetchAppointments: (date?: string) => Promise<void>;
    fetchStats: () => Promise<void>;
    updateAppointmentStatus: (id: string, status: DoctorAppointment['status']) => Promise<boolean>;
    updateAvailability: (slots: DoctorProfile['availableSlots']) => Promise<boolean>;
    refreshAll: () => Promise<void>;
}

const defaultStats: DoctorStats = {
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    completedAppointments: 0,
};

const DoctorContext = createContext<DoctorContextType | null>(null);

export const useDoctor = () => {
    const context = useContext(DoctorContext);
    if (!context) {
        throw new Error('useDoctor must be used within DoctorProvider');
    }
    return context;
};

interface DoctorProviderProps {
    children: ReactNode;
}

export const DoctorProvider: React.FC<DoctorProviderProps> = ({ children }) => {
    const { user, token, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<DoctorAppointment[]>([]);
    const [stats, setStats] = useState<DoctorStats>(defaultStats);
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
            console.error('Doctor API Error:', err);
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // Fetch doctor profile
    const fetchProfile = useCallback(async () => {
        if (!user?.id || user.role !== 'doctor') return;

        const result = await apiRequest<DoctorProfile>(`/doctors/user/${user.id}`);
        if (result.success && result.data) {
            setProfile(result.data);
        }
    }, [user?.id, user?.role, apiRequest]);

    // Fetch appointments for a specific date or all
    const fetchAppointments = useCallback(async (date?: string) => {
        if (!profile?._id) return;

        const query = date ? `?date=${date}` : '';
        const result = await apiRequest<DoctorAppointment[]>(`/appointments/doctor/${profile._id}${query}`);
        
        if (result.success && result.data) {
            if (date) {
                setTodayAppointments(result.data);
            } else {
                setAppointments(result.data);
            }
        }
    }, [profile?._id, apiRequest]);

    // Calculate stats from appointments
    const fetchStats = useCallback(async () => {
        if (!profile?._id) return;

        // Fetch all appointments for this doctor
        const result = await apiRequest<DoctorAppointment[]>(`/appointments/doctor/${profile._id}`);
        
        if (result.success && result.data) {
            const allAppointments = result.data;
            const today = new Date().toDateString();
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();

            // Calculate stats
            const uniquePatients = new Set(allAppointments.map(a => a.patientId._id));
            const todayApts = allAppointments.filter(a => new Date(a.date).toDateString() === today);
            const pending = allAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
            const completed = allAppointments.filter(a => a.status === 'completed');
            
            // Earnings - sum of paid appointments
            const paidAppointments = allAppointments.filter(a => a.paymentStatus === 'paid');
            const totalEarnings = paidAppointments.reduce((sum, a) => sum + a.amount, 0);
            
            const thisMonthPaid = paidAppointments.filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            });
            const thisMonthEarnings = thisMonthPaid.reduce((sum, a) => sum + a.amount, 0);

            setStats({
                totalPatients: uniquePatients.size,
                todayAppointments: todayApts.length,
                pendingAppointments: pending.length,
                totalEarnings,
                thisMonthEarnings,
                completedAppointments: completed.length,
            });

            setTodayAppointments(todayApts);
            setAppointments(allAppointments);
        }
    }, [profile?._id, apiRequest]);

    // Update appointment status
    const updateAppointmentStatus = useCallback(async (id: string, status: DoctorAppointment['status']): Promise<boolean> => {
        const result = await apiRequest(`/appointments/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        if (result.success) {
            // Update local state
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
            setTodayAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
            return true;
        }
        return false;
    }, [apiRequest]);

    // Update availability
    const updateAvailability = useCallback(async (slots: DoctorProfile['availableSlots']): Promise<boolean> => {
        if (!profile?._id) return false;

        const result = await apiRequest(`/doctors/${profile._id}/availability`, {
            method: 'PATCH',
            body: JSON.stringify({ slots }),
        });

        if (result.success) {
            setProfile(prev => prev ? { ...prev, availableSlots: slots } : null);
            return true;
        }
        return false;
    }, [profile?._id, apiRequest]);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await fetchProfile();
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [fetchProfile]);

    // Load profile when user changes
    useEffect(() => {
        if (isAuthenticated && user?.role === 'doctor') {
            refreshAll();
        } else {
            setProfile(null);
            setAppointments([]);
            setTodayAppointments([]);
            setStats(defaultStats);
        }
    }, [isAuthenticated, user?.role, user?.id]);

    // Load stats when profile is available
    useEffect(() => {
        if (profile?._id) {
            fetchStats();
        }
    }, [profile?._id, fetchStats]);

    return (
        <DoctorContext.Provider
            value={{
                profile,
                appointments,
                todayAppointments,
                stats,
                isLoading,
                error,
                fetchProfile,
                fetchAppointments,
                fetchStats,
                updateAppointmentStatus,
                updateAvailability,
                refreshAll,
            }}
        >
            {children}
        </DoctorContext.Provider>
    );
};
