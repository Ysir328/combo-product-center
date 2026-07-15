import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Download, FileText, AlertTriangle
} from 'lucide-react';
import { internalDocuments } from '../../data/internal';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import VersionHistory from '../../components/common/VersionHistory';
import { Lock } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  script: '推广话术',
  sop: '标准流程',
  template: '工具模板',
  compliance: '合规文件',
  event: '活动策划',
  social: '社群素材',
  hr: '人事考核',
};

export default function InternalDocView() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const doc = id ? internalDocuments.find((d) => d.id === id) : undefined;

  if (!hasPermission('internal:view')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录访问</h2>
        <Link to="/auth" className="text-primary hover:underline">前往登录</Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">资料未找到</h2>
        <Link to="/internal" className="text-primary hover:underline">返回资料列表</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/internal" className="hover:text-gray-600">投顾内部资料</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 truncate">{doc.title}</span>
      </div>

      <button
        onClick={() => navigate('/internal')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      {/* Document Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-400">{CATEGORY_LABELS[doc.category] || doc.category}</span>
              <StatusBadge status={doc.status} type="document" />
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-internal text-white rounded-xl hover:bg-internal/90 transition-colors">
            <Download className="w-4 h-4" />
            下载文件
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{doc.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">文件格式</span>
            <p className="text-gray-700 font-medium">{doc.format}</p>
          </div>
          <div>
            <span className="text-gray-400">文件大小</span>
            <p className="text-gray-700 font-medium">{doc.fileSize}</p>
          </div>
          <div>
            <span className="text-gray-400">当前版本</span>
            <p className="text-gray-700 font-medium">{doc.version}</p>
          </div>
          <div>
            <span className="text-gray-400">更新时间</span>
            <p className="text-gray-700 font-medium">{doc.updateTime}</p>
          </div>
          <div>
            <span className="text-gray-400">作者</span>
            <p className="text-gray-700 font-medium">{doc.author}</p>
          </div>
        </div>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {doc.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs rounded-full bg-internal-light text-internal">
                {tag}
              </span>
            ))}
          </div>
        )}

        {doc.productNames.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">关联产品：</span>
            {doc.productNames.map((name) => (
              <span key={name} className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">文件预览</h2>
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">文件预览区域</p>
          <p className="text-sm text-gray-400">
            支持 PDF、图片、Word（转PDF）、Excel、PPT 等格式在线预览
          </p>
          <p className="text-xs text-gray-400 mt-4">
            实际部署时集成文档预览服务（如 Office Online、PDF.js）
          </p>
        </div>
      </div>

      {/* Version History */}
      {doc.versionHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">版本历史</h2>
          <VersionHistory versions={doc.versionHistory} />
        </div>
      )}

      {/* Watermark Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            下载此文件将自动添加您的账号水印，下载记录将被记录。文件仅供内部使用，禁止外传。
          </p>
        </div>
      </div>
    </div>
  );
}
