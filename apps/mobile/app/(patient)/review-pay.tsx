import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

export default function BookAppointmentScreen() {
    const { doctorId, doctorName, specialization, fee, date, time, endTime } = useLocalSearchParams<{
        doctorId: string;
        doctorName: string;
        specialization: string;
        fee: string;
        date: string;
        time: string;
        endTime: string;
    }>();
    const router = useRouter();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [symptoms, setSymptoms] = useState('');

    const consultationFee = parseInt(fee || '0');

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleConfirm = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to book an appointment');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientId: user.id,
                    doctorId,
                    date,
                    timeSlot: { start: time, end: endTime || time },
                    type: 'clinic',
                    symptoms: symptoms || 'General consultation'
                })
            });

            const data = await response.json();

            if (data.success) {
                router.replace({
                    pathname: '/(patient)/success',
                    params: {
                        appointmentId: data.data?._id,
                        doctorName,
                        date,
                        time
                    }
                });
            } else {
                Alert.alert('Booking Failed', data.error || 'Could not book appointment. Please try again.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4">
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </Pressable>
                <Text className="text-xl font-bold text-slate-900 ml-4">Confirm Booking</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Doctor Info Card */}
                <View className="bg-blue-50 p-4 rounded-2xl flex-row items-center mt-4">
                    <View className="h-14 w-14 bg-blue-100 rounded-full items-center justify-center mr-4">
                        <Ionicons name="person" size={28} color="#197fe6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900" style={{ flexWrap: 'wrap' }}>{doctorName}</Text>
                        <Text className="text-slate-600" style={{ flexWrap: 'wrap' }}>{specialization}</Text>
                    </View>
                </View>

                {/* Appointment Details */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Appointment Details</Text>
                    <View className="bg-slate-50 p-4 rounded-2xl">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="calendar" size={20} color="#197fe6" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-slate-500 text-sm">Date</Text>
                                <Text className="text-slate-900 font-semibold" style={{ flexWrap: 'wrap' }}>{formatDate(date)}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="time" size={20} color="#197fe6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-slate-500 text-sm">Time</Text>
                                <Text className="text-slate-900 font-semibold">{time}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                                <Ionicons name="location" size={20} color="#10b981" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-slate-500 text-sm">Consultation Type</Text>
                                <Text className="text-emerald-600 font-semibold">Clinic Visit</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Info */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Payment</Text>
                    <View className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <View className="flex-row items-center">
                            <Ionicons name="cash-outline" size={24} color="#d97706" />
                            <View className="ml-3 flex-1">
                                <Text className="text-amber-800 font-bold" style={{ flexWrap: 'wrap' }}>Pay at Clinic</Text>
                                <Text className="text-amber-700 text-sm" style={{ flexWrap: 'wrap' }}>Payment will be collected after consultation</Text>
                            </View>
                        </View>
                        <View className="mt-4 pt-4 border-t border-amber-200 flex-row justify-between">
                            <Text className="text-slate-700 font-medium">Consultation Fee</Text>
                            <Text className="text-slate-900 font-bold text-lg">₹{consultationFee}</Text>
                        </View>
                    </View>
                </View>

                {/* Important Note */}
                <View className="mt-6 bg-blue-50 p-4 rounded-2xl flex-row items-start">
                    <Ionicons name="information-circle" size={24} color="#197fe6" />
                    <Text className="text-blue-800 ml-3 flex-1 text-sm leading-5">
                        Please arrive 10 minutes before your appointment time. Carry any previous medical reports if available.
                    </Text>
                </View>

                <View className="h-24" />
            </ScrollView>

            {/* Bottom Action */}
            <View className="p-5 border-t border-slate-100">
                <Pressable
                    onPress={handleConfirm}
                    disabled={loading}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`h-14 rounded-xl items-center justify-center ${loading ? 'bg-slate-300' : 'bg-blue-600'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Confirm Appointment</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
