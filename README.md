# Dashboard Analítico em Tempo Real

Sistema completo de dashboard analítico com atualizações em tempo real usando Next.js no frontend e Node.js + Express + Socket.io no backend.

## 📁 Estrutura do Projeto

```
Dashboard-Análitico/
├── frontend/          # Next.js + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── app/       # Páginas da aplicação
│   │   ├── components/# Componentes React
│   │   ├── context/   # Context API (Socket)
│   │   ├── hooks/     # Custom hooks
│   │   └── types/     # Tipos TypeScript
│   └── ...
├── backend/           # Node.js + Express + Socket.io
│   ├── server.js      # Servidor principal
│   ├── metricsPublisher.js # Publicador de métricas
│   └── ...
└── README.md
```

## 🚀 Como Executar

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🔧 Configuração

### Backend (.env)

```env
PORT=4000
DATABASE_URL=<sua-string-de-conexão>
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📊 Funcionalidades

### Frontend

- **Dashboard Principal**: Visualização de métricas em tempo real
- **Cards de Métricas**: Componentes dinâmicos com tendências
- **Gráficos**: Histórico das métricas usando Recharts
- **Página de Configurações**: Personalização do dashboard
- **Status de Conexão**: Indicador de conectividade
- **Responsivo**: Design adaptável para diferentes telas

### Backend

- **API REST**: Endpoints para buscar métricas
- **Socket.io**: Comunicação em tempo real
- **Publicador de Métricas**: Sistema automático de publicação
- **CORS**: Configuração de segurança
- **Middleware**: Logging e tratamento de erros
- **Graceful Shutdown**: Encerramento elegante do servidor

## 🛠️ Tecnologias

### Frontend
- Next.js 15
- TypeScript
- TailwindCSS
- Socket.io Client
- Recharts
- Lucide React

### Backend
- Node.js
- Express
- Socket.io
- CORS
- dotenv

## 🔌 Conectando ao Banco de Dados

Para conectar ao seu banco de dados, edite o arquivo `backend/metricsPublisher.js`:

```javascript
async fetchMetricsFromDatabase() {
  // Substitua este código mock pela sua conexão real
  const client = new Client({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  await client.connect();
  const result = await client.query('SELECT * FROM metrics');
  await client.end();
  
  return result.rows;
}
```

## 📡 API Endpoints

- `GET /api/health` - Status do servidor
- `GET /api/metrics` - Buscar métricas iniciais
- `GET /api/metrics/status` - Status do publicador
- `POST /api/metrics/interval` - Configurar intervalo de publicação

## 🔄 Eventos Socket.io

### Cliente → Servidor
- `request:metrics` - Solicitar métricas atuais

### Servidor → Cliente
- `metric:update` - Atualização de métrica em tempo real

## 📈 Métricas Disponíveis

Por padrão, o sistema inclui estas métricas mock:

- **Usuários Ativos**: Número de usuários conectados
- **Receita**: Receita em tempo real
- **CPU**: Uso de CPU do servidor
- **Tempo de Resposta**: Tempo médio de resposta
- **Taxa de Conversão**: Porcentagem de conversões
- **Tráfego**: Visitantes únicos
- **Erros**: Número de erros no sistema
- **Memória**: Uso de memória

## 🎨 Personalização

### Adicionando Novas Métricas

1. **Backend**: Adicione a métrica em `metricsPublisher.js`
2. **Frontend**: O sistema detectará automaticamente a nova métrica
3. **Configurações**: A métrica aparecerá na página de configurações

### Modificando Intervalos

- **Padrão**: 5 segundos
- **Configurável**: Via página de configurações ou API
- **Mínimo**: 1 segundo

## 🔐 Segurança

- CORS configurado para permitir apenas origins específicas
- Validação de entrada em todas as rotas
- Tratamento de erros centralizado
- Variáveis de ambiente para configurações sensíveis

## 🚀 Deploy

### Backend
1. Configure as variáveis de ambiente
2. Instale as dependências: `npm install`
3. Execute: `npm start`

### Frontend
1. Configure `NEXT_PUBLIC_API_URL`
2. Build: `npm run build`
3. Deploy: `npm start`

## 📝 Próximos Passos

1. **Conectar ao banco de dados real**
2. **Implementar autenticação**
3. **Adicionar testes**
4. **Configurar CI/CD**
5. **Adicionar métricas personalizadas**
6. **Implementar notificações**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.
