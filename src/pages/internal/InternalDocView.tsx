import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Download, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInternalDocument } from '../../hooks/useInternalDocuments';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../lib/storage';
import { internalDocuments as localDocs } from '../../data/internal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VersionHistory from '../../components/common/VersionHistory';
import { Lock } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_LABELS: Record<string, string> = {
  script: '推广话术', sop: '标准流程', template: '工具模板',
  compliance: '合规文件', event: '活动策划', social: '社群素材', hr: '人事考核',
};

export default function InternalDocView() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: doc, loading, error } = useInternalDocument(id);
  const [downloading, setDownloading] = useState(false);

  // Fallback to local data
  const localDoc = !doc && id ? localDocs.find(d => d.id === id) : null;
  const displayDoc = doc || localDoc;

  if (!hasPermission('internal:view')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录访问</h2>
        <Link to="/auth" className="text-primary hover:underline">前往登录</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="加载文档..." /></div>;
  }

  if (!displayDoc) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">资料未找到</h2>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Link to="/internal" className="text-primary hover:underline">返回资料列表</Link>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const success = await downloadFile('internal-files', `docs/${displayDoc.id}`, displayDoc.title);
      if (success) {
        showToast('下载已开始', 'success');
      } else {
        showToast('下载准备中...（云端配置完成后可用）', 'info');
      }
    } catch {
      showToast('下载准备中...（云端配置完成后可用）', 'info');
    }
    setDownloading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/internal" className="hover:text-gray-600">内部文档</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 truncate">{displayDoc.title}</span>
      </div>

      <button onClick={() => navigate('/internal')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />返回列表
      </button>

      {/* Document Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayDoc.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-400">{CATEGORY_LABELS[displayDoc.category] || displayDoc.category}</span>
              <StatusBadge status={displayDoc.status} type="document" />
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-internal text-white rounded-xl hover:bg-internal/90 disabled:opacity-50 transition-colors"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            下载文件
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{displayDoc.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400">文件格式</span><p className="text-gray-700 font-medium">{displayDoc.format}</p></div>
          <div><span className="text-gray-400">文件大小</span><p className="text-gray-700 font-medium">{displayDoc.fileSize}</p></div>
          <div><span className="text-gray-400">当前版本</span><p className="text-gray-700 font-medium">{displayDoc.version}</p></div>
          <div><span className="text-gray-400">更新时间</span><p className="text-gray-700 font-medium">{displayDoc.updateTime}</p></div>
          <div><span className="text-gray-400">作者</span><p className="text-gray-700 font-medium">{displayDoc.author}</p></div>
        </div>

        {displayDoc.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {displayDoc.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs rounded-full bg-internal-light text-internal">{tag}</span>
            ))}
          </div>
        )}

        {displayDoc.productNames.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">关联产品：</span>
            {displayDoc.productNames.map((name, i) => {
              const pid = displayDoc.productIds[i];
              return pid ? (
                <Link key={name} to={`/products/${pid}`} className="ml-2 px-2 py-0.5 text-xs rounded bg-primary-light text-primary hover:underline">
                  {name}
                </Link>
              ) : (
                <span key={name} className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{name}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview */}
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
          <button
            onClick={handleDownload}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />下载后在本地查看
          </button>
        </div>
      </div>

      {/* Version History */}
      {displayDoc.versionHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">版本历史</h2>
          <VersionHistory versions={displayDoc.versionHistory} />
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
