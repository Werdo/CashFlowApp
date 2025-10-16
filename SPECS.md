# 📦 AssetFlow v1.0 - Especificaciones del Proyecto

**Proyecto:** AssetFlow - Sistema de Gestión de Flujo de Activos
**Versión:** 1.0.0
**Base:** Arquitectura CashFlow v4.0
**Fecha:** 15 de Octubre de 2025
**Estado:** En Desarrollo

---

## 🎯 Descripción del Proyecto

**AssetFlow** es un sistema enterprise-ready para la gestión integral de activos empresariales, permitiendo el seguimiento, control y optimización del ciclo de vida completo de los activos de una organización.

### **Diferencias clave con CashFlow:**
- **CashFlow:** Gestiona flujo de dinero (ingresos/gastos)
- **AssetFlow:** Gestiona flujo de activos (adquisición/disposición/depreciación)

---

## 🏗️ Arquitectura

### **Stack Tecnológico:**
```
Frontend:  React 18 + Tailwind CSS + Recharts
Backend:   Node.js + Express + MongoDB
Database:  MongoDB 7.0
DevOps:    Docker + Docker Compose + Nginx
```

### **Microservicios:**
```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│         Port 80/443 (SSL)               │
└─────────────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼──────┐      ┌────────▼────────┐
│  Frontend  │      │    Backend API  │
│  (React)   │      │  (Express)      │
│  Port 80   │      │  Port 5000      │
└────────────┘      └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │    MongoDB       │
                    │    Port 27017    │
                    └──────────────────┘
```

---

## 📊 Modelo de Datos

### **Entidades Principales:**

#### 1. **Asset (Activo)**
```javascript
{
  id: String,
  assetCode: String,        // Código único del activo
  name: String,             // Nombre descriptivo
  category: String,         // Categoría (Maquinaria, Equipos, Vehículos, etc.)
  subcategory: String,      // Subcategoría específica
  description: String,      // Descripción detallada

  // Financiero
  purchaseValue: Number,    // Valor de compra
  currentValue: Number,     // Valor actual (depreciado)
  residualValue: Number,    // Valor residual estimado
  depreciationMethod: String, // Lineal, Acelerada, etc.
  depreciationRate: Number,  // % anual de depreciación
  usefulLife: Number,       // Vida útil en años

  // Estado
  status: String,           // Activo, En mantenimiento, Dado de baja, etc.
  condition: String,        // Excelente, Bueno, Regular, Malo
  location: String,         // Ubicación física
  department: String,       // Departamento asignado
  responsiblePerson: String, // Persona responsable

  // Fechas
  purchaseDate: Date,       // Fecha de compra
  activationDate: Date,     // Fecha de puesta en servicio
  lastMaintenanceDate: Date, // Última fecha de mantenimiento
  nextMaintenanceDate: Date, // Próximo mantenimiento programado
  disposalDate: Date,       // Fecha de baja (si aplica)

  // Documentos y archivos
  invoiceNumber: String,    // Número de factura
  warrantyExpiry: Date,     // Vencimiento de garantía
  documents: [String],      // URLs de documentos adjuntos
  photos: [String],         // URLs de fotos del activo

  // Tracking
  tags: [String],           // Etiquetas para categorización
  notes: String,            // Notas adicionales
  qrCode: String,           // Código QR único
  barcode: String,          // Código de barras

  // Auditoría
  createdBy: String,
  createdAt: Date,
  updatedBy: String,
  updatedAt: Date,
  history: [{
    field: String,
    oldValue: Any,
    newValue: Any,
    modifiedBy: String,
    modifiedAt: Date
  }]
}
```

#### 2. **Maintenance (Mantenimiento)**
```javascript
{
  id: String,
  assetId: String,          // Referencia al activo
  type: String,             // Preventivo, Correctivo, Predictivo
  description: String,      // Descripción del mantenimiento
  scheduledDate: Date,      // Fecha programada
  completedDate: Date,      // Fecha de finalización
  cost: Number,             // Costo del mantenimiento
  provider: String,         // Proveedor del servicio
  technician: String,       // Técnico asignado
  status: String,           // Pendiente, En proceso, Completado
  notes: String,
  documents: [String],
  createdBy: String,
  createdAt: Date
}
```

