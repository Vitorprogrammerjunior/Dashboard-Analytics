const { EventEmitter } = require('events');
const { DatabaseManager } = require('./database');

class MetricsPublisher extends EventEmitter {
  constructor() {
    super();
    this.intervalId = null;
    this.isRunning = false;
    this.publishInterval = 5000; // 5 segundos
    this.metrics = new Map();
    this.database = new DatabaseManager();
    this.useDatabaseMode = false;
    
    // Inicializar métricas mock
    this.initializeMockMetrics();
  }

  initializeMockMetrics() {
    // Métricas mock para demonstração
    this.metrics.set('users', {
      name: 'Usuários Ativos',
      value: 1250,
      unit: 'usuários',
      color: '#3B82F6',
      generator: () => Math.floor(Math.random() * 200) + 1200
    });

    this.metrics.set('revenue', {
      name: 'Receita',
      value: 45780,
      unit: 'R$',
      color: '#10B981',
      generator: () => Math.floor(Math.random() * 5000) + 45000
    });

    this.metrics.set('cpu', {
      name: 'CPU',
      value: 65,
      unit: '%',
      color: '#F59E0B',
      generator: () => Math.floor(Math.random() * 40) + 50
    });

    this.metrics.set('response_time', {
      name: 'Tempo de Resposta',
      value: 245,
      unit: 'ms',
      color: '#EF4444',
      generator: () => Math.floor(Math.random() * 200) + 200
    });

    this.metrics.set('conversion', {
      name: 'Taxa de Conversão',
      value: 3.2,
      unit: '%',
      color: '#8B5CF6',
      generator: () => Math.round((Math.random() * 2 + 2.5) * 100) / 100
    });

    this.metrics.set('traffic', {
      name: 'Tráfego',
      value: 8540,
      unit: 'visitas',
      color: '#06B6D4',
      generator: () => Math.floor(Math.random() * 1000) + 8000
    });

    this.metrics.set('errors', {
      name: 'Erros',
      value: 12,
      unit: 'erros',
      color: '#DC2626',
      generator: () => Math.floor(Math.random() * 20) + 5
    });

    this.metrics.set('memory', {
      name: 'Memória',
      value: 78,
      unit: '%',
      color: '#059669',
      generator: () => Math.floor(Math.random() * 30) + 70
    });
  }

  // Inicializar conexão com banco de dados
  async initializeDatabase() {
    try {
      const connected = await this.database.initialize();
      if (connected) {
        this.useDatabaseMode = true;
        console.log('🔌 Modo banco de dados ativado');
        
        // Inserir métricas mock iniciais se necessário
        await this.seedMockDataIfNeeded();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error.message);
      console.log('🔄 Continuando em modo mock...');
      return false;
    }
  }

  // Inserir dados mock no banco se não existirem
  async seedMockDataIfNeeded() {
    try {
      const stats = await this.database.getStatistics();
      
      if (stats.total_metrics === 0) {
        console.log('🌱 Inserindo dados mock iniciais...');
        
        // Inserir alguns pontos de dados históricos
        const now = Date.now();
        const metricsToInsert = [];
        
        for (let i = 30; i >= 0; i--) {
          for (const [key, metric] of this.metrics) {
            metricsToInsert.push({
              name: key,
              value: metric.generator(),
              timestamp: now - (i * 60000) // 1 minuto atrás
            });
          }
        }
        
        await this.database.insertMultipleMetrics(metricsToInsert);
        console.log(`✅ ${metricsToInsert.length} métricas mock inseridas`);
      }
    } catch (error) {
      console.error('❌ Erro ao inserir dados mock:', error.message);
    }
  }

  // Buscar métricas do banco de dados ou mock
  async fetchMetricsFromDatabase() {
    if (this.useDatabaseMode) {
      try {
        console.log('📊 Fetching metrics from MySQL database...');
        
        // Buscar métricas do banco
        const latestMetrics = await this.database.getLatestMetrics();
        
        const metricsData = [];
        for (const metric of latestMetrics) {
          // Gerar novo valor (simulando dados em tempo real)
          const mockMetric = this.metrics.get(metric.name);
          const newValue = mockMetric ? mockMetric.generator() : metric.value;
          
          // Inserir novo valor no banco
          await this.database.insertMetric(metric.name, newValue);
          
          metricsData.push({
            name: metric.display_name,
            value: newValue,
            unit: metric.unit,
            color: metric.color,
            timestamp: Date.now()
          });
        }
        
        return metricsData;
      } catch (error) {
        console.error('❌ Erro ao buscar do banco, usando mock:', error.message);
        return this.fetchMockMetrics();
      }
    } else {
      return this.fetchMockMetrics();
    }
  }

  // Buscar métricas mock (fallback)
  fetchMockMetrics() {
    console.log('📊 Fetching metrics from mock data...');
    
    const metricsData = [];
    for (const [key, metric] of this.metrics) {
      const newValue = metric.generator();
      metric.value = newValue;
      
      metricsData.push({
        name: metric.name,
        value: newValue,
        unit: metric.unit,
        color: metric.color,
        timestamp: Date.now()
      });
    }
    
    return metricsData;
  }

  // Obter métricas iniciais com histórico
  async getInitialMetrics() {
    if (this.useDatabaseMode) {
      try {
        console.log('📊 Fetching initial metrics from database...');
        return await this.database.getMetricsWithHistory(60); // 60 minutos
      } catch (error) {
        console.error('❌ Erro ao buscar métricas iniciais do banco:', error.message);
        return this.getMockInitialMetrics();
      }
    } else {
      return this.getMockInitialMetrics();
    }
  }

