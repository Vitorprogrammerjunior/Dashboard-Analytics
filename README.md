# 📊 Dashboard Analítico em Tempo Real

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js Version](https://img.shields.io/badge/Next.js-15-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

Sistema completo de dashboard analítico com atualizações em tempo real usando Next.js no frontend e Node.js + Express + Socket.io no backend.

![Dashboard Preview](docs/images/dashboard-preview.png)

## ✨ Funcionalidades

- 📈 **Métricas em Tempo Real** - Visualização instantânea de dados
- 🎨 **Interface Moderna** - Design limpo e responsivo com Tailwind CSS
- 📊 **Múltiplos Gráficos** - Linhas, áreas e gráficos minimalistas
- ⚙️ **Configurável** - Personalize cores, intervalos e métricas
- 🔄 **Socket.io** - Comunicação bidirecional em tempo real
- 🗄️ **MySQL** - Banco de dados robusto e escalável
- 📱 **Responsivo** - Funciona perfeitamente em mobile e desktop
- 🚀 **Performance** - Otimizado para alta performance

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

## 🚀 Início Rápido

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (versão 8.0 ou superior)
- [Git](https://git-scm.com/)

### Instalação Automática

**Windows:**
```powershell
# Clone o repositório
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico

# Execute o script de instalação
.\install.ps1
```

**Linux/macOS:**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico

# Execute o script de instalação
chmod +x install.sh
./install.sh
```

### Instalação Manual

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico
```

2. **Instale as dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edite frontend/.env.local com suas configurações
```

4. **Configure o banco de dados**
```bash
# Windows
.\setup-mysql.bat

# Linux/macOS
./setup-mysql.sh
```

5. **Inicie o projeto**
```bash
# Método 1: Script automático
.\start.bat  # Windows
./start.sh   # Linux/macOS

# Método 2: Manual
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Configurações**: http://localhost:3000/settings

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

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir.

### Passos Rápidos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela framework incrível
- [Socket.io](https://socket.io/) pela comunicação em tempo real
- [Recharts](https://recharts.org/) pelos gráficos belíssimos
- [Tailwind CSS](https://tailwindcss.com/) pelo styling moderno
- [Lucide](https://lucide.dev/) pelos ícones elegantes

## 📞 Suporte

Se você tiver problemas ou perguntas:

1. Verifique a [documentação](README.md)
2. Procure em [Issues existentes](https://github.com/seu-usuario/Dashboard-Analitico/issues)
3. Abra uma [nova issue](https://github.com/seu-usuario/Dashboard-Analitico/issues/new)

## 🗺️ Roadmap

- [ ] Autenticação de usuários
- [ ] Testes automatizados
- [ ] Docker containerization
- [ ] Múltiplos dashboards
- [ ] Alertas e notificações
- [ ] Exportação de dados
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)

Veja o [CHANGELOG.md](CHANGELOG.md) para histórico de versões.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/seu-usuario">Seu Nome</a>
</p>
