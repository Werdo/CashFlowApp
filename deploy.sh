#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║      🚀 Desplegando CashFlow v2.0                 ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env no encontrado, copiando desde .env.example${NC}"
    cp .env.example .env
fi

echo -e "${GREEN}📦 Deteniendo servicios existentes...${NC}"
docker-compose down

echo -e "${GREEN}🏗️  Construyendo imágenes...${NC}"
docker-compose build --no-cache

echo -e "${GREEN}🚀 Levantando servicios...${NC}"
docker-compose up -d

echo -e "${GREEN}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 15

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          ✅ DESPLIEGUE COMPLETADO                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Servicios disponibles:${NC}"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   MongoDB:   localhost:27017"
echo ""
echo -e "${GREEN}📝 Comandos útiles:${NC}"
echo "   Ver logs:       docker-compose logs -f"
echo "   Detener:        docker-compose down"
echo "   Reiniciar:      docker-compose restart"
echo "   Estado:         docker-compose ps"
echo ""
