# Guia de Deploy

Este guia fornece instruções passo a passo para fazer o deploy do Dashboard Analítico em diferentes ambientes.

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- Git
- Acesso ao servidor/plataforma de deploy

## 🚀 Deploy em Produção

### 1. Preparação do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico

# Instale as dependências
npm run install:all

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. Configuração do Banco de Dados

```bash
# Crie o banco de dados
mysql -u root -p
CREATE DATABASE dashboard_analytics;
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON dashboard_analytics.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Execute o schema
mysql -u dashboard_user -p dashboard_analytics < database/schema.sql
```

### 3. Configuração das Variáveis de Ambiente

**Backend (.env)**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://dashboard_user:strong_password@localhost:3306/dashboard_analytics
CORS_ORIGIN=https://seudominio.com
JWT_SECRET=seu-jwt-secret-muito-forte
```

**Frontend (.env.local)**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_SOCKET_URL=https://api.seudominio.com
```

### 4. Build e Deploy

```bash
# Build do frontend
cd frontend
npm run build

# Teste o backend
cd ../backend
npm test

# Inicie em produção
npm run start
```

## 🐳 Deploy com Docker

### 1. Build das Imagens

```bash
# Build de todas as imagens
docker-compose build

# Ou build individual
docker build -t dashboard-backend ./backend
docker build -t dashboard-frontend ./frontend
```

### 2. Deploy com Docker Compose

```bash
# Produção
docker-compose up -d

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Verificação

```bash
# Verificar containers
docker-compose ps

# Logs
docker-compose logs backend
docker-compose logs frontend
```

## ☁️ Deploy em Cloud

### Vercel (Frontend)

1. **Preparação**
```bash
npm install -g vercel
cd frontend
```

2. **Deploy**
```bash
vercel --prod
```

3. **Variáveis de Ambiente**
- `NEXT_PUBLIC_API_URL`: URL da API
- `NEXT_PUBLIC_SOCKET_URL`: URL do Socket.io

### Railway (Backend)

1. **Preparação**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy**
```bash
cd backend
railway deploy
```

3. **Variáveis de Ambiente**
- `DATABASE_URL`: String de conexão MySQL
- `PORT`: Porta do servidor
- `NODE_ENV`: production
- `CORS_ORIGIN`: URL do frontend

### AWS EC2

1. **Preparação do Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar MySQL
sudo apt install mysql-server
```

2. **Deploy da Aplicação**
```bash
# Clone e configure
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico
npm run install:all

# Configure PM2
pm2 start backend/server.js --name dashboard-backend
pm2 start frontend/server.js --name dashboard-frontend
pm2 startup
pm2 save
```

3. **Configuração do Nginx**
```nginx
# /etc/nginx/sites-available/dashboard
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🔧 Configurações Avançadas

### SSL/TLS

```bash
# Certbot para Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Monitoramento

```bash
# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Logs
pm2 logs dashboard-backend
pm2 logs dashboard-frontend
```

### Backup Automático

```bash
# Script de backup do banco
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u dashboard_user -p dashboard_analytics > backup_$DATE.sql
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Porta em uso**
```bash
# Encontrar processo na porta
sudo lsof -i :4000
sudo kill -9 PID
```

2. **Permissões de arquivo**
```bash
# Corrigir permissões
chmod +x start.sh
chown -R $USER:$USER .
```

3. **Conexão com banco**
```bash
# Testar conexão
mysql -u dashboard_user -p -h localhost dashboard_analytics
```

### Logs de Debug

```bash
# Backend
cd backend
DEBUG=* npm run dev

# Frontend
cd frontend
npm run dev

# PM2
pm2 logs --lines 100
```

## 📊 Monitoramento de Produção

### Métricas Importantes

- CPU e memória
- Conexões de banco
- Tempo de resposta
- Conexões WebSocket
- Erros de aplicação

### Ferramentas Recomendadas

- PM2 Plus
- New Relic
- DataDog
- Grafana + Prometheus

## 🔄 CI/CD

### GitHub Actions

O projeto inclui uma pipeline completa em `.github/workflows/ci-cd.yml`:

1. Testes automatizados
2. Build das aplicações
3. Deploy automático
4. Notificações

### Webhooks

Configure webhooks para deploy automático:

```javascript
// Endpoint para webhook
app.post('/webhook', (req, res) => {
  if (req.body.ref === 'refs/heads/main') {
    exec('git pull && npm run build && pm2 restart all');
  }
  res.sendStatus(200);
});
```

## 📚 Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Express](https://expressjs.com/)
- [Documentação do Socket.io](https://socket.io/docs/)
- [Documentação do MySQL](https://dev.mysql.com/doc/)

## 🆘 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs de erro
2. Consulte a documentação
3. Abra uma issue no GitHub
4. Entre em contato com o suporte
