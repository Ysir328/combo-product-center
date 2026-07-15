import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'product' | 'document';
}

const STATUS_STYLES: Record<string, string> = {
  // Product statuses
  online: 'bg-success/10 text-success border-success/20',
  paused: 'bg-warning/10 text-warning border-warning/20',
  offline: 'bg-gray-100 text-gray-500 border-gray-200',

  // Document statuses
  active: 'bg-success/10 text-success border-success/20',
  published: 'bg-success/10 text-success border-success/20',
  updated: 'bg-primary/10 text-primary border-primary/20',
  history: 'bg-gray-100 text-gray-500 border-gray-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  expired: 'bg-danger/10 text-danger border-danger/20',
  draft: 'bg-warning/10 text-warning border-warning/20',

  // Chinese statuses
  '已发布': 'bg-success/10 text-success border-success/20',
  '已上架': 'bg-success/10 text-success border-success/20',
  '已下架': 'bg-gray-100 text-gray-500 border-gray-200',
  '已暂停': 'bg-warning/10 text-warning border-warning/20',
  '历史版本': 'bg-gray-100 text-gray-500 border-gray-200',
  '已失效': 'bg-danger/10 text-danger border-danger/20',
  '审核中': 'bg-primary/10 text-primary border-primary/20',
  '草稿': 'bg-warning/10 text-warning border-warning/20',
};

const STATUS_LABELS: Record<string, string> = {
  online: '上线',
  paused: '已暂停',
  offline: '已下线',
  active: '生效中',
  published: '已发布',
  updated: '已更新',
  history: '历史版本',
  archived: '已归档',
  expired: '已失效',
  draft: '草稿',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type: _type = 'product' }) => {
  const styleKey = status.toLowerCase();
  const style =
    STATUS_STYLES[status] ||
    STATUS_STYLES[styleKey] ||
    'bg-gray-100 text-gray-500 border-gray-200';

  const label = STATUS_LABELS[status] || STATUS_LABELS[styleKey] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${style}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
