import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useCallback } from 'react';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

interface Appointment {
    _id: string;
    doctorId: {
        userId: { name: string };
        specialization: string;
    };
    date: string;
    timeSlot: { start: string };
    type: 'clinic' | 'video' | 'home';
    status: string;
}

export default function PatientHomeScreen() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    const greeting = getGreeting();
    const displayName = user?.name || 'Patient';

    const fetchUpcomingAppointment = useCallback(async () => {
        if (!user?.id || !token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data?.length > 0) {
                // Find next upcoming appointment
                const now = new Date();
                const upcoming = data.data.find((apt: Appointment) => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
                });
                setUpcomingAppointment(upcoming || null);
            }
        } catch (error) {
            console.error('Failed to fetch appointment:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, token]);

    useFocusEffect(
        useCallback(() => {
            fetchUpcomingAppointment();
        }, [fetchUpcomingAppointment])
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-4 pb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-500 text-sm">{greeting},</Text>
                        <Text className="text-2xl font-bold text-slate-900">{displayName} 👋</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(patient)/profile')}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        className="h-11 w-11 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
                    >
                        <Ionicons name="person-outline" size={24} color="#334155" />
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View className="px-5 mb-6">
                    <Pressable
                        onPress={() => router.push('/(patient)/search')}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="flex-row items-center bg-white h-14 rounded-2xl px-4 shadow-sm border border-slate-100"
                    >
                        <Ionicons name="search" size={20} color="#197fe6" />
                        <Text className="ml-3 text-slate-400">Search for doctors...</Text>
                    </Pressable>
                </View>

                {/* Upcoming Appointment Card */}
                <View className="px-5 mb-6">
                    {loading ? (
                        <View className="bg-white rounded-3xl p-8 items-center border border-slate-100">
                            <ActivityIndicator size="small" color="#197fe6" />
                        </View>
                    ) : upcomingAppointment ? (
                        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                            <View className="flex-row items-center mb-1">
                                <View className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    Upcoming Appointment
                                </Text>
                            </View>
                            <Text className="text-xl font-bold text-slate-900 mb-1" style={{ flexWrap: 'wrap' }}>
                                {upcomingAppointment.doctorId?.userId?.name || 'Doctor'}
                            </Text>
                            <Text className="text-slate-500 mb-4" style={{ flexWrap: 'wrap' }}>
                                {upcomingAppointment.doctorId?.specialization} • Clinic Visit
                            </Text>

                            <View className="flex-row items-center bg-slate-50 p-3 rounded-xl mb-4">
                                <Ionicons name="time-outline" size={18} color="#197fe6" />
                                <Text className="ml-2 font-bold text-slate-700">
                                    {formatDate(upcomingAppointment.date)}, {upcomingAppointment.timeSlot?.start}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => router.push('/(patient)/bookings')}
                                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                className="bg-blue-600 h-14 rounded-xl items-center justify-center"
                            >
                                <Text className="text-white font-bold text-base">View Details</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => router.push('/(patient)/search')}
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                            className="bg-blue-50 rounded-3xl p-6 items-center border border-blue-100"
                        >
                            <Ionicons name="calendar-outline" size={48} color="#197fe6" />
                            <Text className="text-slate-700 font-bold mt-3" style={{ flexWrap: 'wrap', textAlign: 'center' }}>No Upcoming Appointments</Text>
                            <Text className="text-slate-500 text-sm mt-1" style={{ flexWrap: 'wrap', textAlign: 'center' }}>Book a doctor consultation</Text>
                        </Pressable>
                    )}
                </View>

                {/* Medical Services */}
                <View className="px-5 mb-6">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Medical Services</Text>
                    <View className="flex-row justify-between">
                        {[
                            { icon: 'medical', label: 'Consult', color: '#3b82f6', route: '/(patient)/search' },
                            { icon: 'calendar', label: 'Bookings', color: '#10b981', route: '/(patient)/bookings' },
                            { icon: 'person', label: 'Profile', color: '#6366f1', route: '/(patient)/profile' },
                            { icon: 'help-circle', label: 'Help', color: '#f59e0b', route: null },
                        ].map((item, i) => (
                            <Pressable
                                key={i}
                                onPress={() => item.route && router.push(item.route as any)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                                className="items-center"
                            >
                                <View
                                    className="h-16 w-16 rounded-2xl items-center justify-center mb-2"
                                    style={{ backgroundColor: `${item.color}15` }}
                                >
                                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                                </View>
                                <Text className="text-xs font-bold text-slate-600">{item.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Specialties */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center px-5 mb-4">
                        <Text className="text-lg font-bold text-slate-900">Find by Specialty</Text>
                        <Pressable
                            onPress={() => router.push('/(patient)/search')}
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                            <Text className="text-blue-600 font-bold text-sm">View All</Text>
                        </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                        {[
                            { name: 'General', icon: 'person' },
                            { name: 'Cardio', icon: 'heart' },
                            { name: 'Derma', icon: 'body' },
                            { name: 'Ortho', icon: 'fitness' },
                            { name: 'Pediatric', icon: 'happy' },
                        ].map((specialty, i) => (
                            <Pressable
                                key={i}
                                onPress={() => router.push('/(patient)/search')}
                                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                                className="items-center mr-5"
                            >
                                <View className="h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-2 border-2 border-slate-200">
                                    <Ionicons name={specialty.icon as any} size={28} color="#64748b" />
                                </View>
                                <Text className="text-xs font-bold text-slate-600">{specialty.name}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
