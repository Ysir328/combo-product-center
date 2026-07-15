-- ============================================================
-- 组合产品可视化资料中心 — Supabase 数据库迁移
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- ============================================================
-- 1. 表结构
-- ============================================================

-- 1.1 profiles（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor','client','advisor','operator','admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'visitor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.2 products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online','paused','offline')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('R1','R2','R3','R4','R5')),
  tags JSONB NOT NULL DEFAULT '[]',
  one_liner TEXT NOT NULL DEFAULT '',
  launch_date DATE,
  update_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_clients TEXT DEFAULT '',
  positioning TEXT DEFAULT '',
  basic_info JSONB NOT NULL DEFAULT '{}',
  investment_objective TEXT DEFAULT '',
  investment_scope TEXT DEFAULT '',
  asset_allocation TEXT DEFAULT '',
  selection_logic TEXT DEFAULT '',
  rebalancing_mechanism TEXT DEFAULT '',
  risk_control TEXT DEFAULT '',
  compliance_note TEXT DEFAULT '',
  cumulative_return NUMERIC DEFAULT 0,
  annualized_return NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  monthly_returns JSONB NOT NULL DEFAULT '[]',
  nav_history JSONB NOT NULL DEFAULT '[]',
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 marketing_materials
CREATE TABLE IF NOT EXISTS public.marketing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('product_intro','performance_report','faq','script','social_media','template','training')),
  product_ids TEXT[] NOT NULL DEFAULT '{}',
  product_names TEXT[] NOT NULL DEFAULT '{}',
  description TEXT DEFAULT '',
  format TEXT NOT NULL CHECK (format IN ('PDF','PPT','Word','Excel','Image')),
  file_size TEXT DEFAULT '',
  pages INTEGER DEFAULT 0,
  version TEXT NOT NULL DEFAULT 'V1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft','archived')),
  update_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  author TEXT DEFAULT '',
  target_audience TEXT DEFAULT '',
  file_url TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4 internal_documents
CREATE TABLE IF NOT EXISTS public.internal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'script',
  product_ids TEXT[] NOT NULL DEFAULT '{}',
  product_names TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT 'V1.0',
  update_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  author TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','updated','history','expired')),
  format TEXT NOT NULL DEFAULT 'PDF',
  file_size TEXT DEFAULT '',
  description TEXT DEFAULT '',
  version_history JSONB NOT NULL DEFAULT '[]',
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.5 announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('product','material','system','compliance')),
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_date DATE,
  related_products TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.6 audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. RLS 策略
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- products
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff can modify products" ON public.products;
CREATE POLICY "Staff can modify products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','admin'))
);

-- marketing_materials
DROP POLICY IF EXISTS "Published materials viewable by all" ON public.marketing_materials;
CREATE POLICY "Published materials viewable by all" ON public.marketing_materials FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Staff can view all materials" ON public.marketing_materials;
CREATE POLICY "Staff can view all materials" ON public.marketing_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('advisor','operator','admin'))
);
DROP POLICY IF EXISTS "Staff can modify materials" ON public.marketing_materials;
CREATE POLICY "Staff can modify materials" ON public.marketing_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','admin'))
);

-- internal_documents
DROP POLICY IF EXISTS "Staff can view internal docs" ON public.internal_documents;
CREATE POLICY "Staff can view internal docs" ON public.internal_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('advisor','operator','admin'))
);
DROP POLICY IF EXISTS "Staff can modify internal docs" ON public.internal_documents;
CREATE POLICY "Staff can modify internal docs" ON public.internal_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','admin'))
);

-- announcements
DROP POLICY IF EXISTS "Announcements viewable by all" ON public.announcements;
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff can modify announcements" ON public.announcements;
CREATE POLICY "Staff can modify announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','admin'))
);

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Auth users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Auth users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 3. Storage Buckets（在 Supabase Dashboard > Storage 中手动创建）
-- ============================================================
-- Bucket 1: product-images (公开读)
-- Bucket 2: marketing-files (私有)
-- Bucket 3: internal-files (私有)

-- ============================================================
-- 4. 种子数据
-- ============================================================

