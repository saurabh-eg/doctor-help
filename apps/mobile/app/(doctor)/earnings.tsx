import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDoctor } from '../../contexts/DoctorContext';
import { useState, useCallback } from 'react';

export default function DoctorEarningsScreen() {
    const { appointments, stats, isLoading, fetchStats } = useDoctor();
    const [refreshing, setRefreshing] = useState(false);

    // Calculate earnings from appointments
    const earningsData = useMemo(() => {
        const paidAppointments = appointments.filter(a => a.paymentStatus === 'paid');
        
        const totalEarnings = paidAppointments.reduce((sum, a) => sum + a.amount, 0);
        
        // This month earnings
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthPaid = paidAppointments.filter(a => new Date(a.date) >= thisMonthStart);
        const monthlyEarnings = thisMonthPaid.reduce((sum, a) => sum + a.amount, 0);
        
        // Total consultations
        const totalConsults = appointments.filter(a => a.status === 'completed').length;
        
        // Recent transactions (last 10 paid)
        const recentTransactions = paidAppointments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(apt => ({
                id: apt._id,
                patient: apt.patientId?.name || 'Patient',
                amount: apt.amount,
                date: new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                type: apt.type === 'video' ? 'Video Consult' : 'Clinic Visit',
            }));

        return {
            totalEarnings,
            monthlyEarnings,
            totalConsults,
            recentTransactions,
        };
    }, [appointments]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, [fetchStats]);

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    // Next payout date (1st of next month)
    const nextPayoutDate = useMemo(() => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }, []);

    // Stats cards data
    const statsCards = [
        { label: 'Total Earned', value: formatCurrency(earningsData.totalEarnings), icon: 'wallet' as const, bgColor: '#ecfdf5', iconColor: '#059669' },
        { label: 'This Month', value: formatCurrency(earningsData.monthlyEarnings), icon: 'trending-up' as const, bgColor: '#eff6ff', iconColor: '#2563eb' },
        { label: 'Consults', value: earningsData.totalConsults.toString(), icon: 'people' as const, bgColor: '#f5f3ff', iconColor: '#7c3aed' },
    ];

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Loading earnings...</Text>
            </SafeAreaView>
        );
    }

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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
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
                        ₹{earningsData.totalEarnings.toLocaleString('en-IN')}
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
                                {nextPayoutDate}
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

                {/* Stats Cards */}
                <View style={{
                    flexDirection: 'row',
                    marginBottom: 24,
                    gap: 12,
                }}>
                    {statsCards.map((stat, index) => (
                        <View
                            key={index}
                            style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#f1f5f9',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: stat.bgColor,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                            }}>
                                <Ionicons name={stat.icon} size={20} color={stat.iconColor} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                                {stat.value}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 }}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Recent Transactions */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                            Recent Transactions
                        </Text>
                        <Pressable>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>
                                View All
                            </Text>
                        </Pressable>
                    </View>

                    {earningsData.recentTransactions.length > 0 ? (
                        earningsData.recentTransactions.map((tx) => (
                            <View
                                key={tx.id}
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: '#f1f5f9',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Icon */}
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: '#ecfdf5',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}>
                                    <Ionicons name="arrow-down" size={20} color="#059669" />
                                </View>

                                {/* Details */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>
                                        {tx.patient}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                        {tx.type} • {tx.date}
                                    </Text>
                                </View>

                                {/* Amount */}
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                                    +₹{tx.amount}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 40,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                        }}>
                            <Ionicons name="wallet-outline" size={48} color="#cbd5e1" />
                            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15, fontWeight: '500' }}>
                                No transactions yet
                            </Text>
                            <Text style={{ color: '#cbd5e1', marginTop: 4, fontSize: 13, textAlign: 'center' }}>
                                Earnings will appear here after consultations
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info Banner */}
                <View style={{
                    backgroundColor: '#eff6ff',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Ionicons name="information-circle" size={24} color="#2563eb" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af' }}>
                            Payout Schedule
                        </Text>
                        <Text style={{ fontSize: 13, color: '#3b82f6', marginTop: 2 }}>
                            Payouts are processed on the 1st of every month to your linked bank account.
                        </Text>
                    </View>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
