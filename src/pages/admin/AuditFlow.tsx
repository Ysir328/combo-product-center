import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

const MOCK_AUDIT_ITEMS = [
  {
    id: 'audit-001',
    title: '满山红精选组合推广话术 V3.5',
    submitter: '张明',
    submitTime: '2026-07-07 14:30',
    status: 'pending',
    type: '资料更新',
  },
  {
    id: 'audit-002',
    title: '稳健增长组合Q2业绩报告 V2.1',
    submitter: '产品运营部',
    submitTime: '2026-07-05 09:15',
    status: 'approved',
    type: '新增资料',
    reviewer: '赵合规',
    reviewTime: '2026-07-05 16:00',
  },
  {
    id: 'audit-003',
    title: '社群素材-7月暑期系列 V6.2',
    submitter: '刘洋',
    submitTime: '2026-07-06 11:20',
    status: 'rejected',
    type: '资料更新',
    reviewer: '赵合规',
    reviewTime: '2026-07-06 15:45',
    reason: '部分海报缺少合规备案编号，请补充后重新提交',
  },
];

const STATUS_MAP: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: '待审核' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: '已通过' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: '已驳回' },
};

export default function AuditFlow() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">审核流程</h2>
        <p className="text-sm text-gray-400 mt-1">审核资料发布申请，确保内容合规</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { label: '全部', count: 3 },
          { label: '待审核', count: 1 },
          { label: '已通过', count: 1 },
          { label: '已驳回', count: 1 },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab.label === '全部'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {MOCK_AUDIT_ITEMS.map((item) => {
            const statusConfig = STATUS_MAP[item.status];
            const StatusIcon = statusConfig.icon;
            return (
              <div key={item.id} className="p-6 hover:bg-gray-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>提交人：{item.submitter}</span>
                      <span>提交时间：{item.submitTime}</span>
                      <span>类型：{item.type}</span>
                    </div>
                    {item.reviewer && (
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>审核人：{item.reviewer}</span>
                        <span>审核时间：{item.reviewTime}</span>
                      </div>
                    )}
                    {item.reason && (
                      <div className="mt-2 bg-red-50 rounded-lg p-3 flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{item.reason}</p>
                      </div>
                    )}
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        通过
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>审核流程说明：</strong>运营编辑 → 填写版本信息、设置可见范围 → 提交审核 → 合规/管理员审核 → 正式发布 → 记录操作日志并保存历史版本。
        </p>
      </div>
    </div>
  );
}
