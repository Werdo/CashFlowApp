#!/bin/bash
# ============================================
# CashFlow v4.0 - Production Deployment Script
# For Ubuntu 24.04 Linux Server
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CashFlow v4.0 - Production Deploy${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check Docker installation
echo -e "${YELLOW}[1/6] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found! Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose not found! Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Stop existing containers
echo -e "${YELLOW}[2/6] Stopping existing containers...${NC}"
docker-compose down || true
echo -e "${GREEN}✓ Containers stopped${NC}"

# Pull latest images
echo -e "${YELLOW}[3/6] Pulling latest base images...${NC}"
docker pull mongo:7.0
docker pull nginx:alpine
echo -e "${GREEN}✓ Images pulled${NC}"

# Build application images
echo -e "${YELLOW}[4/6] Building application images...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Images built${NC}"

# Start services
echo -e "${YELLOW}[5/6] Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"

# Wait for services to be healthy
echo -e "${YELLOW}[6/6] Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Status${NC}"
echo -e "${GREEN}========================================${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Service URLs${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend:  ${GREEN}http://91.98.113.188${NC}"
echo -e "API:       ${GREEN}http://91.98.113.188/api${NC}"
echo -e "Health:    ${GREEN}http://91.98.113.188/health${NC}"
echo ""

# Check health
echo -e "${YELLOW}Checking health...${NC}"
sleep 5
curl -f http://localhost/health && echo -e "${GREEN}✓ Health check passed${NC}" || echo -e "${RED}✗ Health check failed${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  View status:      docker-compose ps"
echo "  Restart service:  docker-compose restart [service]"
echo "  Stop all:         docker-compose down"
echo ""
