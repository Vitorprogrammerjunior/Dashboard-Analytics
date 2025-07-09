-- =============================================
-- Dashboard Analítico - Schema MySQL Simplificado
-- Versão compatível com MySQL 5.7+
-- =============================================

-- Usar o database (certifique-se de que já foi criado)
USE dashboard_analytics;

-- =============================================
-- Tabela para armazenar tipos de métricas
-- =============================================
CREATE TABLE IF NOT EXISTS metric_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome da métrica (users, revenue, cpu, etc.)',
    display_name VARCHAR(200) NOT NULL COMMENT 'Nome para exibição',
    description TEXT COMMENT 'Descrição da métrica',
    unit VARCHAR(50) COMMENT 'Unidade de medida (%, R$, ms, etc.)',
    color VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Cor em hexadecimal',
    icon VARCHAR(50) COMMENT 'Nome do ícone',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Se a métrica está ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Tabela para armazenar valores das métricas
-- =============================================
CREATE TABLE IF NOT EXISTS metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_type_id INT NOT NULL,
    value DECIMAL(15,4) NOT NULL COMMENT 'Valor da métrica',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp da medição',
    metadata TEXT COMMENT 'Dados adicionais em JSON (texto para compatibilidade)',
    INDEX idx_metric_type_timestamp (metric_type_id, timestamp),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (metric_type_id) REFERENCES metric_types(id) ON DELETE CASCADE
);

