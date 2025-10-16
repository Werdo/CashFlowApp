# 📦 AssetFlow - Módulo de Gestión de Activos en Depósito

**Versión:** 1.0.0
**Fecha:** 15 de Octubre de 2025
**Caso de Uso:** Productos entregados en régimen de depósito con facturación por consumo

---

## 🎯 Objetivo General

Diseñar e implantar una plataforma digital que permita gestionar de forma centralizada la **trazabilidad y facturación** de productos entregados en depósito a clientes, los cuales los redistribuyen a su vez a puntos de venta propios o terceros.

---

## 🔄 Funcionamiento General

### **Flujo de Trabajo:**

```
┌─────────────┐
│  Proveedor  │
│   (Pedro)   │
└──────┬──────┘
       │ Entrega en depósito
       ▼
┌─────────────┐
│   Cliente   │
│ (Mayorista) │
└──────┬──────┘
       │ Distribuye a
       ▼
┌─────────────┐      ┌─────────────┐
│   Oficina   │◄────►│    Punto    │
│     Propia  │      │   de Venta  │
└──────┬──────┘      └──────┬──────┘
       │                    │
       └────────┬───────────┘
                │ Reporta venta semanal
                ▼
        ┌───────────────┐
        │   AssetFlow   │
        │   Platform    │
        └───────┬───────┘
                │ Genera factura
                ▼
        ┌───────────────┐
        │  Facturación  │
        │    Automática │
        └───────────────┘
```

### **Características Clave:**
1. ✅ Los productos se entregan en **régimen de depósito** (sin facturación inmediata)
2. ✅ El cliente **reporta semanalmente** las unidades vendidas
3. ✅ La plataforma mantiene **trazabilidad hasta la venta final**
4. ✅ **Genera facturación automática** basada en reportes

---

## 🧩 Módulos Principales

### **1. Conversión de Informes a Formato Estándar (JSON)**

#### **Objetivo:**
Permitir subir informes en múltiples formatos y convertirlos automáticamente a JSON estructurado.

#### **Funcionalidad:**
- 📄 **Upload de archivos:** PDF, Excel, CSV, TXT
- 🔄 **Conversión automática** a JSON según plantilla
- ✅ **Validación de estructura** antes de importar
- 📋 **Preview del resultado** antes de confirmar
- 🔧 **Edición manual** si es necesario

#### **Plantilla JSON Estándar:**
```json
{
  "reportId": "RPT-2025-W42-001",
  "cliente": {
    "id": "CLI-001",
    "nombre": "Distribuidor Norte S.L.",
    "codigo": "DN001"
  },
  "periodo": {
    "semana": 42,
    "año": 2025,
    "fechaInicio": "2025-10-14",
    "fechaFin": "2025-10-20"
  },
  "productos": [
    {
      "codigoQR": "QR-2025-001234",
      "codigoCaja": "CAJ-2025-045",
      "nombreProducto": "Producto A",
      "cantidad": 12,
      "oficina": "Oficina Norte",
      "puntoVenta": "Tienda 01",
      "fechaVenta": "2025-10-15",
      "precio": 25.50,
      "estado": "vendido"
    }
  ],
  "totales": {
    "cantidadProductos": 12,
    "valorTotal": 306.00,
    "productosVendidos": 12,
    "productosPendientes": 0
  },
  "metadata": {
    "archivoOriginal": "reporte_semana_42.xlsx",
    "fechaCarga": "2025-10-21T10:30:00Z",
    "usuarioCarga": "admin@empresa.com"
  }
}
```

#### **Lógica de Conversión:**

**Excel → JSON:**
```
Columnas esperadas:
- Código QR / Código Caja
- Producto
- Cantidad
- Oficina
- Punto de Venta
- Fecha de Venta
- Precio

Proceso:
1. Leer archivo Excel
2. Mapear columnas a campos JSON
3. Validar datos (códigos existen, fechas válidas, etc.)
4. Generar JSON estructurado
5. Mostrar preview al usuario
```

**PDF → JSON:**
```
Proceso:
1. OCR del PDF (si es necesario)
2. Extraer texto estructurado
3. Parsear usando regex o AI
4. Mapear a plantilla JSON
5. Validación manual del resultado
```

---

### **2. Gestión de Productos en Depósito**

#### **Modelo de Datos Extendido:**

