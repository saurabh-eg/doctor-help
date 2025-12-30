import { View, Text, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleSelectScreen() {
    const router = useRouter();
    const { setRole, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

    const handleRoleSelect = async (role: 'patient' | 'doctor') => {
        setSelectedRole(role);
        setIsLoading(true);

        try {
            const response = await setRole(role);

            if (response.success) {
                // Check if user needs to complete profile
                if (!user?.isProfileComplete) {
                    // New user - needs to complete profile first
                    router.replace({
                        pathname: '/(auth)/profile-setup',
                        params: { role }
                    });
                } else {
                    // Existing user with complete profile
                    if (role === 'patient') {
                        router.replace('/(patient)/home');
                    } else {
                        // Doctor - go to verification/registration
                        router.replace('/(doctor)/verification');
                    }
                }
            } else {
                Alert.alert('Error', response.error || 'Failed to set role. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedRole(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center pt-12">
                {/* Header */}
                <View className="items-center mb-12">
                    <View className="h-24 w-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm overflow-hidden">
                        <Image
                            source={require('../../assets/logo.jpg')}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 mb-2 text-center px-6" style={{ flexWrap: 'wrap' }}>
                        How would you like to use
                    </Text>
                    <Text className="text-2xl font-bold text-blue-600">Doctor Help?</Text>
                </View>

                {/* Role Options */}
                <Pressable
                    className={`border-2 rounded-2xl p-5 mb-4 flex-row items-center ${selectedRole === 'patient' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                        }`}
                    onPress={() => handleRoleSelect('patient')}
                    disabled={isLoading}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <View className="h-14 w-14 bg-blue-50 rounded-xl items-center justify-center mr-4">
                        {isLoading && selectedRole === 'patient' ? (
                            <ActivityIndicator color="#197fe6" />
                        ) : (
                            <Ionicons name="person" size={28} color="#197fe6" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900" style={{ flexWrap: 'wrap' }}>I'm a Patient</Text>
                        <Text className="text-slate-500" style={{ flexWrap: 'wrap' }}>Find doctors and book appointments</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                </Pressable>

                <Pressable
                    className={`border-2 rounded-2xl p-5 flex-row items-center ${selectedRole === 'doctor' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
                        }`}
                    onPress={() => handleRoleSelect('doctor')}
                    disabled={isLoading}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <View className="h-14 w-14 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                        {isLoading && selectedRole === 'doctor' ? (
                            <ActivityIndicator color="#10b981" />
                        ) : (
                            <Ionicons name="medkit" size={28} color="#10b981" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900" style={{ flexWrap: 'wrap' }}>I'm a Doctor</Text>
                        <Text className="text-slate-500" style={{ flexWrap: 'wrap' }}>Manage patients and consultations</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                </Pressable>

                {/* Footer Note */}
                <Text className="text-center text-slate-400 text-sm mt-8" style={{ flexWrap: 'wrap' }}>
                    You can switch roles anytime from settings
                </Text>
            </View>
        </SafeAreaView>
    );
}
