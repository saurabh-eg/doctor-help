import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';

export default function SuccessScreen() {
    const router = useRouter();
    const { appointmentId } = useLocalSearchParams();

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
            <View className="bg-emerald-50 h-32 w-32 rounded-full items-center justify-center mb-8">
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            <Text className="text-3xl font-bold text-slate-900 text-center mb-2">Success!</Text>
            <Text className="text-slate-500 text-center text-lg mb-12">
                Your appointment has been successfully booked. We've sent the confirmation details to your phone.
            </Text>

            <View className="w-full space-y-4">
                <Button
                    title="View Appointments"
                    onPress={() => router.replace('/(patient)/bookings')}
                />
                <TouchableOpacity
                    onPress={() => router.replace('/(patient)/home')}
                    className="h-14 items-center justify-center mt-2"
                >
                    <Text className="text-blue-600 font-bold text-lg">Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
