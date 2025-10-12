# 🔧 CashFlow v4.0 - Solutions Guide

**Based on:** DIAGNOSTIC-REPORT.md
**Date:** 2025-10-12

---

## 🔴 CRITICAL: Fix API URL Hardcoded

### Problem:
Frontend tiene `http://localhost:5000/api` hardcoded en múltiples archivos, imposibilitando conexión a backend en producción.

### Solution Steps:

#### 1. Create Environment-aware API Configuration

**File:** `frontend/src/config/api.js` (NEW FILE)
```javascript
// Frontend API Configuration
const API_URL = process.env.REACT_APP_API_URL || window.location.origin + '/api';

export default API_URL;
```

#### 2. Update All Files to Use Config

**Files to modify:**

**A) `frontend/src/CashFlowApp.js`**
```javascript
// OLD:
const API_URL = 'http://localhost:5000/api';

// NEW:
import API_URL from './config/api';
```

**B) `frontend/src/services/categoryService.js`**
```javascript
// OLD:
const API_URL = 'http://localhost:5000/api';

// NEW:
import API_URL from '../config/api';
```

**C) `frontend/src/components/ChatGPT/ChatGPT.jsx`**
```javascript
// OLD:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// NEW:
import API_URL from '../../config/api';
```

**D) `frontend/src/pages/Settings/Settings.jsx`**
```javascript
// OLD (multiple instances):
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// NEW:
import API_URL from '../../config/api';
```

**E) `frontend/src/pages/Profile/Profile.jsx`**
```javascript
// NEW:
import API_URL from '../../config/api';
```

**F) `frontend/src/pages/AISettings/AISettings.jsx`**
```javascript
// NEW:
import API_URL from '../../config/api';
```

#### 3. Create Production Environment File

**File:** `frontend/.env.production`
```env
# Production API URL
REACT_APP_API_URL=https://91.98.113.188/api

# Or for relative URLs (recommended):
# REACT_APP_API_URL=/api
```

#### 4. Update Dockerfile to Use Build Args (OPTIONAL)

**File:** `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Build with environment variable
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 5. Rebuild and Deploy

```bash
# Local machine
cd C:\Users\pedro\CashFlowApp

# Commit changes
git add .
git commit -m "Fix: Use environment-aware API URL configuration"
git push

# Deploy to server
ssh -i ~/.ssh/hetzner_cashflow manager@91.98.113.188
cd ~/cashflow
git pull
docker compose -f docker-compose-simple.yml build frontend
docker compose -f docker-compose-simple.yml up -d --no-deps frontend
docker compose -f docker-compose-simple.yml logs -f frontend
```

#### 6. Verify Fix

```bash
# Check that new build doesn't contain localhost
ssh -i ~/.ssh/hetzner_cashflow manager@91.98.113.188 \
  "docker exec cashflow-frontend grep -r 'localhost:5000' /usr/share/nginx/html/ || echo 'FIXED: No localhost found'"
```

**Expected:** Should say "FIXED: No localhost found"

#### 7. Test in Browser

1. Open https://91.98.113.188
2. Open Browser DevTools (F12) → Network tab
3. Try to login with `ppelaez@cashflow.com` / `@S1i9m8o1n`
4. Verify API calls go to `https://91.98.113.188/api/auth/login` (not localhost)

---

## 🟡 HIGH: Fix Docker Health Checks

### Problem:
Backend y Frontend containers marcados como "unhealthy", healthcheck falla.

### Solution:

#### Option A: Install curl in Backend Container (Recommended)

**File:** `backend/Dockerfile`
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
```

#### Option B: Use wget Instead (Already in Alpine)

**File:** `backend/Dockerfile`
```dockerfile
# Health check with wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
```

#### Option C: Use Node.js for Healthcheck

**File:** `backend/healthcheck.js` (NEW FILE)
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 5000,
  path: '/health',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => process.exit(1));
req.on('timeout', () => process.exit(1));
req.end();
```