  // Obter métricas mock iniciais
  getMockInitialMetrics() {
    const initialMetrics = {};
    
    for (const [key, metric] of this.metrics) {
      // Gerar histórico fake dos últimos 30 pontos
      const history = [];
      const now = Date.now();
      
      for (let i = 29; i >= 0; i--) {
        history.push({
          timestamp: now - (i * 30000), // 30 segundos atrás
          value: metric.generator()
        });
      }
      
      initialMetrics[metric.name] = {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        color: metric.color,
        timestamp: now,
        history: history
      };
    }
    
    return initialMetrics;
  }

  // Iniciar publicação de métricas
  async startPublishing(io) {
    if (this.isRunning) {
      console.log('⚠️  Metrics publisher is already running');
      return;
    }

    // Tentar conectar ao banco de dados
    await this.initializeDatabase();

    this.io = io;
    this.isRunning = true;
    
    console.log(`🚀 Starting metrics publisher with ${this.publishInterval}ms interval`);
    console.log(`📊 Database mode: ${this.useDatabaseMode ? 'Enabled' : 'Disabled (using mock)'}`);
    
    this.intervalId = setInterval(async () => {
      try {
        const metrics = await this.fetchMetricsFromDatabase();
        
        // Emitir cada métrica individualmente
        metrics.forEach(metric => {
          this.io.emit('metric:update', metric);
        });
        
        console.log(`📈 Published ${metrics.length} metrics at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('❌ Error publishing metrics:', error);
        
        // Log erro no banco se possível
        if (this.useDatabaseMode) {
          try {
            await this.database.insertEventLog('ERROR', 'Error publishing metrics', {
              error: error.message,
              stack: error.stack
            });
          } catch (logError) {
            console.error('❌ Error logging to database:', logError.message);
          }
        }
      }
    }, this.publishInterval);
  }

  // Parar publicação
  async stopPublishing() {
    if (!this.isRunning) {
      console.log('⚠️  Metrics publisher is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    
    // Fechar conexão com banco
    if (this.useDatabaseMode) {
      await this.database.close();
    }
    
    console.log('🛑 Metrics publisher stopped');
  }

  // Configurar intervalo de publicação
  async setPublishInterval(interval) {
    this.publishInterval = interval;
    
    if (this.isRunning) {
      console.log(`🔄 Restarting publisher with new interval: ${interval}ms`);
      await this.stopPublishing();
      await this.startPublishing(this.io);
    }
  }

  // Obter status
  getStatus() {
    return {
      isRunning: this.isRunning,
      publishInterval: this.publishInterval,
      metricsCount: this.metrics.size,
      useDatabaseMode: this.useDatabaseMode,
      lastPublished: this.lastPublished
    };
  }

  // Obter estatísticas do banco
  async getDatabaseStats() {
    if (this.useDatabaseMode) {
      try {
        return await this.database.getStatistics();
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error.message);
        return null;
      }
    }
    return null;
  }

  // Obter configurações do dashboard
  async getDashboardConfig() {
    if (this.useDatabaseMode) {
      try {
        const config = await this.database.getDashboardConfig();
        
        // Configurações padrão se não existirem
        const defaultConfig = {
          refreshInterval: 5000,
          displayedMetrics: ['users', 'revenue', 'cpu', 'response_time'],
          chartTimeRange: 60
        };
        
        // Processar configurações do banco
        const processedConfig = { ...defaultConfig };
        
        if (config.refreshInterval !== undefined) {
          processedConfig.refreshInterval = config.refreshInterval;
        }
        
        if (config.displayedMetrics !== undefined) {
          try {
            processedConfig.displayedMetrics = Array.isArray(config.displayedMetrics) 
              ? config.displayedMetrics 
              : JSON.parse(config.displayedMetrics);
          } catch (e) {
            console.error('❌ Erro ao processar displayedMetrics:', e.message);
            processedConfig.displayedMetrics = defaultConfig.displayedMetrics;
          }
        }
        
        if (config.chartTimeRange !== undefined) {
          processedConfig.chartTimeRange = config.chartTimeRange;
        }
        
        return processedConfig;
      } catch (error) {
        console.error('❌ Erro ao buscar configurações:', error.message);
        return {
          refreshInterval: 5000,
          displayedMetrics: ['users', 'revenue', 'cpu', 'response_time'],
          chartTimeRange: 60
        };
      }
    }
    
    // Configurações padrão para modo mock
    return {
      refreshInterval: 5000,
      displayedMetrics: ['users', 'revenue', 'cpu', 'response_time'],
      chartTimeRange: 60
    };
  }

  // Atualizar configurações do dashboard
  async updateDashboardConfig(config) {
    if (this.useDatabaseMode) {
      try {
        // Salvar cada configuração individualmente
        if (config.refreshInterval !== undefined) {
          await this.database.updateDashboardConfig('refreshInterval', config.refreshInterval);
        }
        
        if (config.displayedMetrics !== undefined) {
          await this.database.updateDashboardConfig('displayedMetrics', JSON.stringify(config.displayedMetrics));
        }
        
        if (config.chartTimeRange !== undefined) {
          await this.database.updateDashboardConfig('chartTimeRange', config.chartTimeRange);
        }
        
        // Retornar configurações atualizadas
        return await this.getDashboardConfig();
      } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error.message);
        throw error;
      }
    }
    
    // Em modo mock, apenas retornar as configurações (não persiste)
    return config;
  }
}

module.exports = { MetricsPublisher };
