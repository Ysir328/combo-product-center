import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight, Download, Eye, Loader2 } from 'lucide-react';
import { metricCards, clientGrowthData, aumGrowthData, productAumBreakdown, monthlyNewClients, conversionData } from '../../data/marketing';
import MetricCard from '../../components/common/MetricCard';
import ChartContainer from '../../components/common/ChartContainer';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TrendChart from '../../components/charts/TrendChart';
import BarChart from '../../components/charts/BarChart';
import PieChartComponent from '../../components/charts/PieChartComponent';
import { useMarketingMaterials } from '../../hooks/useMarketingMaterials';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../lib/storage';
import { MATERIAL_CATEGORY_LABELS } from '../../types';

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: '', label: '全部分类' },
  ...Object.entries(MATERIAL_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const formatColor: Record<string, string> = {
  PDF: 'bg-red-50 text-red-600', Word: 'bg-blue-50 text-blue-600',
  PPT: 'bg-orange-50 text-orange-600', Excel: 'bg-green-50 text-green-600',
  Image: 'bg-purple-50 text-purple-600',
};

export default function MarketingDashboard() {
  const [materialCategory, setMaterialCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'materials'>('dashboard');
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data: materials, loading: materialsLoading } = useMarketingMaterials();
  const { showToast } = useToast();

  const filteredMaterials = useMemo(() => {
    if (!materialCategory) return materials;
    return materials.filter(m => m.category === materialCategory);
  }, [materials, materialCategory]);

  const handlePreview = async (mat: typeof materials[0]) => {
    if (mat.id) {
      window.open(`/internal/${mat.id}`, '_blank');
    }
    showToast('预览功能：点击查看详情', 'info');
  };

  const handleDownload = async (mat: typeof materials[0]) => {
    setDownloading(mat.id);
    try {
      // Try Supabase storage download, fallback to toast
      const success = await downloadFile('marketing-files', `materials/${mat.id}`, mat.title);
      if (success) {
        showToast('下载已开始', 'success');
      } else {
        showToast('文件下载准备中...（云端配置完成后可用）', 'info');
      }
    } catch {
      showToast('文件下载准备中...（云端配置完成后可用）', 'info');
    }
    setDownloading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-marketing to-marketing/80 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">营销资料</h1>
            <p className="text-white/80 text-sm">客户规模、资产增长趋势与营销物料</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">营销资料</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'dashboard' ? 'bg-marketing text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          数据看板
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'materials' ? 'bg-marketing text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          营销资料
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metricCards.map(m => <MetricCard key={m.id} {...m} />)}
          </div>

          {/* Charts Row 1 — Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TrendChart
              data={clientGrowthData}
              series={[{ name: '客户数', dataKey: 'value', color: '#159A75' }]}
              title="客户增长趋势"
              subtitle="累计服务客户数"
              unit="户"
            />
            <TrendChart
              data={aumGrowthData}
              series={[
                { name: '总规模', dataKey: 'value', color: '#159A75' },
                ...(aumGrowthData[0]?.value2 != null
                  ? [{ name: '基准', dataKey: 'value2', color: '#94A3B8' }] : []),
              ]}
              title="管理规模增长"
              subtitle="AUM 趋势（万元）"
              unit="万元"
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              data={monthlyNewClients.map(d => ({ name: d.date, value: d.value }))}
              series={[{ name: '新增客户', dataKey: 'value', color: '#159A75' }]}
              title="月度新增客户"
              subtitle="2026年月度数据"
              unit="户"
            />
            <PieChartComponent
              data={productAumBreakdown}
              title="产品 AUM 分布"
              subtitle="各产品管理规模占比"
              showLegend
              unit="万元"
            />
          </div>

          {/* Data Source Note */}
          <p className="text-xs text-gray-400 text-center">
            数据来源：客户管理系统 & 资产管理系统 | 更新日期：2026-07-07
          </p>
        </>
      ) : (
        /* Materials Tab */
        <div>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setMaterialCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    materialCategory === c.value
                      ? 'bg-marketing text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {materialsLoading ? (
            <LoadingSpinner size="lg" text="加载资料中..." />
          ) : filteredMaterials.length === 0 ? (
            <EmptyState title="暂无资料" description="该分类下没有营销资料" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${formatColor[mat.format] || 'bg-gray-50 text-gray-600'}`}>
                        {mat.format}
                      </span>
                      <StatusBadge status={mat.status} type="document" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{mat.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{mat.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mat.productNames.map(name => {
                      const pid = mat.productIds[mat.productNames.indexOf(name)];
                      return pid ? (
                        <Link
                          key={name}
                          to={`/products/${pid}`}
                          className="px-2 py-0.5 text-xs rounded bg-marketing-light text-marketing hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span key={name} className="px-2 py-0.5 text-xs rounded bg-marketing-light text-marketing">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>V{mat.version}</span>
                    <span>{mat.fileSize}</span>
                    <span>{mat.updateTime}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(mat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />预览
                    </button>
                    <button
                      onClick={() => handleDownload(mat)}
                      disabled={downloading === mat.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-marketing text-white text-sm hover:bg-marketing/90 disabled:opacity-50 transition-colors"
                    >
                      {downloading === mat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