-- 4.1 产品数据
INSERT INTO public.products (id, name, short_name, type, status, risk_level, tags, one_liner, launch_date, update_time, target_clients, positioning, basic_info, investment_objective, investment_scope, asset_allocation, selection_logic, rebalancing_mechanism, risk_control, compliance_note, cumulative_return, annualized_return, max_drawdown, sharpe_ratio, monthly_returns, nav_history) VALUES
(
  'prod-001',
  '满山红精选组合',
  '满山红精选',
  '股票多头组合',
  'online',
  'R4',
  '[{"id":"t1","label":"A股精选"},{"id":"t2","label":"价值成长"},{"id":"t3","label":"高胜率"}]',
  '精选A股优质标的，以价值成长为核心策略，追求长期稳健超额收益',
  '2022-03-15',
  '2026-07-07',
  '风险承受能力R4及以上，追求长期资本增值的投资者',
  '满山红精选组合是一款以A股市场为核心的主动管理型股票多头组合产品。通过对宏观周期、行业景气度和个股基本面的深度研究，精选具备核心竞争力、估值合理、成长性良好的优质上市公司，构建均衡且富有弹性的投资组合。',
  '{"产品类型":"股票多头组合","成立日期":"2022-03-15","管理人":"华泰证券资产管理部","投资策略":"价值成长均衡策略","业绩基准":"沪深300指数 × 80% + 中证全债指数 × 20%","最低认购":"100万元","申购/赎回":"每周一开放","管理费率":"1.5%/年","业绩报酬":"超过基准部分提取20%"}',
  '在严格控制下行风险的前提下，通过精选优质个股和灵活的仓位管理，力争实现超越业绩基准的长期稳健回报。',
  '主要投资于A股市场（含主板、创业板、科创板），可配置不超过20%的港股通标的。行业配置上偏好消费、科技、医药、高端制造等长期景气赛道。',
  '股票仓位80%-95%，现金及货币工具5%-20%。单一行业配置不超过30%，单一个股配置不超过10%。',
  '采用"自上而下"与"自下而上"相结合的方法：首先通过宏观分析和行业比较确定配置方向，再通过财务模型筛选ROE>15%、盈利增速>20%、估值合理的标的，最后通过管理层访谈和实地调研进行定性验证。',
  '月度评估、季度再平衡。当单一个股权重偏离目标配置±3%或市场出现重大变化时触发临时再平衡。组合换手率控制在年化150%以内。',
  '严格执行止损纪律：单一个股亏损超15%强制止损；组合回撤超10%启动风险审查；回撤超15%启动临时再平衡。设置行业集中度上限和流动性下限。',
  '本产品风险等级为R4（中高风险），适合风险承受能力为C4及以上的投资者。历史业绩不代表未来表现，投资需谨慎。本材料仅作为产品介绍，不构成投资建议。',
  68.5, 14.2, -18.6, 1.35,
  '[{"month":"2026-01","value":3.2},{"month":"2026-02","value":5.8},{"month":"2026-03","value":-2.1},{"month":"2026-04","value":4.5},{"month":"2026-05","value":6.3},{"month":"2026-06","value":2.8}]',
  '[{"date":"2025-07","nav":1.4200},{"date":"2025-08","nav":1.4380},{"date":"2025-09","nav":1.4650},{"date":"2025-10","nav":1.5100},{"date":"2025-11","nav":1.5350},{"date":"2025-12","nav":1.5680},{"date":"2026-01","nav":1.6180},{"date":"2026-02","nav":1.7120},{"date":"2026-03","nav":1.6760},{"date":"2026-04","nav":1.7510},{"date":"2026-05","nav":1.8610},{"date":"2026-06","nav":1.9130}]'
),
(
  'prod-002',
  '稳健增长组合',
  '稳健增长',
  '混合配置组合',
  'online',
  'R3',
  '[{"id":"t4","label":"股债平衡"},{"id":"t5","label":"低波动"},{"id":"t6","label":"稳健收益"}]',
  '股债均衡配置，追求中等风险水平下的持续稳健增值',
  '2021-08-01',
  '2026-07-05',
  '风险承受能力R3及以上，追求资产稳健增值的均衡型投资者',
  '稳健增长组合是一只股债均衡配置型产品，通过大类资产动态平衡和精选优质基金/个股，在控制组合波动率的前提下争取可持续的绝对回报。',
  '{"产品类型":"混合配置组合","成立日期":"2021-08-01","管理人":"华泰证券资产管理部","投资策略":"大类资产配置 + 基金优选","业绩基准":"沪深300指数 × 50% + 中证全债指数 × 50%","最低认购":"50万元","申购/赎回":"每日开放","管理费率":"1.0%/年","业绩报酬":"超过基准部分提取15%"}',
  '通过大类资产的动态平衡和底层标的的精选优化，在风险可控的前提下实现资产的稳健增值。',
  'A股、债券、公募基金、货币市场工具。权益类资产配置中枢50%，波动区间30%-70%。',
  '权益类30%-70%，固收类20%-60%，现金及货币工具5%-15%。通过大类资产配置模型动态调整。',
  '权益部分采用核心-卫星策略：核心仓位配置优质公募基金（60%），卫星仓位精选个股（40%）。固收部分以利率债和高等级信用债为主。',
  '月度评估大类资产偏离度，季度进行再平衡操作。当股债比偏离目标配置±10%时触发临时调整。',
  '组合波动率目标控制在8%-12%。权益仓位根据市场估值和波动率动态调整。设置最大回撤15%的硬止损线。',
  '本产品风险等级为R3（中风险），适合风险承受能力为C3及以上的投资者。资产配置比例可能根据市场情况动态调整。历史业绩不代表未来表现。',
  42.3, 8.6, -9.2, 1.52,
  '[{"month":"2026-01","value":1.8},{"month":"2026-02","value":2.5},{"month":"2026-03","value":-0.8},{"month":"2026-04","value":2.1},{"month":"2026-05","value":3.0},{"month":"2026-06","value":1.5}]',
  '[{"date":"2025-07","nav":1.2850},{"date":"2025-08","nav":1.2920},{"date":"2025-09","nav":1.3050},{"date":"2025-10","nav":1.3220},{"date":"2025-11","nav":1.3380},{"date":"2025-12","nav":1.3500},{"date":"2026-01","nav":1.3740},{"date":"2026-02","nav":1.4080},{"date":"2026-03","nav":1.3970},{"date":"2026-04","nav":1.4260},{"date":"2026-05","nav":1.4690},{"date":"2026-06","nav":1.4910}]'
);

