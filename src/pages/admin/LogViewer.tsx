import EmptyState from '../../components/common/EmptyState';

export default function LogViewer() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">操作日志</h2>
        <p className="text-sm text-gray-400 mt-1">查看系统操作记录、下载日志和审计追踪</p>
      </div>
      <EmptyState
        icon="FileText"
        title="操作日志"
        description="在正式环境中，此处将展示操作日志列表，支持按用户、操作类型、时间范围筛选，可导出审计报告。当前为MVP演示版本。"
      />
    </div>
  );
}
