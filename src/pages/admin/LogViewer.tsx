import { useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ACTION_LABELS: Record<string, string> = {
  create: '创建', update: '更新', delete: '删除', approve: '审核通过',
  reject: '审核驳回', upload: '上传', download: '下载', preview: '预览',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-blue-100 text-blue-700', update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-red-100 text-red-700', approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700', upload: 'bg-purple-100 text-purple-700',
  download: 'bg-gray-100 text-gray-700', preview: 'bg-gray-100 text-gray-600',
};

export default function LogViewer() {
  const { data: logs, loading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (search && !l.userName?.includes(search) && !l.entityTitle?.includes(search)) return false;
      if (actionFilter && l.action !== actionFilter) return false;
      return true;
    });
  }, [logs, search, actionFilter]);

  const handleExportCSV = () => {
    const headers = ['时间', '用户', '操作', '实体类型', '实体标题', '详情'];
    const rows = filtered.map(l => [
      l.createdAt, l.userName || '', ACTION_LABELS[l.action] || l.action,
      l.entityType, l.entityTitle || '', JSON.stringify(l.details),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner size="lg" text="加载操作日志..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">操作日志</h2>
          <p className="text-sm text-gray-400 mt-1">查看系统操作记录、下载日志和审计追踪</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />导出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="搜索用户名或操作内容..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="">全部操作</option>
            {actions.map(a => (
              <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="FileText" title="暂无日志" description={search || actionFilter ? '未找到匹配的日志记录' : '操作日志为空'} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-medium text-gray-400">时间</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">用户</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">操作</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">类型</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">标题</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-4 px-6 text-gray-700">{log.userName || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-lg font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">{log.entityType}</td>
                    <td className="py-4 px-6 text-gray-700 max-w-[200px] truncate">{log.entityTitle || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            共 {filtered.length} 条记录
          </div>
        </div>
      )}
    </div>
  );
}
