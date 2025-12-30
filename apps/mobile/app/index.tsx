import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
    const router = useRouter();
    const { setGuestMode } = useAuth();

    const handleRegister = () => {
        router.push("/(auth)/login");
    };

    const handleGuestMode = async () => {
        await setGuestMode(true);
        router.replace("/(patient)/home");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center">
                {/* Logo & Branding Section */}
                <View className="items-center mb-12">
                    <View className="h-28 w-28 bg-white rounded-full items-center justify-center mb-6 shadow-sm overflow-hidden">
                        <Image
                            source={require('../assets/logo.jpg')}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <Text className="text-4xl font-bold text-slate-900 tracking-tight">
                        Doctor Help
                    </Text>
                    <View className="w-full mt-3">
                        <Text className="text-lg text-slate-500 text-center leading-6">
                            Heal with Trust,{"\n"}Care with Heart
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="w-full">
                    {/* Primary Button - Register / Login */}
                    <Pressable
                        onPress={handleRegister}
                        className="bg-blue-600 py-5 rounded-2xl items-center shadow-md flex-row justify-center"
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                        <Ionicons name="person-add" size={22} color="#fff" style={{ marginRight: 10 }} />
                        <Text className="text-white font-bold text-lg tracking-wide">
                            Register / Login
                        </Text>
                    </Pressable>

                    {/* Spacer */}
                    <View className="h-4" />

                    {/* Secondary Button - Visit as Guest */}
                    <Pressable
                        onPress={handleGuestMode}
                        className="bg-white py-5 rounded-2xl items-center border-2 border-slate-200 flex-row justify-center"
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, borderColor: pressed ? '#60a5fa' : '#e2e8f0' }]}
                    >
                        <Ionicons name="eye-outline" size={22} color="#475569" style={{ marginRight: 10 }} />
                        <Text className="text-slate-700 font-semibold text-lg">
                            Visit as Guest
                        </Text>
                    </Pressable>

                    {/* Guest Mode Info */}
                    <View className="mt-4 px-4">
                        <Text className="text-center text-slate-400 text-sm">
                            Browse doctors and explore the app without signing up
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer - Fixed at bottom */}
            <View className="px-6 pb-6">
                <Text className="text-center text-slate-400 text-sm">
                    By continuing, you agree to our Terms & Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
}
