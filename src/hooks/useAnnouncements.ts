import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Announcement } from '../types';
import type { AnnouncementRow } from '../types/supabase';
import { announcements as localAnnouncements } from '../data/announcements';

function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id, title: row.title, content: row.content, category: row.category,
    publishDate: row.publish_date, effectiveDate: row.effective_date || undefined,
    relatedProducts: row.related_products || [], isPinned: row.is_pinned,
  };
}

interface AnnouncementFilters { category?: string; }

function filterLocal(filters?: AnnouncementFilters): Announcement[] {
  let result = localAnnouncements;
  if (filters?.category) result = result.filter(a => a.category === filters.category);
  return result;
}

export function useAnnouncements(filters?: AnnouncementFilters) {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);

    if (!supabase) {
      setData(filterLocal(filters));
      setLoading(false);
      return;
    }

    let query = supabase.from('announcements').select('*')
      .order('is_pinned', { ascending: false })
      .order('publish_date', { ascending: false });
    if (filters?.category) query = query.eq('category', filters.category);

    const { data: rows, error: err } = await query;
    if (err) { setError(err.message); setData(filterLocal(filters)); }
    else { setData((rows as AnnouncementRow[]).map(mapAnnouncement)); }
    setLoading(false);
  }, [filters?.category]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useAnnouncement(id: string | undefined) {
  const [data, setData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true); setError(null);

    if (!supabase) {
      setData(localAnnouncements.find(a => a.id === id) || null);
      setLoading(false);
      return;
    }

    const { data: row, error: err } = await supabase.from('announcements').select('*').eq('id', id).single();
    if (err) { setError(err.message); setData(localAnnouncements.find(a => a.id === id) || null); }
    else { setData(mapAnnouncement(row as AnnouncementRow)); }
    setLoading(false);
  }, [id]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useCreateAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (_input: Partial<AnnouncementRow>): Promise<string | null> => {
    if (!supabase) { setError('Supabase 未配置'); return null; }
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from('announcements').insert(_input).select('id').single();
    if (err) { setError(err.message); setLoading(false); return null; }
    setLoading(false); return (data as { id: string }).id;
  }, []);
  return { mutate, loading, error };
}

export function useUpdateAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string, _input: Partial<AnnouncementRow>): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('announcements').update({ ..._input, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}

export function useDeleteAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('announcements').delete().eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}