```javascript
{
  // Asset base (heredado de AssetFlow)
  id: String,
  assetCode: String,

  // Específico de depósito
  depositInfo: {
    status: String,              // "en_deposito", "vendido", "facturado", "devuelto"
    codigoQR: String,            // Código QR individual único
    codigoCaja: String,          // ID de caja (agrupa productos)

    // Cliente y distribución
    clienteId: String,           // ID del cliente mayorista
    clienteNombre: String,       // Nombre del cliente
    oficinaActual: String,       // Oficina donde está actualmente
    puntoVentaFinal: String,     // Punto de venta final (si se conoce)

    // Fechas de trazabilidad
    fechaEntregaDeposito: Date,  // Cuándo se entregó en depósito
    fechaDistribucion: Date,     // Cuándo se distribuyó a oficina/PV
    fechaVenta: Date,            // Cuándo se vendió al consumidor final
    fechaReporte: Date,          // Cuándo se reportó la venta
    fechaFacturacion: Date,      // Cuándo se facturó

    // Financiero
    precioDeposito: Number,      // Precio acordado de venta
    precioVentaFinal: Number,    // Precio al que se vendió (si se conoce)
    comisionCliente: Number,     // Comisión del distribuidor (%)

    // Facturación
    facturaId: String,           // ID de factura generada
    lineaFactura: Number,        // Línea en la factura
    estadoFacturacion: String,   // "pendiente", "borrador", "facturado"

    // Trazabilidad
    historialMovimientos: [{
      fecha: Date,
      ubicacionOrigen: String,
      ubicacionDestino: String,
      responsable: String,
      tipo: String              // "deposito", "transferencia", "venta", "devolucion"
    }],

    // Reportes asociados
    reportesAsociados: [String], // IDs de reportes donde aparece

    // Documentación
    fotosEtiquetas: [String],    // URLs de fotos de etiquetas QR
    documentosEntrega: [String]  // Albaranes, acuses de recibo, etc.
  }
}
```

#### **Estados del Activo en Depósito:**

```
┌──────────────┐
│ EN_DEPOSITO  │ ──► Producto entregado al cliente mayorista
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ DISTRIBUIDO  │ ──► Asignado a una oficina/punto de venta
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   VENDIDO    │ ──► Reportado como vendido al consumidor final
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  FACTURADO   │ ──► Incluido en factura generada
└──────────────┘

       Además:
┌──────────────┐
│  DEVUELTO    │ ──► Producto devuelto al proveedor
└──────────────┘
```

---

### **3. Reportes Semanales**

#### **Recepción de Reportes:**

**Métodos de Entrada:**
1. **Upload de archivo** (Excel, PDF, CSV)
2. **Entrada manual** (formulario web)
3. **API REST** (cliente envía JSON directamente)
4. **Foto de etiquetas** (OCR de códigos QR)
5. **Escaneo por lote** (usando app móvil)

#### **Modelo de Reporte:**

```javascript
{
  id: String,
  reportNumber: String,           // RPT-2025-W42-001
  clienteId: String,
  periodo: {
    tipo: String,                 // "semanal", "quincenal", "mensual"
    semana: Number,
    año: Number,
    fechaInicio: Date,
    fechaFin: Date
  },

  productos: [{
    codigoQR: String,
    codigoCaja: String,
    cantidad: Number,
    oficina: String,
    puntoVenta: String,
    fechaVenta: Date,
    precio: Number,
    notas: String
  }],

  // Validación
  estado: String,                 // "pendiente", "validado", "rechazado", "procesado"
  erroresValidacion: [String],
  advertencias: [String],

  // Procesamiento
  productosEncontrados: Number,
  productosNoEncontrados: [String],
  duplicados: [String],
  yaFacturados: [String],

  // Auditoría
  archivoOriginal: String,
  fechaCarga: Date,
  cargadoPor: String,
  validadoPor: String,
  fechaValidacion: Date,
  procesadoPor: String,
  fechaProcesamiento: Date
}
```

#### **Proceso de Validación:**

```
1. CARGA
   ↓
2. VALIDACIÓN DE FORMATO
   - ¿JSON válido?
   - ¿Todos los campos requeridos?
   ↓
3. VALIDACIÓN DE CONTENIDO
   - ¿Códigos QR existen en sistema?
   - ¿Pertenecen al cliente que reporta?
   - ¿Están en estado "en_deposito" o "distribuido"?
   - ¿Fechas son coherentes?
   ↓
4. DETECCIÓN DE DUPLICADOS
   - ¿Ya reportado en otro reporte?
   - ¿Ya facturado?
   ↓
5. CÁLCULOS
   - Total unidades
   - Valor total
   - Agrupaciones por producto/oficina
   ↓
6. PREVIEW & CONFIRMACIÓN
   ↓
7. PROCESAMIENTO
   - Actualizar estado de activos
   - Generar borrador de factura
```

