'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { MetricWithHistory } from '@/types';

interface MetricCardProps {
  metric: MetricWithHistory;
  icon?: LucideIcon;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  metric, 
  icon: Icon,
  className = ''
}) => {
  // Calcular tendência baseada nos últimos 2 pontos
  const getTrend = () => {
    if (metric.history.length < 2) return 'stable';
    
    const current = metric.history[metric.history.length - 1].value;
    const previous = metric.history[metric.history.length - 2].value;
    
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const trend = getTrend();
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-5 h-5 text-blue-600" />}
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {metric.name}
            </h3>
          </div>
          
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(metric.value)}
              </p>
              {metric.unit && (
                <span className="text-sm text-gray-500">{metric.unit}</span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend === 'stable' ? 'Estável' : trend === 'up' ? 'Crescendo' : 'Decrescendo'}
            </span>
          </div>
        </div>

        {metric.color && (
          <div 
            className="w-3 h-16 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Última atualização</span>
          <span>
            {new Date(metric.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
