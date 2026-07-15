import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Edit2, Trash2, Eye, Download, Loader2, FileText, BarChart3 } from 'lucide-react';
import { useMarketingMaterials, useDeleteMaterial } from '../../hooks/useMarketingMaterials';
import { useInternalDocuments, useDeleteInternalDoc } from '../../hooks/useInternalDocuments';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../lib/storage';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CAT_LABELS: Record<string, string> = {
  product_intro: '产品介绍', performance_report: '业绩报告', faq: '常见问题',
  script: '话术', social_media: '社群素材', template: '模板', training: '培训SOP',
  sop: 'SOP', compliance: '合规', event: '活动', social: '社群', hr: '人事',
};

export default function ContentManage() {
  const [activeTab, setActiveTab] = useState<'marketing' | 'internal'>('marketing');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { showToast } = useToast();

  const { data: materials, loading: mLoading, refetch: mRefetch } = useMarketingMaterials();
  const { data: docs, loading: dLoading, refetch: dRefetch } = useInternalDocuments();
  const { mutate: deleteMaterial } = useDeleteMaterial();
  const { mutate: deleteDoc } = useDeleteInternalDoc();

  const filteredMaterials = materials.filter(m => !search || m.title.includes(search));
  const filteredDocs = docs.filter(d => !search || d.title.includes(search));
  const loading = mLoading || dLoading;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    let ok: boolean;
    if (activeTab === 'marketing') {
      ok = await deleteMaterial(deleteTarget);
    } else {
      ok = await deleteDoc(deleteTarget);
    }
    if (ok) {
      showToast('已删除', 'success');
      activeTab === 'marketing' ? mRefetch() : dRefetch();
    } else {
      showToast('删除失败', 'error');
    }
    setDeleteTarget(null);
  };

  const handleDownload = async (item: { id: string; title: string; format: string }) => {
    const bucket = activeTab === 'marketing' ? 'marketing-files' as const : 'internal-files' as const;
    const success = await downloadFile(bucket, `materials/${item.id}`, `${item.title}.${item.format.toLowerCase()}`);
    if (success) showToast('下载已开始', 'success');
    else showToast('下载准备中...', 'info');
  };

  if (loading) return <LoadingSpinner size="lg" text="加载资料..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">内容管理</h2>
          <p className="text-sm text-gray-400 mt-1">管理营销资料和内部文档的上传、版本控制和发布</p>
        </div>
        <button
          onClick={() => showToast('上传功能：Supabase 配置后可用', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
        >
          <Upload className="w-4 h-4" />上传资料
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'marketing' ? 'bg-marketing text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1.5" />营销资料 ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'internal' ? 'bg-internal text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />内部文档 ({docs.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="搜索资料名称..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      {((activeTab === 'marketing' && filteredMaterials.length === 0) || (activeTab === 'internal' && filteredDocs.length === 0)) ? (
        <EmptyState icon="FolderOpen" title="暂无资料" description="点击上方按钮上传新资料" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-medium text-gray-400">名称</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">分类</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">格式</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">版本</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">状态</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">更新时间</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(activeTab === 'marketing' ? filteredMaterials : filteredDocs).map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{'description' in item ? item.description : ''}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                        {CAT_LABELS[item.category] || item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{item.format}</td>
                    <td className="py-4 px-6 text-gray-500">V{'version' in item ? item.version : ''}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={'status' in item ? item.status : 'active'} type="document" />
                    </td>
                    <td className="py-4 px-6 text-gray-500">{'updateTime' in item ? item.updateTime : ''}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => showToast('编辑功能：Supabase 配置后可用', 'info')}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                        ><Edit2 className="w-4 h-4" /></button>
                        <button
                          onClick={() => handleDownload(item as { id: string; title: string; format: string })}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                        ><Download className="w-4 h-4" /></button>
                        <button
                          onClick={() => setDeleteTarget(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除资料"
        message="确定要删除此资料吗？此操作不可恢复。"
        confirmLabel="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
