import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/client';
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
        // Check for stored auth
        const storedToken = localStorage.getItem('admin_token');
        const storedUser = localStorage.getItem('admin_user');
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role === 'admin') {
                    setToken(storedToken);
                    setUser(parsedUser);
                } else {
                    // Not an admin, clear storage
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                }
            } catch {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        }
        setIsLoading(false);
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