-- prod-003: 进取型先锋组合
INSERT INTO public.products (id, name, short_name, type, status, risk_level, tags, one_liner, launch_date, update_time, target_clients, positioning, basic_info, investment_objective, investment_scope, asset_allocation, selection_logic, rebalancing_mechanism, risk_control, compliance_note, cumulative_return, annualized_return, max_drawdown, sharpe_ratio, monthly_returns, nav_history) VALUES ('prod-003','进取型先锋组合','进取先锋','股票多头组合','online','R5','[{"id":"t7","label":"高弹性"},{"id":"t8","label":"赛道聚焦"},{"id":"t9","label":"趋势跟踪"}]','聚焦高景气赛道，捕捉结构性机会，为进取型投资者创造超额回报','2023-01-10','2026-07-06','风险承受能力R5，能承受较大波动的积极型投资者','进取型先锋组合聚焦科技创新、新能源、高端制造等高景气成长赛道，以趋势跟踪和动量策略为核心，灵活捕捉市场结构性机会。','{"产品类型":"股票多头组合","成立日期":"2023-01-10","管理人":"华泰证券资产管理部","投资策略":"成长趋势跟踪策略","业绩基准":"创业板指数 × 70% + 科创50指数 × 30%","最低认购":"200万元","申购/赎回":"每月首个周一开放","管理费率":"2.0%/年","业绩报酬":"超过基准部分提取25%"}','通过聚焦高成长赛道和精准的趋势判断，在承受较高波动的前提下追求显著的超额收益。','主要投资于A股科技创新、新能源、高端制造、生物医药等高景气赛道，可配置不超过30%的港股通科技标的。','股票仓位85%-100%，无硬性行业上限。通过趋势模型和动量因子动态调整行业配置。现金占比不超过15%。','采用趋势跟踪+基本面验证双引擎：通过量价趋势和资金流向筛选强势赛道，再对赛道内标的进行基本面深度验证。重点考察成长性（收入增速>30%）和赛道空间（TAM>500亿）。','周度趋势评估，双周行业权重调整。个股权重上限12%，行业上限40%。组合月度换手率通常在40%-60%。','组合层面设置20%的最大回撤预警线，25%的强制止损线。行业集中度过高（>40%）时自动触发分散调整。个股市值低于50亿或日均成交低于5000万不得纳入。','本产品风险等级为R5（高风险），适合风险承受能力为C5的投资者。本产品波动较大，可能出现较大幅度的本金亏损，投资者应充分了解风险后谨慎参与。',95.8,22.4,-28.3,1.18,'[{"month":"2026-01","value":7.5},{"month":"2026-02","value":12.3},{"month":"2026-03","value":-5.2},{"month":"2026-04","value":8.8},{"month":"2026-05","value":-3.1},{"month":"2026-06","value":11.5}]','[{"date":"2025-07","nav":1.5200},{"date":"2025-08","nav":1.5480},{"date":"2025-09","nav":1.6100},{"date":"2025-10","nav":1.6850},{"date":"2025-11","nav":1.7220},{"date":"2025-12","nav":1.7580},{"date":"2026-01","nav":1.8900},{"date":"2026-02","nav":2.1220},{"date":"2026-03","nav":2.0120},{"date":"2026-04","nav":2.1890},{"date":"2026-05","nav":2.1210},{"date":"2026-06","nav":2.3650}]');

