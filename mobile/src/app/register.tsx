import { useState } from 'react';
import { Link, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Action, Field, Heading, Notice, Page } from '@/components/clinic-ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/lib/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 8) {
      return setError('Enter your name, a valid email, and a password of at least 8 characters.');
    }
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your account.');
    } finally {
      setBusy(false);
    }
  }

  return <Page>
    <Heading eyebrow="Clinic Connect" title="Create your account" detail="Your appointments stay linked to your account." />
    {error ? <Notice>{error}</Notice> : null}
    <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" />
    <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" />
    <Action title="Create account" onPress={() => void submit()} busy={busy} />
    <Text style={styles.switchText}>Already registered? <Link href="/login" style={styles.link}>Sign in</Link></Text>
  </Page>;
}

const styles = StyleSheet.create({ switchText: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }, link: { color: colors.tealDeep, fontWeight: '800' } });