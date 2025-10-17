#!/bin/bash

# AssetFlow Deployment Script
# Server: 167.235.58.24

set -e

echo "=========================================="
echo "AssetFlow Deployment Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to project directory
cd /var/www/assetflow

echo -e "${BLUE}[1/6] Stopping existing containers...${NC}"
docker compose down || true

echo -e "${BLUE}[2/6] Building Docker images...${NC}"
docker compose build --no-cache

echo -e "${BLUE}[3/6] Creating necessary directories...${NC}"
mkdir -p database/data database/backups uploads logs

echo -e "${BLUE}[4/6] Starting services...${NC}"
docker compose up -d

echo -e "${BLUE}[5/6] Waiting for services to be healthy...${NC}"
sleep 10

echo -e "${BLUE}[6/6] Checking service status...${NC}"
docker compose ps

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Status"
echo "==========================================${NC}"

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API: Running${NC}"
else
    echo -e "${RED}✗ Backend API: Not responding${NC}"
fi

# Check frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend: Running${NC}"
else
    echo -e "${RED}✗ Frontend: Not responding${NC}"
fi

# Check MongoDB
if docker exec assetflow-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB: Running${NC}"
else
    echo -e "${RED}✗ MongoDB: Not responding${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Access URLs"
echo "==========================================${NC}"
echo -e "Frontend:    ${BLUE}http://167.235.58.24:3000${NC}"
echo -e "Backend API: ${BLUE}http://167.235.58.24:5000${NC}"
echo -e "Health Check: ${BLUE}http://167.235.58.24:5000/health${NC}"
echo ""
echo -e "${GREEN}Deployment completed!${NC}"
echo "=========================================="

# Show logs
echo ""
echo "Container logs (last 20 lines):"
docker compose logs --tail=20
