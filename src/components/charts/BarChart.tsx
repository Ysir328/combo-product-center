import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
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

interface BarChartProps {
  data: { name: string; value: number; value2?: number }[];
  series: SeriesConfig[];
  title: string;
  subtitle?: string;
  height?: number;
  horizontal?: boolean;
  unit?: string;
}

const formatValue = (value: number, unit?: string): string => {
  const formatted =
    Math.abs(value) >= 10000
      ? `${(value / 10000).toFixed(2)}万`
      : value.toFixed(2);
  return unit ? `${formatted}${unit}` : formatted;
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 300,
  horizontal = false,
  unit,
}) => {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string; payload?: { name: string } }[];
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{payload[0]?.payload?.name}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value, unit)}
          </p>
        ))}
      </div>
    );
  };

  const renderBarShape = (props: { x?: number; y?: number; width?: number; height?: number; fill?: string }) => {
    const { x = 0, y = 0, width = 0, height = 0, fill } = props;
    const radius = 4;
    if (horizontal) {
      // In horizontal mode, the bar extends from y to y+height (visual width)
      const barHeight = height;
      const barWidth = width;
      return (
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={fill}
          rx={radius}
          ry={radius}
        />
      );
    }
    // Vertical mode: rounded top corners [4, 4, 0, 0]
    const path = `
      M ${x},${y + height}
      L ${x},${y + radius}
      Q ${x},${y} ${x + radius},${y}
      L ${x + width - radius},${y}
      Q ${x + width},${y} ${x + width},${y + radius}
      L ${x + width},${y + height}
      Z
    `;
    return <path d={path} fill={fill} />;
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 10, left: horizontal ? 10 : -10, bottom: 0 }}
          barCategoryGap="25%"
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F3F4F6"
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(v: number) => formatValue(v, unit)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatValue(v, unit)}
                width={60}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="rect"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              shape={renderBarShape}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default BarChart;
