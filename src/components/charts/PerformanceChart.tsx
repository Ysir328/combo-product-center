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
  ReferenceLine,
} from 'recharts';
import ChartContainer from '../common/ChartContainer';

interface PerformanceChartProps {
  data: { date: string; nav: number }[];
  title: string;
  subtitle?: string;
  height?: number;
  benchmarkData?: { date: string; nav: number }[];
}

const formatDate = (dateStr: string): string => {
  // Expect formats like "2024/01/15", "2024-01-15", "2024/01", etc.
  const cleaned = dateStr.replace(/-/g, '/');
  const parts = cleaned.split('/');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return dateStr;
};

const PRIMARY_COLOR = '#1E5EFF';
const BENCHMARK_COLOR = '#9CA3AF';

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title,
  subtitle,
  height = 320,
  benchmarkData,
}) => {
  const gradientId = useId();

  // Merge data for tooltip / chart rendering
  const hasBenchmark = benchmarkData && benchmarkData.length > 0;

  const initialNAV = data.length > 0 ? data[0].nav : 1;

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: {
      name: string;
      value: number;
      color: string;
      payload: { date: string; nav: number };
    }[];
  }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    const cumReturn = initialNAV > 0 ? ((row.nav / initialNAV - 1) * 100) : 0;
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 px-3 py-2 text-xs min-w-[140px]">
        <p className="text-gray-500 mb-1">{formatDate(row.date)}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
        {cumReturn !== undefined && (
          <p
            className={`font-medium mt-0.5 ${
              cumReturn >= 0 ? 'text-[#10B981]' : 'text-red-500'
            }`}
          >
            累计收益: {cumReturn >= 0 ? '+' : ''}
            {cumReturn.toFixed(2)}%
          </p>
        )}
      </div>
    );
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.12} />
              <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F3F4F6"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(2)}
            domain={['auto', 'auto']}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <ReferenceLine
            y={1.0}
            stroke="#D1D5DB"
            strokeDasharray="6 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="nav"
            name="产品净值"
            stroke={PRIMARY_COLOR}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: PRIMARY_COLOR }}
          />
          {hasBenchmark && (
            <Line
              type="monotone"
              data={benchmarkData}
              dataKey="nav"
              name="基准"
              stroke={BENCHMARK_COLOR}
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: BENCHMARK_COLOR }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PerformanceChart;
