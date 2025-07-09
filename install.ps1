# =============================================
# Script de Instalação do Dashboard Analítico (Windows)
# =============================================

Write-Host "🚀 Instalando Dashboard Analítico..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Write-Host "📥 Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado." -ForegroundColor Red
    exit 1
}

# Verificar se o MySQL está instalado (opcional)
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL encontrado: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ MySQL não encontrado. Você pode instalar posteriormente." -ForegroundColor Yellow
    Write-Host "📥 Download: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan

# Instalar dependências do backend
Write-Host "🔧 Instalando dependências do backend..." -ForegroundColor Blue
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend." -ForegroundColor Red
    exit 1
}
Set-Location ".."
Write-Host "✅ Dependências do backend instaladas!" -ForegroundColor Green

# Instalar dependências do frontend
Write-Host "🔧 Instalando dependências do frontend..." -ForegroundColor Blue
Set-Location "frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend." -ForegroundColor Red
    exit 1
}
Set-Location ".."
Write-Host "✅ Dependências do frontend instaladas!" -ForegroundColor Green

# Copiar arquivos de configuração
Write-Host ""
Write-Host "⚙️ Configurando arquivos de ambiente..." -ForegroundColor Cyan

# Copiar .env.example para .env no backend
if (Test-Path "backend\.env.example") {
    if (!(Test-Path "backend\.env")) {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ Arquivo backend\.env criado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Arquivo backend\.env já existe." -ForegroundColor Yellow
    }
}

# Copiar .env.local.example para .env.local no frontend
if (Test-Path "frontend\.env.local.example") {
    if (!(Test-Path "frontend\.env.local")) {
        Copy-Item "frontend\.env.local.example" "frontend\.env.local"
        Write-Host "✅ Arquivo frontend\.env.local criado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Arquivo frontend\.env.local já existe." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure seu banco de dados MySQL" -ForegroundColor White
Write-Host "2. Edite o arquivo backend\.env com suas configurações" -ForegroundColor White
Write-Host "3. Execute o script de configuração do banco: .\setup-mysql.bat" -ForegroundColor White
Write-Host "4. Inicie o projeto: .\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Comandos úteis:" -ForegroundColor Cyan
Write-Host "• Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "• Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "• Ambos: .\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação: README.md" -ForegroundColor Yellow
Write-Host "🐛 Reportar problemas: https://github.com/seu-usuario/Dashboard-Analitico/issues" -ForegroundColor Yellow
