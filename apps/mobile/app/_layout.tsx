import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { DoctorProvider } from "../contexts/DoctorContext";
import { PatientProvider } from "../contexts/PatientContext";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from "@expo-google-fonts/lexend";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Silence Reanimated strict mode warnings
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter: Inter_400Regular,
        Inter_Medium: Inter_500Medium,
        Inter_SemiBold: Inter_600SemiBold,
        Inter_Bold: Inter_700Bold,
        Lexend: Lexend_400Regular,
        Lexend_Medium: Lexend_500Medium,
        Lexend_SemiBold: Lexend_600SemiBold,
        Lexend_Bold: Lexend_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <DoctorProvider>
                    <PatientProvider>
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
                    </PatientProvider>
                </DoctorProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
