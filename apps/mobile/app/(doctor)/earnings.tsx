import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';

export default function DoctorEarningsScreen() {
    const router = useRouter();

    // Use SHORT labels to prevent truncation
    const stats = [
        { label: 'Total', value: '₹45,000', icon: 'wallet', color: 'bg-emerald-100', iconColor: '#059669' },
        { label: 'This Month', value: '₹12,400', icon: 'trending-up', color: 'bg-blue-100', iconColor: '#197fe6' },
        { label: 'Consults', value: '124', icon: 'people', color: 'bg-purple-100', iconColor: '#7c3aed' },
    ];

    const transactions = [
        { id: '1', patient: 'Rahul Sharma', amount: 500, date: '26 Dec, 2025', status: 'Completed' },
        { id: '2', patient: 'Anjali Gupta', amount: 400, date: '25 Dec, 2025', status: 'Completed' },
        { id: '3', patient: 'Amit Kumar', amount: 500, date: '25 Dec, 2025', status: 'Completed' },
        { id: '4', patient: 'Priya Verma', amount: 450, date: '24 Dec, 2025', status: 'Completed' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 ml-4">Earnings</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between">
                    {stats.map((stat, i) => (
                        <Card key={i} className={`items-center justify-center py-6 mb-4 ${i === 0 ? 'w-full' : 'w-[48%]'}`}>
                            <View className={`${stat.color} p-3 rounded-full mb-3`}>
                                <Ionicons name={stat.icon as any} size={24} color={stat.iconColor} />
                            </View>
                            <Text style={{ color: '#94a3b8', fontSize: 13 }}>{stat.label}</Text>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginTop: 4 }}>{stat.value}</Text>
                        </Card>
                    ))}
                </View>

                {/* Payout Information */}
                <Card className="bg-blue-600 border-blue-600 mb-8">
                    <Text className="text-blue-100 text-sm">Next Payout Date</Text>
                    <Text className="text-white text-xl font-bold mt-1">01 Jan, 2026</Text>
                    <TouchableOpacity className="mt-4 bg-white/20 py-2 rounded-xl items-center">
                        <Text className="text-white font-semibold">Withdraw Now</Text>
                    </TouchableOpacity>
                </Card>

                {/* Recent Transactions */}
                <Text className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</Text>
                {transactions.map((tx) => (
                    <Card key={tx.id} className="flex-row items-center justify-between mb-3 py-4">
                        <View className="flex-row items-center">
                            <View className="bg-slate-100 p-2 rounded-full mr-3">
                                <Ionicons name="person" size={20} color="#64748b" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14 }}>{tx.patient}</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{tx.date}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text style={{ color: '#059669', fontWeight: '700', fontSize: 14 }}>+₹{tx.amount}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{tx.status}</Text>
                        </View>
                    </Card>
                ))}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
