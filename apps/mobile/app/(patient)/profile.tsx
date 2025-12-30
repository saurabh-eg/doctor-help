import { View, Text, ScrollView, TouchableOpacity, Alert, Pressable } from 'react-native';
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
    const { user, logout, isGuest, setGuestMode } = useAuth();

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
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const handleLogin = async () => {
        await setGuestMode(false);
        router.push('/(auth)/login');
    };

    // Guest Profile View
    if (isGuest) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50">
                <View className="bg-white px-5 pt-4 pb-8 rounded-b-3xl items-center border-b border-slate-100">
                    <View className="h-24 w-24 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-lg mb-4">
                        <Ionicons name="person-outline" size={48} color="#94a3b8" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 mb-1">Guest User</Text>
                    <Text className="text-slate-500 text-center mb-6">Register to unlock all features</Text>
                    
                    <Pressable
                        onPress={handleLogin}
                        style={({ pressed }) => [
                            {
                                backgroundColor: '#2563eb',
                                paddingVertical: 14,
                                paddingHorizontal: 40,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: pressed ? 0.8 : 1,
                            }
                        ]}
                    >
                        <Ionicons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Register / Login</Text>
                    </Pressable>
                </View>

                {/* Benefits of Registering */}
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                        Why Register?
                    </Text>
                    
                    {[
                        { icon: 'calendar', title: 'Book Appointments', desc: 'Schedule visits with verified doctors' },
                        { icon: 'document-text', title: 'Health Records', desc: 'Store prescriptions and lab reports' },
                        { icon: 'notifications', title: 'Reminders', desc: 'Get appointment notifications' },
                        { icon: 'heart', title: 'Save Favorites', desc: 'Quick access to preferred doctors' },
                    ].map((item, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12 }}>
                            <View style={{ backgroundColor: '#eff6ff', padding: 12, borderRadius: 12, marginRight: 16 }}>
                                <Ionicons name={item.icon as any} size={24} color="#2563eb" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>{item.title}</Text>
                                <Text style={{ color: '#64748b', fontSize: 13 }}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Exit Guest Mode */}
                <View style={{ paddingHorizontal: 20, marginTop: 'auto', paddingBottom: 20 }}>
                    <Pressable
                        onPress={async () => {
                            await logout();
                            router.replace('/');
                        }}
                        style={({ pressed }) => [
                            {
                                backgroundColor: '#fef2f2',
                                paddingVertical: 14,
                                borderRadius: 12,
                                alignItems: 'center',
                                opacity: pressed ? 0.8 : 1,
                            }
                        ]}
                    >
                        <Text style={{ color: '#dc2626', fontSize: 15, fontWeight: '600' }}>Exit Guest Mode</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

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
                <Text className="text-2xl font-bold text-slate-900" style={{ flexWrap: 'wrap', textAlign: 'center' }}>{displayName}</Text>
                <Text className="text-slate-500 font-medium" style={{ flexWrap: 'wrap' }}>{displayPhone}</Text>

                {/* Quick Stats */}
                <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center' }}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#2563eb' }}>0</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Bookings</Text>
                    </View>
                    <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>₹0</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Saved</Text>
                    </View>
                    <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>0</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Doctors</Text>
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
