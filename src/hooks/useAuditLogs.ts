import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AuditLogRow } from '../types/supabase';

export interface AuditLog {
  id: string; action: string; entityType: string; entityId: string | null;
  entityTitle: string | null; userId: string | null; userName: string | null;
  details: Record<string, unknown>; createdAt: string;
}

function mapLog(row: AuditLogRow): AuditLog {
  return { id: row.id, action: row.action, entityType: row.entity_type, entityId: row.entity_id, entityTitle: row.entity_title, userId: row.user_id, userName: row.user_name, details: row.details || {}, createdAt: row.created_at };
}

interface LogFilters { action?: string; entityType?: string; userId?: string; }

export function useAuditLogs(filters?: LogFilters) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    if (!supabase) { setData([]); setLoading(false); return; }
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    const { data: rows, error: err } = await query;
    if (err) { setError(err.message); setData([]); } else { setData((rows as AuditLogRow[]).map(mapLog)); }
    setLoading(false);
  }, [filters?.action, filters?.entityType, filters?.userId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useCreateAuditLog() {
  const [loading, setLoading] = useState(false);
  const mutate = useCallback(async (input: { action: string; entity_type: string; entity_id?: string; entity_title?: string; details?: Record<string, unknown> }): Promise<boolean> => {
    if (!supabase) return false;
    setLoading(true);
    const { error } = await supabase.from('audit_logs').insert({
      ...input,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      user_name: (await supabase.auth.getUser()).data.user?.user_metadata?.name || '',
    });
    setLoading(false);
    return !error;
  }, []);
  return { mutate, loading };
}