-- =============================================
-- Tabela para configurações do dashboard
-- =============================================
CREATE TABLE IF NOT EXISTS dashboard_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL COMMENT 'JSON como texto para compatibilidade',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Tabela para log de eventos/erros
-- =============================================
CREATE TABLE IF NOT EXISTS event_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('INFO', 'WARNING', 'ERROR', 'DEBUG') DEFAULT 'INFO',
    message TEXT NOT NULL,
    details TEXT COMMENT 'JSON como texto para compatibilidade',
    source VARCHAR(100) COMMENT 'Fonte do evento (backend, frontend, etc.)',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type_timestamp (event_type, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- =============================================
-- Inserir tipos de métricas padrão
-- =============================================
INSERT IGNORE INTO metric_types (name, display_name, description, unit, color, icon) VALUES
('users', 'Usuários Ativos', 'Número de usuários conectados no momento', 'usuários', '#3B82F6', 'users'),
('revenue', 'Receita', 'Receita total acumulada', 'R$', '#10B981', 'dollar-sign'),
('cpu', 'CPU', 'Uso de CPU do servidor', '%', '#F59E0B', 'server'),
('response_time', 'Tempo de Resposta', 'Tempo médio de resposta das requisições', 'ms', '#EF4444', 'clock'),
('conversion', 'Taxa de Conversão', 'Percentual de conversões', '%', '#8B5CF6', 'trending-up'),
('traffic', 'Tráfego', 'Número de visitantes únicos', 'visitas', '#06B6D4', 'activity'),
('errors', 'Erros', 'Número de erros do sistema', 'erros', '#DC2626', 'alert-triangle'),
('memory', 'Memória', 'Uso de memória do servidor', '%', '#059669', 'hard-drive');

-- =============================================
-- Inserir configurações padrão
-- =============================================
INSERT IGNORE INTO dashboard_config (config_key, config_value, description) VALUES
('refresh_interval', '5000', 'Intervalo de atualização em milissegundos'),
('chart_time_range', '60', 'Intervalo de tempo dos gráficos em minutos'),
('displayed_metrics', '["users", "revenue", "cpu", "response_time"]', 'Métricas exibidas no dashboard'),
('retention_days', '30', 'Dias para manter dados históricos');

-- =============================================
-- Views úteis
-- =============================================

-- View para métricas com informações completas
CREATE OR REPLACE VIEW v_metrics_full AS
SELECT 
    m.id,
    mt.name as metric_name,
    mt.display_name,
    mt.description,
    mt.unit,
    mt.color,
    mt.icon,
    m.value,
    m.timestamp,
    m.metadata
FROM metrics m
JOIN metric_types mt ON m.metric_type_id = mt.id
WHERE mt.is_active = TRUE;

-- View para últimas métricas
CREATE OR REPLACE VIEW v_latest_metrics AS
SELECT 
    mt.name as metric_name,
    mt.display_name,
    mt.unit,
    mt.color,
    mt.icon,
    m.value,
    m.timestamp,
    m.metadata
FROM metrics m
JOIN metric_types mt ON m.metric_type_id = mt.id
JOIN (
    SELECT metric_type_id, MAX(timestamp) as latest_timestamp
    FROM metrics
    GROUP BY metric_type_id
) latest ON m.metric_type_id = latest.metric_type_id 
    AND m.timestamp = latest.latest_timestamp
WHERE mt.is_active = TRUE;

-- =============================================
-- Inserir dados de exemplo para teste
-- =============================================

-- Gerar dados de exemplo para as últimas 2 horas
INSERT IGNORE INTO metrics (metric_type_id, value, timestamp) 
SELECT 
    mt.id,
    CASE 
        WHEN mt.name = 'users' THEN FLOOR(RAND() * 200) + 1200
        WHEN mt.name = 'revenue' THEN FLOOR(RAND() * 5000) + 45000
        WHEN mt.name = 'cpu' THEN FLOOR(RAND() * 40) + 50
        WHEN mt.name = 'response_time' THEN FLOOR(RAND() * 200) + 200
        WHEN mt.name = 'conversion' THEN ROUND((RAND() * 2 + 2.5), 2)
        WHEN mt.name = 'traffic' THEN FLOOR(RAND() * 1000) + 8000
        WHEN mt.name = 'errors' THEN FLOOR(RAND() * 20) + 5
        WHEN mt.name = 'memory' THEN FLOOR(RAND() * 30) + 70
    END as value,
    DATE_SUB(NOW(), INTERVAL minutes.minute_offset MINUTE) as timestamp
FROM metric_types mt
CROSS JOIN (
    SELECT 0 as minute_offset UNION SELECT 5 UNION SELECT 10 UNION SELECT 15 UNION SELECT 20 UNION
    SELECT 25 UNION SELECT 30 UNION SELECT 35 UNION SELECT 40 UNION SELECT 45 UNION
    SELECT 50 UNION SELECT 55 UNION SELECT 60 UNION SELECT 65 UNION SELECT 70 UNION
    SELECT 75 UNION SELECT 80 UNION SELECT 85 UNION SELECT 90 UNION SELECT 95 UNION
    SELECT 100 UNION SELECT 105 UNION SELECT 110 UNION SELECT 115 UNION SELECT 120
) minutes
WHERE mt.is_active = TRUE;

-- =============================================
-- Verificações finais
-- =============================================

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas:' as status;
SHOW TABLES;

-- Verificar se há dados
SELECT 'Dados inseridos:' as status;
SELECT 
    'metric_types' as tabela, 
    COUNT(*) as total_registros 
FROM metric_types
UNION ALL
SELECT 
    'metrics' as tabela, 
    COUNT(*) as total_registros 
FROM metrics
UNION ALL
SELECT 
    'dashboard_config' as tabela, 
    COUNT(*) as total_registros 
FROM dashboard_config;

-- =============================================
-- Queries úteis para testar
-- =============================================

-- Buscar todas as métricas recentes
-- SELECT * FROM v_metrics_full WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) ORDER BY timestamp DESC;

-- Buscar últimas métricas
-- SELECT * FROM v_latest_metrics;

-- Buscar histórico de uma métrica específica
-- SELECT * FROM v_metrics_full WHERE metric_name = 'users' ORDER BY timestamp DESC LIMIT 100;

-- =============================================
-- Schema criado com sucesso!
-- =============================================
SELECT 'Schema MySQL criado com sucesso!' as resultado;
SELECT 'Próximo passo: iniciar o backend' as proximo_passo;
