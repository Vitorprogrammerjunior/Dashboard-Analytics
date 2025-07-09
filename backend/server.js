const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { MetricsPublisher } = require('./metricsPublisher');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configurar CORS
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar Socket.io
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Inicializar publisher de métricas
const metricsPublisher = new MetricsPublisher();

// Middleware para log de requisições
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await metricsPublisher.getInitialMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch metrics' 
    });
  }
});

app.get('/api/metrics/status', async (req, res) => {
  try {
    const status = metricsPublisher.getStatus();
    const dbStats = await metricsPublisher.getDatabaseStats();
    res.json({
      ...status,
      database: dbStats
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch status' 
    });
  }
});

app.post('/api/metrics/interval', async (req, res) => {
  const { interval } = req.body;
  
  if (!interval || typeof interval !== 'number' || interval < 1000) {
    return res.status(400).json({ 
      error: 'Invalid interval', 
      message: 'Interval must be a number >= 1000ms' 
    });
  }
  
  try {
    await metricsPublisher.setPublishInterval(interval);
    res.json({ 
      success: true, 
      interval: interval 
    });
  } catch (error) {
    console.error('Error setting interval:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to set interval' 
    });
  }
});

// Endpoints para configurações do dashboard
app.get('/api/config', async (req, res) => {
  try {
    const config = await metricsPublisher.getDashboardConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch config' 
    });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    console.log('📝 POST /api/config - Body received:', JSON.stringify(req.body, null, 2));
    
    const { refreshInterval, displayedMetrics, chartTimeRange } = req.body;
    
    // Validar dados
    if (refreshInterval !== undefined && (typeof refreshInterval !== 'number' || refreshInterval < 1000)) {
      console.log('❌ Invalid refreshInterval:', refreshInterval);
      return res.status(400).json({ 
        error: 'Invalid refreshInterval', 
        message: 'refreshInterval must be a number >= 1000ms' 
      });
    }
    
    if (displayedMetrics !== undefined && !Array.isArray(displayedMetrics)) {
      console.log('❌ Invalid displayedMetrics:', displayedMetrics);
      return res.status(400).json({ 
        error: 'Invalid displayedMetrics', 
        message: 'displayedMetrics must be an array' 
      });
    }
    
    if (chartTimeRange !== undefined && (typeof chartTimeRange !== 'number' || chartTimeRange < 5)) {
      console.log('❌ Invalid chartTimeRange:', chartTimeRange);
      return res.status(400).json({ 
        error: 'Invalid chartTimeRange', 
        message: 'chartTimeRange must be a number >= 5 minutes' 
      });
    }
    
    console.log('✅ Validation passed, saving config...');
    
    // Salvar configurações
    const savedConfig = await metricsPublisher.updateDashboardConfig(req.body);
    
    console.log('✅ Config saved:', savedConfig);
    
    // Aplicar configurações imediatamente
    if (refreshInterval) {
      console.log('🔄 Applying new refresh interval:', refreshInterval);
      await metricsPublisher.setPublishInterval(refreshInterval);
    }
    
    res.json({ 
      success: true, 
      config: savedConfig 
    });
  } catch (error) {
    console.error('❌ Error saving config:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to save config' 
    });
  }
});

// Configurar eventos do Socket.io
io.on('connection', async (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Enviar métricas iniciais para o cliente recém-conectado
  try {
    const initialMetrics = await metricsPublisher.getInitialMetrics();
    Object.values(initialMetrics).forEach(metric => {
      socket.emit('metric:update', metric);
    });
  } catch (error) {
    console.error('Error sending initial metrics:', error);
  }
  
  // Lidar com eventos customizados do cliente
  socket.on('request:metrics', async () => {
    console.log(`📊 Client ${socket.id} requested metrics`);
    try {
      const metrics = await metricsPublisher.getInitialMetrics();
      Object.values(metrics).forEach(metric => {
        socket.emit('metric:update', metric);
      });
    } catch (error) {
      console.error('Error sending requested metrics:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  console.log(`
🚀 Dashboard Analytics Server
📍 Port: ${PORT}
🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
🗃️  Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured'}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}
  `);
  
  // Iniciar publicação de métricas
  await metricsPublisher.startPublishing(io);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await metricsPublisher.stopPublishing();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await metricsPublisher.stopPublishing();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Lidar com exceções não tratadas
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server, io };
