import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Action, Heading, Notice, Page, Spinner } from '@/components/clinic-ui';
import { apiRequest, imageUrl, type Appointment, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';

function appointmentDoctor(appointment: Appointment): Doctor | null {
  return typeof appointment.doctor === 'string' ? null : appointment.doctor;
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadAppointments = useCallback(async () => {
    setError('');
    try {
      const result = await apiRequest<{ appointments: Appointment[] }>('/appointments');
      setAppointments(result.appointments);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadAppointments(); }, [loadAppointments]));

  async function cancelAppointment(id: string) {
    setBusyId(id);
    setError('');
    try {
      await apiRequest(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Cancelled' }) });
      await loadAppointments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not cancel appointment.');
    } finally {
      setBusyId('');
    }
  }

  async function deleteAppointment(id: string) {
    setBusyId(id);
    setError('');
    try {
      await apiRequest(`/appointments/${id}`, { method: 'DELETE' });
      await loadAppointments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete appointment.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <Page>
      <Heading eyebrow="YOUR CARE" title="My appointments" detail="Review, update, or cancel your visits." />
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Spinner /> : appointments.length === 0 ? <Notice tone="info">No appointments yet. Choose a doctor to book your first visit.</Notice> : appointments.map((appointment) => {
        const doctor = appointmentDoctor(appointment);
        return (
          <View key={appointment._id} style={styles.card}>
            <View style={styles.cardTop}>
              {doctor?.imageUrl ? <Image source={{ uri: imageUrl(doctor.imageUrl) }} style={styles.avatar} contentFit="cover" /> : <View style={styles.avatarFallback}><Text style={styles.avatarLetter}>{doctor?.name?.charAt(0) || 'D'}</Text></View>}
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor?.name || 'Doctor'}</Text>
                <Text style={styles.specialty}>{doctor?.specialty || 'Clinic visit'}</Text>
              </View>
              <Text style={[styles.status, appointment.status === 'Cancelled' && styles.cancelled]}>{appointment.status}</Text>
            </View>
            <View style={styles.rule} />
            <Text style={styles.date}>{new Date(appointment.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>
            <Text style={styles.reason}>{appointment.reason}</Text>
            {appointment.status !== 'Cancelled' ? (
              <View style={styles.actions}>
                <Pressable onPress={() => router.push({ pathname: '/appointment-form', params: { appointmentId: appointment._id } })} style={styles.textButton}><Text style={styles.edit}>Edit</Text></Pressable>
                <Pressable disabled={busyId === appointment._id} onPress={() => void cancelAppointment(appointment._id)} style={styles.textButton}><Text style={styles.cancel}>Cancel visit</Text></Pressable>
                <Pressable disabled={busyId === appointment._id} onPress={() => void deleteAppointment(appointment._id)} style={styles.textButton}><Text style={styles.delete}>Delete</Text></Pressable>
              </View>
            ) : (
              <Action title="Delete record" kind="quiet" disabled={busyId === appointment._id} onPress={() => void deleteAppointment(appointment._id)} />
            )}
          </View>
        );
      })}
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 10, padding: 15, gap: 12 },
  cardTop: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 7, backgroundColor: colors.mint },
  avatarFallback: { width: 46, height: 46, borderRadius: 7, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: colors.tealDeep, fontWeight: '800', fontSize: 20 },
  doctorInfo: { flex: 1, gap: 3 },
  doctorName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  specialty: { color: colors.muted, fontSize: 12 },
  status: { color: colors.tealDeep, backgroundColor: colors.mint, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, overflow: 'hidden', fontSize: 11, fontWeight: '800' },
  cancelled: { color: colors.coral, backgroundColor: colors.coralWash },
  rule: { height: 1, backgroundColor: colors.line },
  date: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  reason: { color: colors.muted, fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap' },
  textButton: { paddingVertical: 5 },
  edit: { color: colors.tealDeep, fontWeight: '800' },
  cancel: { color: colors.coral, fontWeight: '700' },
  delete: { color: colors.muted, fontWeight: '700' },
});