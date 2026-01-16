import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api } from '@doctor-help/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useDoctor } from '../../contexts/DoctorContext';
import { pickAndUploadImage, pickAndUploadDocument } from '../../utils/uploadImage';

export default function DoctorVerificationScreen() {
    const router = useRouter();
    const { user, token } = useAuth();
    const { profile, isLoading: isProfileLoading, fetchProfile } = useDoctor();
    const [loading, setLoading] = useState(false);

    // Check if doctor already has a profile - redirect to dashboard
    useEffect(() => {
        if (!isProfileLoading && profile) {
            // Doctor already has a profile, redirect to dashboard
            router.replace('/(doctor)/dashboard');
        }
    }, [profile, isProfileLoading]);

    const [form, setForm] = useState({
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        bio: '',
        photoUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [docUploading, setDocUploading] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!form.specialization || !form.qualification || !form.experience || !form.consultationFee) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            if (!user) return;

            const result = await api.doctors.register({
                userId: user.id,
                specialization: form.specialization,
                qualification: form.qualification,
                experience: parseInt(form.experience),
                consultationFee: parseInt(form.consultationFee),
                bio: form.bio,
                photoUrl: form.photoUrl,
                documents,
            });

            if (result.success) {
                // Refresh doctor profile in context
                await fetchProfile();
                
                Alert.alert(
                    'Success',
                    'Your verification request has been submitted. We will notify you once approved.',
                    [{ text: 'OK', onPress: () => router.replace('/(doctor)/dashboard') }]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to submit verification');
            }
        } catch (error) {
            console.error('Verification error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginLeft: 16 }}>Professional Verification</Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                <Text style={{ color: '#64748b', marginBottom: 24 }}>
                    Please provide your professional details to get verified and start consulting patients.
                </Text>

                <Input
                    label="Specialization"
                    placeholder="e.g. Cardiologist, Dermatologist"
                    value={form.specialization}
                    onChangeText={(text) => setForm(prev => ({ ...prev, specialization: text }))}
                />

                {/* Profile Photo Picker & Preview */}
                <Text style={{ color: '#374151', fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>Profile Photo</Text>
                {form.photoUrl ? (
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                        <Image source={{ uri: form.photoUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                    </View>
                ) : null}
                <Button
                    title={uploading ? 'Uploading...' : (form.photoUrl ? 'Change Photo' : 'Upload Photo')}
                    loading={uploading}
                    onPress={async () => {
                        if (!token) {
                            Alert.alert('Error', 'Please login again.');
                            return;
                        }
                        setUploading(true);
                        const url = await pickAndUploadImage(token);
                        if (url) setForm(prev => ({ ...prev, photoUrl: url }));
                        setUploading(false);
                    }}
                />

                <View style={{ marginBottom: 16 }} />

                <Input
                    label="Qualification"
                    placeholder="e.g. MBBS, MD, MS"
                    value={form.qualification}
                    onChangeText={(text) => setForm(prev => ({ ...prev, qualification: text }))}
                />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Experience (Years)"
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={form.experience}
                            onChangeText={(text) => setForm(prev => ({ ...prev, experience: text }))}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Consultation Fee (₹)"
                            placeholder="e.g. 500"
                            keyboardType="numeric"
                            value={form.consultationFee}
                            onChangeText={(text) => setForm(prev => ({ ...prev, consultationFee: text }))}
                        />
                    </View>
                </View>

                <Input
                    label="Bio"
                    placeholder="Tell patients about your background and expertise..."
                    value={form.bio}
                    onChangeText={(text) => setForm(prev => ({ ...prev, bio: text }))}
                    multiline
                />

                <Text style={{ color: '#374151', fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>Upload Documents</Text>
                <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', borderRadius: 24, padding: 16, marginBottom: 16, backgroundColor: '#f8fafc' }}>
                    {documents.length === 0 && (
                        <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Add degree/ID proof (PDF or image)</Text>
                    )}
                    {documents.map((doc, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="document-text-outline" size={18} color="#475569" />
                            <Text style={{ color: '#334155', marginLeft: 8, flex: 1 }} numberOfLines={1}>{doc}</Text>
                        </View>
                    ))}
                    <Button
                        title={docUploading ? 'Uploading...' : 'Add Document'}
                        loading={docUploading}
                        onPress={async () => {
                            if (!token) {
                                Alert.alert('Error', 'Please login again.');
                                return;
                            }
                            setDocUploading(true);
                            const url = await pickAndUploadDocument(token);
                            if (url) setDocuments(prev => [...prev, url]);
                            setDocUploading(false);
                        }}
                    />
                </View>

                <Button
                    title="Submit for Verification"
                    loading={loading}
                    onPress={handleSubmit}
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
