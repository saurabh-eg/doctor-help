import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, FlatList } from 'react-native';
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
            <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
                >
                    {specializations.map((spec, i) => (
                        <View key={i} style={{ marginRight: 12 }}>
                            <Pressable
                                onPress={() => setSelectedSpec(spec.value)}
                                style={{
                                    height: 36,
                                    paddingHorizontal: 20,
                                    borderRadius: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: selectedSpec === spec.value ? '#2563eb' : '#e2e8f0',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '700',
                                        color: selectedSpec === spec.value ? '#ffffff' : '#334155',
                                    }}
                                >
                                    {spec.label}
                                </Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Doctor List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#197fe6" />
                    <Text className="text-slate-500 mt-4">Loading doctors...</Text>
                </View>
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
                    style={{ flex: 1 }}
                    ListEmptyComponent={
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
                            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
                            <Text style={{ color: '#64748b', marginTop: 16, textAlign: 'center' }}>No doctors found</Text>
                        </View>
                    }
                    renderItem={({ item: doctor }) => (
                        <Pressable
                            onPress={() => handleDoctorPress(doctor._id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                            className="bg-white rounded-2xl p-4 mb-4 border border-slate-100"
                        >
                            <View className="flex-row">
                                <View className="h-16 w-16 rounded-full bg-blue-50 items-center justify-center mr-4">
                                    <Ionicons name="person" size={32} color="#197fe6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                                        {doctor.userId?.name || 'Doctor'}
                                    </Text>
                                    <Text className="text-slate-500 text-sm" numberOfLines={1}>{doctor.specialization}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Ionicons name="star" size={14} color="#f59e0b" />
                                        <Text style={{ color: '#334155', fontWeight: '700', fontSize: 14, marginLeft: 4 }}>
                                            {doctor.rating?.toFixed(1) || '0.0'}
                                        </Text>
                                        <Text style={{ color: '#94a3b8', fontSize: 14, marginLeft: 4 }}>
                                            ({doctor.reviewCount || 0})
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-4 pt-4 border-t border-slate-100">
                                <View className="flex-row items-center" style={{ flex: 1 }}>
                                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                                    <Text className="text-slate-600 text-sm ml-1" numberOfLines={1}>{doctor.experience} yrs</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    {doctor.isVerified && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                            <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '700', marginLeft: 4 }}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text className="text-blue-600 font-bold" numberOfLines={1}>₹{doctor.consultationFee}</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => handleDoctorPress(doctor._id)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                                className="bg-blue-600 h-12 rounded-xl items-center justify-center mt-4"
                            >
                                <Text className="text-white font-bold">Book Appointment</Text>
                            </Pressable>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
