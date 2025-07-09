'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricWithHistory } from '@/types';

interface MinimalChartProps {
  metric: MetricWithHistory;
  height?: number;
  className?: string;
}

const MinimalChart: React.FC<MinimalChartProps> = ({ 
  metric, 
  height = 280,
  className = ''
}) => {
  // Processar dados com ainda mais espaçamento
  const processedData = React.useMemo(() => {
    if (metric.history.length === 0) return [];
    
    // Pegar apenas os últimos 12 pontos para gráfico ultra limpo
    const recentData = metric.history.slice(-12);
    
    return recentData.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      formattedTime: new Date(point.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
  }, [metric.history]);

  // Tooltip minimalista
  const CustomTooltip = (props: Record<string, unknown>) => {
    const { active, payload } = props;
    if (active && payload && Array.isArray(payload) && payload.length) {
      const data = payload[0].payload as {
        timestamp: number;
        value: number;
        formattedTime: string;
      };
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium opacity-90">
            {metric.name}
          </p>
          <p className="text-lg font-bold">
            {payload[0].value?.toLocaleString()}
            {metric.unit && ` ${metric.unit}`}
          </p>
          <p className="text-xs opacity-75">
            {data.formattedTime}
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatador para o eixo Y (apenas valores-chave)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Formatador para o eixo X (apenas horário)
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (processedData.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {metric.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Últimas {processedData.length} atualizações
          </p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color || "#3b82f6" }}
            />
            <span className="text-sm text-gray-500">Tempo real</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart 
          data={processedData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={50}
            domain={['dataMin - 10', 'dataMax + 10']}
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
              r: 6,
              opacity: 0.9
            }}
            activeDot={{ 
              r: 10, 
              stroke: metric.color || "#3b82f6", 
              strokeWidth: 3,
              fill: '#ffffff',
              opacity: 1
            }}
            connectNulls={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MinimalChart;