-- prod-004: 全球多资产配置组合
INSERT INTO public.products (id, name, short_name, type, status, risk_level, tags, one_liner, launch_date, update_time, target_clients, positioning, basic_info, investment_objective, investment_scope, asset_allocation, selection_logic, rebalancing_mechanism, risk_control, compliance_note, cumulative_return, annualized_return, max_drawdown, sharpe_ratio, monthly_returns, nav_history) VALUES ('prod-004','全球多资产配置组合','全球配置','多资产配置组合','paused','R3','[{"id":"t10","label":"全球配置"},{"id":"t11","label":"多资产"},{"id":"t12","label":"分散风险"}]','跨市场、跨资产类别的全球配置，分散单一市场风险，捕捉全球投资机遇','2023-06-01','2026-07-01','风险承受能力R3及以上，希望通过全球配置分散风险的中长期投资者','全球多资产配置组合通过投资A股、港股、美股、债券、黄金、REITs等多类资产，构建低相关性的全球化投资组合，有效分散单一市场和资产类别的系统性风险。','{"产品类型":"多资产配置组合","成立日期":"2023-06-01","管理人":"华泰证券资产管理部","投资策略":"全球大类资产轮动策略","业绩基准":"MSCI全球指数 × 50% + 彭博全球债券指数 × 30% + 黄金现货 × 20%","最低认购":"150万元","申购/赎回":"每月15日开放","管理费率":"1.8%/年","业绩报酬":"超过基准部分提取20%"}','通过全球多资产配置和动态再平衡，在控制组合整体波动的前提下，实现资产的长期保值增值。','A股（30%）、港股（15%）、美股（15%）、境内债券（15%）、境外债券（10%）、黄金（10%）、REITs（5%）。','权益类合计60%，固收类合计25%，另类资产合计15%。各类资产配置比例根据全球宏观模型每季度动态调整。','大类资产层面采用风险平价和动量因子模型确定配置权重；底层标的以低费率的指数型ETF为主（占比70%），辅以主动管理型基金（30%）。','季度评估大类资产配置比例，半年度系统再平衡。当任一类资产偏离目标配置±8%时触发临时调整。','组合波动率目标6%-10%。汇率风险通过自然对冲为主，极端情况下使用远期锁汇。单一国家/地区权益敞口不超过40%。设置15%最大回撤预警。','本产品风险等级为R3（中风险），适合风险承受能力为C3及以上的投资者。涉及境外投资，可能面临汇率波动、跨境政策变化等特殊风险。本产品当前处于暂停申购状态。',28.6,8.2,-11.5,1.28,'[{"month":"2026-01","value":1.2},{"month":"2026-02","value":1.8},{"month":"2026-03","value":-0.5},{"month":"2026-04","value":3.2},{"month":"2026-05","value":-1.2},{"month":"2026-06","value":2.1}]','[{"date":"2025-07","nav":1.2100},{"date":"2025-08","nav":1.2180},{"date":"2025-09","nav":1.2250},{"date":"2025-10","nav":1.2400},{"date":"2025-11","nav":1.2520},{"date":"2025-12","nav":1.2650},{"date":"2026-01","nav":1.2800},{"date":"2026-02","nav":1.3030},{"date":"2026-03","nav":1.2970},{"date":"2026-04","nav":1.3380},{"date":"2026-05","nav":1.3220},{"date":"2026-06","nav":1.3500}]');

