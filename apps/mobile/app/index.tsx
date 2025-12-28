import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { Link } from "expo-router";

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerClassName="p-6">
                <View className="items-center mb-10 mt-10">
                    <View className="h-24 w-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-4xl">🏥</Text>
                    </View>
                    <Text className="text-3xl font-bold text-slate-800">Doctor Help</Text>
                    <Text className="text-slate-500 mt-2">Heal with Trust</Text>
                </View>

                <View className="space-y-4">
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity className="bg-blue-600 p-4 rounded-xl items-center active:scale-95 transition-all">
                            <Text className="text-white font-bold text-lg">Login as Patient</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity className="bg-white p-4 rounded-xl items-center border border-slate-200 active:scale-95 transition-all">
                        <Text className="text-slate-700 font-semibold text-lg">I am a Doctor</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
