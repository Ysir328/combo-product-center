import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderLock, ChevronRight, Search, Download, Eye, Lock, X,
  FileText, FileImage, FileSpreadsheet, File
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { internalDocuments } from '../../data/internal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const CATEGORY_LABELS: Record<string, string> = {
  script: '推广话术',
  sop: '标准流程',
  template: '工具模板',
  compliance: '合规文件',
  event: '活动策划',
  social: '社群素材',
  hr: '人事考核',
};

const FORMAT_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  Word: FileText,
  PPT: FileImage,
  Excel: FileSpreadsheet,
  Image: FileImage,
};

export default function InternalDocList() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(internalDocuments.map((d) => d.category))];

  const filtered = useMemo(() => {
    return internalDocuments.filter((d) => {
      if (search && !d.title.includes(search) && !d.tags.some((t) => t.includes(search))) return false;
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [search, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/" className="hover:text-gray-600">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">投顾内部资料</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-internal-light rounded-xl flex items-center justify-center">
            <FolderLock className="w-5 h-5 text-internal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">投顾内部资料</h1>
            <p className="text-sm text-gray-400">推广话术、客户沟通指南、社群素材及培训材料</p>
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
              placeholder="搜索资料名称或标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-internal/30 focus:border-internal"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !categoryFilter ? 'bg-internal text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部分类
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                categoryFilter === cat ? 'bg-internal text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
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
          {filtered.map((doc) => {
            const FormatIcon = FORMAT_ICONS[doc.format] || File;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.format === 'PDF' ? 'bg-red-50' :
                    doc.format === 'Word' ? 'bg-blue-50' :
                    doc.format === 'PPT' ? 'bg-orange-50' :
                    doc.format === 'Excel' ? 'bg-green-50' :
                    'bg-purple-50'
                  }`}>
                    <FormatIcon className={`w-5 h-5 ${
                      doc.format === 'PDF' ? 'text-red-500' :
                      doc.format === 'Word' ? 'text-blue-500' :
                      doc.format === 'PPT' ? 'text-orange-500' :
                      doc.format === 'Excel' ? 'text-green-500' :
                      'text-purple-500'
                    }`} />
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
                      {doc.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded bg-internal-light text-internal">
                          {tag}
                        </span>
                      ))}
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
                        <button
                          onClick={() => navigate(`/internal/${doc.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          预览
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-internal text-white text-sm hover:bg-internal/90">
                          <Download className="w-4 h-4" />
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
            下载的文件将自动添加您的账号水印（{new Date().toISOString().slice(0, 10)}）。
            下载、预览和分享操作均会记录操作日志。请勿将内部资料转发给未授权人员。
          </p>
        </div>
      </div>
    </div>
  );
}
