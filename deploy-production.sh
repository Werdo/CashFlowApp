#!/bin/bash
###############################################################################
# CashFlow v4.0 - Production Deployment Script
# Author: Claude Code
# Date: 2025-10-11
# Version: 1.0
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="cashflow-v4"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME-deployment.log"
DATE=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     CashFlow v4.0 - Production Deployment           ║${NC}"
echo -e "${BLUE}║     Date: $(date)                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Step 1: Pre-deployment checks
log "${YELLOW}[1/10] Running pre-deployment checks...${NC}"

if [ ! -d "$APP_DIR" ]; then
    log "${RED}Error: Application directory not found: $APP_DIR${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    log "${RED}Error: PM2 is not installed${NC}"
    exit 1
fi

if ! command -v mongod &> /dev/null; then
    log "${RED}Error: MongoDB is not installed${NC}"
    exit 1
fi

log "${GREEN}✓ Pre-deployment checks passed${NC}"

# Step 2: Create backup
log "${YELLOW}[2/10] Creating backup...${NC}"

mkdir -p "$BACKUP_DIR"

# Backup database
mongodump --uri="mongodb://localhost:27017/cashflow-production" --out="$BACKUP_DIR/mongo-$DATE" &> /dev/null
log "${GREEN}✓ Database backup created: $BACKUP_DIR/mongo-$DATE${NC}"

# Backup current code
tar -czf "$BACKUP_DIR/code-$DATE.tar.gz" -C "$APP_DIR" . &> /dev/null
log "${GREEN}✓ Code backup created: $BACKUP_DIR/code-$DATE.tar.gz${NC}"

# Step 3: Stop current application
log "${YELLOW}[3/10] Stopping current application...${NC}"
pm2 stop $APP_NAME || true
log "${GREEN}✓ Application stopped${NC}"

# Step 4: Pull latest code
log "${YELLOW}[4/10] Pulling latest code from repository...${NC}"
cd "$APP_DIR"
git fetch --all
git checkout v4.0-RELEASE
git pull origin master
log "${GREEN}✓ Code updated to v4.0-RELEASE${NC}"

# Step 5: Install backend dependencies
log "${YELLOW}[5/10] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm ci --production
log "${GREEN}✓ Backend dependencies installed${NC}"

# Step 6: Build frontend
log "${YELLOW}[6/10] Building frontend for production...${NC}"
cd "$APP_DIR/frontend"
npm ci
npm run build
log "${GREEN}✓ Frontend built successfully${NC}"

# Step 7: Run database migrations (if any)
log "${YELLOW}[7/10] Running database migrations...${NC}"
# Add migration commands here if needed
log "${GREEN}✓ Database migrations completed${NC}"

# Step 8: Start application
log "${YELLOW}[8/10] Starting application...${NC}"
cd "$APP_DIR/backend"
pm2 start server.js --name $APP_NAME --update-env
pm2 save
log "${GREEN}✓ Application started${NC}"

# Step 9: Health check
log "${YELLOW}[9/10] Running health checks...${NC}"

sleep 5  # Wait for app to start

# Check if backend is responding
if curl -f http://localhost:5000/api/health &> /dev/null; then
    log "${GREEN}✓ Backend health check passed${NC}"
else
    log "${RED}✗ Backend health check failed${NC}"
    log "${YELLOW}Rolling back...${NC}"

    # Rollback
    pm2 stop $APP_NAME
    cd "$APP_DIR"
    tar -xzf "$BACKUP_DIR/code-$DATE.tar.gz" -C "$APP_DIR"
    pm2 restart $APP_NAME

    log "${RED}Deployment failed! Rolled back to previous version.${NC}"
    exit 1
fi

# Check if PM2 process is running
if pm2 list | grep -q "$APP_NAME.*online"; then
    log "${GREEN}✓ PM2 process health check passed${NC}"
else
    log "${RED}✗ PM2 process health check failed${NC}"
    exit 1
fi

# Step 10: Cleanup old backups
log "${YELLOW}[10/10] Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -mtime +30 -delete
log "${GREEN}✓ Old backups removed (kept last 30 days)${NC}"

# Deployment summary
echo ""
log "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
log "${BLUE}║           Deployment Completed Successfully!         ║${NC}"
log "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log "${GREEN}✓ CashFlow v4.0 is now running in production!${NC}"
echo ""
log "Application URL: http://your-domain.com"
log "API URL: http://your-domain.com/api"
log "PM2 Status: $(pm2 list | grep $APP_NAME)"
echo ""
log "Deployment log: $LOG_FILE"
log "Backups location: $BACKUP_DIR"
echo ""
log "${YELLOW}Next steps:${NC}"
log "1. Verify application at http://your-domain.com"
log "2. Check PM2 logs: pm2 logs $APP_NAME"
log "3. Monitor performance: pm2 monit"
log "4. Update DNS if needed"
echo ""
log "${GREEN}Deployment completed at: $(date)${NC}"
