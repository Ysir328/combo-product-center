import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
let initialized = false;

function getClient(): SupabaseClient | null {
  if (initialized) return client;
  initialized = true;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Supabase 未配置。应用将使用本地数据运行。\n' +
      '创建 .env 文件并设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 以启用云端功能。\n' +
      '参考 .env.example 文件。'
    );
    return null;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export const supabase = getClient();

/** 是否已配置 Supabase */
export const hasSupabase = (): boolean => getClient() !== null;
