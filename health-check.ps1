# Script de Verificação de Saúde do Sistema
# Verifica se todos os componentes estão funcionando corretamente

Write-Host "🔍 Verificando Dashboard Analítico..." -ForegroundColor Green
Write-Host ""

$errors = @()
$warnings = @()

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    $errors += "❌ Node.js não encontrado"
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Blue
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    $errors += "❌ npm não encontrado"
}

# Verificar MySQL
Write-Host "Verificando MySQL..." -ForegroundColor Blue
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL: $mysqlVersion" -ForegroundColor Green
} catch {
    $warnings += "⚠️ MySQL não encontrado - necessário para produção"
}

# Verificar dependências do backend
Write-Host "Verificando dependências do backend..." -ForegroundColor Blue
if (Test-Path "backend/node_modules") {
    Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
} else {
    $errors += "❌ Dependências do backend não instaladas"
}

# Verificar dependências do frontend
Write-Host "Verificando dependências do frontend..." -ForegroundColor Blue
if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green
} else {
    $errors += "❌ Dependências do frontend não instaladas"
}

# Verificar arquivos de configuração
Write-Host "Verificando arquivos de configuração..." -ForegroundColor Blue

if (Test-Path "backend/.env") {
    Write-Host "✅ Arquivo backend/.env encontrado" -ForegroundColor Green
} else {
    $warnings += "⚠️ Arquivo backend/.env não encontrado"
}

if (Test-Path "frontend/.env.local") {
    Write-Host "✅ Arquivo frontend/.env.local encontrado" -ForegroundColor Green
} else {
    $warnings += "⚠️ Arquivo frontend/.env.local não encontrado"
}

# Verificar portas
Write-Host "Verificando portas..." -ForegroundColor Blue

$portTest3000 = Test-NetConnection -ComputerName "localhost" -Port 3000 -InformationLevel "Quiet" -WarningAction SilentlyContinue
$portTest4000 = Test-NetConnection -ComputerName "localhost" -Port 4000 -InformationLevel "Quiet" -WarningAction SilentlyContinue

if ($portTest3000) {
    Write-Host "⚠️ Porta 3000 em uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta 3000 disponível" -ForegroundColor Green
}

if ($portTest4000) {
    Write-Host "⚠️ Porta 4000 em uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta 4000 disponível" -ForegroundColor Green
}

# Verificar estrutura de arquivos
Write-Host "Verificando estrutura de arquivos..." -ForegroundColor Blue

$requiredFiles = @(
    "package.json",
    "README.md",
    "backend/package.json",
    "backend/server.js",
    "frontend/package.json",
    "frontend/src/app/page.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        $errors += "❌ $file não encontrado"
    }
}

# Verificar Git
Write-Host "Verificando Git..." -ForegroundColor Blue
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green

    if (Test-Path ".git") {
        Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
    } else {
        $warnings += "⚠️ Repositório Git não inicializado"
    }
} catch {
    $warnings += "⚠️ Git não encontrado"
}

# Relatório final
Write-Host ""
Write-Host "📊 Relatório Final:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "🎉 Todos os componentes críticos estão funcionando!" -ForegroundColor Green
} else {
    Write-Host "❌ Erros encontrados:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Avisos:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host "1. Corrija os erros listados acima" -ForegroundColor White
    Write-Host "2. Execute novamente este script" -ForegroundColor White
} else {
    Write-Host "1. Inicie o projeto: .\start.bat" -ForegroundColor White
    Write-Host "2. Acesse: http://localhost:3000" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Links úteis:" -ForegroundColor Cyan
Write-Host "• Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "• Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "• Configurações: http://localhost:3000/settings" -ForegroundColor White
Write-Host "• Documentação: README.md" -ForegroundColor White