-- ============================================================
-- 4.2 营销资料
-- ============================================================
INSERT INTO public.marketing_materials (id, title, category, product_ids, product_names, description, format, file_size, pages, version, status, update_time, author, target_audience) VALUES
('mat-001','满山红精选组合产品介绍','product_intro','{"prod-001"}','{"满山红精选组合"}','面向客户的满山红精选组合产品介绍材料，包含投资策略、历史业绩和风险提示。','PDF','12.5 MB',32,'V3.2','published','2026-07-07','产品运营部','潜在客户及存量客户'),
('mat-002','稳健增长组合季度业绩报告','performance_report','{"prod-002"}','{"稳健增长组合"}','2026年Q2稳健增长组合业绩回顾，含市场回顾、持仓分析和展望。','PDF','8.2 MB',24,'V2.1','published','2026-07-05','产品运营部','存量客户及渠道合作伙伴'),
('mat-003','组合产品客户FAQ手册','faq','{"prod-001","prod-002","prod-003","prod-004"}','{"满山红精选组合","稳健增长组合","进取型先锋组合","全球多资产配置组合"}','覆盖产品购买、赎回、费用、风险等常见问题的标准答复手册。','PDF','5.8 MB',45,'V4.0','published','2026-06-30','客户服务部','全体客户'),
('mat-004','市场周报模板及沟通话术','script','{"prod-001","prod-002"}','{"满山红精选组合","稳健增长组合"}','投顾面向客户的市场周度沟通话术模板，含市场热点解读和产品表现简述。','Word','2.1 MB',12,'V1.8','published','2026-07-04','投资顾问部','客户经理/投资顾问'),
('mat-005','社群运营每日一图素材包','social_media','{"prod-001","prod-002","prod-003"}','{"满山红精选组合","稳健增长组合","进取型先锋组合"}','用于客户微信群日常维护的图片素材，含早安海报、市场数据卡片、产品业绩速览。','Image','35.6 MB',60,'V5.2','published','2026-07-06','数字营销部','社群运营人员'),
('mat-006','客户风险评估与产品匹配表','template','{"prod-001","prod-002","prod-003","prod-004"}','{"满山红精选组合","稳健增长组合","进取型先锋组合","全球多资产配置组合"}','客户风险承受能力等级与适配产品的对照表，含客户画像和推荐逻辑。','Excel','1.5 MB',8,'V2.3','published','2026-06-28','合规管理部','客户经理/投资顾问'),
('mat-007','新产品上线培训课件','training','{"prod-003"}','{"进取型先锋组合"}','进取型先锋组合上线前的内部培训材料，涵盖产品策略、目标客户、合规要点。','PPT','28.3 MB',55,'V1.0','published','2026-03-15','培训发展部','全体投顾及客户经理'),
('mat-008','全球配置组合暂停申购通知','faq','{"prod-004"}','{"全球多资产配置组合"}','全球多资产配置组合暂停申购的客户沟通通知及常见问答。','PDF','1.2 MB',5,'V1.0','published','2026-07-01','产品运营部','存量客户');

