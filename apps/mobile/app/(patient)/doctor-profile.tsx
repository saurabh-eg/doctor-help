import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { apiClient } from '../../contexts/AuthContext'; // Assuming apiClient is exported from AuthContext or similar

export default function DoctorProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                // In a real app, we'd use the ID to fetch
                // const response = await apiClient.get(`/doctors/${id}`);
                // setDoctor(response.data.data);

                // Mock data for now to match the UI requirements
                setDoctor({
                    id: id,
                    name: 'Dr. Sarah Johnson',
                    specialization: 'Cardiologist',
                    rating: 4.9,
                    reviews: 234,
                    experience: 12,
                    consultationFee: 500,
                    bio: 'Dr. Sarah Johnson is a highly experienced Cardiologist with over 12 years of practice. She specializes in non-invasive cardiology and preventive heart care.',
                    qualification: 'MD, Cardiological Sciences',
                    hospital: 'City Heart Hospital, Mumbai',
                    availableSlots: [
                        { day: 1, startTime: '09:00', endTime: '12:00' },
                        { day: 2, startTime: '14:00', endTime: '18:00' }
                    ]
                });
            } catch (error) {
                console.error('Error fetching doctor:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const onShare = async () => {
        try {
            await Share.share({
                message: `Check out ${doctor.name} on Doctor Help!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !doctor) return null;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onShare} className="mr-4">
                        <Ionicons name="share-outline" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={24} color="#1e293b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Header Profile */}
                <View className="items-center mt-4">
                    <Avatar size="xl" name={doctor.name} className="bg-blue-50" />
                    <Text className="text-2xl font-bold text-slate-900 mt-4">{doctor.name}</Text>
                    <Text className="text-blue-600 font-semibold">{doctor.specialization}</Text>
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="location" size={16} color="#64748b" />
                        <Text className="text-slate-500 ml-1">{doctor.hospital}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View className="flex-row justify-between mt-8">
                    <Card className="flex-1 mx-1 items-center py-4">
                        <View className="bg-blue-50 p-2 rounded-full mb-2">
                            <Ionicons name="people" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">1000+</Text>
                        <Text className="text-slate-400 text-xs">Patients</Text>
                    </Card>
                    <Card className="flex-1 mx-1 items-center py-4">
                        <View className="bg-blue-50 p-2 rounded-full mb-2">
                            <Ionicons name="briefcase" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">{doctor.experience} Yrs</Text>
                        <Text className="text-slate-400 text-xs">Exp</Text>
                    </Card>
                    <Card className="flex-1 mx-1 items-center py-4">
                        <View className="bg-blue-50 p-2 rounded-full mb-2">
                            <Ionicons name="star" size={20} color="#197fe6" />
                        </View>
                        <Text className="text-slate-900 font-bold">{doctor.rating}</Text>
                        <Text className="text-slate-400 text-xs">Rating</Text>
                    </Card>
                </View>

                {/* About */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-slate-900 mb-2">About Doctor</Text>
                    <Text className="text-slate-600 leading-6">
                        {doctor.bio}
                    </Text>
                </View>

                {/* Details */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-slate-900 mb-4">Qualifications</Text>
                    <Card>
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 p-2 rounded-xl mr-3">
                                <Ionicons name="school" size={24} color="#197fe6" />
                            </View>
                            <View>
                                <Text className="font-bold text-slate-900">{doctor.qualification}</Text>
                                <Text className="text-slate-500 text-sm">MBBS, MD</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom Action */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-slate-100 flex-row items-center">
                <View className="flex-1">
                    <Text className="text-slate-400 text-sm">Total Fee</Text>
                    <Text className="text-2xl font-bold text-slate-900">₹{doctor.consultationFee}</Text>
                </View>
                <Button
                    title="Book Appointment"
                    onPress={() => router.push({
                        pathname: '/(patient)/slot-selection',
                        params: { doctorId: doctor.id }
                    })}
                    className="flex-1 ml-4"
                />
            </View>
        </SafeAreaView>
    );
}
