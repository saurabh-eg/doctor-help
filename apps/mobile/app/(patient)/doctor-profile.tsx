import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

interface Doctor {
    _id: string;
    userId: {
        _id: string;
        name: string;
        phone: string;
    };
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    bio?: string;
    availableSlots: {
        day: number;
        startTime: string;
        endTime: string;
    }[];
}

export default function DoctorProfileScreen() {
    const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);

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

        if (doctorId) {
            fetchDoctor();
        }
    }, [doctorId]);

    const onShare = async () => {
        if (!doctor) return;
        try {
            await Share.share({
                message: `Book an appointment with ${doctor.userId?.name} on Doctor Help!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#197fe6" />
                <Text className="text-slate-500 mt-4">Loading doctor profile...</Text>
            </SafeAreaView>
        );
    }

    if (!doctor) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                <Text className="text-slate-700 mt-4 text-center">Doctor not found</Text>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4">
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </Pressable>
                <View className="flex-row items-center">
                    <Pressable
                        onPress={onShare}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full mr-3"
                    >
                        <Ionicons name="share-outline" size={20} color="#1e293b" />
                    </Pressable>
                </View>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Header Profile */}
                <View className="items-center mt-4">
                    <View className="h-24 w-24 rounded-full bg-blue-50 items-center justify-center">
                        <Ionicons name="person" size={48} color="#197fe6" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 mt-4" style={{ flexWrap: 'wrap', textAlign: 'center', paddingHorizontal: 16 }}>
                        {doctor.userId?.name || 'Doctor'}
                    </Text>
                    <Text className="text-blue-600 font-semibold" style={{ flexWrap: 'wrap', textAlign: 'center' }}>{doctor.specialization}</Text>

                    {doctor.isVerified && (
                        <View className="flex-row items-center mt-2 bg-emerald-50 px-3 py-1 rounded-full">
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text className="text-emerald-600 font-bold text-sm ml-1">Verified</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View className="flex-row justify-between mt-8">
                    <View className="flex-1 mx-1 items-center py-4 bg-slate-50 rounded-2xl">
                        <View className="bg-blue-100 p-2 rounded-full mb-2">
                            <Ionicons name="briefcase" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">{doctor.experience} Yrs</Text>
                        <Text className="text-slate-400 text-xs">Experience</Text>
                    </View>
                    <View className="flex-1 mx-1 items-center py-4 bg-slate-50 rounded-2xl">
                        <View className="bg-blue-100 p-2 rounded-full mb-2">
                            <Ionicons name="star" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">{doctor.rating?.toFixed(1) || '0.0'}</Text>
                        <Text className="text-slate-400 text-xs">Rating</Text>
                    </View>
                    <View className="flex-1 mx-1 items-center py-4 bg-slate-50 rounded-2xl">
                        <View className="bg-blue-100 p-2 rounded-full mb-2">
                            <Ionicons name="chatbubbles" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">{doctor.reviewCount || 0}</Text>
                        <Text className="text-slate-400 text-xs">Reviews</Text>
                    </View>
                </View>

                {/* About */}
                {doctor.bio && (
                    <View className="mt-8">
                        <Text className="text-xl font-bold text-slate-900 mb-3">About</Text>
                        <Text className="text-slate-600 leading-6" style={{ flexWrap: 'wrap' }}>{doctor.bio}</Text>
                    </View>
                )}

                {/* Qualification */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-slate-900 mb-3">Qualification</Text>
                    <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center">
                        <View className="bg-blue-100 p-3 rounded-xl mr-4">
                            <Ionicons name="school" size={24} color="#197fe6" />
                        </View>
                        <Text className="font-bold text-slate-900 flex-1" style={{ flexWrap: 'wrap' }}>{doctor.qualification}</Text>
                    </View>
                </View>

                {/* Consultation Fee */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-slate-900 mb-3">Consultation</Text>
                    <View className="bg-blue-50 p-4 rounded-2xl flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="location" size={20} color="#197fe6" />
                            <Text className="text-slate-700 ml-2">Clinic Visit</Text>
                        </View>
                        <Text className="text-blue-600 font-bold text-xl">₹{doctor.consultationFee}</Text>
                    </View>
                    <Text className="text-slate-400 text-sm mt-2 text-center" style={{ flexWrap: 'wrap' }}>
                        * Payment at clinic after consultation
                    </Text>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom Action */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-slate-100">
                <Pressable
                    onPress={() => router.push({
                        pathname: '/(patient)/slot-selection',
                        params: { doctorId: doctor._id }
                    })}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="bg-blue-600 h-14 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-bold text-lg">Book Appointment</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
