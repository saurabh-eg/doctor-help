import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle: string;
}

export default function PatientProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const menuItems: MenuItem[] = [
        { icon: 'person-outline', label: 'Edit Profile', subtitle: 'Change name, phone...' },
        { icon: 'document-text-outline', label: 'Medical History', subtitle: 'Your past consultations' },
        { icon: 'wallet-outline', label: 'Payment Methods', subtitle: 'Manage cards and UPI' },
        { icon: 'heart-outline', label: 'Health Records', subtitle: 'Lab reports, prescriptions' },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'Theme, notifications...' },
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs and contact us' },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const displayName = user?.name || 'Patient';
    const displayPhone = user?.phone
        ? `+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`
        : '+91 XXXXX XXXXX';

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header with Profile */}
            <View className="bg-white px-5 pt-4 pb-8 rounded-b-3xl items-center border-b border-slate-100">
                {/* Avatar */}
                <View className="relative mb-4">
                    <View className="h-24 w-24 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-lg">
                        <Ionicons name="person" size={48} color="#64748b" />
                    </View>
                    <TouchableOpacity className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
                        <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                </View>

                {/* User Info */}
                <Text className="text-2xl font-bold text-slate-900">{displayName}</Text>
                <Text className="text-slate-500 font-medium">{displayPhone}</Text>

                {/* Quick Stats */}
                <View className="flex-row mt-6 gap-6">
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-blue-600">0</Text>
                        <Text className="text-slate-500 text-xs font-medium">Bookings</Text>
                    </View>
                    <View className="h-10 w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-emerald-600">₹0</Text>
                        <Text className="text-slate-500 text-xs font-medium">Saved</Text>
                    </View>
                    <View className="h-10 w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-amber-600">0</Text>
                        <Text className="text-slate-500 text-xs font-medium">Doctors</Text>
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
                            <Text className="text-base font-bold text-slate-900">{item.label}</Text>
                            <Text className="text-slate-400 text-sm">{item.subtitle}</Text>
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
