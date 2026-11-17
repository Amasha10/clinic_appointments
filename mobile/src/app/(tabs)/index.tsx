import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Action, Heading, Notice, Page, Spinner } from '@/components/clinic-ui';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, imageUrl, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function DoctorsScreen() {
  const { user, signOut } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDoctors = useCallback(async () => {
    setError('');
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const result = await apiRequest<{ doctors: Doctor[] }>(`/doctors${query}`);
      setDoctors(result.doctors);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load doctors.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(useCallback(() => { void loadDoctors(); }, [loadDoctors]));

  return (
    <Page>
      <View style={styles.topline}>
        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>CARE, MADE SIMPLE</Text>
          <Text style={styles.greeting}>Hello, {user?.name.split(' ')[0]}</Text>
        </View>
        <Pressable onPress={() => void signOut()} accessibilityRole="button"><Text style={styles.signOut}>Sign out</Text></Pressable>
      </View>
      <Heading title="Find your doctor" detail="Browse specialists and book a time that works for you." />
      <TextInput value={search} onChangeText={setSearch} placeholder="Search name or specialty" placeholderTextColor={colors.muted} style={styles.search} returnKeyType="search" />
      <View style={styles.manageRow}>
        <Text style={styles.sectionLabel}>DOCTOR DIRECTORY</Text>
        <Pressable onPress={() => router.push('/doctor-form')}><Text style={styles.manage}>+ Add doctor</Text></Pressable>
      </View>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Spinner /> : doctors.length === 0 ? <Notice tone="info">No doctors found. Add a doctor to get started.</Notice> : doctors.map((doctor) => (
        <Pressable key={doctor._id} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: doctor._id } })} style={({ pressed }) => [styles.doctorCard, pressed && styles.pressed]}>
          {doctor.imageUrl ? <Image source={{ uri: imageUrl(doctor.imageUrl) }} style={styles.avatar} contentFit="cover" /> : <View style={styles.avatarFallback}><Text style={styles.avatarLetter}>{doctor.name.charAt(0).toUpperCase()}</Text></View>}
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.cardHint}>{doctor.phone || 'View profile'}  ·  Book a visit</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
      {!loading ? <Action title="Refresh directory" kind="quiet" onPress={() => { setLoading(true); void loadDoctors(); }} /> : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 6 },
  welcome: { gap: 4 },
  eyebrow: { color: colors.teal, fontWeight: '800', fontSize: 10, letterSpacing: 1.2 },
  greeting: { color: colors.ink, fontWeight: '700', fontSize: 16 },
  signOut: { color: colors.coral, fontWeight: '700', fontSize: 13, padding: 8 },
  search: { minHeight: 48, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, color: colors.ink, fontSize: 15 },
  manageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  manage: { color: colors.tealDeep, fontWeight: '800', fontSize: 13, padding: 7 },
  doctorCard: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 62, height: 62, borderRadius: 8, backgroundColor: colors.mint },
  avatarFallback: { width: 62, height: 62, borderRadius: 8, backgroundColor: colors.mint, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: colors.tealDeep, fontWeight: '800', fontSize: 24 },
  doctorInfo: { flex: 1, gap: 3 },
  doctorName: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  specialty: { color: colors.tealDeep, fontSize: 13, fontWeight: '700' },
  cardHint: { color: colors.muted, fontSize: 12 },
  arrow: { color: colors.teal, fontSize: 28, paddingHorizontal: 4 },
  pressed: { opacity: 0.75 },
});