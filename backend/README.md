# CashFlow Backend API v2.0

## Instalación

```bash
npm install
```

## Desarrollo Local (sin Docker)

```bash
# Asegúrate de tener MongoDB corriendo localmente
npm run dev
```

## Con Docker

```bash
docker build -t cashflow-backend .
docker run -p 5000:5000 --env-file .env cashflow-backend
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Secreto para tokens JWT
- `PORT`: Puerto del servidor (default: 5000)

## Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### CashFlow
- `GET /api/cashflow` - Obtener datos
- `POST /api/cashflow` - Guardar datos
- `POST /api/cashflow/import` - Importar JSON
- `GET /api/cashflow/export` - Exportar JSON
- `DELETE /api/cashflow/:year` - Eliminar año

### Admin
- `GET /api/admin/users` - Listar usuarios (admin)

## Health Check

```bash
curl http://localhost:5000/health
```
