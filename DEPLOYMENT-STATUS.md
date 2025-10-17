# AssetFlow - Estado del Despliegue

**Fecha:** 17 de Octubre, 2025
**Servidor:** 167.235.58.24

---

## ✅ Completado

### 1. Archivos de Configuración Creados

- ✅ `docker-compose.yml` - Orquestación de contenedores (MongoDB + Backend + Frontend)
- ✅ `.env` - Variables de entorno de producción
- ✅ `.env.example` - Template de variables de entorno
- ✅ `.dockerignore` - Exclusión de archivos innecesarios
- ✅ `backend/Dockerfile` - Imagen Docker del backend (Node.js 18-alpine)
- ✅ `backend/src/server.js` - Servidor Express con health checks
- ✅ `frontend/Dockerfile` - Imagen Docker del frontend (build multi-etapa con Nginx)
- ✅ `frontend/nginx.conf` - Configuración Nginx para React SPA
- ✅ `deploy.sh` - Script automatizado de despliegue

### 2. Código Subido al Servidor

- ✅ Código comprimido en `assetflow-deploy.tar.gz` (14MB)
- ✅ Archivo subido a `/tmp/assetflow-deploy.tar.gz`
- ✅ Código descomprimido en `/var/www/assetflow/`
- ✅ Permisos configurados (admin:admin)

### 3. Servidor Preparado

- ✅ Docker 28.5.1 instalado y configurado
- ✅ Docker Compose v2.40.0 instalado
- ✅ Node.js 18.19.1 y npm 9.2.0 disponibles
- ✅ Firewall (UFW) configurado (puertos 22, 80, 443, 3000, 5000)
- ✅ Directorios creados: `/var/www/assetflow/{database,logs,uploads,backups}`

---

## ⏳ En Proceso

### Build de Imágenes Docker

El comando `docker compose build` se estaba ejecutando cuando se perdió la conexión SSH.

**Estado:** Proceso interrumpido por pérdida de conexión
**Última acción:** Se ejecutó `echo 'bb474edf' | sudo -S chown -R admin:admin /var/www/assetflow/ && echo 'bb474edf' | sudo -S chmod +x /var/www/assetflow/server-setup.sh && cd /var/www/assetflow && docker compose build`

---

## 📋 Próximos Pasos

### Cuando la conexión al servidor se restablezca:

#### 1. Verificar Conexión SSH

```bash
ssh admin@167.235.58.24
```

Contraseña sudo: `bb474edf`

#### 2. Verificar Estado del Build

```bash
cd /var/www/assetflow
docker compose ps
docker images | grep assetflow
```

#### 3. Opción A: Si el Build Completó

```bash
cd /var/www/assetflow
docker compose up -d
docker compose ps
docker compose logs -f
```

#### 4. Opción B: Si el Build NO Completó

```bash
cd /var/www/assetflow
docker compose build
docker compose up -d
```

#### 5. Verificar Despliegue

```bash
# Verificar contenedores
docker compose ps

# Verificar health checks
docker inspect assetflow-backend | grep -A 5 Health
docker inspect assetflow-frontend | grep -A 5 Health
docker inspect assetflow-mongodb | grep -A 5 Health

# Verificar endpoints
curl http://localhost:5000/health
curl http://localhost:3000/health
```

#### 6. Verificar Logs

```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs de un servicio específico
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb

# Seguir logs en tiempo real
docker compose logs -f
```

---

## 🔧 Configuración de Producción

### Variables de Entorno (.env)

```env
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
REACT_APP_API_URL=http://167.235.58.24:5000/api
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=AssetFlow2025!Secure#MongoDB
JWT_SECRET=AssetFlow-JWT-Super-Secret-Key-2025-Production-bb474edf
JWT_EXPIRE=7d
```

### Puertos Expuestos

| Servicio | Puerto Interno | Puerto Externo | URL de Acceso |
|----------|---------------|----------------|---------------|
| Frontend | 80 | 3000 | http://167.235.58.24:3000 |
| Backend API | 5000 | 5000 | http://167.235.58.24:5000 |
| MongoDB | 27017 | 27017 | mongodb://167.235.58.24:27017 |

### Health Checks

- **Backend:** `http://167.235.58.24:5000/health`
- **Frontend:** `http://167.235.58.24:3000/health`
- **MongoDB:** `mongosh --eval "db.adminCommand('ping')"`

