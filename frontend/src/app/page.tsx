'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Server, 
  Clock,
  Settings,
  BarChart3
} from 'lucide-react';
import { useMetrics } from '@/hooks/useMetrics';
import { useConfig } from '@/hooks/useConfig';
import MetricCard from '@/components/MetricCard';
import MinimalChart from '@/components/MinimalChart';
import ConnectionStatus from '@/components/ConnectionStatus';

export default function Dashboard() {
  const { metrics, loading: metricsLoading, error: metricsError, isConnected, refreshMetrics } = useMetrics();
  const { config, loading: configLoading, error: configError } = useConfig();

  // Filtrar métricas baseado nas configurações
  const filteredMetrics = useMemo(() => {
    if (!config.displayedMetrics || config.displayedMetrics.length === 0) {
      return metrics;
    }
    
    return metrics.filter(metric => {
      // Mapear nomes das métricas para os IDs das configurações
      const metricNameMap: { [key: string]: string } = {
        'Usuários Ativos': 'users',
        'Receita': 'revenue',
        'CPU': 'cpu',
        'Tempo de Resposta': 'response_time',
        'Taxa de Conversão': 'conversion',
        'Tráfego': 'traffic',
        'Erros': 'errors',
        'Memória': 'memory'
      };
      
      const metricId = metricNameMap[metric.name] || metric.name.toLowerCase();
      return config.displayedMetrics.includes(metricId);
    });
  }, [metrics, config.displayedMetrics]);

  const loading = metricsLoading || configLoading;
  const error = metricsError || configError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro na Conexão</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refreshMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Mapear ícones para métricas específicas
  const getMetricIcon = (metricName: string) => {
    const name = metricName.toLowerCase();
    if (name.includes('user') || name.includes('usuário')) return Users;
    if (name.includes('revenue') || name.includes('receita')) return DollarSign;
    if (name.includes('cpu') || name.includes('server')) return Server;
    if (name.includes('response') || name.includes('resposta')) return Clock;
    if (name.includes('conversion') || name.includes('conversão')) return TrendingUp;
    return Activity;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Analítico
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectionStatus 
                isConnected={isConnected} 
                onRefresh={refreshMetrics}
              />
              <Link 
                href="/settings"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredMetrics.map((metric) => (
            <MetricCard
              key={metric.name}
              metric={metric}
              icon={getMetricIcon(metric.name)}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredMetrics.map((metric) => (
            <MinimalChart
              key={`chart-${metric.name}`}
              metric={metric}
              height={280}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredMetrics.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma métrica disponível
            </h3>
            <p className="text-gray-600 mb-6">
              Aguardando dados do servidor ou verifique a conexão.
            </p>
            <button
              onClick={refreshMetrics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Atualizar Métricas
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
