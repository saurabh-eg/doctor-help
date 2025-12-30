import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TimeSlot {
    start: string;
    end: string;
    enabled: boolean;
}

interface DaySchedule {
    day: string;
    dayIndex: number;
    enabled: boolean;
    slots: TimeSlot[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00', enabled: true };

export default function AvailabilityScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [schedule, setSchedule] = useState<DaySchedule[]>([
        { day: 'Sunday', dayIndex: 0, enabled: false, slots: [] },
        { day: 'Monday', dayIndex: 1, enabled: true, slots: [{ start: '09:00', end: '13:00', enabled: true }, { start: '14:00', end: '18:00', enabled: true }] },
        { day: 'Tuesday', dayIndex: 2, enabled: true, slots: [{ start: '09:00', end: '13:00', enabled: true }, { start: '14:00', end: '18:00', enabled: true }] },
        { day: 'Wednesday', dayIndex: 3, enabled: true, slots: [{ start: '09:00', end: '13:00', enabled: true }] },
        { day: 'Thursday', dayIndex: 4, enabled: true, slots: [{ start: '09:00', end: '13:00', enabled: true }, { start: '14:00', end: '18:00', enabled: true }] },
        { day: 'Friday', dayIndex: 5, enabled: true, slots: [{ start: '09:00', end: '13:00', enabled: true }] },
        { day: 'Saturday', dayIndex: 6, enabled: true, slots: [{ start: '10:00', end: '14:00', enabled: true }] },
    ]);

    const toggleDay = (dayIndex: number) => {
        setSchedule(prev => prev.map(d => 
            d.dayIndex === dayIndex 
                ? { ...d, enabled: !d.enabled, slots: !d.enabled && d.slots.length === 0 ? [DEFAULT_SLOT] : d.slots }
                : d
        ));
    };

    const addSlot = (dayIndex: number) => {
        setSchedule(prev => prev.map(d => 
            d.dayIndex === dayIndex 
                ? { ...d, slots: [...d.slots, { start: '09:00', end: '17:00', enabled: true }] }
                : d
        ));
    };

    const removeSlot = (dayIndex: number, slotIndex: number) => {
        setSchedule(prev => prev.map(d => 
            d.dayIndex === dayIndex 
                ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) }
                : d
        ));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Availability updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1000);
    };

    const formatTime = (time: string) => {
        const [hours] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHour}:00 ${period}`;
    };

    const enabledDaysCount = schedule.filter(d => d.enabled).length;
    const totalSlots = schedule.reduce((acc, d) => acc + (d.enabled ? d.slots.length : 0), 0);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [{
                            opacity: pressed ? 0.6 : 1,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#f8fafc',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </Pressable>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
                        Availability
                    </Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards */}
                <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#eff6ff',
                        borderRadius: 16,
                        padding: 16,
                        marginRight: 12,
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#2563eb' }}>
                            {enabledDaysCount}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#2563eb', marginTop: 4 }}>
                            Days/Week
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#ecfdf5',
                        borderRadius: 16,
                        padding: 16,
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#059669' }}>
                            {totalSlots}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#059669', marginTop: 4 }}>
                            Time Slots
                        </Text>
                    </View>
                </View>

                {/* Schedule */}
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                    Weekly Schedule
                </Text>

                {schedule.map((day) => (
                    <View
                        key={day.dayIndex}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: day.enabled ? '#dbeafe' : '#f1f5f9',
                        }}
                    >
                        {/* Day Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: day.enabled ? '#eff6ff' : '#f1f5f9',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '700',
                                        color: day.enabled ? '#2563eb' : '#94a3b8',
                                    }}>
                                        {SHORT_DAYS[day.dayIndex]}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: day.enabled ? '#0f172a' : '#94a3b8',
                                    }}>
                                        {day.day}
                                    </Text>
                                    {day.enabled && day.slots.length > 0 && (
                                        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                            {day.slots.length} slot{day.slots.length > 1 ? 's' : ''}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <Switch
                                value={day.enabled}
                                onValueChange={() => toggleDay(day.dayIndex)}
                                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                                thumbColor={day.enabled ? '#2563eb' : '#94a3b8'}
                            />
                        </View>

                        {/* Time Slots */}
                        {day.enabled && (
                            <View style={{ marginTop: 16 }}>
                                {day.slots.map((slot, slotIndex) => (
                                    <View
                                        key={slotIndex}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 12,
                                            padding: 12,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Ionicons name="time-outline" size={20} color="#64748b" />
                                        <Text style={{ flex: 1, fontSize: 14, color: '#334155', marginLeft: 10 }}>
                                            {formatTime(slot.start)} - {formatTime(slot.end)}
                                        </Text>
                                        <Pressable
                                            onPress={() => removeSlot(day.dayIndex, slotIndex)}
                                            style={({ pressed }) => [{
                                                opacity: pressed ? 0.6 : 1,
                                                padding: 4,
                                            }]}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                        </Pressable>
                                    </View>
                                ))}

                                <Pressable
                                    onPress={() => addSlot(day.dayIndex)}
                                    style={({ pressed }) => [{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#dbeafe',
                                        borderStyle: 'dashed',
                                        opacity: pressed ? 0.7 : 1,
                                    }]}
                                >
                                    <Ionicons name="add" size={18} color="#2563eb" />
                                    <Text style={{ fontSize: 14, color: '#2563eb', fontWeight: '600', marginLeft: 4 }}>
                                        Add Slot
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                ))}

                {/* Info Note */}
                <View style={{
                    backgroundColor: '#fffbeb',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginTop: 8,
                }}>
                    <Ionicons name="information-circle" size={22} color="#d97706" />
                    <Text style={{ flex: 1, fontSize: 14, color: '#92400e', marginLeft: 10, lineHeight: 20 }}>
                        Patients can only book during your available time slots. Update regularly to keep your schedule accurate.
                    </Text>
                </View>

                {/* Save Button */}
                <Pressable
                    onPress={handleSave}
                    disabled={loading}
                    style={({ pressed }) => [{
                        backgroundColor: loading ? '#94a3b8' : '#2563eb',
                        height: 56,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 24,
                        opacity: pressed ? 0.9 : 1,
                    }]}
                >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                        {loading ? 'Saving...' : 'Save Availability'}
                    </Text>
                </Pressable>

                {/* Bottom padding */}
                <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
