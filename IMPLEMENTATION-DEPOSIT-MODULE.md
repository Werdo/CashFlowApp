# Implementación Deposit Module - Documentación

**Fecha:** 19 de Octubre 2025
**Módulo:** Deposits (Gestión de Depósitos de Artículos)
**Estado:** ✅ COMPLETO

---

## Resumen Ejecutivo

Se ha implementado completamente el módulo de Deposits (Depósitos de Artículos) con infraestructura backend completa (modelo existente, controlador y rutas nuevos) y frontend reescrito conectado al backend real. Se eliminaron dependencias de mapa de España y datos mock, y se añadió funcionalidad CRUD completa con sistema de alertas por vencimiento.

---

## Cambios Realizados

### 1. Backend Creado

#### 1.1 Controlador
**Archivo:** `backend/src/controllers/depositController.js`
**Líneas de código:** 500+ líneas
**Tipo de cambio:** Creación completa

**Funciones implementadas:**
- `getDeposits()` - Listar depósitos con filtros (status, clientId, alertLevel, search)
- `getDeposit()` - Obtener depósito por ID con población completa
- `createDeposit()` - Crear nuevo depósito con auto-generación de código
- `updateDeposit()` - Actualizar depósito con restricción de estados cerrados
- `deleteDeposit()` - Cancelar depósito (soft delete)
- `addDepositItem()` - Añadir artículo a depósito existente
- `removeDepositItem()` - Quitar artículo de depósito
- `getDepositStats()` - Estadísticas completas con alertas
- `getDepositsByAlertLevel()` - Obtener depósitos por nivel de alerta
- `closeDeposit()` - Cerrar depósito

#### 1.2 Rutas
**Archivo:** `backend/src/routes/depositRoutes.js`
**Líneas de código:** 50 líneas
**Tipo de cambio:** Creación completa

#### 1.3 Integración
**Archivos modificados:**
- `backend/src/routes/index.js` - Montaje de rutas deposits
- `backend/src/server.js` - Añadido endpoint a documentación API

### 2. Frontend Reescrito

**Archivo:** `frontend/src/pages/modules/DepositModule.tsx`
**Líneas de código:** 1000 líneas (anteriormente 698 líneas con mapa de España y mock)
**Tipo de cambio:** Reescritura completa

**Cambios principales:**
- Eliminado mapa de España (SpainMap component)
- Eliminado sistema de oficinas postales
- Eliminado routing interno (/office/:code, /items)
- Añadido conexión a API real de depósitos
- Añadido sistema de alertas por vencimiento
- Añadido gestión de artículos dentro de depósitos

---

## Funcionalidades Implementadas

### 2.1 Conexión al Backend Real

**Endpoints utilizados:**
- `GET /api/deposits` - Listar depósitos con filtros
- `GET /api/deposits/:id` - Obtener depósito por ID
- `POST /api/deposits` - Crear nuevo depósito
- `PUT /api/deposits/:id` - Actualizar depósito
- `DELETE /api/deposits/:id` - Cancelar depósito
- `POST /api/deposits/:id/close` - Cerrar depósito
- `POST /api/deposits/:id/items` - Añadir artículo
- `DELETE /api/deposits/:id/items/:itemId` - Quitar artículo
- `GET /api/deposits/stats` - Obtener estadísticas
- `GET /api/deposits/alerts/:level` - Obtener por nivel de alerta

**Parámetros de consulta soportados:**
- `status`: Filtrar por estado (active/invoiced/partial/closed/cancelled)
- `clientId`: Filtrar por cliente
- `alertLevel`: Filtrar por nivel de alerta (critical/warning/info)
- `search`: Búsqueda por código de depósito o nombre de cliente

### 2.2 Estadísticas en Tiempo Real

Se muestran 4 tarjetas con estadísticas calculadas en tiempo real:

1. **Total Depósitos:** Cantidad total de depósitos en el sistema
2. **Activos:** Depósitos con estado `active`
3. **Alertas Críticas:** Depósitos vencidos
4. **Valor Total:** Suma del valor de todos los depósitos

### 2.3 Sistema de Alertas por Vencimiento

El sistema calcula automáticamente el nivel de alerta basado en `dueDate`:

| Nivel | Condición | Color | Descripción |
|-------|-----------|-------|-------------|
| **Critical** | Vencido (< 0 días) | Rojo (danger) | Depósito vencido |
| **Warning** | ≤ 7 días | Amarillo (warning) | Vence en 7 días |
| **Info** | ≤ 30 días | Azul (info) | Vence en 30 días |
| **None** | > 30 días o sin fecha | Gris (secondary) | Sin alertas |

**Cálculo en backend (virtuals):**
```javascript
depositSchema.virtual('alertLevel').get(function() {
  const days = this.daysUntilDue;
  if (days === null) return 'none';
  if (days < 0) return 'critical'; // Overdue
  if (days <= 7) return 'warning';
  if (days <= 30) return 'info';
  return 'none';
});
```

