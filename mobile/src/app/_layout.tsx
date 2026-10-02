import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/lib/theme';

function NavigationGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuthRoute = segments[0] === 'login' || segments[0] === 'register';

  useEffect(() => {
    if (loading) return;
    if (!user && !inAuthRoute) router.replace('/login');
    if (user && inAuthRoute) router.replace('/(tabs)');
  }, [inAuthRoute, loading, router, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTintColor: colors.ink, headerStyle: { backgroundColor: colors.paper }, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="doctor/[id]" options={{ title: 'Doctor profile' }} />
      <Stack.Screen name="doctor-form" options={{ title: 'Doctor details' }} />
      <Stack.Screen name="appointment-form" options={{ title: 'Appointment' }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthProvider><NavigationGate /></AuthProvider>;
}
