import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { usePatient } from '../../contexts/PatientContext';
import { useState, useCallback } from 'react';
import GuestPrompt from '../../components/GuestPrompt';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// Format time from HH:mm to 12hr format
const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export default function PatientHomeScreen() {
    const router = useRouter();
    const { user, isGuest } = useAuth();
    const { upcomingAppointments, stats, isLoading, refreshAll } = usePatient();
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const greeting = getGreeting();
    const displayName = isGuest ? 'Guest' : (user?.name || 'Patient');

    // Get the next upcoming appointment
    const upcomingAppointment = upcomingAppointments[0] || null;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const handleProfilePress = () => {
        if (isGuest) {
            setShowGuestPrompt(true);
        } else {
            router.push('/(patient)/profile');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <GuestPrompt 
                visible={showGuestPrompt} 
                onClose={() => setShowGuestPrompt(false)}
                action="view your profile"
            />

            <ScrollView 
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                {/* Guest Banner */}
                {isGuest && (
                    <Pressable 
                        onPress={() => setShowGuestPrompt(true)}
                        style={{ backgroundColor: '#eff6ff', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Ionicons name="information-circle" size={20} color="#2563eb" />
                        <Text style={{ color: '#1e40af', marginLeft: 8, flex: 1, fontSize: 14 }}>
                            You're browsing as guest. Register to book appointments.
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#2563eb" />
                    </Pressable>
                )}

                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: '#64748b', fontSize: 14 }}>{greeting},</Text>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>{displayName} 👋</Text>
                    </View>
                    <Pressable
                        onPress={handleProfilePress}
                        style={({ pressed }) => [{
                            opacity: pressed ? 0.6 : 1,
                            height: 44,
                            width: 44,
                            backgroundColor: '#fff',
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }]}
                    >
                        <Ionicons name={isGuest ? "person-add-outline" : "person-outline"} size={24} color="#334155" />
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    <Pressable
                        onPress={() => router.push('/(patient)/search')}
                        style={({ pressed }) => [{
                            opacity: pressed ? 0.8 : 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            height: 56,
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }]}
                    >
                        <Ionicons name="search" size={20} color="#2563eb" />
                        <Text style={{ marginLeft: 12, color: '#94a3b8', fontSize: 15 }}>Search for doctors...</Text>
                    </Pressable>
                </View>

                {/* Stats (for logged in users) */}
                {!isGuest && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{
                                flex: 1,
                                backgroundColor: '#eff6ff',
                                borderRadius: 16,
                                padding: 16,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 24, fontWeight: '700', color: '#2563eb' }}>
                                    {stats.totalBookings}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500', marginTop: 2 }}>
                                    Bookings
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                backgroundColor: '#ecfdf5',
                                borderRadius: 16,
                                padding: 16,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>
                                    {stats.doctorsConsulted}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '500', marginTop: 2 }}>
                                    Doctors
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                backgroundColor: '#f5f3ff',
                                borderRadius: 16,
                                padding: 16,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 24, fontWeight: '700', color: '#7c3aed' }}>
                                    {stats.upcomingBookings}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '500', marginTop: 2 }}>
                                    Upcoming
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Upcoming Appointment Card */}
                <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    {isLoading && !refreshing ? (
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 24,
                            padding: 32,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}>
                            <ActivityIndicator size="small" color="#2563eb" />
                        </View>
                    ) : upcomingAppointment ? (
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 24,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: '#2563eb', marginRight: 8 }} />
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Upcoming Appointment
                                </Text>
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                                Dr. {upcomingAppointment.doctorId?.userId?.name || 'Doctor'}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                                {upcomingAppointment.doctorId?.specialization} • {upcomingAppointment.type === 'video' ? 'Video Call' : 'Clinic Visit'}
                            </Text>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                padding: 12,
                                borderRadius: 12,
                                marginBottom: 16,
                            }}>
                                <Ionicons name="time-outline" size={18} color="#2563eb" />
                                <Text style={{ marginLeft: 8, fontWeight: '700', color: '#334155', fontSize: 14 }}>
                                    {formatDate(upcomingAppointment.date)}, {formatTime(upcomingAppointment.timeSlot.start)}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => router.push('/(patient)/bookings')}
                                style={({ pressed }) => [{
                                    opacity: pressed ? 0.8 : 1,
                                    backgroundColor: '#2563eb',
                                    height: 52,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }]}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>View Details</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => router.push('/(patient)/search')}
                            style={({ pressed }) => [{
                                opacity: pressed ? 0.9 : 1,
                                backgroundColor: '#eff6ff',
                                borderRadius: 24,
                                padding: 32,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#dbeafe',
                            }]}
                        >
                            <Ionicons name="calendar-outline" size={48} color="#2563eb" />
                            <Text style={{ color: '#334155', fontWeight: '700', marginTop: 12, fontSize: 16 }}>
                                No Upcoming Appointments
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                                Book a doctor consultation
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Medical Services */}
                <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                        Medical Services
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {[
                            { icon: 'medical' as const, label: 'Consult', color: '#3b82f6', route: '/(patient)/search' },
                            { icon: 'calendar' as const, label: 'Bookings', color: '#10b981', route: '/(patient)/bookings' },
                            { icon: 'document-text' as const, label: 'Records', color: '#8b5cf6', route: '/(patient)/records' },
                            { icon: 'person' as const, label: 'Profile', color: '#f59e0b', route: '/(patient)/profile' },
                        ].map((item, i) => (
                            <Pressable
                                key={i}
                                onPress={() => {
                                    if (isGuest && (item.route === '/(patient)/profile' || item.route === '/(patient)/records')) {
                                        setShowGuestPrompt(true);
                                    } else {
                                        router.push(item.route as any);
                                    }
                                }}
                                style={({ pressed }) => [{
                                    opacity: pressed ? 0.7 : 1,
                                    alignItems: 'center',
                                }]}
                            >
                                <View style={{
                                    height: 64,
                                    width: 64,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 8,
                                    backgroundColor: `${item.color}15`,
                                }}>
                                    <Ionicons name={item.icon} size={28} color={item.color} />
                                </View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>{item.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Specialties */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Find by Specialty</Text>
                        <Pressable
                            onPress={() => router.push('/(patient)/search')}
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                            <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 14 }}>View All</Text>
                        </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
                        {[
                            { name: 'General', icon: 'person' as const },
                            { name: 'Cardio', icon: 'heart' as const },
                            { name: 'Derma', icon: 'body' as const },
                            { name: 'Ortho', icon: 'fitness' as const },
                            { name: 'Pediatric', icon: 'happy' as const },
                        ].map((specialty, i) => (
                            <Pressable
                                key={i}
                                onPress={() => router.push('/(patient)/search')}
                                style={({ pressed }) => [{
                                    opacity: pressed ? 0.7 : 1,
                                    alignItems: 'center',
                                    marginRight: 20,
                                }]}
                            >
                                <View style={{
                                    height: 64,
                                    width: 64,
                                    borderRadius: 32,
                                    backgroundColor: '#f1f5f9',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 8,
                                    borderWidth: 2,
                                    borderColor: '#e2e8f0',
                                }}>
                                    <Ionicons name={specialty.icon} size={28} color="#64748b" />
                                </View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>{specialty.name}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
