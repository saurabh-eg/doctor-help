import { Stack } from 'expo-router';

export default function CommonLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="video-call/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}
