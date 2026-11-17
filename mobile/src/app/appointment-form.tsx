import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, Pressable } from 'react-native';

import { Action, Field, Heading, Notice, Page, Spinner } from '@/components/clinic-ui';
import { apiRequest, type Appointment, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';

function toLocalField(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AppointmentFormScreen() {
  const { doctorId: initialDoctorId, appointmentId } = useLocalSearchParams<{ doctorId?: string; appointmentId?: string }>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState(initialDoctorId || '');
  const [doctorName, setDoctorName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(appointmentId));

  useEffect(() => {
    apiRequest<{ doctors: Doctor[] }>('/doctors')
      .then(({ doctors: result }) => setDoctors(result))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load doctors.'));
  }, []);

  useEffect(() => {
    if (!appointmentId) return;
    apiRequest<{ appointment: Appointment }>(`/appointments/${appointmentId}`)
      .then(({ appointment }) => {
        const doctor = typeof appointment.doctor === 'string' ? null : appointment.doctor;
        setDoctorId(doctor?._id || '');
        setDoctorName(doctor?.name || '');
        setStartAt(toLocalField(appointment.startAt));
        setEndAt(toLocalField(appointment.endAt));
        setReason(appointment.reason);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load appointment.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  async function submit() {
    setError('');
    if (!doctorId || !startAt || !endAt || !reason.trim()) return setError('Choose a doctor, enter the visit times, and add a reason.');
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start <= new Date() || end <= start) {
      return setError('Use valid future times, with the end after the start.');
    }

    setBusy(true);
    try {
      const path = appointmentId ? `/appointments/${appointmentId}` : '/appointments';
      const method = appointmentId ? 'PUT' : 'POST';
      await apiRequest(path, { method, body: JSON.stringify({ doctorId, startAt: start.toISOString(), endAt: end.toISOString(), reason: reason.trim() }) });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save appointment.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Page><Spinner /></Page>;
  return (
    <Page>
      <Heading title={appointmentId ? 'Update visit' : 'Book a visit'} detail="Choose a doctor and time. The clinic checks for conflicts before saving." />
      {error ? <Notice>{error}</Notice> : null}
      {appointmentId ? <Text style={styles.selectedDoctor}>{doctorName || 'Selected doctor'}</Text> : (
        <>
          <Text style={styles.label}>Choose doctor</Text>
          {doctors.map((doctor) => (
            <Pressable key={doctor._id} onPress={() => { setDoctorId(doctor._id); setDoctorName(doctor.name); }} style={[styles.doctorChoice, doctorId === doctor._id && styles.selectedChoice]}>
              <Text style={styles.choiceText}>{doctor.name}  ·  {doctor.specialty}{doctorId === doctor._id ? '  ✓' : ''}</Text>
            </Pressable>
          ))}
        </>
      )}
      <Field label="Start (YYYY-MM-DDTHH:mm)" value={startAt} onChangeText={setStartAt} placeholder="2026-10-05T09:30" autoCapitalize="none" />
      <Field label="End (YYYY-MM-DDTHH:mm)" value={endAt} onChangeText={setEndAt} placeholder="2026-10-05T10:00" autoCapitalize="none" />
      <Field label="Reason for visit" value={reason} onChangeText={setReason} placeholder="Briefly describe what you need" multiline />
      <Action title={appointmentId ? 'Save changes' : 'Request appointment'} onPress={() => void submit()} busy={busy} />
    </Page>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  doctorChoice: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 8, padding: 13 },
  selectedChoice: { borderColor: colors.teal, backgroundColor: colors.mint },
  choiceText: { color: colors.ink, fontSize: 14 },
  selectedDoctor: { color: colors.tealDeep, backgroundColor: colors.mint, borderRadius: 8, padding: 14, fontWeight: '800' },
});