'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, BarChart3, Clock, Eye, EyeOff } from 'lucide-react';
import { DashboardConfig } from '@/types';

export default function SettingsPage() {
  const [config, setConfig] = useState<DashboardConfig>({
    refreshInterval: 5000, // 5 segundos
    displayedMetrics: ['users', 'revenue', 'cpu', 'response_time'],
    chartTimeRange: 60 // 1 hora
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar configurações do servidor
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('🔄 Loading config from server...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/config`);
        console.log('📡 Load response status:', response.status);
        
        if (response.ok) {
          const serverConfig = await response.json();
          console.log('✅ Server config loaded:', serverConfig);
          
          // Processar configurações do servidor
          const processedConfig = {
            refreshInterval: serverConfig.refreshInterval || 5000,
            displayedMetrics: Array.isArray(serverConfig.displayedMetrics) 
              ? serverConfig.displayedMetrics 
              : (typeof serverConfig.displayedMetrics === 'string' 
                ? JSON.parse(serverConfig.displayedMetrics) 
                : ['users', 'revenue', 'cpu', 'response_time']),
            chartTimeRange: serverConfig.chartTimeRange || 60
          };
          
          console.log('📊 Processed config:', processedConfig);
          setConfig(processedConfig);
        } else {
          console.error('❌ Failed to load server config, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        // Fallback para localStorage se o servidor não estiver disponível
        const localConfig = localStorage.getItem('dashboardConfig');
        if (localConfig) {
          console.log('📦 Using localStorage config');
          setConfig(JSON.parse(localConfig));
        }
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validar e preparar dados antes de enviar
      const dataToSend = {
        refreshInterval: config.refreshInterval,
        displayedMetrics: Array.isArray(config.displayedMetrics) 
          ? config.displayedMetrics 
          : [],
        chartTimeRange: config.chartTimeRange
      };
      
      console.log('🔄 Saving config:', dataToSend);
      console.log('🔄 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/config`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save successful:', result);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      // Fallback para localStorage se o servidor não estiver disponível
      localStorage.setItem('dashboardConfig', JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const availableMetrics = [
    { id: 'users', name: 'Usuários Ativos', description: 'Número de usuários conectados' },
    { id: 'revenue', name: 'Receita', description: 'Receita em tempo real' },
    { id: 'cpu', name: 'CPU', description: 'Uso de CPU do servidor' },
    { id: 'response_time', name: 'Tempo de Resposta', description: 'Tempo médio de resposta' },
    { id: 'conversion', name: 'Conversão', description: 'Taxa de conversão' },
    { id: 'traffic', name: 'Tráfego', description: 'Visitantes únicos' },
    { id: 'errors', name: 'Erros', description: 'Número de erros' },
    { id: 'memory', name: 'Memória', description: 'Uso de memória' }
  ];

  const toggleMetric = (metricId: string) => {
    setConfig(prev => ({
      ...prev,
      displayedMetrics: prev.displayedMetrics.includes(metricId)
        ? prev.displayedMetrics.filter(id => id !== metricId)
        : [...prev.displayedMetrics, metricId]
    }));
  };

  const intervalOptions = [
    { value: 1000, label: '1 segundo' },
    { value: 2000, label: '2 segundos' },
    { value: 5000, label: '5 segundos' },
    { value: 10000, label: '10 segundos' },
    { value: 30000, label: '30 segundos' },
    { value: 60000, label: '1 minuto' }
  ];

  const timeRangeOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 360, label: '6 horas' },
    { value: 720, label: '12 horas' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Configurações
              </h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                saved 
                  ? 'bg-green-100 text-green-700' 
                  : saving
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Intervalo de Atualização */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Intervalo de Atualização
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Defina com que frequência as métricas devem ser atualizadas.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {intervalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig(prev => ({ ...prev, refreshInterval: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    config.refreshInterval === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo de Tempo dos Gráficos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Intervalo de Tempo dos Gráficos
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Defina quanto tempo de histórico deve ser exibido nos gráficos.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig(prev => ({ ...prev, chartTimeRange: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    config.chartTimeRange === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Métricas Exibidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Métricas Exibidas
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Selecione quais métricas devem ser exibidas no dashboard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    config.displayedMetrics.includes(metric.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleMetric(metric.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <p className="text-sm text-gray-600">{metric.description}</p>
                    </div>
                    <div className="ml-4">
                      {config.displayedMetrics.includes(metric.id) ? (
                        <Eye className="w-5 h-5 text-blue-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo da Configuração */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Resumo da Configuração</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Intervalo de atualização:</strong> {
                  intervalOptions.find(opt => opt.value === config.refreshInterval)?.label
                }
              </p>
              <p>
                <strong>Intervalo de tempo dos gráficos:</strong> {
                  timeRangeOptions.find(opt => opt.value === config.chartTimeRange)?.label
                }
              </p>
              <p>
                <strong>Métricas selecionadas:</strong> {config.displayedMetrics.length} de {availableMetrics.length}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
