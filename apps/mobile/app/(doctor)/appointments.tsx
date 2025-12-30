import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDoctor, DoctorAppointment } from '../../contexts/DoctorContext';

// Format time from HH:mm to 12hr format
const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Get dates for the week
const getWeekDates = () => {
    const today = new Date();
    const dates = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
            date: date.getDate(),
            day: dayNames[date.getDay()],
            fullDate: date.toISOString().split('T')[0],
            isToday: i === 0,
        });
    }
    return dates;
};

export default function DoctorAppointmentsScreen() {
    const { appointments, isLoading, fetchStats, updateAppointmentStatus } = useDoctor();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [refreshing, setRefreshing] = useState(false);

    const weekDates = useMemo(() => getWeekDates(), []);

    // Filter appointments for selected date
    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date).toISOString().split('T')[0];
            return aptDate === selectedDate;
        }).sort((a, b) => a.timeSlot.start.localeCompare(b.timeSlot.start));
    }, [appointments, selectedDate]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, [fetchStats]);

    const getStatusStyle = (status: DoctorAppointment['status']) => {
        switch (status) {
            case 'completed':
                return { bg: '#ecfdf5', text: '#059669', label: 'Completed' };
            case 'confirmed':
                return { bg: '#eff6ff', text: '#2563eb', label: 'Confirmed' };
            case 'in-progress':
                return { bg: '#fef3c7', text: '#d97706', label: 'In Progress' };
            case 'cancelled':
                return { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' };
            default:
                return { bg: '#f1f5f9', text: '#64748b', label: 'Pending' };
        }
    };

    const handleStatusChange = async (id: string, newStatus: DoctorAppointment['status']) => {
        await updateAppointmentStatus(id, newStatus);
    };

    const renderAppointmentCard = (apt: DoctorAppointment, index: number) => {
        const statusStyle = getStatusStyle(apt.status);
        const isNext = apt.status === 'confirmed' || apt.status === 'pending';
        
        return (
            <View key={apt._id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                {/* Time Column */}
                <View style={{ width: 60, alignItems: 'center', paddingTop: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>
                        {formatTime(apt.timeSlot.start).split(' ')[0]}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                        {formatTime(apt.timeSlot.start).split(' ')[1]}
                    </Text>
                    {index < filteredAppointments.length - 1 && (
                        <View style={{ flex: 1, width: 2, backgroundColor: '#e2e8f0', marginVertical: 8 }} />
                    )}
                </View>

                {/* Appointment Card */}
                <View style={{
                    flex: 1,
                    backgroundColor: isNext ? '#2563eb' : '#fff',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: isNext ? 0 : 1,
                    borderColor: '#e2e8f0',
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ 
                                fontSize: 16, 
                                fontWeight: '700', 
                                color: isNext ? '#fff' : '#0f172a',
                                marginBottom: 4,
                            }}>
                                {apt.patientId?.name || 'Patient'}
                            </Text>
                            <Text style={{ 
                                fontSize: 13, 
                                color: isNext ? 'rgba(255,255,255,0.8)' : '#64748b',
                            }}>
                                {apt.symptoms || 'General Consultation'}
                            </Text>
                        </View>
                        
                        <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: isNext ? 'rgba(255,255,255,0.2)' : apt.type === 'video' ? '#eff6ff' : '#ecfdf5',
                        }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color: isNext ? '#fff' : apt.type === 'video' ? '#2563eb' : '#10b981',
                                textTransform: 'uppercase',
                            }}>
                                {apt.type}
                            </Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: isNext ? 'rgba(255,255,255,0.2)' : statusStyle.bg,
                        }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: isNext ? '#fff' : statusStyle.text,
                            }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                        <Text style={{ 
                            fontSize: 12, 
                            color: isNext ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                            marginLeft: 8,
                        }}>
                            {formatTime(apt.timeSlot.start)} - {formatTime(apt.timeSlot.end)}
                        </Text>
                    </View>

                    {/* Actions */}
                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {apt.type === 'video' && apt.status === 'confirmed' && (
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: isNext ? '#fff' : '#2563eb',
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name="videocam" size={16} color={isNext ? '#2563eb' : '#fff'} />
                                    <Text style={{ 
                                        color: isNext ? '#2563eb' : '#fff', 
                                        fontWeight: '700', 
                                        marginLeft: 6, 
                                        fontSize: 13 
                                    }}>
                                        Start Call
                                    </Text>
                                </TouchableOpacity>
                            )}
                            
                            {apt.status === 'pending' && (
                                <TouchableOpacity
                                    onPress={() => handleStatusChange(apt._id, 'confirmed')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: isNext ? '#fff' : '#10b981',
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ 
                                        color: isNext ? '#10b981' : '#fff', 
                                        fontWeight: '700', 
                                        fontSize: 13 
                                    }}>
                                        Confirm
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {apt.status === 'confirmed' && (
                                <TouchableOpacity
                                    onPress={() => handleStatusChange(apt._id, 'completed')}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: isNext ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ 
                                        color: isNext ? '#fff' : '#64748b', 
                                        fontWeight: '600', 
                                        fontSize: 13 
                                    }}>
                                        Complete
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#fff',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 20 }}>
                    Schedule
                </Text>

                {/* Day Picker */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {weekDates.map((d) => (
                            <TouchableOpacity
                                key={d.fullDate}
                                onPress={() => setSelectedDate(d.fullDate)}
                                style={{
                                    width: 56,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    backgroundColor: selectedDate === d.fullDate ? '#2563eb' : '#f8fafc',
                                }}
                            >
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: selectedDate === d.fullDate ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                                    marginBottom: 4,
                                }}>
                                    {d.day}
                                </Text>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: selectedDate === d.fullDate ? '#fff' : '#334155',
                                }}>
                                    {d.date}
                                </Text>
                                {d.isToday && (
                                    <View style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: selectedDate === d.fullDate ? '#fff' : '#2563eb',
                                        marginTop: 4,
                                    }} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Timeline */}
            <ScrollView 
                style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '700', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase', 
                    letterSpacing: 1,
                    marginBottom: 16,
                }}>
                    {filteredAppointments.length > 0 ? "Today's Schedule" : 'No Appointments'}
                </Text>

                {isLoading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt, index) => renderAppointmentCard(apt, index))
                ) : (
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 40,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    }}>
                        <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                        <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15, fontWeight: '500' }}>
                            No appointments scheduled
                        </Text>
                        <Text style={{ color: '#cbd5e1', marginTop: 4, fontSize: 13 }}>
                            Your schedule is clear for this day
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