**Update Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node /app/healthcheck.js
```

#### Fix Server.js to Listen on All Interfaces

**File:** `backend/src/server.js`
```javascript
// OLD:
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// NEW:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
});
```

#### Deploy:
```bash
cd ~/cashflow
git pull
docker compose -f docker-compose-simple.yml build backend
docker compose -f docker-compose-simple.yml up -d backend
docker compose -f docker-compose-simple.yml ps
```

---

## 🟢 MEDIUM: Remove Deprecated MongoDB Options

### Problem:
```
Warning: useNewUrlParser is a deprecated option
Warning: useUnifiedTopology is a deprecated option
```

### Solution:

**File:** `backend/src/server.js`

```javascript
// OLD:
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/cashflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// NEW:
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/cashflow')
```

These options are no longer needed since MongoDB Driver 4.0.0+.

**Deploy:**
```bash
git pull
docker compose -f docker-compose-simple.yml restart backend
```

---

## 🔵 LOW: Performance Optimizations

### 1. Enable Gzip Compression in Nginx

**File:** `nginx/nginx-ssl.conf`

Add inside `http {}` block:
```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/json application/javascript;
gzip_comp_level 6;
```

### 2. Add Browser Caching

Add inside `server {}` blocks:
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Optimize Docker Images

**Current sizes:**
- backend: ~150MB
- frontend: ~50MB

**Can be reduced using:**
- Multi-stage builds (already using)
- .dockerignore files
- npm ci --only=production (already using)

---

## ⚪ INFO: Security Hardening

### 1. Rotate Secrets Regularly

```bash
# Generate new JWT secret
openssl rand -base64 64

# Generate new MongoDB password
openssl rand -base64 32

# Update .env on server
nano ~/cashflow/.env

# Restart services
docker compose -f docker-compose-simple.yml restart
```

### 2. Obtain Real SSL Certificate

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (requires domain)
sudo certbot --nginx -d yourdomain.com

# Or continue using IP with self-signed cert (current)
```

### 3. Implement Rate Limiting Per IP

**Already configured in nginx-ssl.conf:**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;
```

### 4. Add Fail2Ban Rules

```bash
# Create jail for nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-4xx]
enabled = true
port = http,https
filter = nginx-4xx
logpath = /var/log/nginx/access.log
maxretry = 20
findtime = 60
bantime = 3600
```

### 5. Regular Security Updates

```bash
# Update system packages monthly
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images monthly
docker pull mongo:7.0
docker pull node:18-alpine
docker pull nginx:alpine
```

---

## 🚀 Deployment Checklist

After applying fixes:

- [ ] Create `frontend/src/config/api.js`
- [ ] Update all files to import from config
- [ ] Create `frontend/.env.production`
- [ ] Update backend Dockerfile with healthcheck fix
- [ ] Update `backend/src/server.js` to listen on 0.0.0.0
- [ ] Remove deprecated MongoDB options
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Pull on server
- [ ] Rebuild containers: `docker compose -f docker-compose-simple.yml build`
- [ ] Deploy: `docker compose -f docker-compose-simple.yml up -d`
- [ ] Verify health: `docker compose -f docker-compose-simple.yml ps`
- [ ] Test in browser: https://91.98.113.188
- [ ] Test login functionality
- [ ] Verify API calls go to correct URL (DevTools)
- [ ] Check logs: `docker compose -f docker-compose-simple.yml logs -f`

---

## 📞 Need Help?

If issues persist after applying fixes:

1. Check logs: `docker compose -f docker-compose-simple.yml logs -f`
2. Verify environment: `cat ~/cashflow/.env`
3. Check container status: `docker compose -f docker-compose-simple.yml ps`
4. Test API directly: `curl http://localhost/api/health`
5. Review this document: `DIAGNOSTIC-REPORT.md`

---

**Priority Order:**
1. Fix API URL (CRITICAL - blocks all features)
2. Fix healthchecks (HIGH - improves monitoring)
3. Remove MongoDB warnings (MEDIUM - cleanup)
4. Apply optimizations (LOW - nice to have)
5. Security hardening (INFO - ongoing)
