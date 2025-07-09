'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricWithHistory } from '@/types';

interface LineChartProps {
  metric: MetricWithHistory;
  height?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  metric, 
  height = 300,
  className = ''
}) => {
  // Limitar e espaçar os dados para melhor visualização
  const processedData = React.useMemo(() => {
    if (metric.history.length === 0) return [];
    
    // Pegar apenas os últimos 20 pontos para reduzir poluição
    const recentData = metric.history.slice(-20);
    
    // Se temos muitos pontos, pegar 1 a cada 2 para dar mais espaço
    const spacedData = recentData.length > 15 
      ? recentData.filter((_, index) => index % 2 === 0 || index === recentData.length - 1)
      : recentData;
    
    return spacedData.map(point => ({
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
          <p className="text-sm font-medium text-gray-900">
            {metric.name}: {payload[0].value?.toLocaleString()}
            {metric.unit && ` ${metric.unit}`}
          </p>
          <p className="text-xs text-gray-500">
            {data.formattedDate} às {data.formattedTime}
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
      <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {metric.name} - Histórico
        </h3>
        <p className="text-sm text-gray-500">
          Últimos {processedData.length} pontos de dados
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart 
          data={processedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            opacity={0.5}
          />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={metric.color || "#3b82f6"}
            strokeWidth={3}
            dot={{ 
              fill: metric.color || "#3b82f6", 
              strokeWidth: 0, 
              r: 5,
              opacity: 0.8
            }}
            activeDot={{ 
              r: 8, 
              stroke: metric.color || "#3b82f6", 
              strokeWidth: 2,
              fill: '#ffffff'
            }}
            name={metric.name}
            connectNulls={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
