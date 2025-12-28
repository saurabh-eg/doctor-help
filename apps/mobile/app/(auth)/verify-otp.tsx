import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
    const { verifyOtp } = useAuth();
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

            if (response.success) {
                // Navigate to role selection for new users, or to home for existing
                router.replace('/(auth)/role-select');
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
        if (countdown > 0) return;
        // Reset countdown
        setCountdown(30);
        // TODO: Call sendOtp again
        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="flex-grow p-6">

                    <TouchableOpacity onPress={() => router.back()} className="mb-8">
                        <Text className="text-blue-600 text-lg">← Back</Text>
                    </TouchableOpacity>

                    <View className="mb-10">
                        <Text className="text-3xl font-bold text-slate-900 mb-2">Verify Phone</Text>
                        <Text className="text-slate-500 text-base">
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

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleVerify}
                        disabled={otp.some(d => !d) || isLoading}
                        className={`h-14 rounded-xl items-center justify-center transition-all ${otp.some(d => !d) || isLoading ? 'bg-slate-200' : 'bg-blue-600 active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${otp.some(d => !d) ? 'text-slate-400' : 'text-white'}`}>
                                Verify & Proceed
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-slate-500">Didn't receive code? </Text>
                        <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                            <Text className={countdown > 0 ? 'text-slate-400' : 'text-blue-600 font-bold'}>
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
