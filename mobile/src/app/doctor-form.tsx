import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Action, Field, Heading, Notice, Page, Spinner } from '@/components/clinic-ui';
import { apiRequest, imageUrl, type Doctor } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function DoctorFormScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const editing = Boolean(doctorId);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!doctorId) return;
    apiRequest<{ doctor: Doctor }>(`/doctors/${doctorId}`)
      .then(({ doctor: result }) => {
        setDoctor(result);
        setName(result.name);
        setSpecialty(result.specialty);
        setEmail(result.email || '');
        setPhone(result.phone || '');
        setDescription(result.description || '');
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load doctor.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  async function chooseImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function submit() {
    setError('');
    if (!name.trim() || !specialty.trim()) return setError('Doctor name and specialty are required.');
    setBusy(true);
    const body = new FormData();
    body.append('name', name.trim());
    body.append('specialty', specialty.trim());
    body.append('email', email.trim());
    body.append('phone', phone.trim());
    body.append('description', description.trim());
    if (image) {
      (body as any).append('image', { uri: image.uri, name: image.fileName || 'doctor-photo.jpg', type: image.mimeType || 'image/jpeg' });
    }
    try {
      const path = editing ? `/doctors/${doctorId}` : '/doctors';
      await apiRequest(path, { method: editing ? 'PUT' : 'POST', body });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save doctor.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Page><Spinner /></Page>;
  return (
    <Page>
      <Heading title={editing ? 'Update doctor' : 'Add a doctor'} detail="Add the details patients need before booking." />
      {error ? <Notice>{error}</Notice> : null}
      <Field label="Full name" value={name} onChangeText={setName} placeholder="Dr. Maya Perera" />
      <Field label="Specialty" value={specialty} onChangeText={setSpecialty} placeholder="Cardiology" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="doctor@clinic.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="Contact number" keyboardType="phone-pad" />
      <Field label="About" value={description} onChangeText={setDescription} placeholder="Short professional description" multiline />
      <Pressable onPress={() => void chooseImage()} style={styles.photoButton}>
        {image ? <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" /> : doctor?.imageUrl ? <Image source={{ uri: imageUrl(doctor.imageUrl) }} style={styles.preview} contentFit="cover" /> : null}
        <Text style={styles.photoText}>{image || doctor?.imageUrl ? 'Choose a different photo' : 'Choose doctor photo'}</Text>
      </Pressable>
      <Text style={styles.photoHint}>JPG, PNG, or WebP. Maximum 3 MB.</Text>
      <Action title={editing ? 'Save doctor' : 'Create doctor'} onPress={() => void submit()} busy={busy} />
    </Page>
  );
}

const styles = StyleSheet.create({
  photoButton: { minHeight: 72, padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  preview: { width: 52, height: 52, borderRadius: 6, backgroundColor: colors.mint },
  photoText: { color: colors.tealDeep, fontWeight: '800' },
  photoHint: { color: colors.muted, fontSize: 12, marginTop: -12 },
});