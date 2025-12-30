import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role?: string }>();
    const { completeProfile, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleContinue = async () => {
        if (!form.name.trim()) {
            Alert.alert('Required', 'Please enter your name');
            return;
        }

        if (form.name.trim().length < 2) {
            Alert.alert('Invalid Name', 'Name must be at least 2 characters');
            return;
        }

        // Validate email if provided
        if (form.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email.trim())) {
                Alert.alert('Invalid Email', 'Please enter a valid email address');
                return;
            }
        }

        setIsLoading(true);
        try {
            const response = await completeProfile({
                name: form.name.trim(),
                email: form.email.trim() || undefined,
            });

            if (response.success) {
                // Navigate based on role
                const userRole = role || user?.role || 'patient';
                if (userRole === 'doctor') {
                    router.replace('/(doctor)/verification');
                } else {
                    router.replace('/(patient)/home');
                }
            } else {
                Alert.alert('Error', response.error || 'Failed to save profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="flex-grow p-6 pt-12">
                    {/* Header Icon */}
                    <View className="items-center mb-8">
                        <View className="h-20 w-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                            <Ionicons name="person-add" size={40} color="#2563eb" />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</Text>
                        <Text className="text-slate-500 text-center text-base px-4" style={{ flexWrap: 'wrap' }}>
                            Help us personalize your experience
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4">
                        {/* Name Input */}
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
                                Full Name <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center border border-slate-200 rounded-xl bg-slate-50 h-14 px-4">
                                <Ionicons name="person-outline" size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 ml-3 text-base text-slate-900"
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#94a3b8"
                                    value={form.name}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                                    editable={!isLoading}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
                                Email Address <Text className="text-slate-400">(Optional)</Text>
                            </Text>
                            <View className="flex-row items-center border border-slate-200 rounded-xl bg-slate-50 h-14 px-4">
                                <Ionicons name="mail-outline" size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 ml-3 text-base text-slate-900"
                                    placeholder="your.email@example.com"
                                    placeholderTextColor="#94a3b8"
                                    value={form.email}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                                    editable={!isLoading}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            <Text className="text-xs text-slate-400 mt-1.5 ml-1">
                                We'll use this for appointment confirmations
                            </Text>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <Pressable
                        onPress={handleContinue}
                        disabled={!form.name.trim() || isLoading}
                        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                        className={`h-14 rounded-xl items-center justify-center mt-8 ${
                            form.name.trim() && !isLoading ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center">
                                <Text className={`font-bold text-lg ${form.name.trim() ? 'text-white' : 'text-slate-400'}`}>
                                    Continue
                                </Text>
                                <Ionicons 
                                    name="arrow-forward" 
                                    size={20} 
                                    color={form.name.trim() ? '#fff' : '#94a3b8'} 
                                    style={{ marginLeft: 8 }}
                                />
                            </View>
                        )}
                    </Pressable>

                    {/* Privacy Note */}
                    <View className="flex-row items-center justify-center mt-6 px-4">
                        <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                        <Text className="text-xs text-slate-400 ml-2 text-center" style={{ flexWrap: 'wrap' }}>
                            Your information is secure and will never be shared
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
