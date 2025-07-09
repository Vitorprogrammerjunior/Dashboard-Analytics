@echo off
echo.
echo ========================================
echo  Dashboard Analitico - Setup MySQL
echo ========================================
echo.

echo Este script vai configurar o banco MySQL para o dashboard.
echo.
echo Antes de continuar, certifique-se de que:
echo  1. MySQL esta instalado e rodando
echo  2. Voce tem acesso root ao MySQL
echo  3. Voce sabe a senha do root
echo.
pause

echo.
echo Executando setup do banco de dados...
echo.

set /p mysql_password=Digite a senha do root do MySQL: 

echo.
echo Criando usuario e database...
mysql -u root -p%mysql_password% < database\setup.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao executar setup. Verifique:
    echo  - MySQL esta rodando?
    echo  - Senha do root esta correta?
    echo  - Arquivo setup.sql existe?
    pause
    exit /b 1
)

echo.
echo Criando schema e tabelas...
mysql -u dashboard_user -pdashboard_password_123 dashboard_analytics < database\schema.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao criar schema. Verifique o arquivo schema.sql
    pause
    exit /b 1
)

echo.
echo ✅ Setup do banco concluido com sucesso!
echo.
echo Próximos passos:
echo  1. cd backend
echo  2. npm run dev
echo.
echo Se tudo der certo, voce vera:
echo  ✅ Conexao com MySQL estabelecida
echo  🔌 Modo banco de dados ativado
echo.
pause