**Cálculo en frontend (fallback):**
```typescript
const calculateAlertLevel = (deposit: Deposit): 'none' | 'info' | 'warning' | 'critical' => {
  if (!deposit.dueDate || !['active', 'partial'].includes(deposit.status)) {
    return 'none';
  }

  const now = new Date();
  const dueDate = new Date(deposit.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'critical';
  if (daysUntilDue <= 7) return 'warning';
  if (daysUntilDue <= 30) return 'info';
  return 'none';
};
```

### 2.4 Filtros Avanzados

**Cuatro niveles de filtrado:**

1. **Búsqueda textual** - Busca en:
   - Código de depósito (DEP-YYYY-NNNNNN)
   - Nombre del cliente

2. **Filtro por Estado** - Cinco opciones:
   - Activo (active)
   - Facturado (invoiced)
   - Parcial (partial)
   - Cerrado (closed)
   - Cancelado (cancelled)

3. **Filtro por Nivel de Alerta** - Tres opciones:
   - Críticas (critical)
   - Advertencias (warning)
   - Información (info)

4. **Filtro por Cliente** - Dropdown con todos los clientes activos

### 2.5 Modal de Creación/Edición

**Campos del formulario:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Cliente | select | Sí | Cliente propietario del depósito |
| Fecha Vencimiento | date | No | Fecha límite del depósito |
| Almacén | text | No | Nombre del almacén |
| Ubicación | text | No | Pasillo, estantería, etc. |
| Notas | textarea | No | Notas generales |
| **Artículos** | array | Sí | Mínimo 1 artículo |

**Campos por artículo:**
- Artículo (select) - Requerido
- Cantidad (number) - Requerido, mínimo 0
- Unidad (text) - Por defecto "units"
- Lote (text) - Opcional
- Caducidad (date) - Opcional
- Notas (text) - Opcional

**Validaciones implementadas:**
- Cliente obligatorio
- Al menos 1 artículo
- Validación de artículos existentes
- No editar depósitos cerrados o cancelados
- Enriquecimiento automático: articleName, articleSKU, clientName

### 2.6 Modal de Visualización

Muestra todos los datos del depósito en formato de solo lectura, incluyendo:

- Información básica (código auto-generado, cliente)
- Ubicación (almacén, ubicación específica)
- Fechas (recepción, vencimiento con badge de alerta)
- Estado actual
- Valor total
- Notas generales
- Lista de artículos con tabla detallada:
  - SKU, Nombre, Cantidad, Unidad
  - Lote, Caducidad, Notas
- Timestamps (creado por, actualizado por)
- Botón de "Editar" (si tiene permisos y no está cerrado/cancelado)

### 2.7 Generación Automática de Códigos

El backend genera automáticamente códigos de depósito con formato:

**Formato:** `DEP-YYYY-NNNNNN`

Donde:
- `DEP` es el prefijo fijo
- `YYYY` es el año actual
- `NNNNNN` es un número secuencial de 6 dígitos

Ejemplo: `DEP-2025-000001`

**Implementación en modelo:**
```javascript
depositSchema.pre('save', async function(next) {
  if (!this.code) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^DEP-${year}-`)
    });
    this.code = `DEP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});
```

### 2.8 Control de Permisos por Rol

**Roles soportados:**
- `admin` - Acceso completo (crear, editar, cerrar, cancelar, añadir/quitar artículos)
- `manager` - Acceso completo (crear, editar, cerrar, cancelar, añadir/quitar artículos)
- `viewer` - Solo lectura (ver)

**Botones deshabilitados según rol:**
- "Nuevo Depósito" - Solo admin/manager
- Botón "Editar" (✏️) - Solo admin/manager
- Botón "Cerrar" (✓) - Solo admin/manager
- Botón "Cancelar" (🗑️) - Solo admin/manager

**Restricciones adicionales:**
- No se puede editar depósitos cerrados o cancelados
- No se puede eliminar depósitos cerrados (error 400 con código `DEPOSIT_CLOSED`)
- No se puede eliminar depósitos facturados (error 400 con código `DEPOSIT_INVOICED`)

### 2.9 Estados del Depósito

Los depósitos tienen 5 estados posibles:

| Estado | Color | Descripción |
|--------|-------|-------------|
| active | success (verde) | Depósito activo |
| invoiced | info (azul) | Depósito facturado |
| partial | warning (amarillo) | Depósito parcialmente procesado |
| closed | secondary (gris) | Depósito cerrado |
| cancelled | dark (negro) | Depósito cancelado |

**Flujo de estados:**
```
active → partial → invoiced
   ↓        ↓
 closed   closed
   ↓
cancelled
```

