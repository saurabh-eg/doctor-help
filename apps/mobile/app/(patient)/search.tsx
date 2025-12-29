import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
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
}

const specializations = [
    { label: 'All', value: '' },
    { label: 'General', value: 'General Physician' },
    { label: 'Cardio', value: 'Cardiologist' },
    { label: 'Derma', value: 'Dermatologist' },
    { label: 'Pediatric', value: 'Pediatrician' },
    { label: 'Ortho', value: 'Orthopedic' },
];

export default function PatientSearchScreen() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/doctors`;
            const params = new URLSearchParams();
            if (selectedSpec) params.append('specialization', selectedSpec);
            if (searchQuery) params.append('name', searchQuery);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setDoctors(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedSpec, searchQuery]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleDoctorPress = (doctorId: string) => {
        router.push({
            pathname: '/(patient)/doctor-profile',
            params: { doctorId }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-4 pb-4 bg-white border-b border-slate-100">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Find Doctor</Text>

                {/* Search Input */}
                <View className="flex-row items-center bg-slate-100 h-12 rounded-xl px-4">
                    <Ionicons name="search" size={20} color="#197fe6" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-slate-700"
                        placeholder="Search doctors by name..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={fetchDoctors}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Specialization Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5 py-2 bg-white border-b border-slate-100"
            >
                {specializations.map((spec, i) => (
                    <Pressable
                        key={i}
                        onPress={() => setSelectedSpec(spec.value)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className={`h-9 px-5 rounded-full mr-3 items-center justify-center ${selectedSpec === spec.value ? 'bg-blue-600' : 'bg-slate-100'
                            }`}
                    >
                        <Text className={`text-sm font-bold ${selectedSpec === spec.value ? 'text-white' : 'text-slate-600'
                            }`}>
                            {spec.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Doctor List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#197fe6" />
                    <Text className="text-slate-500 mt-4">Loading doctors...</Text>
                </View>
            ) : doctors.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="search-outline" size={64} color="#cbd5e1" />
                    <Text className="text-slate-500 mt-4 text-center" style={{ flexWrap: 'wrap' }}>No doctors found</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 pt-2">
                    {doctors.map((doctor) => (
                        <Pressable
                            key={doctor._id}
                            onPress={() => handleDoctorPress(doctor._id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                            className="bg-white rounded-2xl p-4 mb-4 border border-slate-100"
                        >
                            <View className="flex-row">
                                {/* Avatar */}
                                <View className="h-16 w-16 rounded-full bg-blue-50 items-center justify-center mr-4">
                                    <Ionicons name="person" size={32} color="#197fe6" />
                                </View>

                                {/* Info */}
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-slate-900" style={{ flexWrap: 'wrap' }}>
                                        {doctor.userId?.name || 'Doctor'}
                                    </Text>
                                    <Text className="text-slate-500 text-sm" style={{ flexWrap: 'wrap' }}>{doctor.specialization}</Text>

                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="star" size={14} color="#f59e0b" />
                                        <Text className="text-slate-700 font-bold text-sm ml-1">
                                            {doctor.rating?.toFixed(1) || '0.0'}
                                        </Text>
                                        <Text className="text-slate-400 text-sm ml-1">
                                            ({doctor.reviewCount || 0} reviews)
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Details Row */}
                            <View className="flex-row items-center mt-4 pt-4 border-t border-slate-100">
                                <View className="flex-1 flex-row items-center">
                                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                                    <Text className="text-slate-600 text-sm ml-1">{doctor.experience} yrs</Text>
                                </View>
                                <View className="flex-1 items-center">
                                    {doctor.isVerified && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                            <Text className="text-emerald-600 text-xs font-bold ml-1">Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1 items-end">
                                    <Text className="text-blue-600 font-bold">₹{doctor.consultationFee}</Text>
                                </View>
                            </View>

                            {/* Action Button */}
                            <Pressable
                                onPress={() => handleDoctorPress(doctor._id)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                className="bg-blue-600 h-12 rounded-xl items-center justify-center mt-4"
                            >
                                <Text className="text-white font-bold">Book Appointment</Text>
                            </Pressable>
                        </Pressable>
                    ))}

                    <View className="h-6" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
