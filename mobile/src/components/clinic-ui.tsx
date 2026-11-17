import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';

export function Page({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>;
}

export function Heading({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  return <View style={styles.heading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}<Text style={styles.title}>{title}</Text>{detail ? <Text style={styles.detail}>{detail}</Text> : null}</View>;
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={[styles.input, props.multiline && styles.multiline, style]} {...props} /></View>;
}

export function Action({ title, onPress, busy = false, disabled = false, kind = 'primary' }: {
  title: string; onPress: () => void; busy?: boolean; disabled?: boolean; kind?: 'primary' | 'secondary' | 'danger' | 'quiet';
}) {
  return <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [styles.action, styles[kind], (pressed || disabled || busy) && styles.dimmed]}>{busy ? <ActivityIndicator color={kind === 'primary' ? '#FFFFFF' : colors.tealDeep} /> : <Text style={[styles.actionText, kind !== 'primary' && kind !== 'danger' && styles.secondaryText]}>{title}</Text>}</Pressable>;
}

export function Notice({ children, tone = 'error' }: { children: string; tone?: 'error' | 'info' }) {
  return <View style={[styles.notice, tone === 'error' ? styles.errorNotice : styles.infoNotice]}><Text style={[styles.noticeText, tone === 'error' ? styles.errorText : styles.infoText]}>{children}</Text></View>;
}

export function Spinner() {
  return <ActivityIndicator style={styles.spinner} size="large" color={colors.teal} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 22, paddingBottom: 38, gap: 18 },
  heading: { gap: 7, marginBottom: 5 },
  eyebrow: { color: colors.teal, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  fieldGroup: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 14, color: colors.ink, backgroundColor: colors.surface, fontSize: 15 },
  multiline: { minHeight: 100, paddingTop: 13, textAlignVertical: 'top' },
  action: { minHeight: 48, paddingHorizontal: 17, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.teal },
  secondary: { backgroundColor: colors.mint },
  danger: { backgroundColor: colors.coral },
  quiet: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  secondaryText: { color: colors.tealDeep },
  dimmed: { opacity: 0.6 },
  notice: { borderRadius: 8, padding: 12 },
  errorNotice: { backgroundColor: colors.coralWash },
  infoNotice: { backgroundColor: colors.mint },
  noticeText: { fontSize: 14, lineHeight: 20 },
  errorText: { color: colors.coral },
  infoText: { color: colors.tealDeep },
  spinner: { marginTop: 40 },
});