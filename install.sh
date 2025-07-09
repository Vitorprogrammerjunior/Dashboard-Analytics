#!/bin/bash

# =============================================
# Script de Instalação do Dashboard Analítico
# =============================================

echo "🚀 Instalando Dashboard Analítico..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se o MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não encontrado. Instale o MySQL primeiro."
    exit 1
fi

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

# Voltar para o diretório raiz
cd ..

# Configurar banco de dados
echo "🗃️  Configurando banco de dados..."
read -p "Digite o usuário MySQL (padrão: root): " mysql_user
mysql_user=${mysql_user:-root}

read -s -p "Digite a senha do MySQL: " mysql_password
echo

# Executar scripts de setup
echo "🔧 Executando scripts de configuração..."
mysql -u $mysql_user -p$mysql_password < database/setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Setup do banco executado com sucesso!"
else
    echo "❌ Erro no setup do banco. Verifique suas credenciais."
    exit 1
fi

# Executar schema
echo "📊 Criando schema do banco..."
mysql -u dashboard_user -pdashboard_password_123 dashboard_analytics < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema criado com sucesso!"
else
    echo "❌ Erro ao criar schema."
    exit 1
fi

# Criar arquivos .env
echo "⚙️  Configurando arquivos de ambiente..."

# Backend .env
cat > backend/.env << EOL
PORT=4000
DATABASE_URL=mysql://dashboard_user:dashboard_password_123@localhost:3306/dashboard_analytics
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
EOL

# Frontend .env.local
cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:4000
EOL

echo "✅ Arquivos .env criados!"

# Instruções finais
echo ""
echo "🎉 Instalação concluída com sucesso!"
echo ""
echo "Para executar o projeto:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Ou use o script de inicialização:"
echo "Windows: start.bat"
echo "Linux/Mac: ./start.sh"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