---

## 🐳 Arquitectura Docker

```
assetflow-network (bridge)
│
├── assetflow-mongodb (mongo:7.0)
│   ├── Puerto: 27017
│   ├── Volúmenes: ./database/data, ./database/backups
│   └── Health: mongosh ping
│
├── assetflow-backend (Node.js 18-alpine)
│   ├── Puerto: 5000
│   ├── Volúmenes: ./uploads, ./logs
│   ├── Depende de: mongodb (healthy)
│   └── Health: wget http://localhost:5000/health
│
└── assetflow-frontend (Nginx alpine)
    ├── Puerto: 3000 -> 80
    ├── Depende de: backend
    └── Health: wget http://localhost:80/health
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de contenedores
docker compose ps

# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Rebuild y reinicio completo
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Gestión de Logs

```bash
# Ver logs
docker compose logs

# Ver logs con seguimiento
docker compose logs -f

# Ver últimas 100 líneas
docker compose logs --tail=100

# Ver logs de un servicio
docker compose logs backend
```

### Gestión de Volúmenes

```bash
# Ver volúmenes
docker volume ls

# Limpiar volúmenes no utilizados
docker volume prune
```

### Acceso a Contenedores

```bash
# Acceder a backend
docker exec -it assetflow-backend sh

# Acceder a frontend
docker exec -it assetflow-frontend sh

# Acceder a MongoDB
docker exec -it assetflow-mongodb mongosh
```

---

## 🚨 Troubleshooting

### Si MongoDB no inicia:

```bash
# Verificar permisos
sudo chown -R 999:999 /var/www/assetflow/database/data

# Limpiar datos corruptos (CUIDADO: elimina todos los datos)
sudo rm -rf /var/www/assetflow/database/data/*
docker compose up -d mongodb
```

### Si Backend no conecta a MongoDB:

```bash
# Verificar conexión
docker exec assetflow-backend ping -c 3 mongodb

# Verificar variables de entorno
docker exec assetflow-backend env | grep MONGODB
```

### Si Frontend no carga:

```bash
# Verificar build
docker exec assetflow-frontend ls -la /usr/share/nginx/html

# Verificar nginx config
docker exec assetflow-frontend cat /etc/nginx/conf.d/default.conf

# Reiniciar nginx
docker compose restart frontend
```

---

## 📊 Monitoreo

### Verificar Recursos

```bash
# Ver uso de recursos por contenedor
docker stats

# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos
htop
```

### Verificar Firewall

```bash
sudo ufw status numbered
```

---

## 🔒 Seguridad

### Recomendaciones Implementadas

- ✅ Firewall configurado (UFW)
- ✅ Puertos restringidos (solo necesarios)
- ✅ Headers de seguridad en Nginx
- ✅ Gzip compression habilitado
- ✅ Health checks en todos los contenedores

### Pendientes para Producción Final

- ⏳ SSL/TLS (Let's Encrypt)
- ⏳ Reverse proxy (Nginx en host)
- ⏳ Backup automatizado de MongoDB
- ⏳ Monitoreo (Prometheus/Grafana)
- ⏳ Rate limiting
- ⏳ CORS configuración específica

---

## 📝 Notas

- El servidor estaba ejecutando `docker compose build` cuando se perdió la conexión
- Es posible que el proceso haya completado exitosamente
- Al reconectar, verificar estado antes de ejecutar nuevos comandos
- Si el build falló, se puede reintentar sin problemas
- Los archivos ya están en el servidor en `/var/www/assetflow/`

---

## 🎯 Checklist de Verificación Post-Despliegue

- [ ] Reconectar al servidor SSH
- [ ] Verificar estado del build de Docker
- [ ] Completar build si es necesario
- [ ] Iniciar contenedores con `docker compose up -d`
- [ ] Verificar todos los contenedores están corriendo
- [ ] Verificar health checks de todos los servicios
- [ ] Acceder al frontend en http://167.235.58.24:3000
- [ ] Verificar backend API en http://167.235.58.24:5000
- [ ] Probar endpoint de health: http://167.235.58.24:5000/health
- [ ] Revisar logs de todos los servicios
- [ ] Verificar conectividad frontend-backend
- [ ] Probar funcionalidad básica de la aplicación

---

**Última actualización:** 17 de Octubre, 2025 00:20 UTC
**Estado:** Esperando reconexión al servidor para completar despliegue
