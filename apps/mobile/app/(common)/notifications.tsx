import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
    id: string;
    type: 'appointment' | 'reminder' | 'system' | 'promo';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'appointment',
            title: 'Appointment Confirmed',
            message: 'Your appointment with Dr. Sharma is confirmed for tomorrow at 10:00 AM',
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            type: 'reminder',
            title: 'Appointment Reminder',
            message: 'Don\'t forget your appointment with Dr. Patel today at 3:00 PM',
            time: '5 hours ago',
            read: false,
        },
        {
            id: '3',
            type: 'system',
            title: 'Profile Updated',
            message: 'Your profile information has been successfully updated',
            time: '1 day ago',
            read: true,
        },
        {
            id: '4',
            type: 'promo',
            title: 'Health Tip',
            message: 'Stay hydrated! Drink at least 8 glasses of water daily for better health',
            time: '2 days ago',
            read: true,
        },
    ]);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'appointment':
                return { name: 'calendar', color: '#2563eb', bg: '#eff6ff' };
            case 'reminder':
                return { name: 'alarm', color: '#f59e0b', bg: '#fffbeb' };
            case 'system':
                return { name: 'checkmark-circle', color: '#10b981', bg: '#ecfdf5' };
            case 'promo':
                return { name: 'heart', color: '#ec4899', bg: '#fdf2f8' };
            default:
                return { name: 'notifications', color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [{
                            opacity: pressed ? 0.6 : 1,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#f8fafc',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </Pressable>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
                        Notifications
                    </Text>
                    {unreadCount > 0 && (
                        <View style={{
                            backgroundColor: '#ef4444',
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginLeft: 8,
                        }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>

                {unreadCount > 0 && (
                    <Pressable
                        onPress={markAllAsRead}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>
                            Mark all read
                        </Text>
                    </Pressable>
                )}
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 80 }}>
                        <View style={{
                            backgroundColor: '#f1f5f9',
                            padding: 24,
                            borderRadius: 50,
                            marginBottom: 16,
                        }}>
                            <Ionicons name="notifications-off-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>
                            No Notifications
                        </Text>
                        <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center' }}>
                            You're all caught up! Check back later.
                        </Text>
                    </View>
                ) : (
                    notifications.map((notification) => {
                        const iconConfig = getIconForType(notification.type);
                        return (
                            <Pressable
                                key={notification.id}
                                onPress={() => markAsRead(notification.id)}
                                style={({ pressed }) => [{
                                    opacity: pressed ? 0.9 : 1,
                                    backgroundColor: notification.read ? '#fff' : '#eff6ff',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: notification.read ? '#f1f5f9' : '#dbeafe',
                                }]}
                            >
                                {/* Icon */}
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: iconConfig.bg,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}>
                                    <Ionicons
                                        name={iconConfig.name as any}
                                        size={22}
                                        color={iconConfig.color}
                                    />
                                </View>

                                {/* Content */}
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                fontWeight: notification.read ? '600' : '700',
                                                color: '#0f172a',
                                                flex: 1,
                                                marginRight: 8,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {notification.title}
                                        </Text>
                                        {!notification.read && (
                                            <View style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#2563eb',
                                                marginTop: 6,
                                            }} />
                                        )}
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: '#64748b',
                                            marginTop: 4,
                                            lineHeight: 20,
                                        }}
                                        numberOfLines={2}
                                    >
                                        {notification.message}
                                    </Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#94a3b8',
                                        marginTop: 8,
                                    }}>
                                        {notification.time}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}

                {/* Bottom padding */}
                <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
