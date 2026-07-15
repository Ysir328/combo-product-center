import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/supabase';
import type { UserRole } from '../types';

export interface Profile {
  id: string; name: string; role: UserRole; avatar: string | null; email?: string; createdAt: string;
}

function mapProfile(row: ProfileRow & { email?: string }): Profile {
  return { id: row.id, name: row.name, role: row.role, avatar: row.avatar, email: row.email, createdAt: row.created_at };
}

export function useProfiles() {
  const [data, setData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    if (!supabase) { setData([]); setLoading(false); return; }
    const { data: rows, error: err } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (err) { setError(err.message); setData([]); } else { setData((rows as ProfileRow[]).map(mapProfile)); }
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useProfile(userId: string | undefined) {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true); setError(null);
    if (!supabase) { setData(null); setLoading(false); return; }
    const { data: row, error: err } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (err) { setError(err.message); setData(null); } else { setData(mapProfile(row as ProfileRow)); }
    setLoading(false);
  }, [userId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (userId: string, input: Partial<ProfileRow>): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('profiles').update({ ...input, updated_at: new Date().toISOString() }).eq('id', userId);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}
