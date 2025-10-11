# 🚀 CashFlow v4.0 - Production Deployment Guide

## 📋 Overview

This guide covers deploying CashFlow v4.0 to a bare-metal Ubuntu 24.04 server using Docker, Docker Compose, and Nginx as reverse proxy.

**Target Server:**
- IP: 91.98.113.188
- OS: Ubuntu 24.04
- SSH User: admin

---

## 🔧 Prerequisites

### On Your Local Machine
- Git installed
- SSH client
- GitHub account with access token

### On the Server
- Ubuntu 24.04 fresh installation
- Root or sudo access
- SSH access configured

---

## 📦 Step 1: Prepare the Server

SSH into your server:

```bash
ssh admin@91.98.113.188
```

Run the server setup script:

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/Werdo/CashFlowApp/main/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

Or manually set up the server:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Configure firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Log out and back in for Docker group changes to take effect
exit
```

---

## 📥 Step 2: Clone the Repository

SSH back into the server:

```bash
ssh admin@91.98.113.188
```

Clone the repository:

```bash
# Create application directory
mkdir -p ~/cashflow
cd ~/cashflow

# Clone repository
git clone https://github.com/Werdo/CashFlowApp.git .

# Verify files
ls -la
```

---

## ⚙️ Step 3: Configure Environment Variables

Create production environment file:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

**Required Configuration:**

```env
# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=<strong-random-password>

# JWT Secret (generate with: openssl rand -base64 64)
JWT_SECRET=<long-random-string>

# CORS Configuration
CORS_ORIGIN=http://91.98.113.188

# React App Configuration
REACT_APP_API_URL=http://91.98.113.188/api
```

**Generate secure secrets:**

```bash
# Generate MongoDB password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

Save and exit (Ctrl+X, Y, Enter in nano).

---

## 🚀 Step 4: Deploy the Application

Run the deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. ✅ Check Docker installation
2. ✅ Stop existing containers
3. ✅ Pull base images
4. ✅ Build application images
5. ✅ Start all services
6. ✅ Verify health checks

---

## 🔍 Step 5: Verify Deployment

Check service status:

```bash
docker-compose ps
```

All services should show "Up" and "healthy".

Check logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend
```

Test endpoints:

```bash
# Health check
curl http://localhost/health

# API health
curl http://localhost/api/health

# Frontend (should return HTML)
curl http://localhost/
```

---

## 🌐 Step 6: Access the Application

Open your browser and navigate to:

- **Frontend:** http://91.98.113.188
- **API:** http://91.98.113.188/api
- **Health:** http://91.98.113.188/health

---

## 👤 Step 7: Create Admin User

Create the default admin user:

```bash
docker exec -it cashflow-backend node src/scripts/create-admin.js
```

**Admin Credentials:**
- Email: ppelaez@cashflow.com
- Password: @S1i9m8o1n

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 🛠️ Management Commands

### Service Management

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

### Updates and Redeployment

```bash
# Pull latest code
cd ~/cashflow
git pull

# Redeploy
./deploy.sh
```

### Database Backup

```bash
# Create backup
docker exec cashflow-mongodb mongodump \
  --uri="mongodb://admin:<password>@localhost:27017/cashflow?authSource=admin" \
  --out=/tmp/backup

# Copy to host
docker cp cashflow-mongodb:/tmp/backup ./backup-$(date +%Y%m%d)

# Download to local machine
scp -r admin@91.98.113.188:~/cashflow/backup-* ./
```

### Database Restore

```bash
# Upload backup to server
scp -r ./backup-* admin@91.98.113.188:~/cashflow/

# Copy to container
docker cp ./backup-20250112 cashflow-mongodb:/tmp/restore

# Restore
docker exec cashflow-mongodb mongorestore \
  --uri="mongodb://admin:<password>@localhost:27017/cashflow?authSource=admin" \
  --drop /tmp/restore
```

---

## 🔒 Security Checklist

- [ ] Changed default MongoDB password
- [ ] Generated strong JWT secret
- [ ] Changed default admin password
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] Fail2ban enabled
- [ ] Regular backups scheduled
- [ ] SSL certificate configured (for HTTPS)
- [ ] Environment variables secured

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### Port Already in Use

```bash
# Find process using port
sudo netstat -tulpn | grep :80

# Kill process
sudo kill <PID>
```

### Database Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Test connection
docker exec -it cashflow-mongodb mongosh \
  --username admin --password <password>
```

### Health Checks Failing

```bash
# Check backend health directly
docker exec cashflow-backend curl http://localhost:5000/health

# Check frontend
docker exec cashflow-frontend wget -qO- http://localhost/

# Check nginx
docker exec cashflow-nginx wget -qO- http://localhost/health
```

### Build Failures

```bash
# Clean rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h

# Docker disk usage
docker system df
```

### View Logs

```bash
# Nginx access log
docker exec cashflow-nginx tail -f /var/log/nginx/access.log

# Nginx error log
docker exec cashflow-nginx tail -f /var/log/nginx/error.log

# Backend logs
docker-compose logs -f backend
```

---

## 🔄 SSL/HTTPS Setup (Future)

To enable HTTPS:

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Place certificates in `nginx/ssl/`
3. Uncomment HTTPS server block in `nginx/nginx.conf`
4. Update CORS_ORIGIN and REACT_APP_API_URL to use https://
5. Redeploy: `./deploy.sh`

---

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Check Docker status: `docker-compose ps`
- Verify environment variables: `cat .env`

---

**Version:** v4.0.0
**Last Updated:** 2025-10-12
**Target OS:** Ubuntu 24.04
**Deployment Type:** Bare-metal Docker
