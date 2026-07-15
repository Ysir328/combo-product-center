/* ========== User & Auth ========== */
export type UserRole = 'visitor' | 'client' | 'advisor' | 'operator' | 'admin';

export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  visitor: '访客',
  client: '授权客户',
  advisor: '投顾经理',
  operator: '运营人员',
  admin: '系统管理员',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  visitor: ['product:view', 'marketing:view'],
  client: ['product:view', 'marketing:view', 'marketing:download'],
  advisor: ['product:view', 'marketing:view', 'marketing:download', 'internal:view', 'internal:download'],
  operator: ['product:view', 'product:edit', 'marketing:view', 'marketing:edit', 'marketing:download', 'internal:view', 'internal:edit', 'internal:download'],
  admin: ['*'],
};

/* ========== Product ========== */
export type ProductStatus = 'online' | 'paused' | 'offline';
export type RiskLevel = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export interface ProductTag {
  id: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  type: string;
  status: ProductStatus;
  riskLevel: RiskLevel;
  tags: ProductTag[];
  oneLiner: string;
  launchDate: string;
  updateTime: string;
  targetClients: string;
  // Detail fields
  positioning: string;
  basicInfo: Record<string, string>;
  investmentObjective: string;
  investmentScope: string;
  assetAllocation: string;
  selectionLogic: string;
  rebalancingMechanism: string;
  riskControl: string;
  complianceNote: string;
  // Performance
  cumulativeReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  monthlyReturns: { month: string; value: number }[];
  navHistory: { date: string; nav: number }[];
}

/* ========== Marketing ========== */
export interface MetricCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  icon: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  value2?: number;
}

export interface ChartSeries {
  name: string;
  dataKey: string;
  color: string;
}

export interface MarketingMaterial {
  id: string;
  title: string;
  category: string;
  productIds: string[];
  productNames: string[];
  description: string;
  format: 'PDF' | 'PPT' | 'Word' | 'Excel' | 'Image';
  fileSize: string;
  pages: number;
  version: string;
  status: 'published' | 'draft' | 'archived';
  updateTime: string;
  author: string;
  thumbnail?: string;
  targetAudience: string;
}

export type MaterialCategory = 'product_intro' | 'performance_report' | 'faq' | 'script' | 'social_media' | 'template' | 'training';

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  product_intro: '产品介绍',
  performance_report: '业绩报告',
  faq: '常见问题',
  script: '沟通话术',
  social_media: '社群素材',
  template: '工具模板',
  training: '培训SOP',
};

/* ========== Internal Documents ========== */
export interface InternalDocument {
  id: string;
  title: string;
  category: string;
  productIds: string[];
  productNames: string[];
  tags: string[];
  version: string;
  updateTime: string;
  author: string;
  status: 'active' | 'updated' | 'history' | 'expired';
  format: string;
  fileSize: string;
  description: string;
  versionHistory: { version: string; date: string; author: string; changes: string }[];
}

/* ========== Announcements ========== */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'material' | 'system' | 'compliance';
  publishDate: string;
  effectiveDate?: string;
  relatedProducts: string[];
  isPinned: boolean;
}

/* ========== Search ========== */
export interface SearchResult {
  id: string;
  type: 'product' | 'marketing' | 'internal' | 'announcement';
  title: string;
  summary: string;
  url: string;
  requiresAuth: boolean;
}
