import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle: string;
}

export default function DoctorProfileScreen() {
    const router = useRouter();

    const menuItems: MenuItem[] = [
        { icon: 'person-outline', label: 'Edit Profile', subtitle: 'Update your information' },
        { icon: 'calendar-outline', label: 'Availability', subtitle: 'Set your working hours' },
        { icon: 'card-outline', label: 'Bank Details', subtitle: 'Manage payout methods' },
        { icon: 'document-text-outline', label: 'Documents', subtitle: 'Certificates & licenses' },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'App preferences' },
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs and contact' },
    ];

    const handleLogout = () => {
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-8 rounded-b-3xl items-center border-b border-slate-100">
                {/* Avatar */}
                <View className="relative mb-4">
                    <View className="h-24 w-24 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-lg">
                        <Ionicons name="person" size={48} color="#64748b" />
                    </View>
                    <TouchableOpacity className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
                        <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                    {/* Verified Badge */}
                    <View className="absolute top-0 right-0 bg-blue-600 rounded-full p-1">
                        <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                </View>

                {/* Doctor Info */}
                <Text className="text-2xl font-bold text-slate-900" style={{ flexWrap: 'wrap', textAlign: 'center' }}>Dr. Smith</Text>
                <Text className="text-blue-600 font-medium" style={{ flexWrap: 'wrap' }}>Cardiologist</Text>
                <Text className="text-slate-500 text-sm mt-1" style={{ flexWrap: 'wrap', textAlign: 'center' }}>MBBS, MD - 12 years experience</Text>

                {/* Stats */}
                <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#2563eb' }}>1.2K</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Patients</Text>
                    </View>
                    <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>4.9</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Rating</Text>
                    </View>
                    <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>₹85K</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Earnings</Text>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <ScrollView className="flex-1 px-5 pt-6">
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-slate-100"
                        activeOpacity={0.7}
                    >
                        <View className="h-11 w-11 rounded-xl bg-slate-50 items-center justify-center mr-4">
                            <Ionicons name={item.icon} size={22} color="#64748b" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-slate-900" style={{ flexWrap: 'wrap' }}>{item.label}</Text>
                            <Text className="text-slate-400 text-sm" style={{ flexWrap: 'wrap' }}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                    className="bg-red-50 rounded-2xl p-4 mt-4 flex-row items-center justify-center"
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                    <Text className="text-red-600 font-bold ml-2">Logout</Text>
                </TouchableOpacity>

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
