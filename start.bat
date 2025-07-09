@echo off
echo.
echo ========================================
echo  Dashboard Analitico - Startup Script
echo ========================================
echo.

echo Iniciando Backend...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

echo.
echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo  Servidores iniciados com sucesso!
echo.
echo  Backend:  http://localhost:4000
echo  Frontend: http://localhost:3000
echo ========================================
echo.

pause
