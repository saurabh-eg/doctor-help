import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <SafeAreaProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(patient)" />
                        <Stack.Screen name="(doctor)" />
                        <Stack.Screen name="(common)" />
                    </Stack>
                </SafeAreaProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
