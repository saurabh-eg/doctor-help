import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctor, DoctorAppointment } from '../../contexts/DoctorContext';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';

// Helper to get greeting based on time
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

export default function DoctorDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { profile, stats, todayAppointments, isLoading, refreshAll } = useDoctor();
    const [refreshing, setRefreshing] = useState(false);

    const greeting = getGreeting();
    const displayName = profile?.userId?.name || user?.name || 'Doctor';
    const isVerified = profile?.isVerified ?? false;

    // Build stats array from real data
    const statsData = [
        { label: 'Patients', value: stats.totalPatients.toString(), icon: 'people' as const, color: '#3b82f6', bgColor: '#eff6ff' },
        { label: 'Today', value: stats.todayAppointments.toString(), icon: 'medical' as const, color: '#10b981', bgColor: '#ecfdf5' },
        { label: 'Pending', value: stats.pendingAppointments.toString(), icon: 'time' as const, color: '#f59e0b', bgColor: '#fffbeb' },
    ];

    // Get next upcoming appointment
    const nextAppointment = todayAppointments.find(a => 
        a.status === 'pending' || a.status === 'confirmed'
    );

    const tools = [
        { label: 'Availability', icon: 'calendar' as const, color: '#3b82f6', bgColor: '#eff6ff', route: '/(doctor)/availability' },
        { label: 'Schedule', icon: 'calendar-outline' as const, color: '#8b5cf6', bgColor: '#f5f3ff', route: '/(doctor)/appointments' },
        { label: 'Patients', icon: 'people' as const, color: '#10b981', bgColor: '#ecfdf5', route: '/(doctor)/patients' },
        { label: 'Earnings', icon: 'wallet' as const, color: '#f59e0b', bgColor: '#fffbeb', route: '/(doctor)/earnings' },
    ];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

    const handleToolPress = (route: string) => {
        router.push(route as any);
    };

    const handleNotifications = () => {
        router.push('/(common)/notifications');
    };

    const renderAppointmentCard = (apt: DoctorAppointment) => (
        <View 
            key={apt._id}
            style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Left accent bar */}
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#3b82f6' }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                        {apt.patientId?.name || 'Patient'}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                        {apt.symptoms || 'General Consultation'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
                            {formatTime(apt.timeSlot.start)} - {formatTime(apt.timeSlot.end)}
                        </Text>
                    </View>
                </View>
                
                <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: apt.type === 'video' ? '#eff6ff' : '#ecfdf5',
                }}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: apt.type === 'video' ? '#2563eb' : '#10b981',
                        textTransform: 'uppercase',
                    }}>
                        {apt.type}
                    </Text>
                </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                {apt.type === 'video' && (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: '#2563eb',
                            paddingVertical: 12,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="videocam" size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 14 }}>Start Call</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={{
                        flex: apt.type === 'video' ? undefined : 1,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Loading dashboard...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        height: 48,
                        width: 48,
                        borderRadius: 24,
                        backgroundColor: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}>
                        {profile?.photoUrl ? (
                            <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: '#e2e8f0' }} />
                        ) : (
                            <Ionicons name="person" size={24} color="#64748b" />
                        )}
                    </View>
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                            {greeting}, Dr. {displayName.split(' ')[0]}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons 
                                name={isVerified ? "checkmark-circle" : "time-outline"} 
                                size={14} 
                                color={isVerified ? "#2563eb" : "#f59e0b"} 
                            />
                            <Text style={{ 
                                fontSize: 12, 
                                color: isVerified ? '#2563eb' : '#f59e0b', 
                                marginLeft: 4, 
                                fontWeight: '500' 
                            }}>
                                {isVerified ? 'Verified Practitioner' : 'Verification Pending'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={handleNotifications}
                    style={{
                        height: 40,
                        width: 40,
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    }}
                >
                    <Ionicons name="notifications-outline" size={22} color="#334155" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                {/* Stats */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -4 }}>
                    {statsData.map((stat, i) => (
                        <View
                            key={i}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                marginRight: 12,
                                borderWidth: 1,
                                borderColor: '#f1f5f9',
                                minWidth: 120,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View
                                    style={{
                                        height: 32,
                                        width: 32,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: stat.bgColor,
                                        marginRight: 8,
                                    }}
                                >
                                    <Ionicons name={stat.icon} size={18} color={stat.color} />
                                </View>
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                                    {stat.label}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>{stat.value}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Up Next */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Up Next</Text>
                        <TouchableOpacity onPress={() => router.push('/(doctor)/appointments')}>
                            <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 14 }}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {nextAppointment ? (
                        renderAppointmentCard(nextAppointment)
                    ) : (
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 32,
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                            alignItems: 'center',
                        }}>
                            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>No upcoming appointments</Text>
                            <Text style={{ color: '#cbd5e1', marginTop: 4, fontSize: 13 }}>Your schedule is clear for today</Text>
                        </View>
                    )}
                </View>

                {/* Clinical Tools */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>Quick Actions</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {tools.map((tool, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => handleToolPress(tool.route)}
                                style={{
                                    width: '48%',
                                    backgroundColor: '#fff',
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#f1f5f9',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <View
                                    style={{
                                        height: 48,
                                        width: 48,
                                        borderRadius: 24,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: tool.bgColor,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Ionicons name={tool.icon} size={24} color={tool.color} />
                                </View>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                                    {tool.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
