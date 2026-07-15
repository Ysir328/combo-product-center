import { useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { BookOpen, BarChart3, FolderLock, Bell, ChevronRight, Lock } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useMarketingMaterials } from '../../hooks/useMarketingMaterials';
import { useInternalDocuments } from '../../hooks/useInternalDocuments';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import type { SearchResult } from '../../types';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { hasPermission } = useAuth();

  const { data: products, loading: pLoading } = useProducts();
  const { data: materials, loading: mLoading } = useMarketingMaterials();
  const { data: docs, loading: dLoading } = useInternalDocuments();
  const { data: announcements, loading: aLoading } = useAnnouncements();

  const isLoading = pLoading || mLoading || dLoading || aLoading;

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const all: SearchResult[] = [];

    products.forEach(p => {
      if (p.name.includes(q) || p.shortName.includes(q) || p.oneLiner.includes(q) || p.type.includes(q)) {
        all.push({ id: p.id, type: 'product', title: p.name, summary: p.oneLiner, url: `/products/${p.id}`, requiresAuth: false });
      }
    });

    materials.forEach(m => {
      if (m.title.includes(q) || m.description.includes(q)) {
        all.push({ id: m.id, type: 'marketing', title: m.title, summary: m.description, url: '/marketing', requiresAuth: false });
      }
    });

    docs.forEach(d => {
      if (d.title.includes(q) || d.tags.some(t => t.includes(q)) || d.description.includes(q)) {
        all.push({
          id: d.id, type: 'internal',
          title: hasPermission('internal:view') ? d.title : '******（需登录查看）',
          summary: hasPermission('internal:view') ? d.description : '此资料仅对内部授权人员开放',
          url: hasPermission('internal:view') ? `/internal/${d.id}` : '/auth',
          requiresAuth: !hasPermission('internal:view'),
        });
      }
    });

    announcements.forEach(a => {
      if (a.title.includes(q) || a.content.includes(q)) {
        all.push({ id: a.id, type: 'announcement', title: a.title, summary: a.content.slice(0, 100) + '...', url: '/announcements', requiresAuth: false });
      }
    });

    return all;
  }, [query, hasPermission, products, materials, docs, announcements]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = { product: [], marketing: [], internal: [], announcement: [] };
    results.forEach(r => groups[r.type]?.push(r));
    return groups;
  }, [results]);

  const GROUP_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
    product: { label: '产品介绍', icon: BookOpen, color: 'text-primary' },
    marketing: { label: '营销推广资料', icon: BarChart3, color: 'text-marketing' },
    internal: { label: '内部资料', icon: FolderLock, color: 'text-internal' },
    announcement: { label: '公告通知', icon: Bell, color: 'text-gray-500' },
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="搜索中..." /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">搜索结果</h1>
      <p className="text-sm text-gray-400 mb-8">
        {query ? (
          <>关键词 "<span className="text-gray-700">{query}</span>" 共找到 {results.length} 条结果</>
        ) : (
          '请输入搜索关键词'
        )}
      </p>

      {results.length === 0 && query ? (
        <EmptyState title="未找到相关结果" description="请尝试调整搜索关键词" icon="Search" />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([type, items]) => {
            if (items.length === 0) return null;
            const config = GROUP_CONFIG[type];
            const Icon = config.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <h3 className="text-sm font-semibold text-gray-500">{config.label}</h3>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            {item.requiresAuth && <Lock className="w-3 h-3 text-internal" />}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
