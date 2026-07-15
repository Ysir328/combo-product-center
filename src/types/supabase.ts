/** 数据库行类型 — 对应 Supabase 表结构 */

export interface ProfileRow {
  id: string;
  name: string;
  role: 'visitor' | 'client' | 'advisor' | 'operator' | 'admin';
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  short_name: string;
  type: string;
  status: 'online' | 'paused' | 'offline';
  risk_level: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  tags: { id: string; label: string }[];
  one_liner: string;
  launch_date: string;
  update_time: string;
  target_clients: string;
  positioning: string;
  basic_info: Record<string, string>;
  investment_objective: string;
  investment_scope: string;
  asset_allocation: string;
  selection_logic: string;
  rebalancing_mechanism: string;
  risk_control: string;
  compliance_note: string;
  cumulative_return: number;
  annualized_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  monthly_returns: { month: string; value: number }[];
  nav_history: { date: string; nav: number }[];
  cover_image: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface MarketingMaterialRow {
  id: string;
  title: string;
  category: string;
  product_ids: string[];
  product_names: string[];
  description: string;
  format: 'PDF' | 'PPT' | 'Word' | 'Excel' | 'Image';
  file_size: string;
  pages: number;
  version: string;
  status: 'published' | 'draft' | 'archived';
  update_time: string;
  author: string;
  target_audience: string;
  file_url: string | null;
  thumbnail: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface InternalDocumentRow {
  id: string;
  title: string;
  category: string;
  product_ids: string[];
  product_names: string[];
  tags: string[];
  version: string;
  update_time: string;
  author: string;
  status: 'active' | 'updated' | 'history' | 'expired';
  format: string;
  file_size: string;
  description: string;
  version_history: { version: string; date: string; author: string; changes: string }[];
  file_url: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'material' | 'system' | 'compliance';
  publish_date: string;
  effective_date: string | null;
  related_products: string[];
  is_pinned: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  user_id: string | null;
  user_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
