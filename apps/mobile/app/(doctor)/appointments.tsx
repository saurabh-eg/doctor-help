import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
    time: string;
    patientName: string;
    type: 'video' | 'clinic';
    status: 'completed' | 'next' | 'upcoming';
    notes: string;
}

export default function DoctorAppointmentsScreen() {
    const [selectedDay, setSelectedDay] = useState(25);

    const days = [
        { day: 23, label: 'Mon' },
        { day: 24, label: 'Tue' },
        { day: 25, label: 'Wed' },
        { day: 26, label: 'Thu' },
        { day: 27, label: 'Fri' },
        { day: 28, label: 'Sat' },
    ];

    const appointments: Appointment[] = [
        { time: '09:00 AM', patientName: 'Robert Fox', type: 'clinic', status: 'completed', notes: 'Regular checkup completed' },
        { time: '10:00 AM', patientName: 'Sarah Jenkins', type: 'video', status: 'next', notes: 'Follow-up for migraine treatment' },
        { time: '11:30 AM', patientName: 'Michael Chen', type: 'video', status: 'upcoming', notes: 'New patient consultation' },
        { time: '02:00 PM', patientName: 'Eleanor Pena', type: 'clinic', status: 'upcoming', notes: 'Blood test review' },
    ];

    const getStatusStyle = (status: string) => {
        if (status === 'next') return { bg: 'bg-blue-600', text: 'text-white', badge: 'bg-white/20' };
        if (status === 'completed') return { bg: 'bg-white', text: 'text-slate-400', badge: 'bg-emerald-100' };
        return { bg: 'bg-white', text: 'text-slate-900', badge: 'bg-slate-100' };
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
                <Text className="text-2xl font-bold text-slate-900 text-center mb-6">Schedule</Text>

                {/* Day Picker */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        {days.map((d) => (
                            <TouchableOpacity
                                key={d.day}
                                className={`w-14 py-3 rounded-2xl items-center ${selectedDay === d.day ? 'bg-blue-600' : 'bg-slate-50'
                                    }`}
                                onPress={() => setSelectedDay(d.day)}
                            >
                                <Text className={`text-xs font-bold mb-1 ${selectedDay === d.day ? 'text-blue-200' : 'text-slate-400'
                                    }`}>
                                    {d.label}
                                </Text>
                                <Text className={`text-lg font-bold ${selectedDay === d.day ? 'text-white' : 'text-slate-700'
                                    }`}>
                                    {d.day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Timeline */}
            <ScrollView className="flex-1 px-5 pt-6">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Today's Timeline</Text>

                {appointments.map((apt, index) => {
                    const style = getStatusStyle(apt.status);
                    return (
                        <View key={index} className="flex-row mb-4">
                            {/* Time Column */}
                            <View style={{ width: 56, alignItems: 'center', paddingTop: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>{apt.time.split(' ')[0]}</Text>
                                <Text style={{ fontSize: 12, color: '#94a3b8' }}>{apt.time.split(' ')[1]}</Text>
                                {index < appointments.length - 1 && (
                                    <View className="flex-1 w-0.5 bg-slate-200 my-2" />
                                )}
                            </View>

                            {/* Appointment Card */}
                            <View className={`flex-1 p-4 rounded-2xl border border-slate-100 ${style.bg}`}>
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text style={{ fontWeight: '700', fontSize: 15, color: apt.status === 'completed' ? '#94a3b8' : '#0f172a' }}>
                                        {apt.patientName}
                                    </Text>
                                    <View className={`px-2 py-0.5 rounded-full ${style.badge}`}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            color: apt.status === 'next' ? '#fff' : apt.status === 'completed' ? '#059669' : '#64748b'
                                        }}>
                                            {apt.type}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={{
                                    fontSize: 13,
                                    color: apt.status === 'next' ? '#bfdbfe' : '#94a3b8'
                                }}>
                                    {apt.notes}
                                </Text>

                                {apt.status === 'next' && (
                                    <TouchableOpacity className="bg-white h-10 rounded-xl items-center justify-center mt-4">
                                        <Text className="text-blue-600 font-bold">Join Call</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
