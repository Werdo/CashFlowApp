#!/bin/bash
###############################################################################
# AssetFlow Server Setup Script
# Ubuntu 24.04 LTS
# Este script configura el servidor completo para AssetFlow
###############################################################################

set -e  # Exit on error

echo "========================================"
echo "AssetFlow Server Setup - Starting"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

###############################################################################
# 1. UPDATE SYSTEM
###############################################################################
echo "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_status "System updated"
echo ""

###############################################################################
# 2. INSTALL BASIC TOOLS
###############################################################################
echo "Step 2: Installing basic tools..."
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https

print_status "Basic tools installed"
echo ""

###############################################################################
# 3. INSTALL DOCKER
###############################################################################
echo "Step 3: Installing Docker..."

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

print_status "Docker installed"
echo ""

###############################################################################
# 4. INSTALL DOCKER COMPOSE (standalone)
###############################################################################
echo "Step 4: Installing Docker Compose standalone..."

# Install latest Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

print_status "Docker Compose installed"
echo ""

###############################################################################
# 5. INSTALL NODE.JS (Optional - for development)
###############################################################################
echo "Step 5: Installing Node.js 18..."

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

print_status "Node.js installed"
echo ""

###############################################################################
# 6. CONFIGURE FIREWALL (UFW)
###############################################################################
echo "Step 6: Configuring firewall..."

sudo apt install -y ufw

# Allow SSH (important!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Allow custom ports if needed
sudo ufw allow 3000/tcp comment 'React Dev Server'
sudo ufw allow 5000/tcp comment 'Backend API'

# Enable firewall (will ask for confirmation)
print_info "Enabling firewall..."
echo "y" | sudo ufw enable

print_status "Firewall configured"
echo ""

###############################################################################
# 7. CREATE PROJECT DIRECTORIES
###############################################################################
echo "Step 7: Creating project directories..."

# Create main project directory
sudo mkdir -p /var/www/assetflow
sudo chown -R $USER:$USER /var/www/assetflow

# Create subdirectories
mkdir -p /var/www/assetflow/logs
mkdir -p /var/www/assetflow/backups
mkdir -p /var/www/assetflow/uploads

print_status "Project directories created"
echo ""

###############################################################################
# 8. CONFIGURE SYSTEM SETTINGS
###############################################################################
echo "Step 8: Configuring system settings..."

# Increase file watchers (for development)
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure log rotation
sudo tee /etc/logrotate.d/assetflow > /dev/null <<EOF
/var/www/assetflow/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
}
EOF

print_status "System settings configured"
echo ""

###############################################################################
# 9. VERIFY INSTALLATIONS
###############################################################################
echo "Step 9: Verifying installations..."
echo ""

echo "Git version:"
git --version

echo ""
echo "Docker version:"
docker --version

echo ""
echo "Docker Compose version:"
docker-compose --version

echo ""
echo "Node.js version:"
node --version

echo ""
echo "NPM version:"
npm --version

echo ""
echo "Firewall status:"
sudo ufw status

echo ""
print_status "All verifications completed"
echo ""

###############################################################################
# 10. FINAL INFORMATION
###############################################################################
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
print_info "IMPORTANT: You need to log out and log back in for Docker group changes to take effect"
echo ""
echo "Next steps:"
echo "  1. Log out: exit"
echo "  2. Log back in: ssh admin@167.235.58.24"
echo "  3. Test Docker: docker run hello-world"
echo "  4. Clone AssetFlow repository"
echo "  5. Deploy with Docker Compose"
echo ""
echo "Project directory: /var/www/assetflow"
echo "Logs directory: /var/www/assetflow/logs"
echo "Backups directory: /var/www/assetflow/backups"
echo ""
print_status "Server is ready for AssetFlow deployment!"
echo ""
