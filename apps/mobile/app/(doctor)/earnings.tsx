import React from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorEarningsScreen() {
    // Stats data with SHORT labels to prevent truncation
    const stats = [
        { label: 'Total Earned', value: '₹45,000', icon: 'wallet', bgColor: '#ecfdf5', iconColor: '#059669' },
        { label: 'Monthly', value: '₹12,400', icon: 'trending-up', bgColor: '#eff6ff', iconColor: '#2563eb' },
        { label: 'Consults', value: '124', icon: 'people', bgColor: '#f5f3ff', iconColor: '#7c3aed' },
    ];

    const transactions = [
        { id: '1', patient: 'Rahul Sharma', amount: 500, date: '26 Dec', type: 'Consultation' },
        { id: '2', patient: 'Anjali Gupta', amount: 400, date: '25 Dec', type: 'Follow-up' },
        { id: '3', patient: 'Amit Kumar', amount: 500, date: '25 Dec', type: 'Consultation' },
        { id: '4', patient: 'Priya Verma', amount: 450, date: '24 Dec', type: 'Consultation' },
        { id: '5', patient: 'Sanjay Patel', amount: 500, date: '23 Dec', type: 'Consultation' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
                    Earnings
                </Text>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Total Earnings Hero Card */}
                <View style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 20,
                }}>
                    <Text style={{ color: '#bfdbfe', fontSize: 14, fontWeight: '500' }}>
                        Total Earnings
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700', marginTop: 4 }}>
                        ₹45,000
                    </Text>
                    
                    {/* Next Payout */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 20,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(255,255,255,0.2)',
                    }}>
                        <View>
                            <Text style={{ color: '#bfdbfe', fontSize: 12, fontWeight: '500' }}>
                                Next Payout
                            </Text>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                                01 Jan, 2026
                            </Text>
                        </View>
                        <Pressable
                            style={({ pressed }) => [{
                                backgroundColor: pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 12,
                            }]}
                        >
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                                Withdraw
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Quick Stats Row */}
                <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                    {stats.slice(1).map((stat, i) => (
                        <View
                            key={i}
                            style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                marginLeft: i > 0 ? 12 : 0,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#f1f5f9',
                            }}
                        >
                            <View style={{
                                backgroundColor: stat.bgColor,
                                padding: 10,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}>
                                <Ionicons name={stat.icon as any} size={22} color={stat.iconColor} />
                            </View>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>
                                {stat.value}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Transactions Header */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                        Recent Transactions
                    </Text>
                    <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>
                            See All
                        </Text>
                    </Pressable>
                </View>

                {/* Transaction List */}
                {transactions.map((tx, index) => (
                    <View
                        key={tx.id}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}
                    >
                        {/* Avatar */}
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#eff6ff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                        }}>
                            <Ionicons name="person" size={22} color="#2563eb" />
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text 
                                style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}
                                numberOfLines={1}
                            >
                                {tx.patient}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ fontSize: 13, color: '#64748b' }}>
                                    {tx.date}
                                </Text>
                                <View style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: '#cbd5e1',
                                    marginHorizontal: 8,
                                }} />
                                <Text style={{ fontSize: 13, color: '#64748b' }}>
                                    {tx.type}
                                </Text>
                            </View>
                        </View>

                        {/* Amount */}
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                                +₹{tx.amount}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Summary Card */}
                <View style={{
                    backgroundColor: '#fffbeb',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: '#fef3c7',
                }}>
                    <View style={{
                        backgroundColor: '#fef3c7',
                        padding: 10,
                        borderRadius: 12,
                        marginRight: 14,
                    }}>
                        <Ionicons name="information-circle" size={22} color="#d97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400e' }}>
                            Payments are processed weekly
                        </Text>
                        <Text style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                            Next processing: Monday, 6 Jan
                        </Text>
                    </View>
                </View>

                {/* Bottom padding for tab bar */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
