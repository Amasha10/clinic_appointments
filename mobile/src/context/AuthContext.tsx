import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { apiRequest, clearSession, readSession, saveSession, type Session } from '@/lib/api';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readSession().then(setSession).catch(() => setSession(null)).finally(() => setLoading(false));
  }, []);

  async function authenticate(path: string, payload: Record<string, string>) {
    const nextSession = await apiRequest<Session>(path, { method: 'POST', body: JSON.stringify(payload) }, false);
    await saveSession(nextSession);
    setSession(nextSession);
  }

  async function signIn(email: string, password: string) {
    await authenticate('/auth/login', { email, password });
  }

  async function register(name: string, email: string, password: string) {
    await authenticate('/auth/register', { name, email, password });
  }

  async function signOut() {
    await clearSession();
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, loading, signIn, register, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return { ...value, user: value.session?.user ?? null };
}