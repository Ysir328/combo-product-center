import { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useMarketingMaterials, useUpdateMaterial } from '../../hooks/useMarketingMaterials';
import { useInternalDocuments, useUpdateInternalDoc } from '../../hooks/useInternalDocuments';
import { useCreateAuditLog } from '../../hooks/useAuditLogs';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

interface AuditItem {
  id: string;
  title: string;
  type: 'marketing' | 'internal';
  status: string;
  category: string;
  author: string;
  updateTime: string;
}

const STATUS_MAP: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  draft: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: '待审核' },
  published: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: '已通过' },
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: '已通过' },
  archived: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: '已驳回' },
};

export default function AuditFlow() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<AuditItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);
  const { showToast } = useToast();

  const { data: materials, loading: mLoading, refetch: mRefetch } = useMarketingMaterials();
  const { data: docs, loading: dLoading, refetch: dRefetch } = useInternalDocuments();
  const { mutate: updateMaterial } = useUpdateMaterial();
  const { mutate: updateDoc } = useUpdateInternalDoc();
  const { mutate: createLog } = useCreateAuditLog();

  // Combine marketing and internal items into audit queue
  const allItems: AuditItem[] = [
    ...materials.map(m => ({ id: m.id, title: m.title, type: 'marketing' as const, status: m.status, category: m.category, author: m.author, updateTime: m.updateTime })),
    ...docs.map(d => ({ id: d.id, title: d.title, type: 'internal' as const, status: d.status, category: d.category, author: d.author, updateTime: d.updateTime })),
  ];

  const filtered = activeFilter === 'all'
    ? allItems
    : activeFilter === 'pending'
      ? allItems.filter(i => i.status === 'draft')
      : activeFilter === 'approved'
        ? allItems.filter(i => i.status === 'published' || i.status === 'active')
        : allItems.filter(i => i.status === 'archived' || i.status === 'expired');

  const tabs = [
    { key: 'all', label: '全部', count: allItems.length },
    { key: 'pending', label: '待审核', count: allItems.filter(i => i.status === 'draft').length },
    { key: 'approved', label: '已通过', count: allItems.filter(i => i.status === 'published' || i.status === 'active').length },
    { key: 'rejected', label: '已驳回', count: allItems.filter(i => i.status === 'archived' || i.status === 'expired').length },
  ];

  const handleApprove = async (item: AuditItem) => {
    setActing(true);
    const newStatus = item.type === 'marketing' ? 'published' : 'active';
    const ok = item.type === 'marketing'
      ? await updateMaterial(item.id, { status: newStatus as 'published' })
      : await updateDoc(item.id, { status: newStatus as 'active' });
    if (ok) {
      await createLog({ action: 'approve', entity_type: item.type === 'marketing' ? 'marketing_material' : 'internal_document', entity_id: item.id, entity_title: item.title });
      showToast('已通过审核', 'success');
      mRefetch(); dRefetch();
    } else { showToast('操作失败', 'error'); }
    setActing(false);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActing(true);
    const ok = rejectModal.type === 'marketing'
      ? await updateMaterial(rejectModal.id, { status: 'archived' as const })
      : await updateDoc(rejectModal.id, { status: 'expired' as const });
    if (ok) {
      await createLog({ action: 'reject', entity_type: rejectModal.type === 'marketing' ? 'marketing_material' : 'internal_document', entity_id: rejectModal.id, entity_title: rejectModal.title, details: { reason: rejectReason } });
      showToast('已驳回', 'success');
      mRefetch(); dRefetch();
    } else { showToast('操作失败', 'error'); }
    setRejectModal(null);
    setRejectReason('');
    setActing(false);
  };

  if (mLoading || dLoading) return <LoadingSpinner size="lg" text="加载审核列表..." />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">审核流程</h2>
        <p className="text-sm text-gray-400 mt-1">审核资料发布申请，确保内容合规</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeFilter === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无审核项" description="该分类下没有待审核的资料" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(item => {
              const config = STATUS_MAP[item.status] || STATUS_MAP.draft;
              const StatusIcon = config.icon;
              return (
                <div key={`${item.type}-${item.id}`} className="p-6 hover:bg-gray-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />{config.label}
                        </span>
                        <span className="text-xs text-gray-400">{item.type === 'marketing' ? '营销资料' : '内部文档'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>作者：{item.author}</span>
                        <span>更新时间：{item.updateTime}</span>
                        <span>分类：{item.category}</span>
                      </div>
                    </div>
                    {item.status === 'draft' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={acting}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        >通过</button>
                        <button
                          onClick={() => setRejectModal(item)}
                          disabled={acting}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >驳回</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">驳回原因</h3>
            <p className="text-sm text-gray-500 mb-4">请填写驳回原因，以便提交者修改</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="填写驳回原因..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || acting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50"
              >确认驳回</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>审核流程说明：</strong>运营编辑 → 填写版本信息 → 提交审核 → 合规/管理员审核 → 正式发布 → 记录操作日志并保存历史版本。
        </p>
      </div>
    </div>
  );
}
