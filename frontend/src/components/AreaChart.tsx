'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricWithHistory } from '@/types';

interface AreaChartProps {
  metric: MetricWithHistory;
  height?: number;
  className?: string;
}

const AreaChartComponent: React.FC<AreaChartProps> = ({ 
  metric, 
  height = 300,
  className = ''
}) => {
  // Limitar e espaçar os dados para melhor visualização
  const processedData = React.useMemo(() => {
    if (metric.history.length === 0) return [];
    
    // Pegar apenas os últimos 15 pontos para gráfico mais limpo
    const recentData = metric.history.slice(-15);
    
    return recentData.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      formattedTime: new Date(point.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      formattedDate: new Date(point.timestamp).toLocaleDateString()
    }));
  }, [metric.history]);

  // Formatador personalizado para o tooltip
  const CustomTooltip = (props: Record<string, unknown>) => {
    const { active, payload } = props;
    if (active && payload && Array.isArray(payload) && payload.length) {
      const data = payload[0].payload as {
        timestamp: number;
        value: number;
        formattedTime: string;
        formattedDate: string;
      };
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">
            {metric.name}
          </p>
          <p className="text-lg font-bold" style={{ color: metric.color || "#3b82f6" }}>
            {payload[0].value?.toLocaleString()}
            {metric.unit && ` ${metric.unit}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.formattedTime}
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatador para o eixo Y
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Formatador para o eixo X
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (processedData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {metric.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Tendência dos últimos {processedData.length} registros
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={processedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`gradient-${metric.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metric.color || "#3b82f6"} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={metric.color || "#3b82f6"} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f1f5f9" 
            vertical={false}
          />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={metric.color || "#3b82f6"}
            strokeWidth={2}
            fill={`url(#gradient-${metric.name})`}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: metric.color || "#3b82f6", 
              strokeWidth: 2,
              fill: '#ffffff'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
