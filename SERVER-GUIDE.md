# 🚀 CashFlow v4.0 - Guía del Servidor en Producción

**Servidor:** Hetzner Ubuntu 24.04 ARM64
**IP:** 91.98.113.188
**Usuario SSH:** manager
**Directorio:** ~/cashflow

---

## 📋 Estado del Deployment

### ✅ Servicios Activos

```bash
cd ~/cashflow
docker compose -f docker-compose-simple.yml ps
```

**Contenedores:**
- 🗄️ **MongoDB 7.0** - Base de datos (puerto interno 27017)
- ⚙️ **Backend API** - Node.js 18 (puerto interno 5000)
- 🎨 **Frontend** - React + Nginx (puerto interno 80)
- 🌐 **Nginx Proxy** - Reverse proxy (puertos 80/443)

### 🌐 URLs de Acceso

- **Aplicación:** http://91.98.113.188
- **API Health:** http://91.98.113.188/health
- **GitHub Repo:** https://github.com/Werdo/CashFlowApp

### 🔑 Credenciales

**Admin User:**
- Email: `ppelaez@cashflow.com`
- Password: `@S1i9m8o1n`

**MongoDB:**
- Usuario: `admin`
- Password: `v3a2duYEM4bNqiYN3SJm0yrSu5Kk6UHq+8bzBqbKcDY=`
- Database: `cashflow`

**JWT Secret:** `GEB/jFqbYkpQkEEprwckzcYNJTmZxiUDiKAfGeyUu6Om1htgjhndq7XA5zUZLfqlz8PrX7oqlexReKa8qew0cA==`

---

## 🛠️ Comandos de Gestión

### Ver Estado de Contenedores

```bash
cd ~/cashflow
docker compose -f docker-compose-simple.yml ps
```

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose-simple.yml logs -f

# Servicio específico
docker compose -f docker-compose-simple.yml logs -f backend
docker compose -f docker-compose-simple.yml logs -f frontend
docker compose -f docker-compose-simple.yml logs -f nginx
docker compose -f docker-compose-simple.yml logs -f mongodb
```

### Reiniciar Servicios

```bash
# Reiniciar un servicio
docker compose -f docker-compose-simple.yml restart backend

# Reiniciar todos
docker compose -f docker-compose-simple.yml restart

# Detener todos
docker compose -f docker-compose-simple.yml down

# Iniciar todos
docker compose -f docker-compose-simple.yml up -d
```

---

## 🔄 Actualizar la Aplicación

### 1. Pull del Código Actualizado

```bash
cd ~/cashflow
git pull origin master
```

### 2. Rebuild y Restart

```bash
# Opción A: Rebuild solo lo necesario
docker compose -f docker-compose-simple.yml up -d --build

# Opción B: Rebuild completo (limpio)
docker compose -f docker-compose-simple.yml down
docker compose -f docker-compose-simple.yml build --no-cache
docker compose -f docker-compose-simple.yml up -d
```

### 3. Verificar Deployment

```bash
# Ver estado
docker compose -f docker-compose-simple.yml ps

# Ver logs recientes
docker compose -f docker-compose-simple.yml logs --tail=50

# Test health
curl http://localhost/health
```

---

## 💾 Backup y Restore

### Backup de MongoDB

```bash
# Crear backup
docker exec cashflow-mongodb mongodump \
  --uri="mongodb://admin:v3a2duYEM4bNqiYN3SJm0yrSu5Kk6UHq+8bzBqbKcDY=@localhost:27017/cashflow?authSource=admin" \
  --out=/tmp/backup

# Copiar a host
docker cp cashflow-mongodb:/tmp/backup ./backup-$(date +%Y%m%d-%H%M%S)

# Ver backups
ls -lh backup-*
```

### Restore de MongoDB

```bash
# Copiar backup al contenedor
docker cp ./backup-20251011-230000 cashflow-mongodb:/tmp/restore

# Restaurar
docker exec cashflow-mongodb mongorestore \
  --uri="mongodb://admin:v3a2duYEM4bNqiYN3SJm0yrSu5Kk6UHq+8bzBqbKcDY=@localhost:27017/cashflow?authSource=admin" \
  --drop /tmp/restore
```

---

## 🔍 Debugging

### Acceder a Contenedores

```bash
# Backend shell
docker exec -it cashflow-backend sh

# MongoDB shell
docker exec -it cashflow-mongodb mongosh \
  --username admin \
  --password "v3a2duYEM4bNqiYN3SJm0yrSu5Kk6UHq+8bzBqbKcDY=" \
  --authenticationDatabase admin

# Nginx shell
docker exec -it cashflow-nginx sh

# Frontend shell
docker exec -it cashflow-frontend sh
```

### Ver Configuración

```bash
# Variables de entorno
cat ~/cashflow/.env

