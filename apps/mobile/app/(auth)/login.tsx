import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { sendOtp } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (phoneNumber.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
            return;
        }

        setIsLoading(true);
        try {
            const response = await sendOtp(phoneNumber);

            if (response.success) {
                // In development, show OTP for testing
                if (response.debug_otp) {
                    Alert.alert('Dev OTP', `Your OTP is: ${response.debug_otp}`);
                }

                requestAnimationFrame(() => {
                    router.push({
                        pathname: "/(auth)/verify-otp",
                        params: { phoneNumber }
                    });
                });
            } else {
                Alert.alert('Error', response.error || 'Failed to send OTP');
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
                <ScrollView contentContainerClassName="flex-grow justify-center p-6 pt-12">

                    {/* Header Section */}
                    <View className="items-center mb-12">
                        <View className="h-28 w-28 bg-white rounded-full items-center justify-center mb-6 shadow-sm overflow-hidden">
                            <Image
                                source={require('../../assets/logo.jpg')}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</Text>
                        <Text className="text-slate-500 text-center text-base leading-6 px-8" style={{ flexWrap: 'wrap' }}>
                            Enter your mobile number to access your medical records
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View>
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">Mobile Number</Text>
                            <View className="flex-row items-center border border-slate-200 rounded-xl bg-slate-50 h-14 overflow-hidden">
                                <View className="bg-slate-100 h-full justify-center px-4 border-r border-slate-200">
                                    <Text className="text-slate-600 font-semibold">+91</Text>
                                </View>
                                <TextInput
                                    className="flex-1 px-4 text-lg text-slate-900 font-medium h-full"
                                    placeholder="98765 43210"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSendOTP}
                            disabled={isLoading || phoneNumber.length !== 10}
                            style={({ pressed }) => [
                                { opacity: pressed ? 0.8 : 1 }
                            ]}
                            className={`h-14 rounded-xl items-center justify-center ${phoneNumber.length === 10 && !isLoading
                                ? 'bg-blue-600'
                                : 'bg-blue-300'
                                }`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Get OTP</Text>
                            )}
                        </Pressable>

                        <Text className="text-xs text-slate-400 text-center mt-4">
                            By continuing, you agree to our Terms of Service & Privacy Policy
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
