import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderLock, ChevronRight, Search, Download, Eye, Lock, X, Loader2,
  FileText, FileImage, FileSpreadsheet, File
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useInternalDocuments } from '../../hooks/useInternalDocuments';
import { downloadFile } from '../../lib/storage';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CATEGORY_LABELS: Record<string, string> = {
  script: '推广话术', sop: '标准流程', template: '工具模板',
  compliance: '合规文件', event: '活动策划', social: '社群素材', hr: '人事考核',
};

const FORMAT_ICONS: Record<string, typeof FileText> = {
  PDF: FileText, Word: FileText, PPT: FileImage, Excel: FileSpreadsheet, Image: FileImage,
};

const FORMAT_COLORS: Record<string, string> = {
  PDF: 'bg-red-50 text-red-500', Word: 'bg-blue-50 text-blue-500',
  PPT: 'bg-orange-50 text-orange-500', Excel: 'bg-green-50 text-green-500',
  Image: 'bg-purple-50 text-purple-500',
};

export default function InternalDocList() {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data: documents, loading } = useInternalDocuments();

  if (!hasPermission('internal:view')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-internal" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录访问</h2>
          <p className="text-gray-500 mb-6">
            投顾内部资料模块仅对内部授权人员开放。请使用投顾经理或运营人员账号登录后访问。
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(documents.map(d => d.category))];

  const filtered = useMemo(() => {
    return documents.filter(d => {
      if (search && !d.title.includes(search) && !d.tags.some(t => t.includes(search))) return false;
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [documents, search, categoryFilter]);

  const handleDownload = async (doc: typeof documents[0]) => {
    setDownloading(doc.id);
    try {
      const success = await downloadFile('internal-files', `docs/${doc.id}`, doc.title);
      if (success) {
        showToast('下载已开始', 'success');
      } else {
        showToast('下载准备中...（云端配置完成后可用）', 'info');
      }
    } catch {
      showToast('下载准备中...（云端配置完成后可用）', 'info');
    }
    setDownloading(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="加载资料..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-internal to-internal/80 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">内部文档</h1>
            <p className="text-white/80 text-sm">推广话术、SOP、合规指引与内部培训资料</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">内部文档</span>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索资料名称或标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-internal/30 focus:border-internal"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!categoryFilter ? 'bg-internal text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            全部分类
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${categoryFilter === cat ? 'bg-internal text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <EmptyState title="未找到匹配的资料" description="请调整搜索条件或筛选器" />
      ) : (
        <div className="space-y-4">
          {filtered.map(doc => {
            const FormatIcon = FORMAT_ICONS[doc.format] || File;
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${FORMAT_COLORS[doc.format] || 'bg-gray-50 text-gray-500'}`}>
                    <FormatIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">{CATEGORY_LABELS[doc.category] || doc.category}</span>
                          <StatusBadge status={doc.status} type="document" />
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doc.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {doc.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded bg-internal-light text-internal">{tag}</span>
                      ))}
                      {doc.productNames.map((name, i) => {
                        const pid = doc.productIds[i];
                        return pid ? (
                          <Link key={name} to={`/products/${pid}`} className="px-2 py-0.5 text-xs rounded bg-primary-light text-primary hover:underline">{name}</Link>
                        ) : (
                          <span key={name} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{name}</span>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>版本 {doc.version}</span>
                        <span>{doc.format}</span>
                        <span>{doc.fileSize}</span>
                        <span>{doc.updateTime}</span>
                        <span>{doc.author}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/internal/${doc.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                          <Eye className="w-4 h-4" />预览
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={downloading === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-internal text-white text-sm hover:bg-internal/90 disabled:opacity-50"
                        >
                          {downloading === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          下载
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Watermark Notice */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">内部资料安全提示</p>
          <p className="text-xs text-amber-700 mt-1">
            下载的文件将自动添加您的账号水印。下载、预览和分享操作均会记录操作日志。请勿将内部资料转发给未授权人员。
          </p>
        </div>
      </div>
    </div>
  );
}
