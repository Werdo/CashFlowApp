# Multi-Tenant Architecture

## Estado Actual

La aplicación **YA ESTÁ CONFIGURADA** como multi-tenant desde su creación. El sistema utiliza autenticación JWT para aislar datos de cada usuario.

## Arquitectura Implementada

### 1. Autenticación JWT

```javascript
// Backend: middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // ← Usuario identificado
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
```

### 2. Aislamiento de Datos

Cada endpoint utiliza `req.userId` para filtrar datos:

```javascript
// Ejemplo: GET /api/cashflow
router.get('/cashflow', authMiddleware, async (req, res) => {
  const cashflow = await Cashflow.findOne({
    userId: req.userId, // ← Solo datos del usuario autenticado
    year: req.query.year
  });
  res.json(cashflow);
});
```

### 3. Modelos de Datos

Todos los documentos MongoDB incluyen `userId` como índice:

```javascript
// models/Cashflow.js
const cashflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // ← Índice para búsquedas rápidas
  },
  year: Number,
  months: [...]
});
```

## Flujo de Usuario

```
1. Usuario se registra → /api/auth/register
   ↓
2. Sistema crea cuenta única con contraseña hasheada (bcrypt)
   ↓
3. Usuario inicia sesión → /api/auth/login
   ↓
4. Backend genera JWT con userId
   ↓
5. Frontend almacena token en localStorage
   ↓
6. Todas las peticiones incluyen: Authorization: Bearer <token>
   ↓
7. Backend extrae userId del token
   ↓
8. Queries filtran por userId automáticamente
```

## Seguridad Implementada

### ✅ Autenticación
- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Middleware de autenticación en todas las rutas protegidas

### ✅ Autorización
- Cada usuario solo accede a SUS datos
- Verificación de userId en cada operación CRUD
- Índices de base de datos por usuario

### ✅ Validación
- Esquemas Zod en formularios (frontend)
- Validación de tokens en cada request
- Sanitización de inputs

## Colecciones MongoDB

```
users
├─ _id: ObjectId
├─ name: String
├─ email: String (unique)
├─ password: String (hashed)
└─ createdAt: Date

cashflows
├─ _id: ObjectId
├─ userId: ObjectId → users._id  ← Multi-tenant key
├─ year: Number
├─ months: Array
└─ updatedAt: Date

categories
├─ _id: ObjectId
├─ userId: ObjectId → users._id  ← Multi-tenant key
├─ name: String
├─ type: String (hashtag/group)
└─ color: String

transactions
├─ _id: ObjectId
├─ userId: ObjectId → users._id  ← Multi-tenant key
├─ amount: Number
├─ category: ObjectId
└─ date: Date
```

## Escalabilidad

### Usuarios Simultáneos
- ✅ Sin límite en la arquitectura actual
- Cada usuario tiene sus propios documentos
- MongoDB indexado por userId

### Performance
- Índices en userId para queries O(log n)
- Posibilidad de sharding por userId en futuro
- Caché por usuario (Redis) si es necesario

### Almacenamiento
- Cada usuario ≈ 5-10MB/año de datos
- 1000 usuarios = 5-10GB
- Escalable con MongoDB Atlas

## Configuración de Entorno

### Variables Requeridas

```env
# Backend (.env)
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion
JWT_EXPIRE=7d

MONGO_URI=mongodb://localhost:27017/cashflow
MONGO_USER=admin
MONGO_PASSWORD=tu_password_seguro

PORT=5000
NODE_ENV=production
```

### Frontend

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment Multi-Tenant

### Opción 1: Instancia Única (Actual)
```
[Cliente A] ─┐
[Cliente B] ─┼─→ [Backend] ─→ [MongoDB]
[Cliente C] ─┘
```
- Todos los usuarios comparten infraestructura
- Aislamiento por userId
- Más económico
- **Recomendado para <10,000 usuarios**

### Opción 2: Multi-Database (Futuro)
```
[Cliente A] ─→ [Backend] ─→ [MongoDB - DB_A]
[Cliente B] ─→ [Backend] ─→ [MongoDB - DB_B]
[Cliente C] ─→ [Backend] ─→ [MongoDB - DB_C]
```
- Cada cliente tiene su base de datos
- Mayor aislamiento
- Costos más altos
- **Para clientes enterprise**

### Opción 3: Multi-Instance (Empresarial)
```
[Cliente A] ─→ [Backend A] ─→ [MongoDB A]
[Cliente B] ─→ [Backend B] ─→ [MongoDB B]
[Cliente C] ─→ [Backend C] ─→ [MongoDB C]
```
- Infraestructura dedicada por cliente
- SLA personalizado
- On-premise posible
- **Solo para clientes grandes**

## Testing Multi-Tenant

### 1. Crear múltiples usuarios

```bash
# Usuario 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User 1","email":"user1@test.com","password":"pass123"}'

# Usuario 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User 2","email":"user2@test.com","password":"pass123"}'
```

### 2. Login y obtener tokens

```bash
# Token User 1
TOKEN1=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"pass123"}' | jq -r '.token')

# Token User 2
TOKEN2=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"pass123"}' | jq -r '.token')
```

### 3. Verificar aislamiento

```bash
# User 1 crea datos
curl -X POST http://localhost:5000/api/cashflow \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"year":2025,"months":[...]}'

# User 2 NO puede ver datos de User 1
curl http://localhost:5000/api/cashflow?year=2025 \
  -H "Authorization: Bearer $TOKEN2"
# → Respuesta: {} (vacío)
```

## Monitoreo

### Métricas Recomendadas

```javascript
// Analytics por usuario
{
  userId: ObjectId,
  metrics: {
    lastLogin: Date,
    requestCount: Number,
    dataSize: Number,
    activeYears: [2024, 2025]
  }
}
```

### Logs de Auditoría

```javascript
// Tracking de operaciones críticas
{
  userId: ObjectId,
  action: 'CREATE_CATEGORY',
  timestamp: Date,
  ip: String,
  userAgent: String
}
```

## Conclusión

✅ **La aplicación ES multi-tenant desde el primer día**
- Cada usuario tiene datos aislados
- Autenticación robusta con JWT
- Escalable hasta miles de usuarios
- No requiere cambios arquitectónicos

🔧 **Configuración backend ya completa:**
- Middleware de autenticación
- Filtrado automático por userId
- Índices en MongoDB

🚀 **Listo para producción:**
- Cambiar JWT_SECRET a valor seguro
- Configurar variables de entorno
- Deploy en cloud (Vercel + MongoDB Atlas)

## Próximos Pasos (Opcional)

Para escalar más allá:

1. **Rate Limiting** por usuario
2. **Planes de suscripción** (free/pro/enterprise)
3. **Quotas** de almacenamiento
4. **Billing** integrado (Stripe)
5. **Multi-database** para clientes enterprise
6. **Analytics** agregados por tenant
7. **Backups** automáticos por usuario

---

**¿Dudas?** El sistema multi-tenant ya funciona. Solo falta:
1. Cambiar JWT_SECRET en .env
2. Configurar MongoDB con credenciales seguras
3. Deploy

🎉 **¡Todo listo para múltiples usuarios!**
