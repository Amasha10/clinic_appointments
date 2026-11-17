import { useState } from 'react';
import { Link, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Action, Field, Heading, Notice, Page } from '@/components/clinic-ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/lib/theme';
import {
  compactErrors, hasErrors, limits, validateEmail, validateName, validatePassword, validatePasswordConfirmation, type FieldErrors,
} from '@/lib/validation';

type RegisterField = 'name' | 'email' | 'password' | 'confirmPassword';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function change(field: RegisterField, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: '' }));
    };
  }

  async function submit() {
    setError('');
    const errors = compactErrors<RegisterField>({
      name: validateName(name, 'Full name', limits.userName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return setError('Please fix the highlighted fields.');

    setBusy(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
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
    <Field label="Full name" value={name} onChangeText={change('name', setName)} error={fieldErrors.name} placeholder="Your name" autoComplete="name" maxLength={limits.userName} />
    <Field label="Email address" value={email} onChangeText={change('email', setEmail)} error={fieldErrors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={limits.email} />
    <Field label="Password" value={password} onChangeText={change('password', setPassword)} error={fieldErrors.password} hint="At least 8 characters, with a letter and a number." placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" maxLength={limits.passwordMax} />
    <Field label="Confirm password" value={confirmPassword} onChangeText={change('confirmPassword', setConfirmPassword)} error={fieldErrors.confirmPassword} placeholder="Re-enter your password" secureTextEntry autoComplete="new-password" maxLength={limits.passwordMax} />
    <Action title="Create account" onPress={() => void submit()} busy={busy} />
    <Text style={styles.switchText}>Already registered? <Link href="/login" style={styles.link}>Sign in</Link></Text>
  </Page>;
}

const styles = StyleSheet.create({ switchText: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }, link: { color: colors.tealDeep, fontWeight: '800' } });
