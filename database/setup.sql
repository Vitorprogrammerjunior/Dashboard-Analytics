-- =============================================
-- Script de Configuração Rápida MySQL
-- =============================================

-- 1. Remover usuário se já existir e criar novo
DROP USER IF EXISTS 'dashboard_user'@'localhost';
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'dashboard_password_123';

-- 2. Criar database
CREATE DATABASE IF NOT EXISTS dashboard_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Dar permissões ao usuário
GRANT ALL PRIVILEGES ON dashboard_analytics.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;

-- 4. Usar o database
USE dashboard_analytics;

-- 5. Verificar se está tudo funcionando
SELECT 'Database criado com sucesso!' as status;
SELECT USER() as `current_user`;
SELECT DATABASE() as `current_database`;

-- =============================================
-- String de conexão para o .env:
-- DATABASE_URL=mysql://dashboard_user:dashboard_password_123@localhost:3306/dashboard_analytics
-- =============================================