#### 3. **Movement (Movimiento de Activo)**
```javascript
{
  id: String,
  assetId: String,
  movementType: String,     // Transferencia, Asignación, Reasignación, Baja
  fromLocation: String,
  toLocation: String,
  fromDepartment: String,
  toDepartment: String,
  fromPerson: String,
  toPerson: String,
  date: Date,
  reason: String,
  approvedBy: String,
  notes: String,
  createdBy: String,
  createdAt: Date
}
```

#### 4. **Depreciation (Depreciación)**
```javascript
{
  id: String,
  assetId: String,
  year: Number,
  month: Number,
  depreciationAmount: Number,
  accumulatedDepreciation: Number,
  bookValue: Number,        // Valor en libros
  calculatedDate: Date,
  method: String,
  createdAt: Date
}
```

#### 5. **User (Usuario)**
```javascript
{
  id: String,
  name: String,
  email: String,
  password: String,         // Hashed
  role: String,             // admin, manager, user
  department: String,
  permissions: [String],
  createdAt: Date,
  lastLogin: Date
}
```

---

## 🎨 Funcionalidades v1.0

### **Dashboard Principal**
- 📊 Resumen de activos totales
- 💰 Valor total de activos
- 📉 Depreciación acumulada
- 🔧 Mantenimientos pendientes
- 📍 Distribución por ubicación
- 📊 Gráficos de tendencias
- 🚨 Alertas y notificaciones

### **Gestión de Activos**
- ➕ Añadir nuevo activo
- ✏️ Editar activo existente
- 🗑️ Dar de baja activo
- 🔍 Búsqueda avanzada
- 🏷️ Filtrado por categorías, ubicación, estado
- 📋 Vista de lista / Vista de tarjetas / Vista de tabla
- 📸 Subida de fotos
- 📄 Adjuntar documentos
- 🖨️ Imprimir código QR/Barcode

### **Depreciación**
- 📉 Cálculo automático de depreciación
- 📊 Métodos: Lineal, Acelerada, Unidades producidas
- 📅 Vista mensual/anual de depreciación
- 📈 Gráficos de valor en libros
- 📊 Reportes fiscales de depreciación

### **Mantenimiento**
- 🔧 Programar mantenimientos preventivos
- ⚠️ Registro de mantenimientos correctivos
- 📅 Calendario de mantenimientos
- 🔔 Alertas de mantenimiento próximo
- 💰 Control de costos de mantenimiento
- 📊 Historial completo por activo
- 📈 Estadísticas de mantenimiento

### **Movimientos**
- 📦 Transferencias entre ubicaciones
- 👤 Asignaciones a personas/departamentos
- 📋 Historial de movimientos
- ✅ Aprobaciones de transferencias
- 📊 Trazabilidad completa

### **Reportes y Analytics**
- 📊 Reporte de inventario completo
- 💰 Reporte de valor de activos
- 📉 Reporte de depreciación
- 🔧 Reporte de mantenimientos
- 📍 Reporte por ubicación
- 📈 Análisis de tendencias
- 📄 Exportación a Excel/PDF

### **Administración**
- 👥 Gestión de usuarios
- 🔐 Roles y permisos
- 🏢 Configuración de empresa
- 🏷️ Configuración de categorías
- 📍 Gestión de ubicaciones
- 🏪 Gestión de departamentos
- ⚙️ Configuración general

---

## 🔐 Seguridad

### **Autenticación:**
- JWT tokens
- Password hashing (bcrypt)
- Refresh tokens
- Session management

### **Autorización:**
- Role-based access control (RBAC)
- Permisos granulares por módulo
- Auditoría completa de acciones

### **Datos:**
- Encriptación de datos sensibles
- Backups automáticos
- GDPR compliance ready

---

## 🎨 Diseño UI/UX

### **Paleta de Colores:**
```css
Primary:   #3B82F6 (Blue)     - Acciones principales
Secondary: #8B5CF6 (Purple)   - Acciones secundarias
Success:   #10B981 (Green)    - Estados positivos
Warning:   #F59E0B (Orange)   - Advertencias
Danger:    #EF4444 (Red)      - Acciones destructivas
Info:      #06B6D4 (Cyan)     - Información
```

### **Iconografía:**
- Lucide React icons
- Iconos consistentes y profesionales
- Tamaño estándar: 20px

