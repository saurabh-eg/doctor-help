import { View, Text, Pressable, Image, Dimensions } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get('window');

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center pt-12">
                {/* Logo & Branding Section */}
                <View className="items-center mb-16">
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
                    {/* Primary Button - Patient Login */}
                    <Link href="/(auth)/login" asChild>
                        <Pressable
                            className="bg-blue-600 py-5 rounded-2xl items-center shadow-md"
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        >
                            <Text className="text-white font-bold text-lg tracking-wide">
                                Login as Patient
                            </Text>
                        </Pressable>
                    </Link>

                    {/* Spacer */}
                    <View className="h-4" />

                    {/* Secondary Button - Doctor Login */}
                    <Link href="/(auth)/login" asChild>
                        <Pressable
                            className="bg-white py-5 rounded-2xl items-center border-2 border-slate-200"
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, borderColor: pressed ? '#60a5fa' : '#e2e8f0' }]}
                        >
                            <Text className="text-slate-700 font-semibold text-lg">
                                I am a Doctor
                            </Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Footer */}
                <View className="mt-auto pb-8">
                    <Text className="text-center text-slate-400 text-sm">
                        By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
