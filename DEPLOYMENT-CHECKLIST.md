# 🚀 CashFlow v4.0 - Traditional Server Deployment Checklist

## Pre-requisitos del Servidor

### Sistema Operativo
- [ ] Ubuntu 20.04 LTS o superior
- [ ] Acceso root/sudo
- [ ] Conexión a internet estable

### Software Necesario

#### 1. Node.js 18+
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe ser >= v18.0.0
npm --version
```

#### 2. MongoDB 6.0+
```bash
# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar
sudo systemctl status mongod
mongosh --eval "db.version()"
```

#### 3. PM2
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar
pm2 --version
```

#### 4. Nginx
```bash
# Instalar Nginx
sudo apt install -y nginx

# Verificar
nginx -v
sudo systemctl status nginx
```

---

## Paso 1: Preparar Directorio de Producción

```bash
# Crear directorio
sudo mkdir -p /var/www/cashflow-v4
sudo chown -R $USER:$USER /var/www/cashflow-v4
cd /var/www/cashflow-v4
```

---

## Paso 2: Clonar Repositorio

### Opción A: Desde Git remoto
```bash
# Si tienes repositorio en GitHub/GitLab
git clone https://github.com/tu-usuario/cashflow-app.git .
git checkout v4.0-RELEASE
```

### Opción B: Copiar desde máquina local
```bash
# En tu máquina Windows
scp -r C:\Users\pedro\cashflow-app-v3.0-RELEASE usuario@servidor:/tmp/cashflow-temp

# En el servidor
sudo mv /tmp/cashflow-temp/* /var/www/cashflow-v4/
cd /var/www/cashflow-v4
```

---

## Paso 3: Configurar Variables de Entorno

### Backend (.env)
```bash
cd /var/www/cashflow-v4/backend
nano .env
```

Contenido del archivo `.env`:
```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cashflow-production

# JWT Secret (generar uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# OpenAI (opcional)
OPENAI_API_KEY=tu_openai_api_key_aqui

# CORS
CORS_ORIGIN=https://tu-dominio.com
```

**Generar JWT Secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (.env.production)
```bash
cd /var/www/cashflow-v4/frontend
nano .env.production
```

Contenido:
```env
REACT_APP_API_URL=https://tu-dominio.com/api
REACT_APP_VERSION=4.0.0
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

---

## Paso 4: Instalar Dependencias

```bash
# Backend
cd /var/www/cashflow-v4/backend
npm install --production

# Frontend
cd /var/www/cashflow-v4/frontend
npm install
```

---

## Paso 5: Build Frontend

```bash
cd /var/www/cashflow-v4/frontend
npm run build
```

Verificar que se creó el directorio `build/` correctamente.

---

## Paso 6: Configurar PM2

```bash
cd /var/www/cashflow-v4/backend

# Iniciar aplicación
pm2 start server.js --name cashflow-api

# Guardar configuración
pm2 save

# Configurar autostart
pm2 startup
# Ejecutar el comando que PM2 te devuelva

# Verificar
pm2 list
pm2 logs cashflow-api
```

---

## Paso 7: Configurar Nginx

### Crear configuración del sitio
```bash
sudo nano /etc/nginx/sites-available/cashflow
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend - Servir archivos estáticos
    location / {
        root /var/www/cashflow-v4/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy reverso
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Cache estático
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Habilitar sitio
```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/cashflow /etc/nginx/sites-enabled/

# Eliminar sitio default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## Paso 8: Configurar Firewall

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Verificar
sudo ufw status
```

---

## Paso 9: Instalar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

Certbot configurará automáticamente HTTPS y redireccionará HTTP a HTTPS.

---

## Paso 10: Verificar Deployment

### Health Checks
```bash
# Backend API
curl http://localhost:5000/api/health
curl https://tu-dominio.com/api/health

# Frontend
curl http://localhost
curl https://tu-dominio.com
```

### PM2 Status
```bash
pm2 list
pm2 monit
pm2 logs cashflow-api --lines 50
```

### Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Paso 11: Smoke Tests

Accede a `https://tu-dominio.com` y verifica:

- [ ] Página de login carga correctamente
- [ ] Registro de nuevo usuario funciona
- [ ] Login funciona
- [ ] Dashboard carga con datos
- [ ] Crear nueva transacción funciona
- [ ] Dark mode funciona
- [ ] Responsive design en móvil funciona
- [ ] PWA se puede instalar
- [ ] AI Chat funciona (si configurado)

---

## Paso 12: Configurar Backups Automáticos

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-cashflow.sh
```

Contenido:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cashflow"
DATE=$(date +%Y%m%d-%H%M%S)

# Crear directorio
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/cashflow-production" --out="$BACKUP_DIR/mongo-$DATE"

# Backup archivos
tar -czf "$BACKUP_DIR/files-$DATE.tar.gz" /var/www/cashflow-v4

# Eliminar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos
sudo chmod +x /usr/local/bin/backup-cashflow.sh

# Añadir a crontab (ejecutar diariamente a las 2 AM)
sudo crontab -e
```

Añadir línea:
```
0 2 * * * /usr/local/bin/backup-cashflow.sh >> /var/log/cashflow-backup.log 2>&1
```

---

## Paso 13: Monitoreo

### Instalar PM2 Log Rotate
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Configurar Monitoring (opcional)
```bash
# PM2 Plus
pm2 link [secret-key] [public-key]

# O usar servicios externos:
# - New Relic
# - DataDog
# - Sentry
```

---

## Troubleshooting

### Backend no arranca
```bash
# Ver logs
pm2 logs cashflow-api

# Verificar puerto
sudo lsof -i :5000

# Reiniciar
pm2 restart cashflow-api
```

### Frontend no carga
```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB no conecta
```bash
# Verificar status
sudo systemctl status mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar
sudo systemctl restart mongod
```

### SSL no funciona
```bash
# Verificar certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal
```

---

## Plan de Rollback

Si algo falla:

```bash
# 1. Stop aplicación
pm2 stop cashflow-api

# 2. Restaurar código desde backup
cd /var/www/cashflow-v4
sudo rm -rf *
sudo tar -xzf /var/backups/cashflow/files-FECHA.tar.gz -C .

# 3. Restaurar base de datos
mongorestore --uri="mongodb://localhost:27017/cashflow-production" --drop /var/backups/cashflow/mongo-FECHA

# 4. Reiniciar
pm2 restart cashflow-api
```

---

## Checklist Final

- [ ] ✅ Node.js instalado
- [ ] ✅ MongoDB funcionando
- [ ] ✅ PM2 instalado
- [ ] ✅ Nginx instalado
- [ ] ✅ Código clonado en /var/www/cashflow-v4
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Frontend built
- [ ] ✅ Backend corriendo con PM2
- [ ] ✅ Nginx configurado
- [ ] ✅ SSL instalado
- [ ] ✅ Health checks pasando
- [ ] ✅ Smoke tests completados
- [ ] ✅ Backups automatizados configurados
- [ ] ✅ Monitoreo activo

---

## Información de Contacto Post-Deployment

**URL Aplicación:** https://tu-dominio.com
**URL API:** https://tu-dominio.com/api
**Servidor:** [IP del servidor]
**Usuario SSH:** [usuario]
**PM2:** `pm2 list` para ver estado
**Logs:** `pm2 logs cashflow-api`
**Backups:** `/var/backups/cashflow`

---

**Deployment Date:** _________
**Deployed By:** _________
**Version:** v4.0.0
**Status:** ✅ PRODUCTION READY
