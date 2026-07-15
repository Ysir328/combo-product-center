import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  icon?: string;
  color?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  marketing: { bg: 'bg-marketing/10', text: 'text-marketing', dot: 'bg-marketing' },
  internal: { bg: 'bg-internal/10', text: 'text-internal', dot: 'bg-internal' },
  success: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  danger: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'primary',
}) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-danger'
        : 'text-gray-400';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <span className={`text-base ${colors.text}`}>{icon}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          {trendValue && (
            <span className={`text-xs font-medium ${trendColor}`}>{trendValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