---

### **4. Módulo de Facturación**

#### **Generación de Facturas:**

**Flujo:**
```
Reportes Validados
       ↓
Agrupación por Cliente + Período
       ↓
Cálculo de Totales
       ↓
Aplicación de Descuentos/Comisiones
       ↓
Generación de Borrador
       ↓
Revisión Manual (opcional)
       ↓
Factura Final
       ↓
Export a Odoo/Contabilidad
```

#### **Modelo de Factura:**

```javascript
{
  id: String,
  numeroFactura: String,          // FACT-2025-10-001
  tipo: String,                   // "deposito", "normal", "rectificativa"

  cliente: {
    id: String,
    nombre: String,
    nif: String,
    direccion: String,
    email: String
  },

  periodo: {
    fechaInicio: Date,
    fechaFin: Date,
    semana: Number,
    año: Number
  },

  lineas: [{
    lineaNumero: Number,
    productoId: String,
    codigoQR: String,            // Referencia individual
    descripcion: String,
    cantidad: Number,
    precioUnitario: Number,
    descuento: Number,           // %
    baseImponible: Number,
    iva: Number,                 // %
    total: Number,

    // Trazabilidad
    reporteId: String,           // De dónde viene
    oficinaVenta: String,
    fechaVenta: Date
  }],

  totales: {
    baseImponible: Number,
    totalIVA: Number,
    totalFactura: Number,
    comisionesAplicadas: Number,
    descuentosAplicados: Number
  },

  estado: String,                // "borrador", "emitida", "pagada", "anulada"

  fechaEmision: Date,
  fechaVencimiento: Date,
  formaPago: String,

  documentos: {
    pdfUrl: String,
    xmlUrl: String,              // Formato electrónico
    albaranesAsociados: [String]
  },

  // Exportación
  exportadaOdoo: Boolean,
  idOdoo: String,
  fechaExportacion: Date,

  // Auditoría
  creadaPor: String,
  fechaCreacion: Date,
  aprobadaPor: String,
  fechaAprobacion: Date
}
```

#### **Exportación a Odoo:**

```javascript
// Endpoint de integración
POST /api/integration/odoo/export-invoice

// Payload
{
  facturaId: "FACT-2025-10-001",
  formato: "xml" | "json",
  incluirLineasDetalle: true,
  incluirDocumentos: true
}

// Response
{
  success: true,
  odooInvoiceId: "INV-12345",
  estado: "exported",
  fecha: "2025-10-21T15:30:00Z"
}
```

---

### **5. Dashboard de Control**

#### **Widgets Principales:**

**1. Inventario en Depósito**
```
┌─────────────────────────────┐
│  INVENTARIO EN DEPÓSITO     │
├─────────────────────────────┤
│  Total Productos: 1,234     │
│  Valor Total: €45,678.00    │
│  En Depósito: 800           │
│  Distribuidos: 400          │
│  Vendidos (no fact.): 34    │
└─────────────────────────────┘
```

**2. Ventas Semanales**
```
┌─────────────────────────────┐
│  VENTAS SEMANA 42/2025      │
├─────────────────────────────┤
│  Productos Vendidos: 120    │
│  Valor: €3,060.00           │
│  Oficinas Activas: 8        │
│  Reportes Pendientes: 2     │
└─────────────────────────────┘
```

**3. Facturación Generada**
```
┌─────────────────────────────┐
│  FACTURACIÓN OCTUBRE 2025   │
├─────────────────────────────┤
│  Facturas Emitidas: 12      │
│  Total Facturado: €15,890   │
│  Pendientes Cobro: €3,200   │
│  Comisiones: €1,120         │
└─────────────────────────────┘
```

**4. Gráfico de Tendencias**
```
Productos Vendidos por Semana
│
│     ████
│   ████████
│ ██████████████
│ ██████████████████
└────────────────────────
  W38 W39 W40 W41 W42
```

#### **Filtros Disponibles:**
- 📅 Por período (semana, mes, trimestre, año)
- 👤 Por cliente
- 📍 Por oficina
- 🏪 Por punto de venta
- 📦 Por producto/categoría
- 🔖 Por estado (depósito, vendido, facturado)

---

## 🔍 Trazabilidad Completa

### **Por Código QR Individual:**

