import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Action, Notice, Page, Spinner } from '@/components/clinic-ui';
import { apiRequest, imageUrl, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ doctor: Doctor }>(`/doctors/${id}`)
      .then((result) => setDoctor(result.doctor))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load this doctor.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function removeDoctor() {
    if (!doctor) return;
    try {
      await apiRequest(`/doctors/${doctor._id}`, { method: 'DELETE' });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not remove doctor.');
    }
  }

  if (loading) return <Page><Spinner /></Page>;
  if (!doctor) return <Page><Notice>{error || 'Doctor not found.'}</Notice></Page>;

  return (
    <Page>
      {doctor.imageUrl ? <Image source={{ uri: imageUrl(doctor.imageUrl) }} style={styles.photo} contentFit="cover" /> : <View style={styles.photoFallback}><Text style={styles.initial}>{doctor.name.charAt(0)}</Text></View>}
      <Text style={styles.specialty}>{doctor.specialty}</Text>
      <Text style={styles.name}>{doctor.name}</Text>
      {doctor.description ? <Text style={styles.description}>{doctor.description}</Text> : null}
      {doctor.phone ? <Text style={styles.contact}>Phone  ·  {doctor.phone}</Text> : null}
      {doctor.email ? <Text style={styles.contact}>Email  ·  {doctor.email}</Text> : null}
      {error ? <Notice>{error}</Notice> : null}
      <Action title="Book an appointment" onPress={() => router.push({ pathname: '/appointment-form', params: { doctorId: doctor._id } })} />
      <Action title="Edit doctor" kind="secondary" onPress={() => router.push({ pathname: '/doctor-form', params: { doctorId: doctor._id } })} />
      <Action title="Delete doctor" kind="quiet" onPress={() => void removeDoctor()} />
    </Page>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 230, borderRadius: 10, backgroundColor: colors.mint },
  photoFallback: { width: '100%', height: 230, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint },
  initial: { color: colors.tealDeep, fontSize: 70, fontWeight: '800' },
  specialty: { color: colors.teal, fontWeight: '800', fontSize: 14, marginTop: 3 },
  name: { color: colors.ink, fontSize: 30, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  contact: { color: colors.ink, fontSize: 14 },
});