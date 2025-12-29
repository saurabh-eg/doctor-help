import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@doctor-help/api-client';

export default function DoctorVerificationScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        bio: ''
    });

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
                bio: form.bio
            });

            if (result.success) {
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
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 ml-4">Professional Verification</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                <Text className="text-slate-500 mb-6" style={{ flexWrap: 'wrap' }}>
                    Please provide your professional details to get verified and start consulting patients.
                </Text>

                <Input
                    label="Specialization"
                    placeholder="e.g. Cardiologist, Dermatologist"
                    value={form.specialization}
                    onChangeText={(text) => setForm(prev => ({ ...prev, specialization: text }))}
                />

                <Input
                    label="Qualification"
                    placeholder="e.g. MBBS, MD, MS"
                    value={form.qualification}
                    onChangeText={(text) => setForm(prev => ({ ...prev, qualification: text }))}
                />

                <View className="flex-row">
                    <Input
                        label="Experience (Years)"
                        placeholder="e.g. 5"
                        keyboardType="numeric"
                        value={form.experience}
                        onChangeText={(text) => setForm(prev => ({ ...prev, experience: text }))}
                        className="flex-1 mr-2"
                    />
                    <Input
                        label="Consultation Fee (₹)"
                        placeholder="e.g. 500"
                        keyboardType="numeric"
                        value={form.consultationFee}
                        onChangeText={(text) => setForm(prev => ({ ...prev, consultationFee: text }))}
                        className="flex-1 ml-2"
                    />
                </View>

                <Input
                    label="Bio"
                    placeholder="Tell patients about your background and expertise..."
                    value={form.bio}
                    onChangeText={(text) => setForm(prev => ({ ...prev, bio: text }))}
                    multiline
                    className="h-32"
                />

                {/* Document Upload Mock */}
                <Text className="text-gray-700 font-semibold mb-2 ml-1">Upload Documents</Text>
                <TouchableOpacity className="border-2 border-dashed border-slate-200 rounded-3xl p-8 items-center justify-center mb-8 bg-slate-50">
                    <Ionicons name="cloud-upload-outline" size={40} color="#197fe6" />
                    <Text className="text-slate-500 mt-2">Upload Degree/ID Proof</Text>
                    <Text className="text-slate-400 text-xs mt-1">(PDF, JPG, PNG up to 5MB)</Text>
                </TouchableOpacity>

                <Button
                    title="Submit for Verification"
                    loading={loading}
                    onPress={handleSubmit}
                    className="mb-10"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
