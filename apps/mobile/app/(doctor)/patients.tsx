import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useMemo } from 'react';
import { useDoctor } from '../../contexts/DoctorContext';

interface PatientInfo {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    lastVisit: string;
    visitCount: number;
    lastSymptoms?: string;
}

export default function DoctorPatientsScreen() {
    const { appointments, stats, isLoading, fetchStats } = useDoctor();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Extract unique patients from appointments
    const patients = useMemo(() => {
        const patientMap = new Map<string, PatientInfo>();
        
        appointments.forEach(apt => {
            if (!apt.patientId?._id) return;
            
            const existing = patientMap.get(apt.patientId._id);
            const aptDate = new Date(apt.date);
            
            if (!existing || new Date(existing.lastVisit) < aptDate) {
                patientMap.set(apt.patientId._id, {
                    id: apt.patientId._id,
                    name: apt.patientId.name || 'Unknown Patient',
                    phone: apt.patientId.phone || '',
                    avatar: apt.patientId.avatar,
                    lastVisit: apt.date,
                    visitCount: (existing?.visitCount || 0) + 1,
                    lastSymptoms: apt.symptoms,
                });
            } else {
                existing.visitCount += 1;
            }
        });

        return Array.from(patientMap.values()).sort((a, b) => 
            new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );
    }, [appointments]);

    // Filter patients by search
    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return patients;
        const query = searchQuery.toLowerCase();
        return patients.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.phone.includes(query)
        );
    }, [patients, searchQuery]);

    // Stats
    const thisMonth = useMemo(() => {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return patients.filter(p => new Date(p.lastVisit) >= thisMonthStart).length;
    }, [patients]);

    const followUps = useMemo(() => {
        return appointments.filter(a => 
            a.status === 'pending' || a.status === 'confirmed'
        ).length;
    }, [appointments]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, [fetchStats]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#fff',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                    My Patients
                </Text>

                {/* Search */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f1f5f9',
                    height: 48,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                }}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#334155' }}
                        placeholder="Search patients..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16 }}>
                <View style={{ 
                    flex: 1, 
                    backgroundColor: '#eff6ff', 
                    borderRadius: 12, 
                    padding: 12, 
                    alignItems: 'center', 
                    marginRight: 8 
                }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#2563eb' }}>
                        {stats.totalPatients}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500', marginTop: 2 }}>
                        Total Patients
                    </Text>
                </View>
                <View style={{ 
                    flex: 1, 
                    backgroundColor: '#ecfdf5', 
                    borderRadius: 12, 
                    padding: 12, 
                    alignItems: 'center', 
                    marginRight: 8 
                }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#10b981' }}>
                        {thisMonth}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '500', marginTop: 2 }}>
                        This Month
                    </Text>
                </View>
                <View style={{ 
                    flex: 1, 
                    backgroundColor: '#fffbeb', 
                    borderRadius: 12, 
                    padding: 12, 
                    alignItems: 'center' 
                }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#f59e0b' }}>
                        {followUps}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#f59e0b', fontWeight: '500', marginTop: 2 }}>
                        Follow-ups
                    </Text>
                </View>
            </View>

            {/* Patient List */}
            <ScrollView 
                style={{ flex: 1, paddingHorizontal: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
            >
                <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '700', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase', 
                    letterSpacing: 1,
                    marginBottom: 12,
                }}>
                    {filteredPatients.length > 0 ? 'Recent Patients' : 'No Patients'}
                </Text>

                {isLoading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <TouchableOpacity
                            key={patient.id}
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
                            activeOpacity={0.7}
                        >
                            {/* Avatar */}
                            <View style={{
                                height: 48,
                                width: 48,
                                borderRadius: 24,
                                backgroundColor: '#f1f5f9',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                            }}>
                                <Ionicons name="person" size={24} color="#64748b" />
                            </View>

                            {/* Info */}
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>
                                    {patient.name}
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                                    {patient.phone}
                                </Text>
                                {patient.lastSymptoms && (
                                    <View style={{
                                        backgroundColor: '#eff6ff',
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 6,
                                        alignSelf: 'flex-start',
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: '600' }}>
                                            {patient.lastSymptoms.length > 25 
                                                ? patient.lastSymptoms.substring(0, 25) + '...' 
                                                : patient.lastSymptoms}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Visit Info */}
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Last visit</Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>
                                    {formatDate(patient.lastVisit)}
                                </Text>
                                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                    {patient.visitCount} visit{patient.visitCount > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
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
                        <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                        <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15, fontWeight: '500' }}>
                            {searchQuery ? 'No patients found' : 'No patients yet'}
                        </Text>
                        <Text style={{ color: '#cbd5e1', marginTop: 4, fontSize: 13, textAlign: 'center' }}>
                            {searchQuery 
                                ? 'Try a different search term'
                                : 'Patients will appear here after appointments'}
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
