import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, Pressable } from 'react-native';

import { Action, Field, Heading, Notice, Page, Spinner } from '@/components/clinic-ui';
import { apiRequest, type Appointment, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';
import { compactErrors, hasErrors, limits, validateAppointmentTimes, validateRequiredText, type FieldErrors } from '@/lib/validation';

type AppointmentField = 'doctorId' | 'startAt' | 'endAt' | 'reason';

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<AppointmentField>>({});
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

  function change(field: AppointmentField, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: '' }));
    };
  }

  async function submit() {
    setError('');
    const times = validateAppointmentTimes(startAt, endAt);
    const errors = compactErrors<AppointmentField>({
      doctorId: doctorId ? '' : 'Choose a doctor.',
      startAt: times.errors.startAt || '',
      endAt: times.errors.endAt || '',
      reason: validateRequiredText(reason, 'Reason for visit', limits.reason, 5),
    });
    setFieldErrors(errors);
    if (hasErrors(errors) || !times.start || !times.end) return setError('Please fix the highlighted fields.');
    const { start, end } = times;

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
            <Pressable key={doctor._id} onPress={() => { change('doctorId', setDoctorId)(doctor._id); setDoctorName(doctor.name); }} style={[styles.doctorChoice, doctorId === doctor._id && styles.selectedChoice]}>
              <Text style={styles.choiceText}>{doctor.name}  ·  {doctor.specialty}{doctorId === doctor._id ? '  ✓' : ''}</Text>
            </Pressable>
          ))}
          {fieldErrors.doctorId ? <Text style={styles.error}>{fieldErrors.doctorId}</Text> : null}
        </>
      )}
      <Field label="Start (YYYY-MM-DDTHH:mm)" value={startAt} onChangeText={change('startAt', setStartAt)} error={fieldErrors.startAt} maxLength={16} autoCorrect={false} placeholder="2026-10-05T09:30" autoCapitalize="none" />
      <Field label="End (YYYY-MM-DDTHH:mm)" value={endAt} onChangeText={change('endAt', setEndAt)} error={fieldErrors.endAt} maxLength={16} autoCorrect={false} placeholder="2026-10-05T10:00" autoCapitalize="none" />
      <Field label="Reason for visit" value={reason} onChangeText={change('reason', setReason)} error={fieldErrors.reason} hint={`${reason.trim().length}/${limits.reason} characters`} maxLength={limits.reason} placeholder="Briefly describe what you need" multiline />
      <Action title={appointmentId ? 'Save changes' : 'Request appointment'} onPress={() => void submit()} busy={busy} />
    </Page>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  error: { color: colors.coral, fontSize: 12, marginTop: -10 },
  doctorChoice: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 8, padding: 13 },
  selectedChoice: { borderColor: colors.teal, backgroundColor: colors.mint },
  choiceText: { color: colors.ink, fontSize: 14 },
  selectedDoctor: { color: colors.tealDeep, backgroundColor: colors.mint, borderRadius: 8, padding: 14, fontWeight: '800' },
});