### **Layout:**
```
┌────────────────────────────────────────┐
│  Header (Logo, Search, User Menu)     │
├─────────┬──────────────────────────────┤
│         │                              │
│ Sidebar │      Main Content            │
│         │                              │
│ - Home  │  [Dashboard/List/Form]       │
│ - Assets│                              │
│ - Maint │                              │
│ - Move  │                              │
│ - Repts │                              │
│ - Admin │                              │
│         │                              │
└─────────┴──────────────────────────────┘
```

---

## 📱 Responsive Design

### **Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### **Mobile-First:**
- Sidebar colapsable
- Tablas → Cards en móvil
- Touch-friendly buttons
- Gestos táctiles

---

## 🚀 Roadmap de Desarrollo

### **Fase 1: MVP (Semana 1-2)**
- ✅ Setup del proyecto
- ✅ Autenticación básica
- ✅ CRUD de activos
- ✅ Dashboard básico
- ✅ Docker deployment

### **Fase 2: Core Features (Semana 3-4)**
- ⏳ Sistema de depreciación
- ⏳ Gestión de mantenimientos
- ⏳ Movimientos de activos
- ⏳ Búsqueda y filtros avanzados

### **Fase 3: Analytics (Semana 5)**
- ⏳ Reportes completos
- ⏳ Gráficos y estadísticas
- ⏳ Exportación de datos
- ⏳ Dashboard analytics

### **Fase 4: Advanced (Semana 6)**
- ⏳ Códigos QR/Barcode
- ⏳ App móvil (PWA)
- ⏳ Notificaciones push
- ⏳ Integración con ERP

---

## 🔧 API Endpoints

### **Auth:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
```

### **Assets:**
```
GET    /api/assets              - Listar todos
POST   /api/assets              - Crear nuevo
GET    /api/assets/:id          - Obtener uno
PUT    /api/assets/:id          - Actualizar
DELETE /api/assets/:id          - Eliminar
GET    /api/assets/search       - Búsqueda avanzada
GET    /api/assets/categories   - Por categoría
GET    /api/assets/location     - Por ubicación
POST   /api/assets/:id/photo    - Subir foto
POST   /api/assets/:id/document - Adjuntar documento
```

### **Maintenance:**
```
GET    /api/maintenance
POST   /api/maintenance
GET    /api/maintenance/:id
PUT    /api/maintenance/:id
DELETE /api/maintenance/:id
GET    /api/maintenance/pending
GET    /api/maintenance/asset/:assetId
```

### **Movements:**
```
GET    /api/movements
POST   /api/movements
GET    /api/movements/:id
GET    /api/movements/asset/:assetId
```

### **Depreciation:**
```
GET    /api/depreciation/asset/:assetId
POST   /api/depreciation/calculate
GET    /api/depreciation/report
```

### **Reports:**
```
GET    /api/reports/inventory
GET    /api/reports/value
GET    /api/reports/depreciation
GET    /api/reports/maintenance
POST   /api/reports/export
```

---

## 📊 KPIs y Métricas

### **Operacionales:**
- Número total de activos
- Valor total de activos
- Depreciación acumulada
- Tasa de utilización de activos
- Tiempo medio entre fallos (MTBF)
- Tiempo medio de reparación (MTTR)

### **Financieros:**
- Valor en libros
- ROI de activos
- Costo total de propiedad (TCO)
- Ratio de mantenimiento/valor

### **Técnicos:**
- Mantenimientos preventivos vs correctivos
- Tasa de disponibilidad
- Vida útil promedio
- Tasa de baja de activos

---

## 🎯 Diferenciadores vs CashFlow

| Característica | CashFlow | AssetFlow |
|----------------|----------|-----------|
| **Enfoque** | Flujo de caja | Flujo de activos |
| **Entidad Principal** | Transacción monetaria | Activo físico |
| **Valor** | Dinero | Depreciación |
| **Temporalidad** | Día a día | Ciclo de vida |
| **Alertas** | Pagos/cobros | Mantenimientos |
| **Reportes** | P&L, Cash flow | Inventario, Deprec. |
| **Códigos** | N/A | QR/Barcode |
| **Documentos** | Facturas | Fotos, manuales |

---

## 📄 Licencia

MIT License

---

**Preparado por:** Claude Code
**Fecha:** 15/10/2025
**Versión:** 1.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
