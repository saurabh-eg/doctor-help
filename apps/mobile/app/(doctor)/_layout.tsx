import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator, Text } from 'react-native';
import { useDoctor } from '../../contexts/DoctorContext';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorLayout() {
    const router = useRouter();
    const segments = useSegments();
    const { profile, isLoading, fetchProfile } = useDoctor();
    const { user, token } = useAuth();
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);

    // Check if doctor has a profile on mount
    useEffect(() => {
        const checkDoctorProfile = async () => {
            if (!user?.id || !token) {
                setIsCheckingProfile(false);
                setHasProfile(false);
                return;
            }

            try {
                await fetchProfile();
            } catch (error) {
                console.error('Error fetching doctor profile:', error);
            } finally {
                setIsCheckingProfile(false);
            }
        };

        checkDoctorProfile();
    }, [user?.id, token]);

    // Update hasProfile when profile changes
    useEffect(() => {
        if (!isLoading && !isCheckingProfile) {
            setHasProfile(profile !== null);
        }
    }, [profile, isLoading, isCheckingProfile]);

    // Redirect logic based on profile and verification status
    useEffect(() => {
        if (isCheckingProfile || isLoading) return;

        const currentScreen = segments[segments.length - 1];
        const isOnVerification = currentScreen === 'verification';

        // If no profile exists, always show verification
        if (!hasProfile && !isOnVerification) {
            router.replace('/(doctor)/verification');
            return;
        }

        // If profile exists but not verified, still allow limited access
        // but could restrict certain features if needed
        if (profile && !profile.isVerified && !isOnVerification) {
            // Doctor profile exists but pending verification
            // They can view dashboard but with a pending banner
            // For now, let them access tabs but show verification status
        }
    }, [hasProfile, profile, isCheckingProfile, isLoading, segments]);

    // Show loading while checking profile
    if (isCheckingProfile || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 16, color: '#64748b' }}>Loading...</Text>
            </View>
        );
    }

    // If no profile and on any screen other than verification, show loading
    // The useEffect above will handle the redirect
    if (!hasProfile) {
        const currentScreen = segments[segments.length - 1];
        if (currentScreen !== 'verification') {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={{ marginTop: 16, color: '#64748b' }}>Redirecting...</Text>
                </View>
            );
        }
    }

    // Determine if tabs should be shown
    // Hide tabs if doctor doesn't have a profile yet
    const showTabs = hasProfile;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: showTabs ? {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                } : { display: 'none' },
                tabBarActiveTintColor: '#197fe6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="grid" size={24} color={color} />
                    ),
                    href: showTabs ? '/(doctor)/dashboard' : null,
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="calendar" size={24} color={color} />
                    ),
                    href: showTabs ? '/(doctor)/appointments' : null,
                }}
            />
            <Tabs.Screen
                name="patients"
                options={{
                    title: 'Patients',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="people" size={24} color={color} />
                    ),
                    href: showTabs ? '/(doctor)/patients' : null,
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="wallet" size={24} color={color} />
                    ),
                    href: showTabs ? '/(doctor)/earnings' : null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person" size={24} color={color} />
                    ),
                    href: showTabs ? '/(doctor)/profile' : null,
                }}
            />
            {/* Verification screen - always accessible, hidden from tab bar */}
            <Tabs.Screen
                name="verification"
                options={{
                    href: null, // Hides from tab bar but still accessible
                }}
            />
        </Tabs>
    );
}
