@echo off
REM ============================================
REM CashFlow v4.0 - Docker Startup Script
REM For Docker Desktop on Windows
REM ============================================

echo.
echo ========================================================
echo   CashFlow v4.0 - Docker Deployment
echo   Starting all services...
echo ========================================================
echo.

REM Check if Docker Desktop is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Docker Desktop is running...

REM Load environment variables
if exist .env.docker (
    echo [2/5] Loading environment variables from .env.docker...
    for /f "tokens=*" %%a in (.env.docker) do set %%a
) else (
    echo [WARNING] .env.docker not found, using defaults...
)

REM Stop any existing containers
echo [3/5] Stopping existing containers...
docker-compose down 2>nul

REM Build and start containers
echo [4/5] Building and starting containers...
echo This may take a few minutes on first run...
echo.
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start containers!
    echo Check the logs above for errors.
    pause
    exit /b 1
)

echo.
echo [5/5] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Show container status
echo.
echo ========================================================
echo   Container Status
echo ========================================================
docker-compose ps

echo.
echo ========================================================
echo   CashFlow v4.0 is now running!
echo ========================================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000/api
echo   MongoDB:   localhost:27017
echo.
echo ========================================================
echo   Useful Commands:
echo ========================================================
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose down
echo   Restart:          docker-compose restart
echo   Shell (backend):  docker exec -it cashflow-backend sh
echo   Shell (MongoDB):  docker exec -it cashflow-mongodb mongosh
echo.
echo ========================================================

pause
