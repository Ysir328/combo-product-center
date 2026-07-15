import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Pin, Clock, Tag } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useProducts } from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CATEGORY_LABELS: Record<string, string> = {
  product: '产品动态', material: '资料更新', system: '系统通知', compliance: '合规公告',
};

export default function AnnouncementsPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const { data: announcements, loading } = useAnnouncements();
  const { data: products } = useProducts();

  const filtered = categoryFilter
    ? announcements.filter(a => a.category === categoryFilter)
    : announcements;

  const pinned = filtered.filter(a => a.isPinned);
  const unpinned = filtered.filter(a => !a.isPinned);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="加载公告..." /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">公告通知</span>
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公告通知</h1>
          <p className="text-sm text-gray-400">产品动态、资料更新与系统通知</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!categoryFilter ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          全部
        </button>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCategoryFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === value ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <EmptyState title="暂无公告" description="该分类下没有公告" />
      ) : (
        <div className="space-y-4">
          {pinned.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-light text-primary">置顶</span>
                      <span className="text-xs text-gray-400">{CATEGORY_LABELS[ann.category] || ann.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ann.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{ann.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ann.publishDate}</span>
                      {ann.effectiveDate && <span>生效日期：{ann.effectiveDate}</span>}
                      {ann.relatedProducts.length > 0 && (
                        <span className="flex items-center gap-1 flex-wrap">
                          <Tag className="w-3 h-3" />
                          {ann.relatedProducts.map(pid => {
                            const p = products.find(pr => pr.id === pid);
                            return p ? (
                              <Link key={pid} to={`/products/${pid}`} className="text-primary hover:underline">{p.name}</Link>
                            ) : (
                              <span key={pid} className="text-gray-500">{pid}</span>
                            );
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {unpinned.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">{CATEGORY_LABELS[ann.category] || ann.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{ann.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{ann.content}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ann.publishDate}</span>
                {ann.effectiveDate && <span>生效日期：{ann.effectiveDate}</span>}
                {ann.relatedProducts.length > 0 && (
                  <span className="flex items-center gap-1 flex-wrap">
                    <Tag className="w-3 h-3" />
                    {ann.relatedProducts.map(pid => {
                      const p = products.find(pr => pr.id === pid);
                      return p ? (
                        <Link key={pid} to={`/products/${pid}`} className="text-primary hover:underline">{p.name}</Link>
                      ) : (
                        <span key={pid} className="text-gray-500">{pid}</span>
                      );
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
