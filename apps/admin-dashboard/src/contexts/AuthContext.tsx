import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, authApi } from '../api/client';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('admin_token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                // Re-verify token with backend instead of trusting localStorage
                const response = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                const freshUser = response.data.data;

                if (freshUser.role !== 'admin') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    setIsLoading(false);
                    return;
                }

                setToken(storedToken);
                setUser(freshUser);
                // Update localStorage with fresh data
                localStorage.setItem('admin_user', JSON.stringify(freshUser));
            } catch {
                // Token invalid or expired — clear stored auth
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
            setIsLoading(false);
        };

        verifyAuth();
    }, []);

    const sendOtp = async (phone: string) => {
        try {
            await authApi.sendOtp(phone);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Failed to send OTP' 
            };
        }
    };

    const login = async (phone: string, otp: string) => {
        try {
            const response = await authApi.verifyOtp(phone, otp);
            const { token: authToken, user: authUser } = response.data.data;

            if (authUser.role !== 'admin') {
                return { 
                    success: false, 
                    error: 'Access denied. Admin privileges required.' 
                };
            }

            setToken(authToken);
            setUser(authUser);
            localStorage.setItem('admin_token', authToken);
            localStorage.setItem('admin_user', JSON.stringify(authUser));

            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                token, 
                isLoading,
                isAuthenticated: !!token && !!user,
                login, 
                logout,
                sendOtp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
