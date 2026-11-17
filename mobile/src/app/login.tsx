import { useState } from 'react';
import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Action, Field, Heading, Notice, Page } from '@/components/clinic-ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/lib/theme';
import { compactErrors, hasErrors, limits, validateEmail, type FieldErrors } from '@/lib/validation';

type LoginField = 'email' | 'password';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function change(field: LoginField, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: '' }));
    };
  }

  async function submit() {
    setError('');
    // Only presence/format here: strength rules belong to registration, not sign-in.
    const errors = compactErrors<LoginField>({
      email: validateEmail(email),
      password: password ? '' : 'Password is required.',
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setBusy(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return <Page>
    <View style={styles.mark}><Text style={styles.markText}>C</Text></View>
    <Heading eyebrow="Clinic Connect" title="Welcome back" detail="Sign in to find a doctor or manage your visits." />
    {error ? <Notice>{error}</Notice> : null}
    <Field label="Email address" value={email} onChangeText={change('email', setEmail)} error={fieldErrors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={limits.email} />
    <Field label="Password" value={password} onChangeText={change('password', setPassword)} error={fieldErrors.password} placeholder="At least 8 characters" secureTextEntry autoComplete="password" maxLength={limits.passwordMax} />
    <Action title="Sign in" onPress={() => void submit()} busy={busy} />
    <Text style={styles.switchText}>New to Clinic Connect? <Link href="/register" style={styles.link}>Create an account</Link></Text>
  </Page>;
}

const styles = StyleSheet.create({ mark: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', marginTop: 28 }, markText: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' }, switchText: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }, link: { color: colors.tealDeep, fontWeight: '800' } });
