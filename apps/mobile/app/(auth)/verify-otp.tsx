import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl
    || process.env.EXPO_PUBLIC_API_URL
    || 'http://localhost:3001/api';

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
    const { verifyOtp, sendOtp, token } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto focus previous input on delete
        if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Check if doctor profile exists
    const checkDoctorProfile = async (userId: string, authToken: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            return data.success && data.data !== null;
        } catch (error) {
            console.error('Error checking doctor profile:', error);
            return false;
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) return;

        if (!phoneNumber) {
            Alert.alert('Error', 'Phone number not found');
            router.back();
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyOtp(phoneNumber, otpString);

            if (response.success && response.user) {
                const { user } = response;
                
                // Determine where to navigate based on user state
                if (response.isNewUser) {
                    // New user -> Role selection
                    router.replace('/(auth)/role-select');
                } else if (!user.isProfileComplete) {
                    // Existing user without complete profile -> Profile setup
                    router.replace('/(auth)/profile-setup');
                } else {
                    // Existing user with complete profile -> Go to dashboard based on role
                    if (user.role === 'doctor') {
                        // Check if doctor has verification/profile
                        const authToken = token || '';
                        const hasDoctorProfile = await checkDoctorProfile(user.id, authToken);
                        
                        if (hasDoctorProfile) {
                            router.replace('/(doctor)/dashboard');
                        } else {
                            router.replace('/(doctor)/verification');
                        }
                    } else if (user.role === 'admin') {
                        // Admin role - redirect to login page (admin uses web)
                        Alert.alert('Admin Access', 'Please use the web admin panel to access admin features.');
                        router.replace('/(auth)/login');
                    } else {
                        // Patient
                        router.replace('/(patient)/home');
                    }
                }
            } else {
                Alert.alert('Error', response.error || 'Invalid OTP');
                // Clear OTP on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || !phoneNumber) return;
        
        setCountdown(30);
        try {
            const response = await sendOtp(phoneNumber);
            if (response.success) {
                if (response.debug_otp) {
                    Alert.alert('Dev OTP', `Your new OTP is: ${response.debug_otp}`);
                } else {
                    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
                }
            } else {
                Alert.alert('Error', response.error || 'Failed to resend OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="flex-grow p-6 pt-12">

                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        className="mb-8 w-10 h-10 items-center justify-center bg-slate-50 rounded-full border border-slate-100"
                    >
                        <Text className="text-slate-600 text-xl font-bold">←</Text>
                    </Pressable>

                    <View className="mb-10">
                        <Text className="text-3xl font-bold text-slate-900 mb-2">Verify Phone</Text>
                        <Text className="text-slate-500 text-base" style={{ flexWrap: 'wrap' }}>
                            Code sent to <Text className="font-bold text-slate-900">+91 {phoneNumber || "your number"}</Text>
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-10">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                className={`w-12 h-14 border rounded-xl text-center text-2xl font-bold bg-slate-50 ${digit ? 'border-blue-500 text-blue-600' : 'border-slate-200 text-slate-900'}`}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                editable={!isLoading}
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                        inputRefs.current[index - 1]?.focus();
                                    }
                                }}
                            />
                        ))}
                    </View>

                    <Pressable
                        onPress={handleVerify}
                        disabled={otp.some(d => !d) || isLoading}
                        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                        className={`h-14 rounded-xl items-center justify-center transition-all ${otp.some(d => !d) || isLoading ? 'bg-slate-200' : 'bg-blue-600'
                            }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${otp.some(d => !d) ? 'text-slate-400' : 'text-white'}`}>
                                Verify & Proceed
                            </Text>
                        )}
                    </Pressable>

                    <View className="flex-row justify-center mt-8">
                        <Text style={{ color: '#64748b', fontSize: 14 }}>Didn't receive code? </Text>
                        <Pressable
                            onPress={handleResend}
                            disabled={countdown > 0}
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                            <Text style={{ 
                                color: countdown > 0 ? '#64748b' : '#2563eb', 
                                fontWeight: countdown > 0 ? '500' : '700',
                                fontSize: 14
                            }}>
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                            </Text>
                        </Pressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
