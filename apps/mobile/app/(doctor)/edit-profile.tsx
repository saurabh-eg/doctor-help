import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || 'Dr. Smith',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD Cardiology',
        experience: '12',
        consultationFee: '500',
        bio: 'Experienced cardiologist with expertise in interventional cardiology and heart failure management.',
        phone: user?.phone || '+91 98765 43210',
        email: 'dr.smith@example.com',
        hospital: 'City Heart Hospital',
        address: '123 Medical Street, Mumbai',
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1000);
    };

    const InputField = ({ 
        label, 
        value, 
        onChangeText, 
        placeholder,
        keyboardType = 'default',
        multiline = false,
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder?: string;
        keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
        multiline?: boolean;
    }) => (
        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={keyboardType}
                multiline={multiline}
                style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: multiline ? 14 : 0,
                    height: multiline ? 100 : 52,
                    fontSize: 16,
                    color: '#0f172a',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    textAlignVertical: multiline ? 'top' : 'center',
                }}
            />
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
                        Edit Profile
                    </Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Photo */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <View style={{ position: 'relative' }}>
                        <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: '#e2e8f0',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Ionicons name="person" size={48} color="#64748b" />
                        </View>
                        <Pressable
                            style={({ pressed }) => [{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: '#2563eb',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 3,
                                borderColor: '#fff',
                                opacity: pressed ? 0.8 : 1,
                            }]}
                        >
                            <Ionicons name="camera" size={18} color="#fff" />
                        </Pressable>
                    </View>
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
                        Tap to change photo
                    </Text>
                </View>

                {/* Personal Info Section */}
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
                    Personal Information
                </Text>

                <InputField
                    label="Full Name"
                    value={form.name}
                    onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your name"
                />

                <InputField
                    label="Phone Number"
                    value={form.phone}
                    onChangeText={(text) => setForm(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                />

                <InputField
                    label="Email Address"
                    value={form.email}
                    onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                    placeholder="Enter email"
                    keyboardType="email-address"
                />

                {/* Professional Info Section */}
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16, marginTop: 12 }}>
                    Professional Information
                </Text>

                <InputField
                    label="Specialization"
                    value={form.specialization}
                    onChangeText={(text) => setForm(prev => ({ ...prev, specialization: text }))}
                    placeholder="e.g., Cardiologist"
                />

                <InputField
                    label="Qualification"
                    value={form.qualification}
                    onChangeText={(text) => setForm(prev => ({ ...prev, qualification: text }))}
                    placeholder="e.g., MBBS, MD"
                />

                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
                            Experience (Yrs)
                        </Text>
                        <TextInput
                            value={form.experience}
                            onChangeText={(text) => setForm(prev => ({ ...prev, experience: text }))}
                            placeholder="e.g., 10"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                height: 52,
                                fontSize: 16,
                                color: '#0f172a',
                                borderWidth: 1,
                                borderColor: '#e2e8f0',
                            }}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
                            Fee (₹)
                        </Text>
                        <TextInput
                            value={form.consultationFee}
                            onChangeText={(text) => setForm(prev => ({ ...prev, consultationFee: text }))}
                            placeholder="e.g., 500"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                height: 52,
                                fontSize: 16,
                                color: '#0f172a',
                                borderWidth: 1,
                                borderColor: '#e2e8f0',
                            }}
                        />
                    </View>
                </View>

                <InputField
                    label="Hospital/Clinic"
                    value={form.hospital}
                    onChangeText={(text) => setForm(prev => ({ ...prev, hospital: text }))}
                    placeholder="Enter hospital name"
                />

                <InputField
                    label="Bio"
                    value={form.bio}
                    onChangeText={(text) => setForm(prev => ({ ...prev, bio: text }))}
                    placeholder="Tell patients about yourself..."
                    multiline
                />

                {/* Save Button */}
                <Pressable
                    onPress={handleSave}
                    disabled={loading}
                    style={({ pressed }) => [{
                        backgroundColor: loading ? '#94a3b8' : '#2563eb',
                        height: 56,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 8,
                        opacity: pressed ? 0.9 : 1,
                    }]}
                >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </Pressable>

                {/* Bottom padding */}
                <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
