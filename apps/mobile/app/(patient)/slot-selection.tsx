import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Doctor {
    _id: string;
    userId: { name: string };
    specialization: string;
    consultationFee: number;
    availableSlots: { day: number; startTime: string; endTime: string }[];
}

// Generate time slots from start to end
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        slots.push(`${displayHour}:00 ${period}`);
    }
    return slots;
};

export default function SlotSelectionScreen() {
    const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Generate dates for next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            dayName: DAYS[d.getDay()],
            dayNum: d.getDate(),
            dayOfWeek: d.getDay(),
            fullDate: d.toISOString().split('T')[0]
        };
    });

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`);
                const data = await response.json();
                if (data.success) {
                    setDoctor(data.data);
                }
            } catch (error) {
                console.error('Error fetching doctor:', error);
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) fetchDoctor();
    }, [doctorId]);

    // Get available slots for selected date
    const getAvailableSlots = () => {
        if (!doctor?.availableSlots) return { morning: [], afternoon: [] };

        const selectedDayOfWeek = dates[selectedDate].dayOfWeek;
        const slotsForDay = doctor.availableSlots.filter(s => s.day === selectedDayOfWeek);

        const allSlots: string[] = [];
        slotsForDay.forEach(slot => {
            allSlots.push(...generateTimeSlots(slot.startTime, slot.endTime));
        });

        return {
            morning: allSlots.filter(s => s.includes('AM') || s.includes('12:00 PM')),
            afternoon: allSlots.filter(s => s.includes('PM') && !s.includes('12:00 PM'))
        };
    };

    const { morning, afternoon } = getAvailableSlots();

    // Calculate end time (1 hour after start)
    const calculateEndTime = (startTime: string): string => {
        const [timePart, period] = startTime.split(' ');
        let [hour] = timePart.split(':').map(Number);

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        hour = (hour + 1) % 24;

        const newPeriod = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:00 ${newPeriod}`;
    };

    const handleContinue = () => {
        if (!selectedSlot || !doctor) return;

        const endTime = calculateEndTime(selectedSlot);

        router.push({
            pathname: '/(patient)/review-pay',
            params: {
                doctorId: doctor._id,
                doctorName: doctor.userId?.name,
                specialization: doctor.specialization,
                fee: doctor.consultationFee.toString(),
                date: dates[selectedDate].fullDate,
                time: selectedSlot,
                endTime: endTime
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#197fe6" />
            </SafeAreaView>
        );
    }

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
                <Text className="text-xl font-bold text-slate-900 ml-4">Select Slot</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Doctor Info */}
                {doctor && (
                    <View className="bg-blue-50 p-4 rounded-2xl mb-6 flex-row items-center">
                        <View className="h-12 w-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="person" size={24} color="#197fe6" />
                        </View>
                        <View>
                            <Text className="font-bold text-slate-900">{doctor.userId?.name}</Text>
                            <Text className="text-slate-500 text-sm">{doctor.specialization}</Text>
                        </View>
                    </View>
                )}

                {/* Date Selection */}
                <View>
                    <Text className="text-lg font-bold text-slate-900 mb-4">Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {dates.map((item, index) => (
                            <Pressable
                                key={index}
                                onPress={() => {
                                    setSelectedDate(index);
                                    setSelectedSlot(null);
                                }}
                                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                className={`items-center justify-center w-20 h-24 rounded-3xl mr-3 ${selectedDate === index ? 'bg-blue-600' : 'bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                <Text className={`text-sm ${selectedDate === index ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {item.dayName}
                                </Text>
                                <Text className={`text-xl font-bold mt-1 ${selectedDate === index ? 'text-white' : 'text-slate-900'}`}>
                                    {item.dayNum}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Slots */}
                {morning.length === 0 && afternoon.length === 0 ? (
                    <View className="mt-8 items-center py-8 bg-slate-50 rounded-2xl">
                        <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                        <Text className="text-slate-500 mt-4">No slots available on this day</Text>
                        <Text className="text-slate-400 text-sm mt-1">Try selecting another date</Text>
                    </View>
                ) : (
                    <View className="mt-8">
                        {morning.length > 0 && (
                            <>
                                <Text className="text-lg font-bold text-slate-900 mb-4">
                                    <Ionicons name="sunny-outline" size={18} color="#f59e0b" /> Morning
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {morning.map((slot) => (
                                        <Pressable
                                            key={slot}
                                            onPress={() => setSelectedSlot(slot)}
                                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                            className={`px-4 py-3 rounded-2xl mr-3 mb-3 border ${selectedSlot === slot ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                                }`}
                                        >
                                            <Text className={`font-semibold ${selectedSlot === slot ? 'text-white' : 'text-slate-600'}`}>
                                                {slot}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}

                        {afternoon.length > 0 && (
                            <>
                                <Text className="text-lg font-bold text-slate-900 mt-4 mb-4">
                                    <Ionicons name="partly-sunny-outline" size={18} color="#f97316" /> Afternoon
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {afternoon.map((slot) => (
                                        <Pressable
                                            key={slot}
                                            onPress={() => setSelectedSlot(slot)}
                                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                            className={`px-4 py-3 rounded-2xl mr-3 mb-3 border ${selectedSlot === slot ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                                }`}
                                        >
                                            <Text className={`font-semibold ${selectedSlot === slot ? 'text-white' : 'text-slate-600'}`}>
                                                {slot}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                )}

                {/* Info Card */}
                <View className="mt-8 bg-blue-50 p-4 rounded-2xl flex-row items-start">
                    <Ionicons name="information-circle" size={24} color="#197fe6" />
                    <Text className="text-blue-800 ml-3 flex-1 text-sm leading-5">
                        Payment will be collected at the clinic after your consultation.
                    </Text>
                </View>

                <View className="h-24" />
            </ScrollView>

            {/* Bottom Action */}
            <View className="p-5 border-t border-slate-100">
                <Pressable
                    onPress={handleContinue}
                    disabled={!selectedSlot}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`h-14 rounded-xl items-center justify-center ${selectedSlot ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                >
                    <Text className={`font-bold text-lg ${selectedSlot ? 'text-white' : 'text-slate-400'}`}>
                        Continue
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
