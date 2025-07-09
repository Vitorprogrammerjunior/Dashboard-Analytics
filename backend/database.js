const mysql = require('mysql2/promise');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  // Inicializar conexão com o banco
  async initialize() {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL não configurada');
      }

      // Criar pool de conexões
      this.pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4'
      });

      // Testar conexão
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.isConnected = true;
      console.log('✅ Conexão com MySQL estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com MySQL:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  // Executar query
  async query(sql, params = []) {
    if (!this.isConnected || !this.pool) {
      throw new Error('Banco de dados não conectado');
    }

    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Erro na query:', error.message);
      throw error;
    }
  }

  // Buscar últimas métricas
  async getLatestMetrics() {
    const sql = `
      SELECT 
        mt.name,
        mt.display_name,
        mt.unit,
        mt.color,
        mt.icon,
        m.value,
        UNIX_TIMESTAMP(m.timestamp) * 1000 as timestamp,
        m.metadata
      FROM metrics m
      JOIN metric_types mt ON m.metric_type_id = mt.id
      JOIN (
        SELECT metric_type_id, MAX(timestamp) as latest_timestamp
        FROM metrics
        GROUP BY metric_type_id
      ) latest ON m.metric_type_id = latest.metric_type_id 
        AND m.timestamp = latest.latest_timestamp
      WHERE mt.is_active = TRUE
      ORDER BY mt.name
    `;

    return await this.query(sql);
  }

  // Buscar histórico de métricas
  async getMetricsHistory(metricName, minutes = 60) {
    const sql = `
      SELECT 
        m.value,
        UNIX_TIMESTAMP(m.timestamp) * 1000 as timestamp
      FROM metrics m
      JOIN metric_types mt ON m.metric_type_id = mt.id
      WHERE mt.name = ? 
        AND mt.is_active = TRUE
        AND m.timestamp >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
      ORDER BY m.timestamp ASC
    `;

    return await this.query(sql, [metricName, minutes]);
  }

  // Buscar métricas com histórico
  async getMetricsWithHistory(minutes = 60) {
    try {
      const metrics = {};
      
      // Buscar todas as métricas ativas
      const metricTypes = await this.query(`
        SELECT name, display_name, unit, color, icon
        FROM metric_types 
        WHERE is_active = TRUE
      `);

      // Para cada tipo de métrica, buscar o último valor e histórico
      for (const metricType of metricTypes) {
        // Último valor
        const latestValue = await this.query(`
          SELECT 
            value,
            UNIX_TIMESTAMP(timestamp) * 1000 as timestamp,
            metadata
          FROM metrics m
          JOIN metric_types mt ON m.metric_type_id = mt.id
          WHERE mt.name = ?
          ORDER BY m.timestamp DESC
          LIMIT 1
        `, [metricType.name]);

        // Histórico
        const history = await this.getMetricsHistory(metricType.name, minutes);

        if (latestValue.length > 0) {
          metrics[metricType.display_name] = {
            name: metricType.display_name,
            value: parseFloat(latestValue[0].value),
            unit: metricType.unit,
            color: metricType.color,
            icon: metricType.icon,
            timestamp: latestValue[0].timestamp,
            history: history.map(h => ({
              timestamp: h.timestamp,
              value: parseFloat(h.value)
            }))
          };
        }
      }

      return metrics;
    } catch (error) {
      console.error('❌ Erro ao buscar métricas com histórico:', error);
      throw error;
    }
  }

  // Inserir nova métrica
  async insertMetric(metricName, value, timestamp = null, metadata = null) {
    const sql = `
      INSERT INTO metrics (metric_type_id, value, timestamp, metadata)
      SELECT id, ?, IFNULL(?, NOW()), ?
      FROM metric_types
      WHERE name = ? AND is_active = TRUE
    `;

    const params = [
      value,
      timestamp ? new Date(timestamp) : null,
      metadata ? JSON.stringify(metadata) : null,
      metricName
    ];

    return await this.query(sql, params);
  }

  // Inserir múltiplas métricas
  async insertMultipleMetrics(metricsData) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const metric of metricsData) {
        const sql = `
          INSERT INTO metrics (metric_type_id, value, timestamp, metadata)
          SELECT id, ?, IFNULL(?, NOW()), ?
          FROM metric_types
          WHERE name = ? AND is_active = TRUE
        `;

        const params = [
          metric.value,
          metric.timestamp ? new Date(metric.timestamp) : null,
          metric.metadata ? JSON.stringify(metric.metadata) : null,
          metric.name
        ];

        await connection.execute(sql, params);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Buscar configuração do dashboard
  async getDashboardConfig() {
    const sql = `
      SELECT config_key, config_value
      FROM dashboard_config
    `;

    const results = await this.query(sql);
    const config = {};
    
    results.forEach(row => {
      try {
        config[row.config_key] = JSON.parse(row.config_value);
      } catch (e) {
        config[row.config_key] = row.config_value;
      }
    });

    return config;
  }

  // Atualizar configuração
  async updateDashboardConfig(key, value) {
    const sql = `
      INSERT INTO dashboard_config (config_key, config_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE 
        config_value = VALUES(config_value),
        updated_at = CURRENT_TIMESTAMP
    `;

    return await this.query(sql, [key, JSON.stringify(value)]);
  }

  // Limpar dados antigos
  async cleanOldData(days = 30) {
    const sql = `
      DELETE FROM metrics 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const result = await this.query(sql, [days]);
    console.log(`🗑️ Limpeza: ${result.affectedRows} registros removidos`);
    return result.affectedRows;
  }

  // Inserir log de evento
  async insertEventLog(type, message, details = null, source = 'backend') {
    const sql = `
      INSERT INTO event_logs (event_type, message, details, source)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      type,
      message,
      details ? JSON.stringify(details) : null,
      source
    ];

    return await this.query(sql, params);
  }

  // Buscar estatísticas
  async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_metrics,
        COUNT(DISTINCT metric_type_id) as active_metric_types,
        MIN(timestamp) as oldest_data,
        MAX(timestamp) as newest_data
      FROM metrics m
      JOIN metric_types mt ON m.metric_type_id = mt.id
      WHERE mt.is_active = TRUE
    `;

    const result = await this.query(sql);
    return result[0] || {};
  }

  // Fechar conexão
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 Conexão MySQL fechada');
    }
  }

  // Verificar saúde da conexão
  async healthCheck() {
    try {
      if (!this.pool) return false;
      
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error.message);
      return false;
    }
  }
}

module.exports = { DatabaseManager };
