import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@doctor-help/api-client';

export default function ReviewPayScreen() {
    const { doctorId, date, time } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Mock doctor data (should be fetched or passed)
    const doctor = {
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiologist',
        fee: 500
    };

    const tax = 50;
    const total = doctor.fee + tax;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (!user) {
                Alert.alert('Error', 'You must be logged in to book an appointment');
                return;
            }

            // Real API call
            const result = await api.appointments.create({
                patientId: user.id,
                doctorId: doctorId as string,
                date: date as string,
                timeSlot: { start: time as string, end: '' }, // We might need to calculate end time
                type: 'clinic',
                symptoms: 'Initial checkup'
            });

            if (result.success) {
                router.replace({
                    pathname: '/(patient)/success',
                    params: { appointmentId: result.data?._id }
                });
            } else {
                Alert.alert('Error', result.error || 'Failed to book appointment');
            }
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 ml-4">Review & Pay</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Doctor Info Card */}
                <Card className="mt-4 flex-row items-center">
                    <Avatar size="lg" name={doctor.name} className="bg-blue-50" />
                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-bold text-slate-900">{doctor.name}</Text>
                        <Text className="text-slate-500">{doctor.specialization}</Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="star" size={14} color="#f59e0b" />
                            <Text className="text-slate-700 font-bold ml-1">4.9</Text>
                        </View>
                    </View>
                </Card>

                {/* Appointment Details */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Appointment Details</Text>
                    <Card>
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text className="text-slate-700 ml-3 font-medium">{date}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={20} color="#64748b" />
                            <Text className="text-slate-700 ml-3 font-medium">{time}</Text>
                        </View>
                    </Card>
                </View>

                {/* Payment Summary */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Payment Summary</Text>
                    <Card>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-slate-500">Consultation Fee</Text>
                            <Text className="text-slate-900 font-medium">₹{doctor.fee}</Text>
                        </View>
                        <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-100">
                            <Text className="text-slate-500">Service Fee & Tax</Text>
                            <Text className="text-slate-900 font-medium">₹{tax}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-slate-900 font-bold">Total Amount</Text>
                            <Text className="text-blue-600 font-bold text-lg">₹{total}</Text>
                        </View>
                    </Card>
                </View>

                <View className="h-20" />
            </ScrollView>

            <View className="p-5 border-t border-slate-100">
                <Button
                    title={`Pay & Confirm Appointment`}
                    loading={loading}
                    onPress={handleConfirm}
                />
            </View>
        </SafeAreaView>
    );
}
