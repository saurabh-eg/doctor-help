import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen() {
    const router = useRouter();
    const { doctorName, date, time } = useLocalSearchParams<{
        appointmentId?: string;
        doctorName?: string;
        date?: string;
        time?: string;
    }>();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
            {/* Success Icon */}
            <View className="bg-emerald-50 h-32 w-32 rounded-full items-center justify-center mb-8">
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-slate-900 text-center mb-2" style={{ flexWrap: 'wrap' }}>
                Booking Confirmed!
            </Text>
            <Text className="text-slate-500 text-center text-base mb-8" style={{ flexWrap: 'wrap' }}>
                Your appointment has been successfully booked.
            </Text>

            {/* Appointment Summary */}
            {doctorName && (
                <View className="w-full bg-slate-50 p-5 rounded-2xl mb-8">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="person" size={20} color="#197fe6" />
                        </View>
                        <Text className="ml-3 font-bold text-slate-900 flex-1" style={{ flexWrap: 'wrap' }}>{doctorName}</Text>
                    </View>
                    <View className="flex-row">
                        <View className="flex-1 flex-row items-center">
                            <Ionicons name="calendar-outline" size={16} color="#64748b" />
                            <Text className="ml-2 text-slate-600">{formatDate(date || '')}</Text>
                        </View>
                        <View className="flex-1 flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#64748b" />
                            <Text className="ml-2 text-slate-600">{time}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Reminder */}
            <View className="w-full bg-amber-50 p-4 rounded-2xl mb-8 flex-row items-start">
                <Ionicons name="cash-outline" size={24} color="#d97706" />
                <Text className="ml-3 text-amber-800 flex-1 text-sm" style={{ flexWrap: 'wrap' }}>
                    Remember to pay at the clinic after your consultation.
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="w-full">
                <Pressable
                    onPress={() => router.replace('/(patient)/bookings')}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="bg-blue-600 h-14 rounded-xl items-center justify-center mb-3"
                >
                    <Text className="text-white font-bold text-lg">View My Appointments</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.replace('/(patient)/home')}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="h-14 items-center justify-center"
                >
                    <Text className="text-blue-600 font-bold text-lg">Back to Home</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