-- ============================================================
-- 4.3 内部文档
-- ============================================================
INSERT INTO public.internal_documents (id, title, category, product_ids, product_names, tags, version, update_time, author, status, format, file_size, description, version_history) VALUES
('int-001','满山红精选组合推广话术大全','script','{"prod-001"}','{"满山红精选组合"}','{"话术","推广","电话","面谈","微信"}','V3.5','2026-07-07','投资顾问部','active','PDF','6.8 MB','涵盖电话邀约、面谈沟通、微信跟进等场景的标准话术，包含产品亮点介绍、客户疑问应对、竞品对比等模块。','[{"version":"V3.5","date":"2026-07-07","author":"张明","changes":"更新Q2业绩数据及市场观点"},{"version":"V3.4","date":"2026-06-15","author":"张明","changes":"新增竞品对比话术章节"},{"version":"V3.3","date":"2026-05-01","author":"李华","changes":"更新费率说明及风险提示措辞"}]'),
('int-002','客户异议处理标准流程（SOP）','sop','{"prod-001","prod-002","prod-003","prod-004"}','{"满山红精选组合","稳健增长组合","进取型先锋组合","全球多资产配置组合"}','{"SOP","异议处理","客户服务","投诉"}','V2.1','2026-06-20','客户服务部','active','PDF','3.2 MB','标准化客户异议处理流程，涵盖常见异议类型、分级响应机制、话术参考和升级路径。确保全渠道服务体验一致。','[{"version":"V2.1","date":"2026-06-20","author":"王芳","changes":"新增线上渠道异议处理流程"},{"version":"V2.0","date":"2026-03-10","author":"王芳","changes":"重构分级响应机制，增加处理时效要求"}]'),
('int-003','投顾晨会日报模板及填写规范','template','{}','{}','{"模板","日报","晨会","规范"}','V1.6','2026-05-15','运营管理部','active','Word','1.1 MB','投顾每日工作汇报标准模板，包含客户拜访记录、产品销售进度、市场观点摘要、次日工作计划等模块。','[{"version":"V1.6","date":"2026-05-15","author":"陈刚","changes":"优化产品销售统计表格格式"}]'),
('int-004','产品合规销售指引（2026版）','compliance','{"prod-001","prod-002","prod-003","prod-004"}','{"满山红精选组合","稳健增长组合","进取型先锋组合","全球多资产配置组合"}','{"合规","销售指引","风险提示","法规"}','V4.0','2026-04-01','合规管理部','active','PDF','8.5 MB','2026年度最新合规销售指引，包含适当性管理要求、信息披露规范、禁止性行为清单、录音录像规范和处罚案例。','[{"version":"V4.0","date":"2026-04-01","author":"赵合规","changes":"依据最新监管要求全面更新适当性管理章节"},{"version":"V3.2","date":"2025-09-15","author":"赵合规","changes":"新增AI投顾工具使用规范"}]'),
('int-005','客户沙龙活动策划执行手册','event','{"prod-001","prod-002"}','{"满山红精选组合","稳健增长组合"}','{"活动","沙龙","策划","执行"}','V2.3','2026-06-10','市场营销部','active','PPT','15.2 MB','客户沙龙活动从策划到执行的全流程指南，包含活动主题库、邀请函模板、现场执行清单、会后跟进SOP。','[{"version":"V2.3","date":"2026-06-10","author":"刘洋","changes":"新增线上直播沙龙执行章节"},{"version":"V2.2","date":"2026-03-20","author":"刘洋","changes":"更新活动主题库，新增8个主题"}]'),
('int-006','客户分层服务标准手册','sop','{}','{}','{"分层","服务标准","VIP","权益"}','V3.0','2026-05-01','客户服务部','updated','PDF','5.6 MB','基于客户资产规模和贡献度的分层服务标准，明确各层级客户的服务内容、触达频率、专属权益和升级路径。','[{"version":"V3.0","date":"2026-05-01","author":"王芳","changes":"重构客户分层标准，新增钻石层级"},{"version":"V2.5","date":"2025-11-15","author":"王芳","changes":"调整各层级最低资产门槛"},{"version":"V2.4","date":"2025-08-01","author":"李华","changes":"新增生日关怀和节日问候标准"}]'),
('int-007','微信客户沟通素材库-早安海报合集','social','{"prod-001","prod-002","prod-003"}','{"满山红精选组合","稳健增长组合","进取型先锋组合"}','{"微信","海报","素材","早安"}','V6.2','2026-07-06','数字营销部','active','Image','45.8 MB','每日早安海报素材包，按月度和产品分类，含节日特别版。每张海报含市场金句、产品一句话亮点和合规备案编号。','[{"version":"V6.2","date":"2026-07-06","author":"刘洋","changes":"新增7月暑期主题系列海报"}]'),
('int-008','季度绩效考核-产品销售评分细则','hr','{"prod-001","prod-002","prod-003","prod-004"}','{"满山红精选组合","稳健增长组合","进取型先锋组合","全球多资产配置组合"}','{"考核","绩效","销售","评分"}','V2.0','2026-04-01','人力资源部','history','Excel','2.3 MB','投顾及客户经理季度绩效考核中产品销售相关的评分细则，包含AUM增量、客户新增、客户留存等多维度权重。','[{"version":"V2.0","date":"2026-04-01","author":"孙HR","changes":"Q2考核权重调整：AUM权重提升至40%"},{"version":"V1.0","date":"2026-01-01","author":"孙HR","changes":"初始版本"}]');

