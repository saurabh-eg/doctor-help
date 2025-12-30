import { View, Text, ScrollView, TouchableOpacity, Alert, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { usePatient } from '../../contexts/PatientContext';
import { useState, useCallback } from 'react';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle: string;
    route?: string;
}

// Format currency
const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
};

export default function PatientProfileScreen() {
    const router = useRouter();
    const { user, logout, isGuest, setGuestMode } = useAuth();
    const { stats, refreshAll } = usePatient();
    const [refreshing, setRefreshing] = useState(false);

    const menuItems: MenuItem[] = [
        { icon: 'person-outline', label: 'Edit Profile', subtitle: 'Change name, phone...' },
        { icon: 'document-text-outline', label: 'Medical History', subtitle: 'Your past consultations' },
        { icon: 'wallet-outline', label: 'Payment Methods', subtitle: 'Manage cards and UPI' },
        { icon: 'heart-outline', label: 'Health Records', subtitle: 'Lab reports, prescriptions', route: '/(patient)/records' },
        { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Manage alerts', route: '/(common)/notifications' },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'Theme, notifications...' },
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs and contact us' },
    ];

    const handleMenuPress = (item: MenuItem) => {
        if (item.route) {
            router.push(item.route as any);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

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
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                <View style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 32,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                }}>
                    <View style={{
                        height: 96,
                        width: 96,
                        borderRadius: 48,
                        backgroundColor: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 4,
                        borderColor: '#fff',
                        marginBottom: 16,
                    }}>
                        <Ionicons name="person-outline" size={48} color="#94a3b8" />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>Guest User</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
                        Register to unlock all features
                    </Text>
                    
                    <Pressable
                        onPress={handleLogin}
                        style={({ pressed }) => [{
                            backgroundColor: '#2563eb',
                            paddingVertical: 14,
                            paddingHorizontal: 40,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: pressed ? 0.8 : 1,
                        }]}
                    >
                        <Ionicons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Register / Login</Text>
                    </Pressable>
                </View>

                {/* Benefits of Registering */}
                <ScrollView style={{ flex: 1, padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                        Why Register?
                    </Text>
                    
                    {[
                        { icon: 'calendar' as const, title: 'Book Appointments', desc: 'Schedule visits with verified doctors' },
                        { icon: 'document-text' as const, title: 'Health Records', desc: 'Store prescriptions and lab reports' },
                        { icon: 'notifications' as const, title: 'Reminders', desc: 'Get appointment notifications' },
                        { icon: 'heart' as const, title: 'Save Favorites', desc: 'Quick access to preferred doctors' },
                    ].map((item, i) => (
                        <View 
                            key={i} 
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                backgroundColor: '#fff', 
                                padding: 16, 
                                borderRadius: 16, 
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: '#f1f5f9',
                            }}
                        >
                            <View style={{ backgroundColor: '#eff6ff', padding: 12, borderRadius: 12, marginRight: 16 }}>
                                <Ionicons name={item.icon} size={24} color="#2563eb" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>{item.title}</Text>
                                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Exit Guest Mode */}
                    <Pressable
                        onPress={async () => {
                            await logout();
                            router.replace('/');
                        }}
                        style={({ pressed }) => [{
                            backgroundColor: '#fef2f2',
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            opacity: pressed ? 0.8 : 1,
                            marginTop: 12,
                        }]}
                    >
                        <Text style={{ color: '#dc2626', fontSize: 15, fontWeight: '600' }}>Exit Guest Mode</Text>
                    </Pressable>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    const displayName = user?.name || 'Patient';
    const displayPhone = user?.phone
        ? `+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`
        : '+91 XXXXX XXXXX';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <ScrollView 
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                {/* Header with Profile */}
                <View style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 32,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                }}>
                    {/* Avatar */}
                    <View style={{ position: 'relative', marginBottom: 16 }}>
                        <View style={{
                            height: 96,
                            width: 96,
                            borderRadius: 48,
                            backgroundColor: '#f1f5f9',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 4,
                            borderColor: '#fff',
                        }}>
                            <Ionicons name="person" size={48} color="#64748b" />
                        </View>
                        <TouchableOpacity style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            height: 32,
                            width: 32,
                            backgroundColor: '#2563eb',
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: '#fff',
                        }}>
                            <Ionicons name="pencil" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                        {displayName}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '500', marginTop: 4 }}>
                        {displayPhone}
                    </Text>

                    {/* Quick Stats */}
                    <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#2563eb' }}>
                                {stats.totalBookings}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Bookings
                            </Text>
                        </View>
                        <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>
                                {formatCurrency(stats.savedAmount)}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Saved
                            </Text>
                        </View>
                        <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>
                                {stats.doctorsConsulted}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Doctors
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#f1f5f9',
                            }}
                            activeOpacity={0.7}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={{
                                height: 44,
                                width: 44,
                                borderRadius: 12,
                                backgroundColor: '#f8fafc',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                            }}>
                                <Ionicons name={item.icon} size={22} color="#64748b" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>{item.label}</Text>
                                <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: 16,
                            padding: 16,
                            marginTop: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                        <Text style={{ color: '#dc2626', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>Logout</Text>
                    </TouchableOpacity>

                    {/* Bottom padding for tab bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