```
Código QR: QR-2025-001234

┌─────────────────────────────────────┐
│ TRAZABILIDAD COMPLETA               │
├─────────────────────────────────────┤
│ 01/10/2025 - Fabricado              │
│ 03/10/2025 - Entregado en depósito  │
│              Cliente: Distribuidor Norte
│              Contacto: Juan Pérez
│                                      │
│ 05/10/2025 - Transferido a oficina  │
│              Oficina: Norte 01
│              Ubicación: Madrid
│                                      │
│ 15/10/2025 - Vendido                │
│              PV: Tienda Central
│              Precio: €25.50
│                                      │
│ 21/10/2025 - Reportado               │
│              Reporte: RPT-W42-001
│                                      │
│ 22/10/2025 - Facturado               │
│              Factura: FACT-2025-10-001
│              Línea: 5
└─────────────────────────────────────┘
```

### **Por Caja:**

```
Caja: CAJ-2025-045 (20 unidades)

├─ QR-2025-001234 ✓ Vendido - Fact. 001
├─ QR-2025-001235 ✓ Vendido - Fact. 001
├─ QR-2025-001236 ✓ Vendido - Fact. 002
├─ QR-2025-001237 ⚠️ En depósito
├─ QR-2025-001238 ⚠️ En depósito
└─ ... (15 más)

Resumen:
- Vendidos: 3
- En depósito: 17
- Tasa rotación: 15%
```

---

## 📱 Soporte Múltiples Formatos de Reporte

### **1. Texto (Lista de Códigos)**
```
Cliente: DN001
Semana: 42/2025

QR-2025-001234
QR-2025-001235
QR-2025-001236
...
```

### **2. Excel Estructurado**
```
| Código QR      | Producto   | Oficina    | Fecha Venta | Cantidad | Precio |
|----------------|------------|------------|-------------|----------|--------|
| QR-2025-001234 | Producto A | Norte 01   | 15/10/2025  | 1        | 25.50  |
| QR-2025-001235 | Producto A | Norte 01   | 15/10/2025  | 1        | 25.50  |
```

### **3. Imagen (Fotos de Etiquetas)**
```
[Foto.jpg] → OCR → [QR-2025-001234, QR-2025-001235, ...]
                ↓
         Validación automática
                ↓
         Añadir a reporte
```

### **4. API JSON (Sistema del Cliente)**
```javascript
POST /api/reports/submit
Authorization: Bearer {client_token}

{
  "clienteId": "CLI-001",
  "periodo": { "semana": 42, "año": 2025 },
  "productos": [
    { "codigoQR": "QR-2025-001234", "cantidad": 1, ... }
  ]
}
```

---

## 🎯 Integración con AssetFlow Base

### **Relación de Módulos:**

```
AssetFlow Core
    ├─ Asset Management (base)
    ├─ Depreciation
    ├─ Maintenance
    └─ Reports

AssetFlow Deposit Extension ⭐
    ├─ Deposit Management
    ├─ Weekly Reports Processing
    ├─ Automatic Invoicing
    ├─ QR/Barcode Tracking
    └─ External Integration (Odoo)
```

### **Ventajas de la Arquitectura:**

1. ✅ **Modularidad** - Deposit puede activarse/desactivarse
2. ✅ **Reutilización** - Usa la base de Asset Management
3. ✅ **Escalabilidad** - Fácil añadir otros módulos
4. ✅ **Trazabilidad** - Aprovecha sistema de auditoría existente
5. ✅ **Multi-tenant** - Cada cliente puede tener su vista

---

## 📊 KPIs Específicos de Depósito

### **Operacionales:**
- Productos en depósito vs vendidos (ratio)
- Tiempo promedio en depósito
- Tasa de rotación por oficina
- Tasa de devoluciones

### **Financieros:**
- Valor en depósito no facturado
- Facturación semanal/mensual
- Comisiones generadas
- Días promedio de cobro

### **Cliente:**
- Reportes a tiempo (%)
- Exactitud de reportes (%)
- Productos por oficina
- Puntos de venta activos

---

## 🚀 Roadmap de Implementación

### **Fase 1: Base (2 semanas)**
- ✅ Modelo de datos extendido
- ✅ CRUD de productos en depósito
- ✅ Tracking de estados

### **Fase 2: Reportes (2 semanas)**
- ✅ Upload y conversión de archivos
- ✅ Validación de reportes
- ✅ Dashboard de reportes

### **Fase 3: Facturación (2 semanas)**
- ✅ Generación de facturas
- ✅ Export a PDF/XML
- ✅ Integración con Odoo

### **Fase 4: Analytics (1 semana)**
- ✅ Dashboard completo
- ✅ Reportes avanzados
- ✅ Alertas automáticas

---

**Preparado por:** Claude Code
**Cliente:** Pedro
**Fecha:** 15/10/2025

🤖 Generated with [Claude Code](https://claude.com/claude-code)
