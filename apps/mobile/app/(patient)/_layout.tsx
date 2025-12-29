import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function PatientLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                },
                tabBarActiveTintColor: '#197fe6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            {/* Main tabs */}
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Find',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="search" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="calendar" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person" size={24} color={color} />
                    ),
                }}
            />

            {/* Hidden screens - part of booking flow, not shown in tab bar */}
            <Tabs.Screen
                name="doctor-profile"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="slot-selection"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="review-pay"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="success"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="ai-assistant"
                options={{ href: null }}
            />
        </Tabs>
    );
}
