import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    lastVisit: string;
    condition: string;
}

export default function DoctorPatientsScreen() {
    const patients: Patient[] = [
        { id: '1', name: 'Sarah Jenkins', age: 34, gender: 'Female', lastVisit: 'Dec 24, 2025', condition: 'Migraine' },
        { id: '2', name: 'John Doe', age: 45, gender: 'Male', lastVisit: 'Dec 22, 2025', condition: 'Hypertension' },
        { id: '3', name: 'Maria Garcia', age: 28, gender: 'Female', lastVisit: 'Dec 20, 2025', condition: 'Routine Checkup' },
        { id: '4', name: 'Robert Fox', age: 52, gender: 'Male', lastVisit: 'Dec 18, 2025', condition: 'Diabetes Management' },
        { id: '5', name: 'Eleanor Pena', age: 39, gender: 'Female', lastVisit: 'Dec 15, 2025', condition: 'Thyroid Issues' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
                <Text className="text-2xl font-bold text-slate-900 mb-4">My Patients</Text>

                {/* Search */}
                <View className="flex-row items-center bg-slate-100 h-12 rounded-xl px-4">
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-slate-700"
                        placeholder="Search patients..."
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

            {/* Stats */}
            <View className="flex-row px-5 py-4 gap-3">
                <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
                    <Text className="text-2xl font-bold text-blue-600">1,240</Text>
                    <Text className="text-xs text-blue-600 font-medium">Total Patients</Text>
                </View>
                <View className="flex-1 bg-emerald-50 rounded-xl p-3 items-center">
                    <Text className="text-2xl font-bold text-emerald-600">48</Text>
                    <Text className="text-xs text-emerald-600 font-medium">This Month</Text>
                </View>
                <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                    <Text className="text-2xl font-bold text-amber-600">12</Text>
                    <Text className="text-xs text-amber-600 font-medium">Follow-ups</Text>
                </View>
            </View>

            {/* Patient List */}
            <ScrollView className="flex-1 px-5">
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Patients</Text>

                {patients.map((patient) => (
                    <TouchableOpacity
                        key={patient.id}
                        className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center"
                        activeOpacity={0.7}
                    >
                        {/* Avatar */}
                        <View className="h-12 w-12 rounded-full bg-slate-100 items-center justify-center mr-4">
                            <Ionicons name="person" size={24} color="#64748b" />
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                            <Text className="text-base font-bold text-slate-900">{patient.name}</Text>
                            <Text className="text-slate-500 text-sm">
                                {patient.age} yrs • {patient.gender}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className="bg-blue-50 px-2 py-0.5 rounded">
                                    <Text className="text-blue-600 text-xs font-bold">{patient.condition}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Last Visit */}
                        <View className="items-end">
                            <Text className="text-xs text-slate-400">Last visit</Text>
                            <Text className="text-xs font-bold text-slate-600">{patient.lastVisit}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
