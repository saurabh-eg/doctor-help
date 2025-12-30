import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface GuestPromptProps {
    visible: boolean;
    onClose: () => void;
    action?: string;
}

/**
 * Modal prompt shown to guest users when they try to perform restricted actions
 * Offers option to register/login or continue browsing
 */
export default function GuestPrompt({ visible, onClose, action = 'perform this action' }: GuestPromptProps) {
    const router = useRouter();
    const { setGuestMode } = useAuth();

    const handleLogin = async () => {
        await setGuestMode(false);
        onClose();
        router.push('/(auth)/login');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
                    {/* Icon */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ backgroundColor: '#eff6ff', borderRadius: 50, padding: 16 }}>
                            <Ionicons name="lock-closed" size={32} color="#2563eb" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
                        Login Required
                    </Text>

                    {/* Message */}
                    <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                        You need to create an account or login to {action}. It only takes a minute!
                    </Text>

                    {/* Buttons */}
                    <Pressable
                        onPress={handleLogin}
                        style={({ pressed }) => [
                            {
                                backgroundColor: '#2563eb',
                                paddingVertical: 14,
                                borderRadius: 12,
                                alignItems: 'center',
                                marginBottom: 12,
                                opacity: pressed ? 0.8 : 1,
                            }
                        ]}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Register / Login</Text>
                    </Pressable>

                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [
                            {
                                backgroundColor: '#f1f5f9',
                                paddingVertical: 14,
                                borderRadius: 12,
                                alignItems: 'center',
                                opacity: pressed ? 0.8 : 1,
                            }
                        ]}
                    >
                        <Text style={{ color: '#475569', fontSize: 16, fontWeight: '600' }}>Continue Browsing</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
