# 💰 CashFlow v4.0 - Gestión Inteligente de Tesorería

**Versión:** 4.0.0 - Release
**Base:** v3.0
**Estado:** ✅ Producción
**Última Actualización:** 15 de Octubre de 2025

---

## 🎯 Descripción

CashFlow v4.0 es un sistema completo de gestión de tesorería enterprise-ready con arquitectura modular, diseño profesional y funcionalidades avanzadas. Esta versión RELEASE incluye todas las características implementadas y probadas en producción.

## ✨ Funcionalidades v4.0 Release

### **🎯 Core Features**
- ✅ Multi-usuario con autenticación JWT
- ✅ Gestión de múltiples años fiscales
- ✅ Auto-guardado inteligente con debounce
- ✅ Sistema de auditoría completo
- ✅ Historial de modificaciones por usuario
- ✅ API REST completa y documentada

### **💼 Gestión Financiera**
- ✅ Ingresos y gastos (fijos/variables)
- ✅ Items recurrentes automáticos
- ✅ Gastos agrupados por etiquetas (#hashtags)
- ✅ Vista de caja día a día
- ✅ Alertas configurables
- ✅ Calendario anual interactivo
- ✅ Drag & drop de items

### **📊 Analytics & Reporting**
- ✅ Dashboard con métricas en tiempo real
- ✅ Gráficos interactivos (Bar, Area Charts)
- ✅ Resumen trimestral y anual
- ✅ Exportación a JSON
- ✅ Posición de caja acumulada
- ✅ Notificaciones del día

### **🎨 UI/UX Professional**
- ✅ Diseño moderno con Tailwind CSS
- ✅ Logo personalizable por empresa
- ✅ Interfaz optimizada y limpia
- ✅ Componentes reutilizables
- ✅ Layout profesional con sidebar
- ✅ Save indicator en tiempo real

### **⚙️ Sistema de Administración**
- ✅ Panel de administración completo
- ✅ Gestión de usuarios
- ✅ Sistema de billing y suscripciones
- ✅ Configuración de appearance
- ✅ Roles y permisos

### **🐳 DevOps & Deployment**
- ✅ Totalmente dockerizado
- ✅ Nginx reverse proxy con SSL
- ✅ MongoDB 7.0 optimizado
- ✅ Scripts de deploy automáticos
- ✅ Health checks configurados
- ✅ Environment-aware API config

---

## 🏆 Arquitectura v4.0

Aplicación completa de gestión de cashflow con:
- ✅ Multi-usuario con JWT
- ✅ Backend API REST (Node.js + Express)
- ✅ Frontend React con Tailwind
- ✅ Base de datos MongoDB
- ✅ Control de auditoría completo
- ✅ Historial de modificaciones
- ✅ Gastos agrupados por etiquetas
- ✅ Vista de caja día a día
- ✅ Alertas configurables
- ✅ Calendario anual completo
- ✅ Totalmente dockerizado

## 🚀 Instalación Rápida

### Prerequisitos
- Docker >= 20.10
- Docker Compose >= 2.0

### Pasos

1. **Clonar archivos**
   ```bash
   # Ejecutar los scripts:
   bash BACKEND-COMPLETO.txt
   bash FRONTEND-COMPLETO.txt
   bash DOCKER-SETUP-COMPLETO.txt
   ```

2. **Verificar estructura**
   ```
   .
   ├── backend/
   ├── frontend/
   ├── database/
   ├── docker-compose.yml
   └── deploy.sh
   ```

3. **Desplegar**
   ```bash
   ./deploy.sh
   ```

   O manualmente:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Acceder**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - MongoDB: localhost:27017

## 🔐 Credenciales por defecto

**MongoDB:**
- Usuario: `admin`
- Password: `cashflow2025`

**Primera cuenta:** Registrarse en http://localhost:3000

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar datos (⚠️ CUIDADO)
docker-compose down -v

# Ver estado de servicios
docker-compose ps

# Reconstruir imágenes
docker-compose build --no-cache

# Entrar a un contenedor
docker exec -it cashflow-backend sh
docker exec -it cashflow-mongodb mongosh
```

## 🗄️ Gestión de MongoDB

### Acceder a MongoDB

```bash
# Entrar al contenedor
docker exec -it cashflow-mongodb mongosh

# Conectarse a la base de datos
use cashflow

# Autenticarse
db.auth('admin', 'cashflow2025')

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Ver cashflows
db.cashflows.find().pretty()
```

### Backup

```bash
# Crear backup
docker exec cashflow-mongodb mongodump \
  --username admin \
  --password cashflow2025 \
  --authenticationDatabase admin \
  --out /backup

# Copiar al host
docker cp cashflow-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore

```bash
# Copiar backup al contenedor
docker cp ./mongodb-backup cashflow-mongodb:/restore

# Restaurar
docker exec cashflow-mongodb mongorestore \
  --username admin \
  --password cashflow2025 \
  --authenticationDatabase admin \
  /restore
```

## 🧪 Probar la API

### Registrar usuario
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Test",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Obtener datos (con token)
```bash
curl http://localhost:5000/api/cashflow?year=2025 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🐛 Troubleshooting

### Backend no conecta con MongoDB
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Puerto ocupado
Editar `docker-compose.yml` y cambiar el puerto:
```yaml
ports:
  - "3001:80"  # Cambiar 3000 por 3001
```

### Rebuild completo
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📦 Estructura del Proyecto

```
cashflow-app-v2/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React App
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   └── init.js          # MongoDB init script
├── docker-compose.yml   # Orquestación
├── deploy.sh            # Script de deploy
└── README.md
```

## 🔒 Seguridad en Producción

**⚠️ IMPORTANTE:** Antes de desplegar en producción:

1. Cambiar `JWT_SECRET` en `.env`
2. Cambiar contraseñas de MongoDB
3. Configurar HTTPS
4. Configurar CORS apropiadamente
5. Activar rate limiting
6. Configurar backups automáticos

## 📚 Documentación de la API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### CashFlow
- `GET /api/cashflow?year=2025` - Obtener datos
- `POST /api/cashflow` - Guardar datos
- `POST /api/cashflow/import` - Importar JSON
- `GET /api/cashflow/export?year=2025` - Exportar JSON
- `DELETE /api/cashflow/:year` - Eliminar año

### Admin
- `GET /api/admin/users` - Listar usuarios (admin only)

### Health Check
- `GET /health` - Estado del servidor

## 🎯 Roadmap v2.1

- [ ] Sistema de roles avanzado
- [ ] Compartir cashflow entre usuarios
- [ ] Notificaciones por email
- [ ] Reportes PDF automáticos
- [ ] Integración con bancos
- [ ] App móvil

## 📄 Licencia

MIT

---

**v2.0.0** - Enero 2025
