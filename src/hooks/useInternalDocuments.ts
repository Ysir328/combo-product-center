import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InternalDocument } from '../types';
import type { InternalDocumentRow } from '../types/supabase';
import { internalDocuments as localDocs } from '../data/internal';

function mapDoc(row: InternalDocumentRow): InternalDocument {
  return {
    id: row.id, title: row.title, category: row.category,
    productIds: row.product_ids || [], productNames: row.product_names || [],
    tags: row.tags || [], version: row.version, updateTime: row.update_time,
    author: row.author, status: row.status, format: row.format,
    fileSize: row.file_size, description: row.description,
    versionHistory: row.version_history || [],
  };
}

interface DocFilters { category?: string; search?: string; }

function filterLocal(filters?: DocFilters): InternalDocument[] {
  let result = localDocs;
  if (filters?.category) result = result.filter(d => d.category === filters.category);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(d => d.title.toLowerCase().includes(s));
  }
  return result;
}

export function useInternalDocuments(filters?: DocFilters) {
  const [data, setData] = useState<InternalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);

    if (!supabase) {
      setData(filterLocal(filters));
      setLoading(false);
      return;
    }

    let query = supabase.from('internal_documents').select('*').order('updated_at', { ascending: false });
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data: rows, error: err } = await query;
    if (err) { setError(err.message); setData(filterLocal(filters)); }
    else { setData((rows as InternalDocumentRow[]).map(mapDoc)); }
    setLoading(false);
  }, [filters?.category, filters?.search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useInternalDocument(id: string | undefined) {
  const [data, setData] = useState<InternalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true); setError(null);

    if (!supabase) {
      setData(localDocs.find(d => d.id === id) || null);
      setLoading(false);
      return;
    }

    const { data: row, error: err } = await supabase.from('internal_documents').select('*').eq('id', id).single();
    if (err) { setError(err.message); setData(localDocs.find(d => d.id === id) || null); }
    else { setData(mapDoc(row as InternalDocumentRow)); }
    setLoading(false);
  }, [id]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useCreateInternalDoc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (_input: Partial<InternalDocumentRow>): Promise<string | null> => {
    if (!supabase) { setError('Supabase 未配置'); return null; }
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from('internal_documents').insert(_input).select('id').single();
    if (err) { setError(err.message); setLoading(false); return null; }
    setLoading(false); return (data as { id: string }).id;
  }, []);
  return { mutate, loading, error };
}

export function useUpdateInternalDoc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string, _input: Partial<InternalDocumentRow>): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('internal_documents').update({ ..._input, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}

export function useDeleteInternalDoc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('internal_documents').delete().eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);
  return { mutate, loading, error };
}
