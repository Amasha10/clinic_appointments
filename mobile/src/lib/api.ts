import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const sessionKey = 'clinic-session';

export interface Session {
  token: string;
  user: { id: string; name: string; email: string };
}

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}

export interface Appointment {
  _id: string;
  doctor: Doctor | string;
  startAt: string;
  endAt: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export async function saveSession(session: Session) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(sessionKey, JSON.stringify(session));
    return;
  }
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
}

export async function readSession(): Promise<Session | null> {
  const stored = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.localStorage.getItem(sessionKey) : null)
    : await SecureStore.getItemAsync(sessionKey);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.removeItem(sessionKey);
    return;
  }
  await SecureStore.deleteItemAsync(sessionKey);
}

export function imageUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = apiBaseUrl.replace(/\/api$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isMultipart && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const session = await readSession();
    if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status}).`);
  return payload as T;
}