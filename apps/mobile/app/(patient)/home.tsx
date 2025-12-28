import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

// Helper to get greeting based on time
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export default function PatientHomeScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const greeting = getGreeting();
    const displayName = user?.name || 'Patient';

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-4 pb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-500 text-sm">{greeting},</Text>
                        <Text className="text-2xl font-bold text-slate-900">{displayName} 👋</Text>
                    </View>
                    <TouchableOpacity className="h-11 w-11 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
                        <Ionicons name="notifications-outline" size={24} color="#334155" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-5 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center bg-white h-14 rounded-2xl px-4 shadow-sm border border-slate-100"
                        onPress={() => router.push('/(patient)/search')}
                    >
                        <Ionicons name="search" size={20} color="#197fe6" />
                        <Text className="ml-3 text-slate-400">Search for doctors, labs...</Text>
                    </TouchableOpacity>
                </View>

                {/* Upcoming Appointment Card */}
                <View className="px-5 mb-6">
                    <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                        <View className="flex-row items-center mb-1">
                            <View className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                            <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">Upcoming Appointment</Text>
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-1">Dr. Sarah Johnson</Text>
                        <Text className="text-slate-500 mb-4">Cardiologist • Video Consult</Text>

                        <View className="flex-row items-center bg-slate-50 p-3 rounded-xl mb-4">
                            <Ionicons name="time-outline" size={18} color="#197fe6" />
                            <Text className="ml-2 font-bold text-slate-700">Today, 10:30 AM</Text>
                        </View>

                        <TouchableOpacity className="bg-blue-600 h-14 rounded-xl items-center justify-center">
                            <Text className="text-white font-bold text-base">Join Video Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Medical Services */}
                <View className="px-5 mb-6">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Medical Services</Text>
                    <View className="flex-row justify-between">
                        {[
                            { icon: 'medical', label: 'Consult', color: '#3b82f6', route: '/(patient)/search' },
                            { icon: 'medkit', label: 'Medicine', color: '#10b981', route: null },
                            { icon: 'flask', label: 'Lab Test', color: '#6366f1', route: null },
                            { icon: 'warning', label: 'SOS', color: '#ef4444', route: null },
                        ].map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                className="items-center"
                                onPress={() => item.route && router.push(item.route as any)}
                            >
                                <View
                                    className="h-16 w-16 rounded-2xl items-center justify-center mb-2"
                                    style={{ backgroundColor: `${item.color}15` }}
                                >
                                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                                </View>
                                <Text className="text-xs font-bold text-slate-600">{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Specialties */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center px-5 mb-4">
                        <Text className="text-lg font-bold text-slate-900">Specialties</Text>
                        <TouchableOpacity onPress={() => router.push('/(patient)/search')}>
                            <Text className="text-blue-600 font-bold text-sm">View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                        {['General', 'Cardio', 'Derma', 'Ortho', 'Neuro'].map((specialty, i) => (
                            <TouchableOpacity
                                key={i}
                                className="items-center mr-5"
                                onPress={() => router.push('/(patient)/search')}
                            >
                                <View className="h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-2 border-2 border-slate-200">
                                    <Ionicons name="person" size={32} color="#64748b" />
                                </View>
                                <Text className="text-xs font-bold text-slate-600">{specialty}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
