import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { SocketProvider } from "../hooks/useSocket";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, LogBox } from "react-native";

LogBox.ignoreLogs(['Unable to activate keep awake', 'Exception in HostObject']);
import "../global.css";

import { GlobalCallNotification } from "../components/GlobalCallNotification";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Redirect to login if user is not signed in and not in auth group
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Redirect to home if user is signed in and in auth group
      router.replace("/");
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0E1A" }}>
        <ActivityIndicator size="large" color="#F2A7C3" />
      </View>
    );
  }

  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        {/* Let Expo Router handle (tabs) group layout automatically */}
      </Stack>
      <GlobalCallNotification />
    </SocketProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
