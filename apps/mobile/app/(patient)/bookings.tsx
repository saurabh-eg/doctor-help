import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { usePatient, PatientAppointment } from '../../contexts/PatientContext';
import GuestPrompt from '../../components/GuestPrompt';

type TabType = 'upcoming' | 'past';

// Format time from HH:mm to 12hr format
const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export default function PatientBookingsScreen() {
    const router = useRouter();
    const { isGuest } = useAuth();
    const { upcomingAppointments, pastAppointments, isLoading, refreshAll, cancelAppointment } = usePatient();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

    const handleCancelAppointment = (apt: PatientAppointment) => {
        Alert.alert(
            'Cancel Appointment',
            `Are you sure you want to cancel your appointment with Dr. ${apt.doctorId?.userId?.name || 'Doctor'}?`,
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel', 
                    style: 'destructive',
                    onPress: async () => {
                        const success = await cancelAppointment(apt._id);
                        if (success) {
                            Alert.alert('Cancelled', 'Your appointment has been cancelled.');
                        } else {
                            Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    // Show guest state
    if (isGuest) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                <GuestPrompt 
                    visible={showGuestPrompt} 
                    onClose={() => setShowGuestPrompt(false)}
                    action="view your bookings"
                />
                
                <View style={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 16,
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>My Bookings</Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <View style={{ backgroundColor: '#eff6ff', borderRadius: 50, padding: 20, marginBottom: 20 }}>
                        <Ionicons name="calendar-outline" size={48} color="#2563eb" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
                        No Bookings Yet
                    </Text>
                    <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                        Register or login to book appointments with verified doctors
                    </Text>
                    <Pressable
                        onPress={() => setShowGuestPrompt(true)}
                        style={({ pressed }) => [{
                            backgroundColor: '#2563eb',
                            paddingVertical: 14,
                            paddingHorizontal: 32,
                            borderRadius: 12,
                            opacity: pressed ? 0.8 : 1,
                        }]}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Register Now</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(patient)/search')}
                        style={({ pressed }) => [{
                            marginTop: 12,
                            opacity: pressed ? 0.7 : 1,
                        }]}
                    >
                        <Text style={{ color: '#2563eb', fontSize: 15, fontWeight: '600' }}>Browse Doctors</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'completed': return { bg: '#d1fae5', text: '#059669' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            case 'in-progress': return { bg: '#fef3c7', text: '#d97706' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    const renderAppointmentCard = (apt: PatientAppointment) => {
        const statusColor = getStatusColor(apt.status);
        const isUpcoming = activeTab === 'upcoming';
        
        return (
            <TouchableOpacity
                key={apt._id}
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#f1f5f9',
                }}
                activeOpacity={0.7}
            >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {/* Doctor Avatar */}
                    <View style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                    }}>
                        <Ionicons name="person" size={24} color="#64748b" />
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>
                            Dr. {apt.doctorId?.userId?.name || 'Doctor'}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                            {apt.doctorId?.specialization || 'Specialist'}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            {/* Date & Time */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
                                    {formatDate(apt.date)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="time-outline" size={14} color="#64748b" />
                                <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
                                    {formatTime(apt.timeSlot.start)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: statusColor.bg,
                    }}>
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: statusColor.text,
                            textTransform: 'capitalize',
                        }}>
                            {apt.status}
                        </Text>
                    </View>
                </View>

                {/* Type & Amount */}
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: apt.type === 'video' ? '#eff6ff' : '#ecfdf5',
                            marginRight: 8,
                        }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: apt.type === 'video' ? '#2563eb' : '#10b981',
                            }}>
                                {apt.type === 'video' ? 'Video Call' : apt.type === 'clinic' ? 'Clinic Visit' : 'Home Visit'}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>
                            ₹{apt.amount}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    {isUpcoming && apt.status !== 'cancelled' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {apt.type === 'video' && apt.status === 'confirmed' && (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#2563eb',
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Ionicons name="videocam" size={14} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>
                                        Join
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => handleCancelAppointment(apt)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#fecaca',
                                    backgroundColor: '#fef2f2',
                                }}
                            >
                                <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 12 }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                    My Bookings
                </Text>

                {/* Tabs */}
                <View style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: 12, 
                    padding: 4 
                }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('upcoming')}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: activeTab === 'upcoming' ? '#fff' : 'transparent',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: activeTab === 'upcoming' ? '#0f172a' : '#64748b',
                        }}>
                            Upcoming ({upcomingAppointments.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('past')}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: activeTab === 'past' ? '#fff' : 'transparent',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: activeTab === 'past' ? '#0f172a' : '#64748b',
                        }}>
                            Past ({pastAppointments.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Appointments List */}
            <ScrollView 
                style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                {isLoading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : currentAppointments.length > 0 ? (
                    currentAppointments.map(renderAppointmentCard)
                ) : (
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 40,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    }}>
                        <Ionicons 
                            name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'} 
                            size={48} 
                            color="#cbd5e1" 
                        />
                        <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15, fontWeight: '500' }}>
                            {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
                        </Text>
                        <Text style={{ color: '#cbd5e1', marginTop: 4, fontSize: 13, textAlign: 'center' }}>
                            {activeTab === 'upcoming' 
                                ? 'Book an appointment with a doctor to get started'
                                : 'Your consultation history will appear here'}
                        </Text>
                        {activeTab === 'upcoming' && (
                            <TouchableOpacity
                                onPress={() => router.push('/(patient)/search')}
                                style={{
                                    marginTop: 20,
                                    backgroundColor: '#2563eb',
                                    paddingVertical: 12,
                                    paddingHorizontal: 24,
                                    borderRadius: 12,
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                                    Find a Doctor
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
