'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardConfig } from '@/types';

export const useConfig = () => {
  const [config, setConfig] = useState<DashboardConfig>({
    refreshInterval: 5000,
    displayedMetrics: ['users', 'revenue', 'cpu', 'response_time'],
    chartTimeRange: 60
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/config`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const serverConfig = await response.json();
      
      // Processar configurações do servidor
      const processedConfig: DashboardConfig = {
        refreshInterval: serverConfig.refreshInterval || 5000,
        displayedMetrics: Array.isArray(serverConfig.displayedMetrics) 
          ? serverConfig.displayedMetrics 
          : (typeof serverConfig.displayedMetrics === 'string' 
            ? JSON.parse(serverConfig.displayedMetrics) 
            : ['users', 'revenue', 'cpu', 'response_time']),
        chartTimeRange: serverConfig.chartTimeRange || 60
      };
      
      setConfig(processedConfig);
      setError(null);
    } catch (err) {
      console.error('Error fetching config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback para localStorage
      const localConfig = localStorage.getItem('dashboardConfig');
      if (localConfig) {
        try {
          const parsed = JSON.parse(localConfig);
          setConfig(parsed);
        } catch (parseError) {
          console.error('Error parsing local config:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const refetchConfig = useCallback(() => {
    setLoading(true);
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refetchConfig
  };
};
