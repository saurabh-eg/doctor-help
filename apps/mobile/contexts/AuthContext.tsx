import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Configuration - Use environment variable or fallback
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl
    || process.env.EXPO_PUBLIC_API_URL
    || 'http://localhost:3001/api';

interface User {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    role: 'patient' | 'doctor' | 'admin';
    avatar?: string;
    userId?: number;
    isPhoneVerified?: boolean;
    isProfileComplete?: boolean;
    isNewUser?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isGuest: boolean;
}

interface AuthContextType extends AuthState {
    sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; debug_otp?: string }>;
    verifyOtp: (phone: string, otp: string) => Promise<{ 
        success: boolean; 
        error?: string; 
        isNewUser?: boolean;
        user?: User;
    }>;
    setRole: (role: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
    completeProfile: (data: { name: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
    setGuestMode: (enabled: boolean) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    requireAuth: (action: string) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
        isGuest: false,
    });

    // Load saved auth state on mount
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [storedToken, storedUser, storedGuest] = await Promise.all([
                AsyncStorage.getItem('auth_token'),
                AsyncStorage.getItem('auth_user'),
                AsyncStorage.getItem('is_guest'),
            ]);

            if (storedToken && storedUser) {
                const user = JSON.parse(storedUser);
                setState({
                    token: storedToken,
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    isGuest: false,
                });
            } else if (storedGuest === 'true') {
                setState({
                    token: null,
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                    isGuest: true,
                });
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const apiRequest = async (endpoint: string, options: RequestInit = {}, token?: string) => {
        const authToken = token || state.token;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const sendOtp = async (phone: string) => {
        const response = await apiRequest('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        });
        return response;
    };

    const verifyOtp = async (phone: string, otp: string) => {
        const response = await apiRequest('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        });

        if (response.success && response.data) {
            const { token, user } = response.data;

            // Save to storage
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(user));
            await AsyncStorage.removeItem('is_guest');

            setState({
                token,
                user,
                isLoading: false,
                isAuthenticated: true,
                isGuest: false,
            });

            return { 
                success: true, 
                isNewUser: user.isNewUser,
                user
            };
        }

        return { success: false, error: response.error };
    };

    const setRole = async (role: 'patient' | 'doctor') => {
        if (!state.user || !state.token) return { success: false, error: 'Not authenticated' };

        const response = await apiRequest(`/users/${state.user.id}/role`, {
            method: 'POST',
            body: JSON.stringify({ role }),
        });

        if (response.success) {
            const updatedUser = { ...state.user, role };
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setState(prev => ({ ...prev, user: updatedUser }));
        }

        return response;
    };

    const completeProfile = async (data: { name: string; email?: string }) => {
        if (!state.user || !state.token) return { success: false, error: 'Not authenticated' };

        const response = await apiRequest(`/users/${state.user.id}/complete-profile`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (response.success && response.data) {
            const updatedUser = { ...state.user, ...response.data, isProfileComplete: true };
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setState(prev => ({ ...prev, user: updatedUser }));
        }

        return response;
    };

    const refreshUser = async () => {
        if (!state.user || !state.token) return;

        const response = await apiRequest('/auth/me');
        if (response.success && response.data) {
            const updatedUser = { ...state.user, ...response.data };
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setState(prev => ({ ...prev, user: updatedUser }));
        }
    };

    const setGuestMode = async (enabled: boolean) => {
        if (enabled) {
            await AsyncStorage.setItem('is_guest', 'true');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');
            setState({
                user: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
                isGuest: true,
            });
        } else {
            await AsyncStorage.removeItem('is_guest');
            setState(prev => ({ ...prev, isGuest: false }));
        }
    };

    const requireAuth = (action: string): boolean => {
        return state.isAuthenticated && !state.isGuest;
    };

    const logout = async () => {
        await AsyncStorage.multiRemove(['auth_token', 'auth_user', 'is_guest']);
        setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            isGuest: false,
        });
    };

    const updateUser = (data: Partial<User>) => {
        if (state.user) {
            const updatedUser = { ...state.user, ...data };
            AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setState(prev => ({ ...prev, user: updatedUser }));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                sendOtp,
                verifyOtp,
                setRole,
                completeProfile,
                setGuestMode,
                logout,
                updateUser,
                requireAuth,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
