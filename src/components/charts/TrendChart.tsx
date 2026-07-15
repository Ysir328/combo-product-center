import React, { useId } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../common/ChartContainer';

interface SeriesConfig {
  name: string;
  dataKey: string;
  color: string;
}

interface TrendChartProps {
  data: { date: string; value: number; value2?: number }[];
  series: SeriesConfig[];
  title: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  unit?: string;
}

const formatMonth = (dateStr: string): string => {
  const parts = dateStr.split(/[\/-]/);
  const month = parseInt(parts[1] || parts[0], 10);
  return isNaN(month) ? dateStr : `${month}月`;
};

const formatValue = (value: number, unit?: string): string => {
  const formatted =
    Math.abs(value) >= 10000
      ? `${(value / 10000).toFixed(2)}万`
      : value.toFixed(2);
  return unit ? `${formatted}${unit}` : formatted;
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  unit,
}) => {
  const gradientId = useId();

  const areaKey = series[0]?.dataKey ?? 'value';
  const areaColor = series[0]?.color ?? '#1E5EFF';

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string; payload?: { index?: number; date?: string } }[];
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{formatMonth(data[payload[0]?.payload?.index ?? 0]?.date ?? '')}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value, unit)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={areaColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          )}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={formatMonth}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatValue(v, unit)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey={areaKey}
            name={series[0]?.name ?? ''}
            stroke={areaColor}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          {series.length > 1 &&
            series.slice(1).map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TrendChart;
