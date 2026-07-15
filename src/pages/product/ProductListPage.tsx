import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { products } from '../../data/products';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const RISK_LEVELS: { value: string; label: string }[] = [
  { value: '', label: '全部风险' },
  { value: 'R1', label: 'R1 低风险' },
  { value: 'R2', label: 'R2 中低风险' },
  { value: 'R3', label: 'R3 中风险' },
  { value: 'R4', label: 'R4 中高风险' },
  { value: 'R5', label: 'R5 高风险' },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'online', label: '已上架' },
  { value: 'paused', label: '已暂停' },
  { value: 'offline', label: '已下架' },
];

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('online');

  const filtered = products.filter((p) => {
    if (search && !p.name.includes(search) && !p.shortName.includes(search) && !p.oneLiner.includes(search)) return false;
    if (riskFilter && p.riskLevel !== riskFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/" className="hover:text-gray-600">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">产品介绍</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">产品介绍</h1>
            <p className="text-sm text-gray-400">了解组合产品的投资策略与历史业绩</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品名称、描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="未找到匹配的产品"
          description="请调整搜索条件或筛选器"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{product.shortName}</p>
                </div>
                <StatusBadge status={product.status} type="product" />
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                {product.oneLiner}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                  {product.type}
                </span>
                <span className={`px-2 py-1 text-xs rounded-lg font-medium ${
                  product.riskLevel === 'R4' || product.riskLevel === 'R5'
                    ? 'bg-red-50 text-red-600'
                    : product.riskLevel === 'R3'
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-green-50 text-green-600'
                }`}>
                  风险{product.riskLevel}
                </span>
                {product.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="px-2 py-1 text-xs rounded-lg bg-primary-light text-primary">
                    {tag.label}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>成立：{product.launchDate}</span>
                <span>更新：{product.updateTime}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
