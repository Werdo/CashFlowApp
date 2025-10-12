@echo off
REM ============================================
REM CashFlow v4.0 - Quick Deploy Script
REM Despliega cambios al servidor automáticamente
REM ============================================

echo.
echo ========================================
echo   CashFlow v4.0 - Quick Deploy
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist ".git" (
    echo ERROR: No estamos en un repositorio Git
    echo Ejecuta este script desde C:\Users\pedro\CashFlowApp\
    pause
    exit /b 1
)

echo [1/4] Committing changes...
git add .
git status

echo.
set /p commit_msg="Mensaje del commit (o Enter para 'Update'): "
if "%commit_msg%"=="" set commit_msg=Update

git commit -m "%commit_msg%"

echo.
echo [2/4] Pushing to GitHub...
git push

echo.
echo [3/4] Deploying to server...
ssh -i %USERPROFILE%\.ssh\hetzner_cashflow manager@91.98.113.188 "cd ~/cashflow && git pull && docker compose -f docker-compose-simple.yml up -d --build"

echo.
echo [4/4] Checking server status...
ssh -i %USERPROFILE%\.ssh\hetzner_cashflow manager@91.98.113.188 "~/monitor-cashflow.sh"

echo.
echo ========================================
echo   Deploy Complete!
echo ========================================
echo.
echo Application: http://91.98.113.188
echo.

pause
