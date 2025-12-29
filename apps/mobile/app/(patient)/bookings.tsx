import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

type TabType = 'upcoming' | 'past';

interface Appointment {
    _id: string;
    doctorId: {
        userId: { name: string };
        specialization: string;
    };
    date: string;
    timeSlot: { start: string; end: string };
    type: 'video' | 'clinic' | 'home';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}

export default function PatientBookingsScreen() {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        if (!user?.id || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setAppointments(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, token]);

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [fetchAppointments])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return { bg: '#dbeafe', text: '#2563eb' };
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'completed': return { bg: '#d1fae5', text: '#059669' };
            case 'cancelled': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Compare dates only (not time) for proper today detection
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
    });
    const pastAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
    });

    const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>

                {/* Tabs - Using TouchableOpacity with inline styles to avoid NativeWind bug */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('upcoming')}
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                            Upcoming ({upcomingAppointments.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('past')}
                        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                            Past ({pastAppointments.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#197fe6" />
                    <Text style={styles.loadingText}>Loading appointments...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {displayAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No {activeTab} appointments</Text>
                            {activeTab === 'upcoming' && (
                                <Text style={styles.emptySubtext}>
                                    Book a doctor consultation to see it here
                                </Text>
                            )}
                        </View>
                    ) : (
                        displayAppointments.map((apt) => {
                            const statusStyle = getStatusColor(apt.status);
                            const doctorName = apt.doctorId?.userId?.name || 'Doctor';
                            const specialization = apt.doctorId?.specialization || '';

                            return (
                                <View key={apt._id} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={styles.avatar}>
                                            <Ionicons name="person" size={28} color="#197fe6" />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                    {apt.status}
                                                </Text>
                                            </View>
                                            <Text style={styles.doctorName}>{doctorName}</Text>
                                            <Text style={styles.specialty}>{specialization}</Text>
                                            <View style={styles.detailsRow}>
                                                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                                <Text style={styles.detailText}>
                                                    {formatDate(apt.date)}, {apt.timeSlot?.start}
                                                </Text>
                                            </View>
                                            <View style={styles.typeRow}>
                                                <Ionicons name="location-outline" size={14} color="#64748b" />
                                                <Text style={styles.typeText}>
                                                    {apt.type === 'clinic' ? 'Clinic Visit' : apt.type === 'video' ? 'Video Call' : 'Home Visit'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {activeTab === 'upcoming' && apt.type === 'clinic' && (
                                        <View style={styles.payNote}>
                                            <Ionicons name="cash-outline" size={18} color="#d97706" />
                                            <Text style={styles.payNoteText}>Pay at clinic</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 16 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12 },
    tab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontWeight: 'bold', color: '#94a3b8' },
    activeTabText: { color: '#2563eb' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#64748b', marginTop: 16 },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    scrollContent: { paddingTop: 16, paddingBottom: 24 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyText: { color: '#94a3b8', fontWeight: '500', marginTop: 16 },
    emptySubtext: { color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
    avatar: { height: 56, width: 56, borderRadius: 28, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, marginBottom: 4 },
    statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
    doctorName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    specialty: { fontSize: 14, color: '#64748b' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    detailText: { fontSize: 12, color: '#64748b', marginLeft: 6 },
    typeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    typeText: { fontSize: 12, color: '#10b981', marginLeft: 6, fontWeight: '500' },
    payNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, marginTop: 16 },
    payNoteText: { color: '#b45309', fontSize: 14, marginLeft: 8 },
});
