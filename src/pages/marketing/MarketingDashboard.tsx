import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, ChevronRight, Download, TrendingUp, Eye
} from 'lucide-react';
import { metricCards, clientGrowthData, aumGrowthData, productAumBreakdown, monthlyNewClients, marketingMaterials } from '../../data/marketing';
import MetricCard from '../../components/common/MetricCard';
import ChartContainer from '../../components/common/ChartContainer';
import StatusBadge from '../../components/common/StatusBadge';
import { MATERIAL_CATEGORY_LABELS } from '../../types';

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: '', label: '全部分类' },
  ...Object.entries(MATERIAL_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export default function MarketingDashboard() {
  const [materialCategory, setMaterialCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'materials'>('dashboard');

  const filteredMaterials = useMemo(() => {
    if (!materialCategory) return marketingMaterials;
    return marketingMaterials.filter((m) => m.category === materialCategory);
  }, [materialCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/" className="hover:text-gray-600">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">客户营销推广资料</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-marketing-light rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-marketing" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">客户营销推广资料</h1>
            <p className="text-sm text-gray-400">客户规模、资产增长与营销物料</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-marketing text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          数据看板
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'materials'
              ? 'bg-marketing text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          营销资料
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metricCards.map((m) => (
              <MetricCard key={m.id} {...m} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartContainer title="客户增长趋势" subtitle="累计服务客户数">
              <div className="h-64 flex items-end gap-1">
                {clientGrowthData.map((d, _i) => {
                  const maxVal = Math.max(...clientGrowthData.map((x) => x.value));
                  const height = (d.value / maxVal) * 100;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500 font-mono">{d.value.toLocaleString()}</span>
                      <div
                        className="w-full bg-marketing rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-400">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">数据来源：客户管理系统 | 更新日期：2026-07-07</p>
            </ChartContainer>

            <ChartContainer title="管理规模增长" subtitle="AUM趋势（万元）">
              <div className="h-64">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200].map((y) => (
                    <line key={y} x1="40" y1={y} x2="380" y2={y} stroke="#f0f0f0" strokeWidth="1" />
                  ))}
                  {/* Area under AUM */}
                  <path
                    d={`M40,180 ${aumGrowthData.map((d, i) => {
                      const x = 40 + (i / (aumGrowthData.length - 1)) * 340;
                      const y = 180 - (d.value / 400000) * 180;
                      return `L${x},${y}`;
                    }).join(' ')} L380,180 Z`}
                    fill="#159A75"
                    fillOpacity="0.1"
                  />
                  {/* AUM line */}
                  <polyline
                    points={aumGrowthData.map((d, i) => {
                      const x = 40 + (i / (aumGrowthData.length - 1)) * 340;
                      const y = 180 - (d.value / 400000) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#159A75"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-6 mt-2 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-marketing rounded" />
                  <span className="text-xs text-gray-500">总规模</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">数据来源：资产管理系统 | 更新日期：2026-07-07</p>
            </ChartContainer>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartContainer title="月度新增客户" subtitle="2026年月度数据">
              <div className="h-64 flex items-end gap-3 px-4">
                {monthlyNewClients.map((d) => {
                  const maxVal = Math.max(...monthlyNewClients.map((x) => x.value));
                  const height = (d.value / maxVal) * 100;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500 font-mono">{d.value}</span>
                      <div
                        className="w-full max-w-[60px] mx-auto bg-marketing/80 rounded-t-md transition-all hover:bg-marketing"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-400">{d.date.slice(5)}月</span>
                    </div>
                  );
                })}
              </div>
            </ChartContainer>

            <ChartContainer title="产品AUM分布" subtitle="各产品管理规模占比（万元）">
              <div className="h-64 flex flex-col justify-center gap-3 px-8">
                {productAumBreakdown.map((item) => {
                  const total = productAumBreakdown.reduce((s, i) => s + i.value, 0);
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-28 truncate">{item.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 font-medium w-16 text-right">{pct}%</span>
                      <span className="text-xs text-gray-400 w-20 text-right">{(item.value / 10000).toFixed(1)}亿</span>
                    </div>
                  );
                })}
              </div>
            </ChartContainer>
          </div>
        </>
      ) : (
        /* Materials Tab */
        <div>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((c) => (
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

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      mat.format === 'PDF' ? 'bg-red-50 text-red-600' :
                      mat.format === 'Word' ? 'bg-blue-50 text-blue-600' :
                      mat.format === 'PPT' ? 'bg-orange-50 text-orange-600' :
                      mat.format === 'Excel' ? 'bg-green-50 text-green-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {mat.format}
                    </span>
                    <StatusBadge status={mat.status} type="document" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{mat.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{mat.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mat.productNames.map((name) => (
                    <span key={name} className="px-2 py-0.5 text-xs rounded bg-marketing-light text-marketing">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>V{mat.version}</span>
                  <span>{mat.fileSize}</span>
                  <span>{mat.updateTime}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    预览
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-marketing text-white text-sm hover:bg-marketing/90 transition-colors">
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
