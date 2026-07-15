import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../types';
import type { ProfileRow } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const profile = data as ProfileRow | null;
    if (!profile) return null;
    return { id: profile.id, email: email || '', name: profile.name, role: profile.role as UserRole, avatar: profile.avatar || undefined };
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    const initAuth = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchProfile(session.user.id, session.user.email || undefined);
        setUser(userData);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const userData = await fetchProfile(session.user.id, session.user.email || undefined);
          setUser(userData);
        } else { setUser(null); }
        setLoading(false);
      }
    );
    return () => { subscription.unsubscribe(); };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase 未配置，请在 .env 中设置环境变量' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.includes('Invalid login credentials') ? '邮箱或密码错误'
        : error.message.includes('Email not confirmed') ? '邮箱未验证，请先检查邮箱' : error.message;
      return { error: msg };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) return { error: 'Supabase 未配置' };
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    return perms.includes('*') || perms.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, loading, signIn, signUp, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
