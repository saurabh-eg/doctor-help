import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'upcoming' | 'past';

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    type: 'video' | 'clinic';
    status: 'confirmed' | 'pending' | 'completed';
}

export default function PatientBookingsScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');

    const appointments: Appointment[] = [
        {
            id: '1',
            doctorName: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            date: 'Dec 26, 2025',
            time: '10:30 AM',
            type: 'video',
            status: 'confirmed',
        },
        {
            id: '2',
            doctorName: 'Dr. Michael Chen',
            specialty: 'Dermatologist',
            date: 'Dec 28, 2025',
            time: '02:00 PM',
            type: 'clinic',
            status: 'pending',
        },
    ];

    const pastAppointments: Appointment[] = [
        {
            id: '3',
            doctorName: 'Dr. Priya Sharma',
            specialty: 'Pediatrician',
            date: 'Dec 20, 2025',
            time: '11:00 AM',
            type: 'video',
            status: 'completed',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return { bg: 'bg-blue-50', text: 'text-blue-600' };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600' };
            case 'completed': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600' };
        }
    };

    const displayAppointments = activeTab === 'upcoming' ? appointments : pastAppointments;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
                <Text className="text-2xl font-bold text-slate-900 text-center mb-4">My Bookings</Text>

                {/* Tabs */}
                <View className="flex-row bg-slate-100 p-1 rounded-xl">
                    <TouchableOpacity
                        className={`flex-1 h-10 items-center justify-center rounded-lg ${activeTab === 'upcoming' ? 'bg-white shadow-sm' : ''
                            }`}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text className={`font-bold ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                            Upcoming
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 h-10 items-center justify-center rounded-lg ${activeTab === 'past' ? 'bg-white shadow-sm' : ''
                            }`}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text className={`font-bold ${activeTab === 'past' ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                            Past
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Appointments List */}
            <ScrollView className="flex-1 px-5 pt-4">
                {displayAppointments.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                        <Text className="text-slate-400 font-medium mt-4">No {activeTab} appointments</Text>
                    </View>
                ) : (
                    displayAppointments.map((apt) => {
                        const statusStyle = getStatusColor(apt.status);
                        return (
                            <View
                                key={apt.id}
                                className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 relative overflow-hidden"
                            >
                                {/* Status indicator bar */}
                                <View className="absolute left-0 top-4 bottom-4 w-1 bg-blue-500 rounded-r-full" />

                                <View className="flex-row items-start ml-2">
                                    {/* Doctor Avatar */}
                                    <View className="h-14 w-14 rounded-full bg-slate-100 items-center justify-center mr-4">
                                        <Ionicons name="person" size={28} color="#64748b" />
                                    </View>

                                    {/* Info */}
                                    <View className="flex-1">
                                        {/* Status Badge */}
                                        <View className={`self-start px-2 py-0.5 rounded-full mb-1 ${statusStyle.bg}`}>
                                            <Text className={`text-xs font-bold capitalize ${statusStyle.text}`}>
                                                {apt.status}
                                            </Text>
                                        </View>

                                        <Text className="text-base font-bold text-slate-900">{apt.doctorName}</Text>
                                        <Text className="text-slate-500 text-sm">{apt.specialty}</Text>

                                        {/* Date & Type */}
                                        <View className="flex-row items-center mt-2 gap-4">
                                            <View className="flex-row items-center">
                                                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                                <Text className="text-slate-600 text-xs ml-1">{apt.date}, {apt.time}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons
                                                    name={apt.type === 'video' ? 'videocam' : 'location'}
                                                    size={14}
                                                    color="#64748b"
                                                />
                                                <Text className="text-slate-600 text-xs ml-1 capitalize">{apt.type}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Action Button */}
                                {activeTab === 'upcoming' && (
                                    <TouchableOpacity className="bg-blue-50 h-11 rounded-xl items-center justify-center mt-4">
                                        <Text className="text-blue-600 font-bold">Manage Booking</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })
                )}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
