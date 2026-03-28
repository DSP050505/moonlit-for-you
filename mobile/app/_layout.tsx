import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { SocketProvider } from "../hooks/useSocket";
import { MusicProvider } from "../hooks/useMusic";
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
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
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
      <MusicProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack>
        <GlobalCallNotification />
      </MusicProvider>
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
