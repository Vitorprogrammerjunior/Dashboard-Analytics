-- =============================================
-- Dashboard Analítico - Schema MySQL
-- =============================================

-- Criar database (execute apenas uma vez)
CREATE DATABASE IF NOT EXISTS dashboard_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o database

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
    metadata JSON COMMENT 'Dados adicionais em JSON',
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
    config_value JSON NOT NULL,
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
    details JSON,
    source VARCHAR(100) COMMENT 'Fonte do evento (backend, frontend, etc.)',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type_timestamp (event_type, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- =============================================
-- Inserir tipos de métricas padrão
-- =============================================
INSERT INTO metric_types (name, display_name, description, unit, color, icon) VALUES
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
INSERT INTO dashboard_config (config_key, config_value, description) VALUES
('refresh_interval', '5000', 'Intervalo de atualização em milissegundos'),
('chart_time_range', '60', 'Intervalo de tempo dos gráficos em minutos'),
('displayed_metrics', '["users", "revenue", "cpu", "response_time"]', 'Métricas exibidas no dashboard'),
('retention_days', '30', 'Dias para manter dados históricos');

-- =============================================
-- Inserir dados de exemplo (opcional)
-- =============================================
INSERT INTO metrics (metric_type_id, value, timestamp) 
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
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) MINUTE) as timestamp
FROM metric_types mt
WHERE mt.is_active = TRUE;

-- =============================================
-- Stored Procedures úteis
-- =============================================

-- Procedure para inserir uma nova métrica
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS InsertMetric(
    IN p_metric_name VARCHAR(100),
    IN p_value DECIMAL(15,4),
    IN p_timestamp TIMESTAMP,
    IN p_metadata JSON
)
BEGIN
    DECLARE metric_type_id INT;
    
    -- Buscar ID do tipo de métrica
    SELECT id INTO metric_type_id 
    FROM metric_types 
    WHERE name = p_metric_name AND is_active = TRUE;
    
    IF metric_type_id IS NOT NULL THEN
        INSERT INTO metrics (metric_type_id, value, timestamp, metadata)
        VALUES (metric_type_id, p_value, IFNULL(p_timestamp, NOW()), p_metadata);
    END IF;
END//
DELIMITER ;

-- Procedure para buscar métricas recentes
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetRecentMetrics(
    IN p_minutes INT
)
BEGIN
    -- Usar valor padrão se não informado
    IF p_minutes IS NULL THEN
        SET p_minutes = 60;
    END IF;
    
    SELECT 
        mt.name,
        mt.display_name,
        mt.unit,
        mt.color,
        mt.icon,
        m.value,
        m.timestamp,
        m.metadata
    FROM metrics m
    JOIN metric_types mt ON m.metric_type_id = mt.id
    WHERE m.timestamp >= DATE_SUB(NOW(), INTERVAL p_minutes MINUTE)
        AND mt.is_active = TRUE
    ORDER BY mt.name, m.timestamp DESC;
END//
DELIMITER ;

-- Procedure para buscar último valor de cada métrica
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetLatestMetrics()
BEGIN
    SELECT 
        mt.name,
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
    WHERE mt.is_active = TRUE
    ORDER BY mt.name;
END//
DELIMITER ;

-- Procedure para limpeza de dados antigos
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanOldData(
    IN p_days INT
)
BEGIN
    -- Usar valor padrão se não informado
    IF p_days IS NULL THEN
        SET p_days = 30;
    END IF;
    
    DELETE FROM metrics 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL p_days DAY);
    
    DELETE FROM event_logs 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL p_days DAY);
    
    SELECT ROW_COUNT() as deleted_rows;
END//
DELIMITER ;

-- =============================================
-- Views úteis
-- =============================================

-- View para métricas com informações completas
CREATE VIEW IF NOT EXISTS v_metrics_full AS
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
CREATE VIEW IF NOT EXISTS v_latest_metrics AS
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
-- Triggers para logs
-- =============================================

-- Trigger para log de inserções de métricas
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_metric_insert
    AFTER INSERT ON metrics
    FOR EACH ROW
BEGIN
    INSERT INTO event_logs (event_type, message, details, source)
    VALUES ('INFO', 'Nova métrica inserida', 
            JSON_OBJECT('metric_id', NEW.id, 'value', NEW.value, 'timestamp', NEW.timestamp),
            'database');
END//
DELIMITER ;

-- =============================================
-- Índices para performance
-- =============================================

-- Índices adicionais para otimização
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp_desc ON metrics (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_value ON metrics (value);
CREATE INDEX IF NOT EXISTS idx_metric_types_name ON metric_types (name);
CREATE INDEX IF NOT EXISTS idx_event_logs_source ON event_logs (source);

-- =============================================
-- Grants para usuário da aplicação (opcional)
-- =============================================

-- Criar usuário específico para a aplicação
-- CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'senha_segura';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_analytics.* TO 'dashboard_user'@'localhost';
-- GRANT EXECUTE ON dashboard_analytics.* TO 'dashboard_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- Consultas de exemplo
-- =============================================

-- Buscar todas as métricas dos últimos 30 minutos
-- SELECT * FROM v_metrics_full WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 MINUTE);

-- Buscar últimas métricas
-- SELECT * FROM v_latest_metrics;

-- Buscar histórico de uma métrica específica
-- SELECT * FROM v_metrics_full WHERE metric_name = 'users' ORDER BY timestamp DESC LIMIT 100;

-- Buscar métricas por período
-- SELECT * FROM v_metrics_full 
-- WHERE timestamp BETWEEN '2025-07-09 00:00:00' AND '2025-07-09 23:59:59';

-- =============================================
-- Fim do Schema
-- =============================================
