import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../common/ChartContainer';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartComponentProps {
  data: PieDataItem[];
  title: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  unit?: string;
}

const formatValue = (value: number, unit?: string): string => {
  const formatted =
    Math.abs(value) >= 10000
      ? `${(value / 10000).toFixed(2)}万`
      : value.toFixed(2);
  return unit ? `${formatted}${unit}` : formatted;
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  unit,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; payload: PieDataItem }[];
  }) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{entry.name}</p>
        <p className="font-medium" style={{ color: entry.payload.color }}>
          {formatValue(entry.value, unit)} ({pct}%)
        </p>
      </div>
    );
  };

  const renderLegend = (props: { payload?: readonly { value?: string; color?: string }[] }) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-col gap-1.5 pl-2 text-xs" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <span className="text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                content={renderLegend}
                verticalAlign="middle"
                align="right"
                layout="vertical"
                wrapperStyle={{ fontSize: 12 }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        {/* Center total overlay */}
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            position: 'absolute',
            top: showLegend ? '50%' : '50%',
            left: showLegend ? '42%' : '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <span className="text-xl font-bold text-gray-800">
            {formatValue(total, unit)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">合计</span>
        </div>
      </div>
    </ChartContainer>
  );
};

export default PieChartComponent;