### 2.10 Gestión de Artículos Dentro del Depósito

**Añadir artículo:**
```
POST /api/deposits/:id/items
Body: { article, quantity, unit, expiryDate, lotNumber, notes }
```

**Quitar artículo:**
```
DELETE /api/deposits/:id/items/:itemId
```

**Restricciones:**
- No se pueden añadir/quitar artículos de depósitos cerrados o cancelados
- El backend enriquece automáticamente con articleName, articleSKU
- Se recalcula totalValue después de cada operación

### 2.11 Interfaz de Usuario

**Mejoras visuales:**
- Loading spinner mientras carga datos
- Badges de estado con colores semánticos
- Badges de alerta con iconos y colores dinámicos
- Badges de cliente con colores personalizados
- Tabla responsiva con scroll horizontal
- Tooltips en botones de acción
- Modal backdrop para focus
- Mensajes toast para feedback inmediato
- Modal XL para formulario de creación/edición
- Gestión dinámica de artículos (añadir/quitar filas)

---

## Estructura de Datos

### Deposit Interface (Frontend)

```typescript
interface Deposit {
  _id: string;
  code: string;
  client: {
    _id: string;
    code: string;
    name: string;
    color?: string;
  };
  clientName?: string;
  warehouse?: string;
  warehouseName?: string;
  location?: string;
  items: DepositItem[];
  status: 'active' | 'invoiced' | 'partial' | 'closed' | 'cancelled';
  receivedDate: string;
  dueDate?: string;
  totalValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  updatedBy?: {
    name: string;
    email: string;
  };
  // Virtuals from backend
  daysUntilDue?: number | null;
  isOverdue?: boolean;
  alertLevel?: 'none' | 'info' | 'warning' | 'critical';
}
```

### DepositItem Interface

```typescript
interface DepositItem {
  _id?: string;
  article: {
    _id: string;
    sku: string;
    name: string;
  };
  articleName?: string;
  articleSKU?: string;
  quantity: number;
  unit: string;
  receivedDate: string;
  expiryDate?: string;
  lotNumber?: string;
  notes?: string;
}
```

### DepositStats Interface

```typescript
interface DepositStats {
  total: number;
  byStatus: {
    active: number;
    invoiced: number;
    partial: number;
    closed: number;
    cancelled: number;
  };
  totalValue: number;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}
```

---

## Flujos de Usuario

### 4.1 Crear Depósito

1. Usuario hace clic en "➕ Nuevo Depósito"
2. Se abre modal con formulario vacío
3. Usuario selecciona cliente (obligatorio)
4. Usuario opcionalmente añade almacén, ubicación, fecha de vencimiento
5. Usuario hace clic en "➕ Añadir Artículo"
6. Usuario selecciona artículo, cantidad, unidad, lote, caducidad
7. Usuario añade más artículos según necesidad
8. Usuario hace clic en "Crear"
9. Backend valida datos y artículos
10. Backend genera código automático (DEP-YYYY-NNNNNN)
11. Backend enriquece con articleName, articleSKU, clientName
12. Backend crea el depósito
13. Toast de confirmación
14. Se recarga la lista
15. Modal se cierra

### 4.2 Editar Depósito

1. Usuario hace clic en botón "✏️" de un depósito (solo si no está cerrado/cancelado)
2. Se abre modal con datos pre-cargados
3. Usuario modifica campos deseados
4. Usuario puede añadir/quitar artículos
5. Usuario hace clic en "Actualizar"
6. Backend valida que no esté cerrado o cancelado
7. Backend actualiza
8. Backend recalcula totalValue
9. Toast de confirmación
10. Se recarga la lista
11. Modal se cierra

### 4.3 Ver Detalles

1. Usuario hace clic en "👁️" de un depósito
2. Se abre modal de solo lectura
3. Usuario ve código auto-generado, cliente, fechas
4. Usuario ve badge de alerta si está próximo a vencer o vencido
5. Usuario ve lista de artículos en tabla
6. Si tiene permisos y no está cerrado/cancelado, puede hacer clic en "Editar"
7. Se cierra modal de vista y abre el de edición

### 4.4 Cerrar Depósito

1. Usuario hace clic en botón "✓" (solo admin/manager, solo si no está cerrado/cancelado)
2. Aparece confirmación: "¿Marcar este depósito como cerrado?"
3. Si confirma, se envía POST a `/api/deposits/:id/close`
4. Backend valida que no esté ya cerrado o cancelado
5. Backend marca como closed
6. Backend guarda updatedBy
7. Toast de confirmación
8. Se recarga la lista
9. El depósito ya no se puede editar ni cancelar

### 4.5 Cancelar Depósito