-- ============================================================
-- 4.4 公告
-- ============================================================
INSERT INTO public.announcements (id, title, content, category, publish_date, effective_date, related_products, is_pinned) VALUES
('ann-001','满山红精选组合2026年Q2业绩报告发布','满山红精选组合2026年第二季度业绩报告已正式发布。Q2组合净值增长6.8%，年内累计收益14.2%。详细业绩数据及持仓分析请查看最新产品一页通。','product','2026-07-07',NULL,'{"prod-001"}',true),
('ann-002','全球多资产配置组合暂停申购通知','因境外投资额度调整，全球多资产配置组合自2026年7月1日起暂停新增申购，赎回业务正常办理。恢复时间将另行通知。已持有份额的客户不受影响，存量资产继续按照原策略管理。','product','2026-07-01','2026-07-01','{"prod-004"}',true),
('ann-003','合规销售指引更新至V4.0版本','根据最新监管要求，《产品合规销售指引》已更新至V4.0版本。主要更新内容：适当性管理流程优化、AI投顾工具使用规范新增、录音录像标准更新。请全体投顾及客户经理于7月15日前完成学习并签署确认书。','compliance','2026-06-25',NULL,'{}',false),
('ann-004','营销推广资料V3.0版本更新','满山红精选组合和稳健增长组合的客户营销推广资料已更新至最新版本，包含Q2最新业绩数据和市场展望。旧版本资料已于7月1日下架，请使用新版本进行客户沟通。','material','2026-07-02',NULL,'{"prod-001","prod-002"}',false),
('ann-005','系统功能升级：新增资料收藏和版本对比功能','平台已完成V2.3版本升级，新增以下功能：1）内部资料支持个人收藏夹；2）支持同资料不同版本的对比查看；3）营销数据看板新增导出Excel功能；4）产品搜索支持模糊匹配和标签筛选。如有使用问题请联系运营支持团队。','system','2026-06-28',NULL,'{}',false),
('ann-006','客户沙龙活动7月排期发布','7月客户沙龙活动排期已确定：7月12日"下半年市场展望"（上海）、7月19日"高净值客户资产配置策略"（北京）、7月26日"科技赛道投资机会"（深圳）。活动邀请函及执行手册已同步更新，请各区域投顾提前邀约目标客户。','product','2026-07-03',NULL,'{"prod-001","prod-003"}',false),
('ann-007','客户沟通话术V3.5版本更新说明','满山红精选组合推广话术已更新至V3.5版本，重点新增：1）Q2业绩亮点话术；2）竞品差异化优势对比；3）客户异议处理新增场景（波动焦虑、赎回诉求）。请各投顾尽快熟悉新话术并在客户沟通中应用。','material','2026-06-22',NULL,'{"prod-001"}',false);
