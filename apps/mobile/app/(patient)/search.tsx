import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PatientSearchScreen() {
    const router = useRouter();

    const filters = [
        { label: 'All', active: true },
        { label: 'Doctors', active: false },
        { label: 'Labs', active: false },
        { label: 'Medicines', active: false },
    ];

    const doctors = [
        {
            id: '1',
            name: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            rating: 4.9,
            reviews: 234,
            experience: 12,
            fee: 500,
            available: 'Available Today',
        },
        {
            id: '2',
            name: 'Dr. Michael Chen',
            specialty: 'Dermatologist',
            rating: 4.8,
            reviews: 189,
            experience: 8,
            fee: 400,
            available: 'Available Tomorrow',
        },
        {
            id: '3',
            name: 'Dr. Priya Sharma',
            specialty: 'Pediatrician',
            rating: 4.9,
            reviews: 312,
            experience: 15,
            fee: 450,
            available: 'Available Today',
        },
    ];

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
                        placeholder="Search doctors, labs, tests..."
                        placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity className="h-8 w-8 bg-white rounded-lg items-center justify-center">
                        <Ionicons name="options" size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5 py-3 bg-white"
            >
                {filters.map((filter, i) => (
                    <TouchableOpacity
                        key={i}
                        className={`h-9 px-5 rounded-full mr-3 items-center justify-center ${filter.active
                                ? 'bg-blue-600'
                                : 'bg-slate-100'
                            }`}
                    >
                        <Text className={`text-sm font-bold ${filter.active ? 'text-white' : 'text-slate-600'
                            }`}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Doctor List */}
            <ScrollView className="flex-1 px-5 pt-4">
                {doctors.map((doctor) => (
                    <TouchableOpacity
                        key={doctor.id}
                        className="bg-white rounded-2xl p-4 mb-4 border border-slate-100"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row">
                            {/* Avatar */}
                            <View className="h-16 w-16 rounded-full bg-slate-100 items-center justify-center mr-4">
                                <Ionicons name="person" size={32} color="#64748b" />
                            </View>

                            {/* Info */}
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-900">{doctor.name}</Text>
                                <Text className="text-slate-500 text-sm">{doctor.specialty}</Text>

                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="star" size={14} color="#f59e0b" />
                                    <Text className="text-slate-700 font-bold text-sm ml-1">
                                        {doctor.rating}
                                    </Text>
                                    <Text className="text-slate-400 text-sm ml-1">
                                        ({doctor.reviews} reviews)
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Details Row */}
                        <View className="flex-row items-center mt-4 pt-4 border-t border-slate-100">
                            <View className="flex-1 flex-row items-center">
                                <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                                <Text className="text-slate-600 text-sm ml-1">{doctor.experience} yrs exp</Text>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-emerald-600 text-xs font-bold">{doctor.available}</Text>
                            </View>
                            <View className="flex-1 items-end">
                                <Text className="text-blue-600 font-bold">₹{doctor.fee}</Text>
                            </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity className="bg-blue-600 h-12 rounded-xl items-center justify-center mt-4">
                            <Text className="text-white font-bold">Book Appointment</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
