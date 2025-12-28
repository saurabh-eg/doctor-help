import 'dotenv/config';

export default {
    expo: {
        name: "Doctor Help",
        slug: "doctor-help",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        scheme: "doctorhelp",
        extra: {
            // API URL - Update this when using ngrok
            // Run: npx ngrok http 3001
            // Then set: EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io/api
            apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            }
        },
        web: {
            favicon: "./assets/favicon.png",
            bundler: "metro"
        },
        plugins: ["expo-router"]
    }
};
