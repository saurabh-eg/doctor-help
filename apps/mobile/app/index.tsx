import { useEffect, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl
    || process.env.EXPO_PUBLIC_API_URL
    || 'http://localhost:3001/api';

export default function Home() {
    const router = useRouter();
    const { isLoading, isAuthenticated, isGuest, user, token, setGuestMode } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Check if doctor profile exists
    const checkDoctorProfile = async (): Promise<boolean> => {
        if (!user?.id || !token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/doctors/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            return data.success && data.data !== null;
        } catch (error) {
            console.error('Error checking doctor profile:', error);
            return false;
        }
    };

    // Redirect authenticated users to their appropriate screen
    useEffect(() => {
        const redirectUser = async () => {
            if (isLoading || isRedirecting) return;

            if (isGuest) {
                // Guest user - go to patient home
                setIsRedirecting(true);
                router.replace('/(patient)/home');
                return;
            }

            if (isAuthenticated && user) {
                setIsRedirecting(true);

                // Check if profile is complete
                if (!user.isProfileComplete) {
                    router.replace('/(auth)/profile-setup');
                    return;
                }

                // Route based on role
                if (user.role === 'doctor') {
                    const hasDoctorProfile = await checkDoctorProfile();
                    if (hasDoctorProfile) {
                        router.replace('/(doctor)/dashboard');
                    } else {
                        router.replace('/(doctor)/verification');
                    }
                } else if (user.role === 'admin') {
                    // Admin should use web panel
                    router.replace('/(auth)/login');
                } else {
                    router.replace('/(patient)/home');
                }
            }
        };

        redirectUser();
    }, [isLoading, isAuthenticated, isGuest, user]);

    // Show loading while checking auth state or redirecting
    if (isLoading || isRedirecting) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ height: 80, width: 80, backgroundColor: '#fff', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
                    <Image
                        source={require('../assets/logo.jpg')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                </View>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ color: '#64748b', marginTop: 16 }}>Loading...</Text>
            </SafeAreaView>
        );
    }

    const handleRegister = () => {
        router.push("/(auth)/login");
    };

    const handleGuestMode = async () => {
        await setGuestMode(true);
        router.replace("/(patient)/home");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, justifyContent: 'space-between' }}>
                    {/* Logo & Branding Section */}
                    <View style={{ alignItems: 'center', marginBottom: 40 }}>
                        <View style={{ height: 112, width: 112, backgroundColor: '#fff', borderRadius: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
                            <Image
                                source={require('../assets/logo.jpg')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={{ fontSize: 36, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                            Doctor Help
                        </Text>
                        <View style={{ width: '100%', marginTop: 12 }}>
                            <Text style={{ fontSize: 18, color: '#64748b', textAlign: 'center', lineHeight: 24 }}>
                                Heal with Trust,{"\n"}Care with Heart
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ width: '100%' }}>
                        {/* Primary Button - Register / Login */}
                        <Pressable
                            onPress={handleRegister}
                            style={({ pressed }) => [{
                                backgroundColor: '#2563eb',
                                paddingVertical: 20,
                                borderRadius: 16,
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 3,
                                elevation: 3,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                opacity: pressed ? 0.8 : 1
                            }]}
                        >
                            <Ionicons name="person-add" size={22} color="#fff" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, letterSpacing: 0.5 }}>
                                Register / Login
                            </Text>
                        </Pressable>

                        {/* Spacer */}
                        <View style={{ height: 16 }} />

                        {/* Secondary Button - Visit as Guest */}
                        <Pressable
                            onPress={handleGuestMode}
                            style={({ pressed }) => [{
                                backgroundColor: '#fff',
                                paddingVertical: 20,
                                borderRadius: 16,
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: pressed ? '#60a5fa' : '#e2e8f0',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                opacity: pressed ? 0.8 : 1
                            }]}
                        >
                            <Ionicons name="eye-outline" size={22} color="#475569" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#334155', fontWeight: '600', fontSize: 18 }}>
                                Visit as Guest
                            </Text>
                        </Pressable>

                        {/* Guest Mode Info */}
                        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                            <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                Browse doctors and explore the app without signing up
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={{ paddingTop: 32 }}>
                        <Text style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 12 }}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
