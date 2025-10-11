@echo off
REM ============================================
REM CashFlow v4.0 - Docker Stop Script
REM ============================================

echo.
echo ========================================================
echo   Stopping CashFlow v4.0 Services...
echo ========================================================
echo.

docker-compose down

echo.
echo ========================================================
echo   All services stopped!
echo ========================================================
echo.
echo To start again, run: start-docker.bat
echo.

pause
