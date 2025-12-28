import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

// Helper to get greeting based on time
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

interface Stat {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}

interface Appointment {
    id: string;
    patientName: string;
    time: string;
    type: 'video' | 'clinic';
    symptoms: string;
}

export default function DoctorDashboardScreen() {
    const { user } = useAuth();

    const greeting = getGreeting();
    const displayName = user?.name || 'Doctor';

    const stats: Stat[] = [
        { label: 'Total Patients', value: '0', icon: 'people', color: '#3b82f6', bgColor: '#eff6ff' },
        { label: "Today's Visits", value: '0', icon: 'medical', color: '#10b981', bgColor: '#ecfdf5' },
        { label: 'Pending', value: '0', icon: 'time', color: '#f59e0b', bgColor: '#fffbeb' },
    ];

    const nextAppointment: Appointment | null = null; // Will be fetched from API

    const pendingRequests: Appointment[] = []; // Will be fetched from API

    const tools = [
        { label: 'Availability', icon: 'calendar' as const, color: '#3b82f6', bgColor: '#eff6ff' },
        { label: 'Calendar', icon: 'calendar-outline' as const, color: '#8b5cf6', bgColor: '#f5f3ff' },
        { label: 'Records', icon: 'folder-open' as const, color: '#10b981', bgColor: '#ecfdf5' },
        { label: 'Notes', icon: 'document-text' as const, color: '#f59e0b', bgColor: '#fffbeb' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-4 pb-4 flex-row items-center justify-between bg-white border-b border-slate-100">
                <View className="flex-row items-center">
                    <View className="h-12 w-12 rounded-full bg-slate-100 items-center justify-center mr-3 border-2 border-white shadow">
                        <Ionicons name="person" size={24} color="#64748b" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900">{greeting}, Dr. {displayName}</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={14} color="#197fe6" />
                            <Text className="text-xs text-blue-600 ml-1 font-medium">Verified Practitioner</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity className="h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
                    <Ionicons name="notifications-outline" size={22} color="#334155" />
                    <View className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-4">
                {/* Stats */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-1">
                    {stats.map((stat, i) => (
                        <View
                            key={i}
                            className="bg-white rounded-2xl p-4 mr-3 border border-slate-100 min-w-[140px]"
                        >
                            <View className="flex-row items-center mb-2">
                                <View
                                    className="h-8 w-8 rounded-lg items-center justify-center mr-2"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <Ionicons name={stat.icon} size={18} color={stat.color} />
                                </View>
                                <Text className="text-xs text-slate-400 font-bold uppercase">{stat.label}</Text>
                            </View>
                            <Text className="text-2xl font-bold text-slate-900">{stat.value}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Up Next */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-bold text-slate-900">Up Next</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold text-sm">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {nextAppointment ? (
                        <View className="bg-white rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                            <View className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            {/* Appointment content */}
                        </View>
                    ) : (
                        <View className="bg-white rounded-2xl p-6 border border-slate-100 items-center">
                            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-2">No upcoming appointments</Text>
                        </View>
                    )}
                </View>

                {/* Clinical Tools */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-slate-900 mb-3">Clinical Tools</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {tools.map((tool, i) => (
                            <TouchableOpacity
                                key={i}
                                className="bg-white rounded-2xl p-4 border border-slate-100 items-center mb-3"
                                style={{ width: '48%' }}
                            >
                                <View
                                    className="h-12 w-12 rounded-full items-center justify-center mb-2"
                                    style={{ backgroundColor: tool.bgColor }}
                                >
                                    <Ionicons name={tool.icon} size={24} color={tool.color} />
                                </View>
                                <Text className="text-sm font-bold text-slate-900">{tool.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
