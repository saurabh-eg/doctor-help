import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HealthRecord {
    id: string;
    type: 'prescription' | 'lab_report' | 'scan' | 'vaccination';
    title: string;
    doctor: string;
    date: string;
    hospital?: string;
}

export default function RecordsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'prescriptions' | 'reports'>('all');

    const records: HealthRecord[] = [
        {
            id: '1',
            type: 'prescription',
            title: 'General Checkup Prescription',
            doctor: 'Dr. Sharma',
            date: '25 Dec, 2025',
            hospital: 'City Hospital',
        },
        {
            id: '2',
            type: 'lab_report',
            title: 'Complete Blood Count (CBC)',
            doctor: 'Dr. Patel',
            date: '20 Dec, 2025',
            hospital: 'Diagnostic Labs',
        },
        {
            id: '3',
            type: 'scan',
            title: 'Chest X-Ray Report',
            doctor: 'Dr. Kumar',
            date: '15 Dec, 2025',
            hospital: 'Radiology Center',
        },
        {
            id: '4',
            type: 'vaccination',
            title: 'COVID-19 Booster',
            doctor: 'Dr. Singh',
            date: '10 Dec, 2025',
            hospital: 'Health Center',
        },
    ];

    const getIconForType = (type: string) => {
        switch (type) {
            case 'prescription':
                return { name: 'document-text', color: '#2563eb', bg: '#eff6ff' };
            case 'lab_report':
                return { name: 'flask', color: '#7c3aed', bg: '#f5f3ff' };
            case 'scan':
                return { name: 'scan', color: '#059669', bg: '#ecfdf5' };
            case 'vaccination':
                return { name: 'shield-checkmark', color: '#f59e0b', bg: '#fffbeb' };
            default:
                return { name: 'document', color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'prescriptions', label: 'Prescriptions' },
        { key: 'reports', label: 'Reports' },
    ];

    const filteredRecords = records.filter(r => {
        if (activeTab === 'all') return true;
        if (activeTab === 'prescriptions') return r.type === 'prescription';
        if (activeTab === 'reports') return r.type === 'lab_report' || r.type === 'scan';
        return true;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', flex: 1 }}>
                        Health Records
                    </Text>
                    <Pressable
                        style={({ pressed }) => [{
                            opacity: pressed ? 0.6 : 1,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#2563eb',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }]}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </Pressable>
                </View>

                {/* Tabs */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#f1f5f9',
                    borderRadius: 12,
                    padding: 4,
                }}>
                    {tabs.map((tab) => (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as any)}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 8,
                                alignItems: 'center',
                                backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
                                shadowColor: activeTab === tab.key ? '#000' : 'transparent',
                                shadowOpacity: activeTab === tab.key ? 0.1 : 0,
                                shadowRadius: 4,
                                elevation: activeTab === tab.key ? 2 : 0,
                            }}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: activeTab === tab.key ? '#2563eb' : '#64748b',
                            }}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Stats */}
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        marginRight: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#2563eb' }}>
                            {records.filter(r => r.type === 'prescription').length}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                            Prescriptions
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                    }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#7c3aed' }}>
                            {records.filter(r => r.type === 'lab_report' || r.type === 'scan').length}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                            Reports
                        </Text>
                    </View>
                </View>

                {/* Records List */}
                {filteredRecords.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <View style={{
                            backgroundColor: '#f1f5f9',
                            padding: 24,
                            borderRadius: 50,
                            marginBottom: 16,
                        }}>
                            <Ionicons name="document-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>
                            No Records Found
                        </Text>
                        <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center' }}>
                            Upload your health records to keep them organized
                        </Text>
                    </View>
                ) : (
                    filteredRecords.map((record) => {
                        const iconConfig = getIconForType(record.type);
                        return (
                            <Pressable
                                key={record.id}
                                style={({ pressed }) => [{
                                    opacity: pressed ? 0.9 : 1,
                                    backgroundColor: '#fff',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#f1f5f9',
                                }]}
                            >
                                {/* Icon */}
                                <View style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    backgroundColor: iconConfig.bg,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}>
                                    <Ionicons
                                        name={iconConfig.name as any}
                                        size={24}
                                        color={iconConfig.color}
                                    />
                                </View>

                                {/* Content */}
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}
                                        numberOfLines={1}
                                    >
                                        {record.title}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
                                        {record.doctor}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                        <Text style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>
                                            {record.date}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action */}
                                <Pressable
                                    style={({ pressed }) => [{
                                        opacity: pressed ? 0.6 : 1,
                                        padding: 8,
                                    }]}
                                >
                                    <Ionicons name="download-outline" size={22} color="#2563eb" />
                                </Pressable>
                            </Pressable>
                        );
                    })
                )}

                {/* Upload CTA */}
                <Pressable
                    style={({ pressed }) => [{
                        opacity: pressed ? 0.9 : 1,
                        backgroundColor: '#eff6ff',
                        borderRadius: 16,
                        padding: 20,
                        alignItems: 'center',
                        marginTop: 8,
                        borderWidth: 2,
                        borderColor: '#dbeafe',
                        borderStyle: 'dashed',
                    }]}
                >
                    <Ionicons name="cloud-upload-outline" size={32} color="#2563eb" />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#2563eb', marginTop: 8 }}>
                        Upload New Record
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        PDF, JPG or PNG (Max 10MB)
                    </Text>
                </Pressable>

                {/* Bottom padding */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
