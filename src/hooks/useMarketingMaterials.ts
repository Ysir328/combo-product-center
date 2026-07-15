import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketingMaterial } from '../types';
import type { MarketingMaterialRow } from '../types/supabase';
import { marketingMaterials as localMaterials } from '../data/marketing';

function mapMaterial(row: MarketingMaterialRow): MarketingMaterial {
  return {
    id: row.id, title: row.title, category: row.category,
    productIds: row.product_ids || [], productNames: row.product_names || [],
    description: row.description, format: row.format, fileSize: row.file_size,
    pages: row.pages, version: row.version, status: row.status,
    updateTime: row.update_time, author: row.author,
    targetAudience: row.target_audience, thumbnail: row.thumbnail || undefined,
  } as MarketingMaterial;
}

interface MaterialFilters { category?: string; status?: string; search?: string; }

function filterLocal(filters?: MaterialFilters): MarketingMaterial[] {
  let result = localMaterials;
  if (filters?.category) result = result.filter(m => m.category === filters.category);
  if (filters?.status) result = result.filter(m => m.status === filters.status);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(s));
  }
  return result;
}

export function useMarketingMaterials(filters?: MaterialFilters) {
  const [data, setData] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);

    if (!supabase) {
      setData(filterLocal(filters));
      setLoading(false);
      return;
    }

    let query = supabase.from('marketing_materials').select('*').order('updated_at', { ascending: false });
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data: rows, error: err } = await query;
    if (err) { setError(err.message); setData(filterLocal(filters)); }
    else { setData((rows as MarketingMaterialRow[]).map(mapMaterial)); }
    setLoading(false);
  }, [filters?.category, filters?.status, filters?.search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useMarketingMaterial(id: string | undefined) {
  const [data, setData] = useState<MarketingMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true); setError(null);

    if (!supabase) {
      setData(localMaterials.find(m => m.id === id) || null);
      setLoading(false);
      return;
    }

    const { data: row, error: err } = await supabase
      .from('marketing_materials').select('*').eq('id', id).single();
    if (err) { setError(err.message); setData(localMaterials.find(m => m.id === id) || null); }
    else { setData(mapMaterial(row as MarketingMaterialRow)); }
    setLoading(false);
  }, [id]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useCreateMaterial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (_input: Partial<MarketingMaterialRow>): Promise<string | null> => {
    if (!supabase) { setError('Supabase 未配置'); return null; }
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from('marketing_materials').insert(_input).select('id').single();
    if (err) { setError(err.message); setLoading(false); return null; }
    setLoading(false); return (data as { id: string }).id;
  }, []);
  return { mutate, loading, error };
}

export function useUpdateMaterial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string, _input: Partial<MarketingMaterialRow>): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('marketing_materials').update({ ..._input, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}

export function useDeleteMaterial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('marketing_materials').delete().eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}
