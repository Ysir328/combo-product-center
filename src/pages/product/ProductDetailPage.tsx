import { useParams, Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, ShieldAlert, Target, Info, ExternalLink, Briefcase } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useMarketingMaterials } from '../../hooks/useMarketingMaterials';
import { marketingMaterials as localMaterials } from '../../data/marketing';
import { getProductById } from '../../data/products';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import PerformanceChart from '../../components/charts/PerformanceChart';
import BarChart from '../../components/charts/BarChart';

const ANCHORS = [
  { id: 'overview', label: '产品概览' },
  { id: 'strategy', label: '投资策略' },
  { id: 'performance', label: '历史业绩' },
  { id: 'compliance', label: '合规信息' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, loading, error } = useProduct(id);
  const { data: supabaseMaterials } = useMarketingMaterials();

  // Fallback to local data if Supabase not configured
  const localProduct = !product && id ? getProductById(id) : null;
  const displayProduct = product || localProduct;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="加载产品信息..." />
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900">产品未找到</h2>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
          返回产品列表
        </Link>
      </div>
    );
  }

  // Related materials: prefer Supabase data, fallback to local
  const relatedMaterials = (supabaseMaterials.length > 0 ? supabaseMaterials : localMaterials)
    .filter(m => m.productIds.includes(displayProduct.id));

  const navData = displayProduct.navHistory.map(h => ({ date: h.date, nav: h.nav }));
  const monthlyReturnData = displayProduct.monthlyReturns.map(m => ({ name: m.month, value: m.value }));

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{displayProduct.name}</h1>
              <p className="text-white/80 text-sm">{displayProduct.shortName} · {displayProduct.type}</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-gray-600">产品中心</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{displayProduct.shortName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Anchor Nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">目录导航</h4>
              <ul className="space-y-1">
                {ANCHORS.map(a => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      {a.label}
                    </a>
                  </li>
                ))}
              </ul>
              {relatedMaterials.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">相关营销资料</h4>
                  <ul className="space-y-1">
                    {relatedMaterials.slice(0, 5).map(m => (
                      <li key={m.id}>
                        <Link
                          to="/marketing"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-marketing-light hover:text-marketing transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview" className="anchor-offset bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{displayProduct.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">{displayProduct.shortName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={displayProduct.status} type="product" />
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    displayProduct.riskLevel === 'R4' || displayProduct.riskLevel === 'R5'
                      ? 'bg-red-50 text-red-600' : displayProduct.riskLevel === 'R3'
                      ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                  }`}>
                    风险等级 {displayProduct.riskLevel}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{displayProduct.oneLiner}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {displayProduct.tags.map(tag => (
                  <span key={tag.id} className="px-3 py-1 text-sm rounded-full bg-primary-light text-primary">
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(displayProduct.basicInfo).slice(0, 6).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-gray-400">{key}</span>
                    <p className="text-gray-700 font-medium mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategy */}
            <section id="strategy" className="anchor-offset bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-primary" />投资策略
              </h2>
              <div className="space-y-5">
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">投资目标</h3><p className="text-gray-600 leading-relaxed">{displayProduct.investmentObjective}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">投资范围</h3><p className="text-gray-600 leading-relaxed">{displayProduct.investmentScope}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">资产配置</h3><p className="text-gray-600 leading-relaxed">{displayProduct.assetAllocation}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">选股逻辑</h3><p className="text-gray-600 leading-relaxed">{displayProduct.selectionLogic}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">再平衡机制</h3><p className="text-gray-600 leading-relaxed">{displayProduct.rebalancingMechanism}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-700 mb-1">风险控制</h3><p className="text-gray-600 leading-relaxed">{displayProduct.riskControl}</p></div>
              </div>
            </section>

            {/* Performance */}
            <section id="performance" className="anchor-offset bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />历史业绩
              </h2>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">累计收益</p>
                  <p className="text-2xl font-bold text-green-600">+{displayProduct.cumulativeReturn}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">年化收益</p>
                  <p className="text-2xl font-bold text-gray-900">{displayProduct.annualizedReturn}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">最大回撤</p>
                  <p className="text-2xl font-bold text-red-500">{displayProduct.maxDrawdown}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">夏普比率</p>
                  <p className="text-2xl font-bold text-gray-900">{displayProduct.sharpeRatio}</p>
                </div>
              </div>

              {/* Performance Chart — Replaces old NAV table */}
              {navData.length > 0 && (
                <div className="mb-6">
                  <PerformanceChart
                    data={navData}
                    title="单位净值走势"
                    subtitle={`统计区间：${navData[0]?.date} — ${navData[navData.length - 1]?.date}`}
                    height={320}
                  />
                </div>
              )}

              {/* Monthly Returns Chart */}
              {monthlyReturnData.length > 0 && (
                <div className="mb-6">
                  <BarChart
                    data={monthlyReturnData}
                    series={[{ name: '月度收益', dataKey: 'value', color: '#1E5EFF' }]}
                    title="月度收益"
                    subtitle="月度收益率（%）"
                    unit="%"
                  />
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                数据来源：华泰证券资产管理部 | 更新日期：{displayProduct.updateTime}
              </p>
            </section>

            {/* Compliance */}
            <section id="compliance" className="anchor-offset bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-primary" />合规信息与风险提示
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 leading-relaxed">{displayProduct.complianceNote}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-amber-700">
                      <span>适合客户：{displayProduct.targetClients}</span>
                      <span>数据来源：华泰证券资产管理部</span>
                      <span>更新日期：{displayProduct.updateTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
