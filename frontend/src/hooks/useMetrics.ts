'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { MetricData, MetricWithHistory, MetricHistory } from '@/types';

export const useMetrics = () => {
  const { socket, isConnected } = useSocket();
  const [metrics, setMetrics] = useState<{ [key: string]: MetricWithHistory }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar métricas iniciais
  const fetchInitialMetrics = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching initial metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  // Função para atualizar métrica
  const updateMetric = useCallback((metricData: MetricData) => {
    setMetrics(prev => {
      const existing = prev[metricData.name];
      const newHistoryPoint: MetricHistory = {
        timestamp: metricData.timestamp,
        value: metricData.value
      };

      const updatedHistory = existing?.history 
        ? [...existing.history, newHistoryPoint].slice(-100) // Manter últimos 100 pontos
        : [newHistoryPoint];

      return {
        ...prev,
        [metricData.name]: {
          ...metricData,
          history: updatedHistory
        }
      };
    });
  }, []);

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket) return;

    const handleMetricUpdate = (data: MetricData) => {
      updateMetric(data);
    };

    socket.on('metric:update', handleMetricUpdate);

    return () => {
      socket.off('metric:update', handleMetricUpdate);
    };
  }, [socket, updateMetric]);

  // Buscar métricas iniciais quando conectado
  useEffect(() => {
    if (isConnected) {
      fetchInitialMetrics();
    }
  }, [isConnected, fetchInitialMetrics]);

  // Função para refrescar métricas
  const refreshMetrics = useCallback(() => {
    setLoading(true);
    fetchInitialMetrics();
  }, [fetchInitialMetrics]);

  return {
    metrics: Object.values(metrics),
    metricsMap: metrics,
    loading,
    error,
    isConnected,
    refreshMetrics
  };
};
