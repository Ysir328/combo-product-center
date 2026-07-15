import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import type { ProductRow } from '../types/supabase';
import { products as localProducts, getProductById as localGetById } from '../data/products';

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    type: row.type,
    status: row.status,
    riskLevel: row.risk_level,
    tags: row.tags || [],
    oneLiner: row.one_liner,
    launchDate: row.launch_date,
    updateTime: row.update_time,
    targetClients: row.target_clients,
    positioning: row.positioning,
    basicInfo: row.basic_info || {},
    investmentObjective: row.investment_objective,
    investmentScope: row.investment_scope,
    assetAllocation: row.asset_allocation,
    selectionLogic: row.selection_logic,
    rebalancingMechanism: row.rebalancing_mechanism,
    riskControl: row.risk_control,
    complianceNote: row.compliance_note,
    cumulativeReturn: row.cumulative_return,
    annualizedReturn: row.annualized_return,
    maxDrawdown: row.max_drawdown,
    sharpeRatio: row.sharpe_ratio,
    monthlyReturns: row.monthly_returns || [],
    navHistory: row.nav_history || [],
  };
}

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setData(localProducts);
      setLoading(false);
      return;
    }

    const { data: rows, error: err } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) { setError(err.message); setData(localProducts); }
    else { setData((rows as ProductRow[]).map(mapProduct)); }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useProduct(id: string | undefined) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    if (!supabase) {
      setData(localGetById(id) || null);
      setLoading(false);
      return;
    }

    const { data: row, error: err } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (err) { setError(err.message); setData(localGetById(id) || null); }
    else { setData(mapProduct(row as ProductRow)); }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (_input: Partial<ProductRow>): Promise<string | null> => {
    if (!supabase) { setError('Supabase 未配置'); return null; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products').insert(_input).select('id').single();
    if (err) { setError(err.message); setLoading(false); return null; }
    setLoading(false);
    return (data as { id: string }).id;
  }, []);

  return { mutate, loading, error };
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, _input: Partial<ProductRow>): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase
      .from('products').update({ ..._input, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);

  return { mutate, loading, error };
}

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) { setError('Supabase 未配置'); return false; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (err) { setError(err.message); setLoading(false); return false; }
    setLoading(false); return true;
  }, []);

  return { mutate, loading, error };
}
