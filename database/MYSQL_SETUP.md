# 🗃️ Guia de Configuração MySQL

## Pré-requisitos

1. **MySQL instalado** em sua máquina
2. **Acesso root** ao MySQL
3. **MySQL rodando** na porta 3306 (padrão)

## Passo 1: Configurar o Banco de Dados

### Opção A: Usando MySQL Workbench (Recomendado)

1. Abra o MySQL Workbench
2. Conecte como `root`
3. Abra o arquivo `database/setup.sql`
4. Execute o script completo
5. **IMPORTANTE**: Use o arquivo simplificado:
   - Abra o arquivo `database/schema_simple.sql`
   - Execute o script completo (é mais compatível)

### Opção B: Usando linha de comando

```bash
# 1. Conectar ao MySQL como root
mysql -u root -p

# 2. Executar setup (dentro do MySQL)
source database/setup.sql

# 3. Executar schema simplificado
source database/schema_simple.sql

# 4. Sair do MySQL
exit
```

### Opção C: Executar arquivos diretamente

```bash
# No diretório raiz do projeto
mysql -u root -p < database/setup.sql
mysql -u dashboard_user -pdashboard_password_123 dashboard_analytics < database/schema_simple.sql
```

## Passo 2: Verificar a Conexão

```sql
-- Conectar com o usuário criado
mysql -u dashboard_user -pdashboard_password_123 dashboard_analytics

-- Verificar se as tabelas foram criadas
SHOW TABLES;

-- Verificar se há dados de exemplo
SELECT * FROM metric_types;
SELECT COUNT(*) FROM metrics;
```

## Passo 3: Configurar o Backend

O arquivo `backend/.env` já está configurado com:

```env
PORT=4000
DATABASE_URL=mysql://dashboard_user:dashboard_password_123@localhost:3306/dashboard_analytics
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Passo 4: Testar a Conexão

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Procure por estas mensagens:**
   ```
   ✅ Conexão com MySQL estabelecida
   🔌 Modo banco de dados ativado
   🌱 Inserindo dados mock iniciais...
   ✅ 248 métricas mock inseridas
   ```

3. **Se aparecer erro, verifique:**
   - MySQL está rodando?
   - Usuário e senha estão corretos?
   - Database existe?
   - Permissões estão corretas?

## Estrutura do Banco Criado

- **`metric_types`**: Tipos de métricas (users, revenue, cpu, etc.)
- **`metrics`**: Valores das métricas com timestamp
- **`dashboard_config`**: Configurações do dashboard
- **`event_logs`**: Logs de eventos e erros

## Dados de Exemplo

O sistema criará automaticamente:
- 8 tipos de métricas
- Dados históricos dos últimos 30 minutos
- Configurações padrão do dashboard

## Troubleshooting

### Erro: "Access denied"
```sql
-- Verificar usuário
SELECT User, Host FROM mysql.user WHERE User = 'dashboard_user';

-- Recriar usuário se necessário
DROP USER 'dashboard_user'@'localhost';
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'dashboard_password_123';
GRANT ALL PRIVILEGES ON dashboard_analytics.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
```

### Erro: "Database doesn't exist"
```sql
-- Criar database
CREATE DATABASE dashboard_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Erro: "Connection refused"
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql
# ou
brew services list | grep mysql
```

## Personalização

### Mudar senha do usuário
1. Altere no `database/setup.sql`
2. Altere no `backend/.env`
3. Execute novamente o setup

### Usar usuário root diretamente
```env
DATABASE_URL=mysql://root:sua_senha@localhost:3306/dashboard_analytics
```

### Conexão remota
```env
DATABASE_URL=mysql://usuario:senha@ip_servidor:3306/dashboard_analytics
```

## Comandos Úteis

```sql
-- Ver status das conexões
SHOW PROCESSLIST;

-- Ver tamanho do banco
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables 
WHERE table_schema = 'dashboard_analytics';

-- Limpar dados antigos
DELETE FROM metrics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Backup do banco
mysqldump -u dashboard_user -pdashboard_password_123 dashboard_analytics > backup.sql
```