# Docker compose
cat ~/cashflow/docker-compose-simple.yml

# Nginx config
cat ~/cashflow/nginx/nginx-ssl.conf
```

### Monitoreo de Recursos

```bash
# Stats en tiempo real
docker stats

# Uso de disco
du -sh ~/cashflow
df -h

# Uso de Docker
docker system df
```

---

## 🔧 Desarrollo y Testing

### Ejecutar Scripts en Backend

```bash
# Crear usuario admin
docker exec cashflow-backend node scripts/create-admin.js

# Ejecutar cualquier script Node
docker exec cashflow-backend node scripts/tu-script.js
```

### Testing de API

```bash
# Health check
curl http://localhost/health

# Test de autenticación (ejemplo)
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ppelaez@cashflow.com","password":"@S1i9m8o1n"}'
```

---

## 📝 Editar Código en el Servidor

### Opción 1: Editar y Rebuild

```bash
# 1. Editar archivos
nano ~/cashflow/backend/src/routes/tu-archivo.js

# 2. Rebuild
docker compose -f docker-compose-simple.yml up -d --build backend

# 3. Ver logs
docker compose -f docker-compose-simple.yml logs -f backend
```

### Opción 2: Usar Git (Recomendado)

```bash
# 1. Hacer cambios en tu máquina local
# 2. Commit y push
git add .
git commit -m "Tu cambio"
git push

# 3. En el servidor, pull y rebuild
cd ~/cashflow
git pull
docker compose -f docker-compose-simple.yml up -d --build
```

---

## 🗂️ Estructura de Archivos

```
~/cashflow/
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Rutas de API
│   │   ├── models/         # Modelos MongoDB
│   │   ├── middleware/     # Middleware Express
│   │   └── server.js       # Punto de entrada
│   ├── scripts/            # Scripts utilitarios
│   ├── Dockerfile          # Imagen Docker backend
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   ├── public/
│   ├── Dockerfile          # Imagen Docker frontend
│   └── package.json
├── nginx/                  # Configuración Nginx
│   ├── nginx-ssl.conf      # Config con SSL
│   └── ssl/                # Certificados SSL
│       ├── fullchain.pem
│       └── privkey.pem
├── docker-compose-simple.yml  # Compose en uso
├── .env                    # Variables de entorno
└── SERVER-GUIDE.md         # Esta guía
```

---

## 🔒 Seguridad

### Firewall Status

```bash
sudo iptables -L -n
```

### Actualizar Secretos

Si necesitas regenerar secretos:

```bash
# Nuevo JWT secret
openssl rand -base64 64

# Nueva password MongoDB
openssl rand -base64 32

# Editar .env
nano ~/cashflow/.env

# Restart servicios
docker compose -f docker-compose-simple.yml restart
```

---

## 📊 Monitoreo

### Logs de Nginx

```bash
# Access log
docker exec cashflow-nginx tail -f /var/log/nginx/access.log

# Error log
docker exec cashflow-nginx tail -f /var/log/nginx/error.log
```

### Database Stats

```bash
docker exec -it cashflow-mongodb mongosh \
  --username admin \
  --password "v3a2duYEM4bNqiYN3SJm0yrSu5Kk6UHq+8bzBqbKcDY=" \
  --authenticationDatabase admin \
  --eval "db.stats()" cashflow
```

---

## 🆘 Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs del contenedor
docker compose -f docker-compose-simple.yml logs [servicio]

# Ver último error
docker compose -f docker-compose-simple.yml logs --tail=20 [servicio]

# Inspeccionar contenedor
docker inspect cashflow-[servicio]
```

### Problema: No hay conexión a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker compose -f docker-compose-simple.yml ps mongodb

# Restart MongoDB
docker compose -f docker-compose-simple.yml restart mongodb
```

### Problema: 502 Bad Gateway

```bash
# Verificar backend está corriendo
docker compose -f docker-compose-simple.yml ps backend

# Verificar logs de backend
docker compose -f docker-compose-simple.yml logs backend

# Restart backend
docker compose -f docker-compose-simple.yml restart backend
```

### Problema: Espacio en disco lleno

```bash
# Ver uso de espacio Docker
docker system df

# Limpiar imágenes no usadas
docker system prune -a

# Limpiar volúmenes no usados
docker volume prune
```

---

## 📚 Recursos

- **Documentación React:** https://react.dev
- **Express.js:** https://expressjs.com
- **MongoDB:** https://docs.mongodb.com
- **Docker Compose:** https://docs.docker.com/compose/
- **Nginx:** https://nginx.org/en/docs/

---

**Última actualización:** 2025-10-11
**Versión:** v4.0
**Mantenido por:** Claude Code
