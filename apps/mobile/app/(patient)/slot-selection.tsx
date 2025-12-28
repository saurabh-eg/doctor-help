import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SlotSelectionScreen() {
    const { doctorId } = useLocalSearchParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(0); // 0 = Today, 1 = Tomorrow, etc.
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Mock dates for next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            dayName: DAYS[d.getDay()],
            dayNum: d.getDate(),
            fullDate: d.toISOString().split('T')[0]
        };
    });

    const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM'];
    const afternoonSlots = ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 ml-4">Select Slot</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Date Selection */}
                <View className="mt-4">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {dates.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedDate(index)}
                                className={`items-center justify-center w-20 h-24 rounded-3xl mr-3 ${selectedDate === index ? 'bg-blue-600' : 'bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                <Text className={`text-sm ${selectedDate === index ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {item.dayName}
                                </Text>
                                <Text className={`text-xl font-bold mt-1 ${selectedDate === index ? 'text-white' : 'text-slate-900'}`}>
                                    {item.dayNum}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Slot Selection */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-900 mb-4">Morning Slots</Text>
                    <View className="flex-row flex-wrap">
                        {morningSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot}
                                onPress={() => setSelectedSlot(slot)}
                                className={`px-4 py-3 rounded-2xl mr-3 mb-3 border ${selectedSlot === slot ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`font-semibold ${selectedSlot === slot ? 'text-white' : 'text-slate-600'}`}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-lg font-bold text-slate-900 mt-4 mb-4">Afternoon Slots</Text>
                    <View className="flex-row flex-wrap">
                        {afternoonSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot}
                                onPress={() => setSelectedSlot(slot)}
                                className={`px-4 py-3 rounded-2xl mr-3 mb-3 border ${selectedSlot === slot ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`font-semibold ${selectedSlot === slot ? 'text-white' : 'text-slate-600'}`}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reminder */}
                <Card className="mt-8 flex-row items-center bg-blue-50 border-blue-100">
                    <Ionicons name="information-circle" size={24} color="#197fe6" />
                    <Text className="text-blue-800 ml-3 flex-1 text-sm">
                        You can reschedule or cancel your appointment up to 2 hours before the start time.
                    </Text>
                </Card>

                <View className="h-20" />
            </ScrollView>

            <View className="p-5 border-t border-slate-100">
                <Button
                    title="Continue"
                    disabled={!selectedSlot}
                    onPress={() => router.push({
                        pathname: '/(patient)/review-pay',
                        params: {
                            doctorId,
                            date: dates[selectedDate].fullDate,
                            time: selectedSlot
                        }
                    })}
                />
            </View>
        </SafeAreaView>
    );
}
