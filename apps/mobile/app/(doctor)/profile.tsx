import { View, Text, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctor } from '../../contexts/DoctorContext';
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

export default function DoctorProfileScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { profile, stats, refreshAll } = useDoctor();
    const [refreshing, setRefreshing] = useState(false);

    const menuItems: MenuItem[] = [
        { icon: 'person-outline', label: 'Edit Profile', subtitle: 'Update your information', route: '/(doctor)/edit-profile' },
        { icon: 'calendar-outline', label: 'Availability', subtitle: 'Set your working hours', route: '/(doctor)/availability' },
        { icon: 'card-outline', label: 'Bank Details', subtitle: 'Manage payout methods' },
        { icon: 'document-text-outline', label: 'Documents', subtitle: 'Certificates & licenses' },
        { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Manage alerts', route: '/(common)/notifications' },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'App preferences' },
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs and contact' },
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

    // Get display values from profile
    const displayName = profile?.userId?.name || 'Doctor';
    const specialization = profile?.specialization || 'Specialist';
    const qualification = profile?.qualification || '';
    const experience = profile?.experience || 0;
    const isVerified = profile?.isVerified ?? false;
    const photoUrl = profile?.photoUrl;
    const rating = profile?.rating || 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <ScrollView 
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                {/* Header */}
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
                            overflow: 'hidden',
                        }}>
                            {photoUrl ? (
                                <Image 
                                    source={{ uri: photoUrl }} 
                                    style={{ height: 96, width: 96, borderRadius: 48 }}
                                />
                            ) : (
                                <Ionicons name="person" size={48} color="#64748b" />
                            )}
                        </View>
                        <TouchableOpacity 
                            onPress={() => router.push('/(doctor)/edit-profile')}
                            style={{
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
                            }}
                        >
                            <Ionicons name="pencil" size={14} color="#fff" />
                        </TouchableOpacity>
                        
                        {/* Verified Badge */}
                        {isVerified && (
                            <View style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                backgroundColor: '#2563eb',
                                borderRadius: 12,
                                padding: 4,
                            }}>
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            </View>
                        )}
                    </View>

                    {/* Doctor Info */}
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                        Dr. {displayName}
                    </Text>
                    <Text style={{ fontSize: 15, color: '#2563eb', fontWeight: '600', marginTop: 2 }}>
                        {specialization}
                    </Text>
                    {(qualification || experience > 0) && (
                        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
                            {qualification}{qualification && experience > 0 ? ' • ' : ''}{experience > 0 ? `${experience} years experience` : ''}
                        </Text>
                    )}
                    
                    {/* Verification Status */}
                    {!isVerified && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#fef3c7',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            marginTop: 12,
                        }}>
                            <Ionicons name="time-outline" size={14} color="#d97706" />
                            <Text style={{ fontSize: 12, color: '#d97706', fontWeight: '600', marginLeft: 4 }}>
                                Verification Pending
                            </Text>
                        </View>
                    )}

                    {/* Stats */}
                    <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#2563eb' }}>
                                {stats.totalPatients}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Patients
                            </Text>
                        </View>
                        <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>
                                {rating.toFixed(1)}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Rating
                            </Text>
                        </View>
                        <View style={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>
                                {formatCurrency(stats.totalEarnings)}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                                Earnings
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
