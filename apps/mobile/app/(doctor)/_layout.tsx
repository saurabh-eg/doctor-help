import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function DoctorLayout() {
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
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="grid" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="calendar" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="patients"
                options={{
                    title: 'Patients',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="people" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="wallet" size={24} color={color} />
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
            {/* Hide verification from tabs - it's accessed via navigation only */}
            <Tabs.Screen
                name="verification"
                options={{
                    href: null, // Hides from tab bar
                }}
            />
        </Tabs>
    );
}
