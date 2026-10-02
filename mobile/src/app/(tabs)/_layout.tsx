import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { colors } from '@/lib/theme';

export default function ClinicTabs() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.paper },
      headerTintColor: colors.ink,
      headerTitleStyle: { fontWeight: '800' },
      tabBarActiveTintColor: colors.teal,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Doctors',
        tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'stethoscope', android: 'medical_services', web: 'medical_services' }} tintColor={color} size={22} />,
      }} />
      <Tabs.Screen name="appointments" options={{
        title: 'My visits',
        tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'calendar', android: 'event', web: 'calendar_month' }} tintColor={color} size={22} />,
      }} />
    </Tabs>
  );
}