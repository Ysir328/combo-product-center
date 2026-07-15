import { Link } from 'react-router-dom';
import {
  Briefcase,
  BarChart3,
  FileText,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Bell,
} from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PieChartComponent from '../../components/charts/PieChartComponent';
import TrendChart from '../../components/charts/TrendChart';
import { useProducts } from '../../hooks/useProducts';
import { useMarketingMaterials } from '../../hooks/useMarketingMaterials';
import { useInternalDocuments } from '../../hooks/useInternalDocuments';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useAuth } from '../../context/AuthContext';
import { productAumBreakdown, clientGrowthData } from '../../data/marketing';

const riskLabel: Record<string, string> = {
  R1: '低风险', R2: '中低风险', R3: '中等风险', R4: '中高风险', R5: '高风险',
};
const riskColor: Record<string, string> = {
  R1: 'bg-green-100 text-green-700', R2: 'bg-emerald-100 text-emerald-700',
  R3: 'bg-amber-100 text-amber-700', R4: 'bg-orange-100 text-orange-700',
  R5: 'bg-red-100 text-red-700',
};

export default function HomePage() {
  const { user } = useAuth();
  const { data: products, loading: productsLoading } = useProducts();
  const { data: materials, loading: materialsLoading } = useMarketingMaterials();
  const { data: docs, loading: docsLoading } = useInternalDocuments();
  const { data: announcements, loading: announcementsLoading } = useAnnouncements();

  const isLoading = productsLoading || materialsLoading || docsLoading || announcementsLoading;

  const onlineProducts = products.filter(p => p.status === 'online');
  const pinnedAnnouncements = announcements.filter(a => a.isPinned).slice(0, 2);
  const recentAnnouncements = announcements.filter(a => !a.isPinned).slice(0, 3);
  const recentProducts = products.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="加载数据中..." />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-white to-primary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              组合产品可视化资料中心
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed">
              面向外部客户和内部投顾团队的一站式产品展示、营销数据查阅与运营资料管理平台
            </p>
            <p className="mt-4 text-sm text-gray-400">同一入口 · 不同视图 · 统一维护</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                查看产品 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/marketing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                营销数据看板
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/products" className="hover:scale-[1.02] transition-transform">
            <MetricCard
              title="产品总数"
              value={`${onlineProducts.length}`}
              unit={`/ ${products.length}`}
              trend="up"
              trendValue="在线"
              icon="Box"
              color="primary"
            />
          </Link>
          <Link to="/marketing" className="hover:scale-[1.02] transition-transform">
            <MetricCard
              title="营销资料"
              value={`${materials.length}`}
              unit="份"
              trend="up"
              trendValue={`${materials.filter(m => m.status === 'published').length} 已发布`}
              icon="FileText"
              color="marketing"
            />
          </Link>
          <Link to="/internal" className="hover:scale-[1.02] transition-transform">
            <MetricCard
              title="内部文档"
              value={`${docs.length}`}
              unit="份"
              trend="flat"
              trendValue="内部资料"
              icon="FileText"
              color="internal"
            />
          </Link>
          <Link to="/announcements" className="hover:scale-[1.02] transition-transform">
            <MetricCard
              title="系统公告"
              value={`${announcements.length}`}
              unit="条"
              trend="up"
              trendValue={`${pinnedAnnouncements.length} 置顶`}
              icon="Bell"
              color="warning"
            />
          </Link>
        </div>
      </section>

      {/* Three Module CTA Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Products */}
          <Link
            to="/products"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">产品中心</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              查看产品详情、历史业绩、投资策略与合规信息
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{products.length} 款产品</span>
              <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                查阅全部 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Marketing */}
          <Link
            to="/marketing"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-marketing/30 transition-all"
          >
            <div className="w-12 h-12 bg-marketing-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-marketing" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">营销资料</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              数据看板、业绩报告、沟通话术与社群素材
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{materials.length} 份资料</span>
              <span className="text-marketing text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                查阅全部 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Internal Docs */}
          {user ? (
            <Link
              to="/internal"
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-internal/30 transition-all"
            >
              <div className="w-12 h-12 bg-internal-light rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-internal" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">内部文档</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                SOP、合规指引、活动方案与内部培训资料
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{docs.length} 份文档</span>
                <span className="text-internal text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  查阅全部 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="group bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200 hover:shadow-md hover:border-internal/30 transition-all"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">内部文档</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                登录后访问内部文档资料
              </p>
              <span className="text-primary text-sm font-medium flex items-center gap-1">
                立即登录 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Recent Products Grid */}
      {recentProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">最新产品</h2>
            <Link
              to="/products"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{product.shortName}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor[product.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                    {product.riskLevel} {riskLabel[product.riskLevel]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.oneLiner}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={product.status} type="product" />
                    {product.tags.slice(0, 2).map(tag => (
                      <span key={tag.id} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{product.launchDate}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats Charts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PieChartComponent
            data={productAumBreakdown}
            title="产品 AUM 分布"
            subtitle="按产品类型划分"
            showLegend
            unit="亿元"
          />
          <TrendChart
            data={clientGrowthData}
            series={[{ name: '客户数', dataKey: 'value', color: '#159A75' }]}
            title="客户增长趋势"
            subtitle="近 12 个月累计客户数"
            unit="户"
          />
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-16 md:pb-20">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">最新公告</h2>
          </div>
          <Link
            to="/announcements"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {pinnedAnnouncements.map(a => (
            <Link
              key={a.id}
              to="/announcements"
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{a.title}</h4>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary-light text-primary shrink-0">置顶</span>
                  <span className="text-xs text-blue-600">
                    {a.category === 'product' ? '产品' : a.category === 'compliance' ? '合规' : a.category === 'system' ? '系统' : '资料'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{a.content}</p>
                {a.relatedProducts.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {a.relatedProducts.map(pid => {
                      const p = products.find(pr => pr.id === pid);
                      return p ? (
                        <Link
                          key={pid}
                          to={`/products/${pid}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-primary hover:underline"
                        >
                          {p.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {recentAnnouncements.map(a => (
            <Link
              key={a.id}
              to="/announcements"
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-gray-300" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{a.title}</h4>
                  <span className="text-xs text-gray-400">
                    {a.category === 'product' ? '产品' : a.category === 'compliance' ? '合规' : a.category === 'system' ? '系统' : '资料'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{a.publishDate}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">实时数据</h3>
            <p className="text-sm text-gray-400 leading-relaxed">产品业绩和客户数据定期更新，确保信息时效性</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">合规保障</h3>
            <p className="text-sm text-gray-400 leading-relaxed">所有对外展示内容经过合规审核，风险揭示完整</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">高效协作</h3>
            <p className="text-sm text-gray-400 leading-relaxed">资料统一管理、版本可追溯，告别文件散落和重复传递</p>
          </div>
        </div>
      </section>
    </div>
  );
}
