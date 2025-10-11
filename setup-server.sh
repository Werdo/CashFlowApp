#!/bin/bash
# ============================================
# CashFlow v4.0 - Server Setup Script
# Prepares Ubuntu 24.04 server for deployment
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CashFlow v4.0 - Server Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Update system
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y
echo -e "${GREEN}✓ System updated${NC}"

# Install required packages
echo -e "${YELLOW}[2/7] Installing required packages...${NC}"
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban
echo -e "${GREEN}✓ Packages installed${NC}"

# Install Docker
echo -e "${YELLOW}[3/7] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}[4/7] Installing Docker Compose...${NC}"
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Configure firewall
echo -e "${YELLOW}[5/7] Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${GREEN}✓ Firewall configured${NC}"

# Configure fail2ban
echo -e "${YELLOW}[6/7] Configuring fail2ban...${NC}"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
echo -e "${GREEN}✓ Fail2ban configured${NC}"

# Create application directory
echo -e "${YELLOW}[7/7] Creating application directory...${NC}"
mkdir -p ~/cashflow
echo -e "${GREEN}✓ Directory created${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Server Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Docker version:"
docker --version
docker compose version
echo ""
echo "Firewall status:"
sudo ufw status
echo ""
echo -e "${YELLOW}IMPORTANT: Log out and back in for Docker group changes to take effect${NC}"
echo ""
echo "Next steps:"
echo "1. Log out and back in"
echo "2. Clone the repository: cd ~/cashflow && git clone <repo-url> ."
echo "3. Copy .env.example to .env and configure"
echo "4. Run: ./deploy.sh"
echo ""