1. Usuario hace clic en botón "🗑️" (solo admin/manager)
2. Aparece confirmación: "¿Está seguro de cancelar este depósito?"
3. Si confirma, se envía DELETE a `/api/deposits/:id`
4. Backend valida que no esté cerrado o facturado
5. Si está cerrado: error 400 con código `DEPOSIT_CLOSED`
6. Si está facturado: error 400 con código `DEPOSIT_INVOICED`
7. Si válido: marca como cancelled (soft delete)
8. Toast de resultado
9. Se recarga la lista

---

## Manejo de Errores

### Errores Capturados

| Error | Causa | Manejo |
|-------|-------|--------|
| 400 Bad Request | Datos inválidos | Toast con mensaje del backend |
| 400 DEPOSIT_LOCKED | Intentar editar depósito cerrado/cancelado | Toast específico con sugerencias |
| 400 DEPOSIT_CLOSED | Intentar eliminar depósito cerrado | Toast "No se puede eliminar un depósito cerrado" |
| 400 DEPOSIT_INVOICED | Intentar eliminar depósito facturado | Toast "No se puede eliminar un depósito facturado" |
| 401 Unauthorized | Token inválido/expirado | Toast genérico de error |
| 403 Forbidden | Falta de permisos | Toast genérico de error |
| 404 Not Found | Depósito/artículo no existe | Toast con mensaje específico |
| 500 Server Error | Error interno | Toast "Error al [acción] depósito" |
| Network Error | Sin conexión | Toast "Error al cargar datos" |

---

## Endpoints API

### GET /api/deposits

**Descripción:** Listar depósitos con filtros

**Query Params:**
- `status` (optional): active | invoiced | partial | closed | cancelled
- `clientId` (optional): ObjectId del cliente
- `alertLevel` (optional): critical | warning | info
- `search` (optional): Búsqueda por código o cliente

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [ ... ]
}
```

### GET /api/deposits/stats

**Descripción:** Obtener estadísticas

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "byStatus": {
      "active": 50,
      "invoiced": 20,
      "partial": 10,
      "closed": 15,
      "cancelled": 5
    },
    "totalValue": 125000,
    "alerts": {
      "critical": 5,
      "warning": 10,
      "info": 15
    }
  }
}
```

### POST /api/deposits

**Descripción:** Crear nuevo depósito

**Body:**
```json
{
  "client": "507f1f77bcf86cd799439011",
  "warehouse": "Almacén Central",
  "location": "Pasillo A, Estante 3",
  "items": [
    {
      "article": "507f1f77bcf86cd799439012",
      "quantity": 50,
      "unit": "units",
      "lotNumber": "LOT-2025-001",
      "expiryDate": "2026-12-31",
      "notes": "Frágil"
    }
  ],
  "dueDate": "2025-12-31",
  "notes": "Depósito urgente"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit created successfully",
  "data": { ... }
}
```

### POST /api/deposits/:id/close

**Descripción:** Cerrar depósito

**Response:**
```json
{
  "success": true,
  "message": "Deposit closed successfully",
  "data": { ... }
}
```

---

## Próximos Pasos

### Mejoras Futuras

1. **Gestión de valores** - Asignar valor a cada artículo y calcular automáticamente
2. **Facturación automática** - Generar factura desde depósito
3. **Notificaciones de alerta** - Email cuando un depósito está próximo a vencer
4. **Dashboard de alertas** - Vista específica de depósitos vencidos
5. **Exportación** - A CSV/Excel/PDF
6. **Códigos de barras** - Escaneo de artículos al añadir
7. **Firma digital** - Captura de firma al cerrar depósito
8. **Historial de movimientos** - Track de añadir/quitar artículos
9. **Vista de almacén** - Agrupación por almacén físico
10. **Integración con Invoicing** - Crear factura directamente

---

## Archivos Creados/Modificados

### Backend

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `backend/src/controllers/depositController.js` | Creado | 500+ líneas, 10 funciones CRUD completas |
| `backend/src/routes/depositRoutes.js` | Creado | 50 líneas, rutas completas con auth |
| `backend/src/routes/index.js` | Modificado | Añadido montaje de deposits |
| `backend/src/server.js` | Modificado | Añadido endpoint a documentación |

### Frontend

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `frontend/src/pages/modules/DepositModule.tsx` | Reescritura completa | 1000 líneas, eliminado mapa y mock, añadido CRUD completo |

---

## Conclusión

El módulo de Deposits está **100% funcional** con backend completo (controlador y rutas) y frontend conectado al backend real. Todos los botones tienen handlers implementados, sistema de alertas funciona correctamente, y el manejo de errores es robusto.

El módulo está listo para pruebas de QA y despliegue a producción.

**Tiempo estimado de implementación:** ~3 horas
**Complejidad:** Alta
**Estado:** ✅ COMPLETO

---

**Módulos completados:** AssetsModule, MovementsModule, DepositModule
**Siguiente módulo:** InvoicingModule (si está planeado) o despliegue completo
