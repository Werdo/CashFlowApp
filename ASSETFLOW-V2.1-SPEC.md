# AssetFlow v2.1 - Especificación Completa de Cambios

**Versión:** 2.1.0
**Tipo:** Major Update - Sistema de Gestión de Almacén y Logística
**Fecha:** 2025-10-17
**Estado:** 📋 Planificación

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Usuarios y Autenticación](#usuarios-y-autenticación)
3. [Sistema de Clientes Multi-nivel](#sistema-de-clientes-multi-nivel)
4. [Gestión de Artículos](#gestión-de-artículos)
5. [Sistema de Trazabilidad](#sistema-de-trazabilidad)
6. [Dashboard y Analytics](#dashboard-y-analytics)
7. [Integración IA](#integración-ia)
8. [Sistema de Exportación](#sistema-de-exportación)
9. [Configuración del Sistema](#configuración-del-sistema-settings)
10. [Módulos Eliminados](#módulos-eliminados)
11. [Modelo de Datos](#modelo-de-datos)
12. [Plan de Implementación](#plan-de-implementación)

---

## 🎯 Resumen Ejecutivo

### Transformación Principal

**De:** Sistema de gestión de activos corporativos
**A:** Sistema de gestión de almacén y logística con trazabilidad completa

### Cambios Clave

- ✅ Sistema de usuarios admin predefinidos
- ✅ Estructura de clientes jerárquica (3 niveles)
- ✅ Gestión de artículos con SKU/EAN
- ✅ Trazabilidad completa por lotes
- ✅ Dashboard analítico avanzado
- ✅ Integración con IA para consultas
- ✅ Sistema de exportación de informes
- ✅ Página de configuración completa (usuarios, tema, empresa, sistema, integraciones)
- ❌ Eliminación del módulo de Mantenimiento
- ❌ Eliminación del módulo de Movimientos (reemplazado por Albaranes)

---

## 👥 Usuarios y Autenticación

### Usuarios Predefinidos (Admin)

```javascript
const INITIAL_USERS = [
  {
    email: 'gvarela@oversunenergy.com',
    name: 'Gustavo Varela',
    role: 'admin',
    company: 'Oversun Energy',
    password: 'hashed_password'
  },
  {
    email: 'sjimenez@oversunenergy.com',
    name: 'Sara Jiménez',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'mherreros@oversunenergy.com',
    name: 'María Herreros',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'ppelaez@oversunenergy.com',
    name: 'Pedro Peláez',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'mperez@gestaeasesores.com',
    name: 'Manuel Pérez',
    role: 'admin',
    company: 'Gestae Asesores'
  }
];
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso completo al sistema |
| **manager** | Gestión de inventario y clientes (futuro) |
| **viewer** | Solo lectura (futuro) |

### Comandos de Inicialización

```bash
npm run create-admin-users    # Crear usuarios admin
npm run reset-database         # Limpiar datos de prueba
npm run seed-initial-data      # Datos iniciales si necesario
```

---

## 🏢 Sistema de Clientes Multi-nivel

### Estructura Jerárquica (3 Niveles)

```
Cliente (Nivel 1)
  ├─ Almacén Central
  ├─ Sucursal A (Sub-cliente, Nivel 2)
  │   ├─ Almacén Sucursal A
  │   └─ Sub-sucursal A1 (Sub-sub-cliente, Nivel 3)
  │       └─ Almacén Sub-sucursal A1
  └─ Sucursal B (Sub-cliente, Nivel 2)
      └─ Almacén Sucursal B
```

### Modelo de Cliente

```javascript
{
  _id: ObjectId,
  code: "CLI-001",
  name: "Oversun Energy",
  type: "client",              // client, sub-client, sub-sub-client
  level: 1,                    // 1, 2, 3
  parentClientId: null,        // null para nivel 1
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  warehouses: [
    {
      warehouseId: ObjectId,
      name: "Almacén Central Madrid",
      type: "central",         // central, branch
      address: String,
      locations: [             // Emplazamientos importados
        {
          code: "A-01",
          name: "Pasillo A - Rack 01",
          capacity: Number
        }
      ]
    }
  ],
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Funcionalidades de Clientes

1. **Gestión de Clientes**
   - Crear cliente de nivel 1
   - Añadir sub-clientes (nivel 2)
   - Añadir sub-sub-clientes (nivel 3)
   - Vista de árbol jerárquico

2. **Gestión de Almacenes**
   - Almacén central por cliente
   - Múltiples almacenes por sucursal
   - Importar emplazamientos vía CSV
   - Crear emplazamientos manualmente

3. **Importación de Emplazamientos**
   ```csv
   codigo,nombre,tipo,capacidad,pasillo,rack,nivel
   A-01-01,"Pasillo A - Rack 01 - Nivel 01",estanteria,100,A,01,01
   A-01-02,"Pasillo A - Rack 01 - Nivel 02",estanteria,100,A,01,02
   ```

---

## 📦 Gestión de Artículos

### Modelo de Artículo

```javascript
{
  _id: ObjectId,
  sku: "SKU-001",              // Código interno único
  ean: "1234567890123",        // Código de barras EAN-13
  name: "Panel Solar 450W",
  description: String,
  family: {
    id: ObjectId,
    name: "Paneles Solares",
    code: "FAM-001"
  },
  specifications: {
    brand: String,
    model: String,
    attributes: Map           // Atributos dinámicos
  },
  pricing: {
    cost: Number,
    price: Number,
    currency: "EUR"
  },
  images: [
    {
      url: String,
      isPrimary: Boolean,
      uploadedAt: Date
    }
  ],
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Familias de Productos

```javascript
{
  _id: ObjectId,
  code: "FAM-001",
  name: "Paneles Solares",
  description: String,
  parentFamilyId: ObjectId,   // Para sub-familias
  attributes: [               // Atributos específicos de la familia
    {
      name: "Potencia",
      type: "number",
      unit: "W",
      required: true
    }
  ]
}
```

### Funcionalidades de Artículos

1. **Gestión de Artículos**
   - CRUD completo de artículos
   - Upload de fotos (múltiples imágenes)
   - Asignación de familias
   - Gestión de precios

2. **Gestión de Familias**
   - Crear familias y sub-familias
   - Definir atributos por familia
   - Importar/Exportar catálogo

3. **Búsqueda y Filtrado**
   - Por SKU/EAN
   - Por familia
   - Por precio
   - Búsqueda de texto completo

---

## 🔍 Sistema de Trazabilidad

### Niveles de Trazabilidad

1. **Lote Master** - Lote de fabricación/importación
2. **Lote Expo** - Lote de exportación/envío
3. **Código de Trazabilidad Individual** - Por unidad

### Modelo de Lote

```javascript
{
  _id: ObjectId,
  type: "master",             // master, expo
  code: "LOTE-M-2025-001",
  articleId: ObjectId,
  quantity: Number,
  manufacturingDate: Date,
  expiryDate: Date,
  status: "active",           // active, expired, depleted
  parentLotId: ObjectId,      // Para lotes expo (ref a master)
  traceability: {
    origin: String,
    supplier: String,
    certifications: [String]
  },
  createdAt: Date
}
```

### Modelo de Unidad de Stock

```javascript
{
  _id: ObjectId,
  traceabilityCode: "TRZ-2025-001234",  // Código único por unidad
  articleId: ObjectId,
  lotMasterId: ObjectId,
  lotExpoId: ObjectId,
  deliveryNoteId: ObjectId,              // Albarán de entrada
  currentLocation: {
    clientId: ObjectId,
    warehouseId: ObjectId,
    locationCode: String                 // Emplazamiento
  },
  dates: {
    received: Date,
    expiry: Date,
    lastMovement: Date
  },
  stockAge: Number,                      // Días desde recepción (calculado)
  status: "available",                   // available, reserved, shipped, expired
  movements: [                           // Historial de movimientos
    {
      date: Date,
      type: "entry",                     // entry, movement, exit
      from: Object,
      to: Object,
      deliveryNoteId: ObjectId,
      userId: ObjectId
    }
  ]
}
```

### Calendario de Vencimientos

```javascript
{
  _id: ObjectId,
  date: Date,                            // Fecha de vencimiento
  items: [
    {
      articleId: ObjectId,
      articleName: String,
      lotId: ObjectId,
      lotCode: String,
      quantity: Number,
      location: String,
      daysUntilExpiry: Number,
      alertLevel: "green",               // green, yellow, red
    }
  ]
}
```

### Funcionalidades de Trazabilidad

1. **Gestión de Lotes**
   - Crear lotes master
   - Generar lotes expo desde master
   - Asignar fechas de vencimiento
   - Tracking de antigüedad

2. **Códigos de Trazabilidad**
   - Generación automática de códigos
   - Asociación con QR
   - Historial completo de movimientos

3. **Calendario de Vencimientos**
   - Vista mensual de vencimientos
   - Alertas por proximidad
   - Filtros por producto/cliente
   - Exportación de vencimientos próximos

4. **Cálculo de Antigüedad**
   ```javascript
   stockAge = Math.floor((new Date() - receivedDate) / (1000 * 60 * 60 * 24));

   alertLevel = {
     green: stockAge < 60,
     yellow: stockAge >= 60 && stockAge < 90,
     red: stockAge >= 90
   };
   ```

---

## 📊 Dashboard y Analytics

### Dashboard General (Cuadro de Mando)

#### Métricas Principales

1. **Total de Unidades**
   ```javascript
   {
     total: Number,
     byClient: [
       { clientName: String, units: Number }
     ],
     byProductType: [
       { family: String, units: Number }
     ],
     byStatus: {
       available: Number,
       reserved: Number,
       shipped: Number
     }
   }
   ```

2. **Antigüedad del Stock**
   ```javascript
   {
     distribution: [
       { range: "0-30 días", quantity: Number, percentage: Number },
       { range: "31-60 días", quantity: Number, percentage: Number },
       { range: "61-90 días", quantity: Number, percentage: Number },
       { range: ">90 días", quantity: Number, percentage: Number }
     ],
     average: Number,
     oldest: {
       articleName: String,
       days: Number,
       location: String
     }
   }
   ```

3. **Ventas Últimos Meses**
   ```javascript
   {
     monthly: [
       {
         month: "2025-07",
         sales: Number,
         units: Number,
         revenue: Number
       }
     ],
     trend: "up",              // up, down, stable
     growthRate: Number        // Porcentaje
   }
   ```

4. **Evolución de Stock**
   - Gráfica de evolución temporal
   - Entradas vs Salidas
   - Proyección de tendencia

### Dashboard de Análisis

#### Entregas vs Previsiones

```javascript
{
  clientId: ObjectId,
  period: "2025-10",
  deliveries: [
    {
      date: Date,
      deliveryNoteId: ObjectId,
      quantity: Number,
      type: "delivered",        // Color verde
      articles: [...]
    }
  ],
  forecasts: [
    {
      date: Date,
      expectedQuantity: Number,
      type: "forecast",         // Color azul/gris
      articles: [...]
    }
  ],
  accuracy: {
    delivered: Number,
    forecast: Number,
    variance: Number,
    percentageAccuracy: Number
  }
}
```

#### Visualizaciones

1. **Gráfico de Barras Apiladas**
   - Eje X: Fechas
   - Eje Y: Unidades
   - Verde: Entregado
   - Azul: Previsto

2. **Línea de Tendencia**
   - Evolución histórica
   - Previsión calculada (ML simple)

3. **Mapa de Calor**
   - Distribución por ubicaciones
   - Densidad de stock

### Previsiones

```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  articleId: ObjectId,
  forecastDate: Date,
  quantity: Number,
  confidence: Number,         // 0-100%
  method: "historical",       // historical, manual, ai
  basedOn: {
    historicalData: [...]
  },
  createdBy: ObjectId,
  createdAt: Date
}
```

---

## 🤖 Integración IA

### Sistema Similar a CashFlow App

#### Modelo de Consulta IA

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  query: String,
  aiProvider: "openai",       // openai, anthropic, local
  model: "gpt-4",
  context: {
    clientId: ObjectId,
    dateRange: {
      start: Date,
      end: Date
    },
    dataScope: ["stock", "deliveries", "forecasts"]
  },
  response: {
    text: String,
    data: Object,
    visualizations: [...]
  },
  timestamp: Date
}
```

#### Proveedores de IA Disponibles

1. **OpenAI (GPT-4)**
2. **Anthropic (Claude)**
3. **Local Model** (Ollama/LLaMA)

#### Casos de Uso

```javascript
// Ejemplos de consultas
const queries = [
  "¿Cuál es el stock actual de paneles solares 450W?",
  "Muestra la antigüedad promedio del stock por cliente",
  "Calcula la previsión de ventas para el próximo mes",
  "¿Qué productos tienen stock con más de 90 días?",
  "Compara las entregas de este mes vs el mes pasado",
  "Genera un resumen de vencimientos próximos"
];
```

#### Arquitectura de IA

```javascript
// Backend: /api/ai/query
POST /api/ai/query
{
  "query": "¿Cuál es el stock actual?",
  "provider": "openai",
  "includeCharts": true,
  "context": {
    "clientId": "...",
    "dateRange": {...}
  }
}

// Response
{
  "response": {
    "text": "El stock actual es de 1,234 unidades...",
    "data": {
      "total": 1234,
      "byFamily": [...]
    },
    "visualizations": [
      {
        "type": "pie",
        "data": {...}
      }
    ]
  },
  "usage": {
    "tokens": 150,
    "cost": 0.003
  }
}
```

---

## 📤 Sistema de Exportación

### Exportador de Informes

#### Parámetros de Exportación

```javascript
{
  format: "excel",            // excel, pdf, csv
  reportType: "inventory",    // inventory, movements, aging, expiry
  filters: {
    dateRange: {
      start: Date,
      end: Date,
      groupBy: "month"        // day, month, year
    },
    client: ObjectId,
    product: ObjectId,
    warehouse: ObjectId,
    location: String
  },
  columns: [String],          // Columnas a incluir
  sorting: {
    field: String,
    order: "asc"              // asc, desc
  }
}
```

#### Tipos de Informes

1. **Informe de Inventario**
   ```
   Columnas: SKU, Nombre, Familia, Cantidad, Ubicación, Cliente,
             Antigüedad, Valor, Fecha Vencimiento
   ```

2. **Informe de Movimientos**
   ```
   Columnas: Fecha, Tipo, Artículo, Cantidad, Origen, Destino,
             Usuario, Albarán, Observaciones
   ```

3. **Informe de Antigüedad**
   ```
   Columnas: Artículo, Lote, Fecha Entrada, Días Stock, Ubicación,
             Cliente, Alerta, Valor
   ```

4. **Informe de Vencimientos**
   ```
   Columnas: Artículo, Lote, Cantidad, Fecha Vencimiento, Días Restantes,
             Ubicación, Cliente, Estado
   ```

5. **Informe de Entregas vs Previsiones**
   ```
   Columnas: Fecha, Cliente, Artículo, Cantidad Prevista, Cantidad Entregada,
             Variación, % Exactitud
   ```

#### Formatos de Exportación

1. **Excel (.xlsx)**
   - Múltiples hojas
   - Formato condicional
   - Gráficos incluidos
   - Tablas dinámicas

2. **PDF**
   - Formato profesional
   - Logo de empresa
   - Gráficos y tablas
   - Pie de página con fecha/hora

3. **CSV**
   - Delimitado por comas
   - UTF-8 encoding
   - Headers incluidos

---

## ⚙️ Configuración del Sistema (Settings)

### Página de Ajustes (Similar a CashFlow App)

Sistema completo de configuración con 5 secciones principales.

#### Modelo de Configuración

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Usuario que modificó
  companySettings: {
    companyName: "Oversun Energy",
    logo: {
      url: String,
      showInNavbar: Boolean,
      showInReports: Boolean
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      website: String
    }
  },
  themeSettings: {
    colors: {
      primary: "#0066CC",
      secondary: "#6C757D",
      success: "#28A745",
      danger: "#DC3545",
      warning: "#FFC107",
      info: "#17A2B8",
      light: "#F8F9FA",
      dark: "#343A40"
    },
    backgrounds: {
      body: "#FFFFFF",
      sidebar: "#2C3E50",
      navbar: "#34495E",
      card: "#FFFFFF"
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: {
        base: "14px",
        small: "12px",
        large: "16px"
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        bold: 700
      }
    }
  },
  headerSettings: {
    appTitle: "AssetFlow",
    showAppTitle: Boolean,
    showCompanyName: Boolean,
    navbarPosition: "fixed-top",    // fixed-top, static
    navbarHeight: "60px"
  },
  systemSettings: {
    language: "es",                 // es, en
    timezone: "Europe/Madrid",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",              // 24h, 12h
    currency: "EUR",
    itemsPerPage: 25
  },
  integrationSettings: {
    ai: {
      enabled: Boolean,
      defaultProvider: "openai",    // openai, anthropic, local
      apiKeys: {
        openai: String,
        anthropic: String
      },
      models: {
        openai: "gpt-4",
        anthropic: "claude-3-sonnet"
      }
    },
    email: {
      enabled: Boolean,
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
      fromEmail: String
    },
    storage: {
      provider: "local",            // local, s3, azure
      maxFileSize: "10MB",
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"]
    }
  },
  updatedAt: Date,
  updatedBy: ObjectId
}
```

### Sección 1: Gestión de Usuarios

#### Interfaz de Usuarios

```tsx
interface UserManagementSection {
  users: User[];
  roles: Role[];
  actions: {
    create: (userData: CreateUserDTO) => Promise<User>;
    update: (userId: string, data: UpdateUserDTO) => Promise<User>;
    delete: (userId: string) => Promise<void>;
    resetPassword: (userId: string) => Promise<void>;
    toggleActive: (userId: string) => Promise<User>;
  };
}
```

#### Funcionalidades
- Crear/Editar/Eliminar usuarios
- Asignar roles (admin, manager, viewer)
- Resetear contraseñas
- Activar/Desactivar usuarios
- Ver historial de accesos

### Sección 2: Personalización de Tema

#### ColorPicker Component

```tsx
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presets
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hexValue, setHexValue] = useState(value);

  return (
    <div className="color-picker-container">
      <label>{label}</label>
      <div className="color-input-group">
        <div
          className="color-preview"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={hexValue}
          onChange={(e) => {
            setHexValue(e.target.value);
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          placeholder="#0066CC"
        />
      </div>
      {showPicker && (
        <div className="color-picker-popup">
          <SketchPicker
            color={value}
            onChange={(color) => onChange(color.hex)}
          />
          {presets && (
            <div className="color-presets">
              {presets.map(preset => (
                <div
                  key={preset}
                  className="preset-color"
                  style={{ backgroundColor: preset }}
                  onClick={() => onChange(preset)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### Theme Provider

```tsx
interface ThemeContextValue {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>;
  resetTheme: () => Promise<void>;
  applyTheme: (themeConfig: ThemeSettings) => void;
}

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

  const applyTheme = useCallback((themeConfig: ThemeSettings) => {
    const root = document.documentElement;

    // Apply colors
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      root.style.setProperty(`--bs-${key}`, value);
    });

    // Apply backgrounds
    Object.entries(themeConfig.backgrounds).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', themeConfig.typography.fontFamily);
    root.style.setProperty('--font-size-base', themeConfig.typography.fontSize.base);

    setTheme(themeConfig);
  }, []);

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...updates };
    await api.put('/api/settings/theme', newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    // Load theme on mount
    api.get('/api/settings/theme').then(({ data }) => {
      applyTheme(data);
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme: () => {}, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### Configuraciones Disponibles

**Colores Principales:**
- Primary Color (Color principal de botones, enlaces)
- Secondary Color (Color secundario)
- Success Color (Verde - éxito)
- Danger Color (Rojo - errores)
- Warning Color (Amarillo - advertencias)
- Info Color (Azul - información)

**Colores de Fondo:**
- Body Background
- Sidebar Background
- Navbar Background
- Card Background

**Tipografía:**
- Font Family (selección entre Google Fonts)
- Base Font Size
- Font Weights

**Logo y Headers:**
- Upload de logo
- Título de la aplicación
- Mostrar/Ocultar elementos

### Sección 3: Configuración de Empresa

```tsx
interface CompanySettings {
  companyName: string;
  logo: {
    file: File | null;
    preview: string;
    showInNavbar: boolean;
    showInReports: boolean;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website: string;
  };
}

const CompanySettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const { data } = await api.post('/api/settings/upload-logo', formData);
    setSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, preview: data.url }
    }));
  };

  const handleSave = async () => {
    await api.put('/api/settings/company', settings);
    toast.success('Configuración guardada');
  };

  return (
    <div className="company-settings">
      <h3>Configuración de Empresa</h3>

      <div className="form-group">
        <label>Nombre de la Empresa</label>
        <input
          type="text"
          value={settings.companyName}
          onChange={(e) => setSettings({...settings, companyName: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>Logo de la Empresa</label>
        <div className="logo-upload">
          {settings.logo.preview && (
            <img src={settings.logo.preview} alt="Logo" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleLogoUpload(e.target.files[0]);
              }
            }}
          />
        </div>
        <div className="logo-options">
          <label>
            <input
              type="checkbox"
              checked={settings.logo.showInNavbar}
              onChange={(e) => setSettings({
                ...settings,
                logo: {...settings.logo, showInNavbar: e.target.checked}
              })}
            />
            Mostrar en barra de navegación
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.logo.showInReports}
              onChange={(e) => setSettings({
                ...settings,
                logo: {...settings.logo, showInReports: e.target.checked}
              })}
            />
            Mostrar en informes
          </label>
        </div>
      </div>

      {/* Contact Info Fields */}

      <button onClick={handleSave}>Guardar Cambios</button>
    </div>
  );
};
```

### Sección 4: Preferencias del Sistema

```tsx
interface SystemPreferences {
  language: 'es' | 'en';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  itemsPerPage: number;
  notifications: {
    email: boolean;
    browser: boolean;
    expiryAlerts: boolean;
    lowStockAlerts: boolean;
  };
}
```

**Configuraciones:**
- Idioma (Español/Inglés)
- Zona horaria
- Formato de fecha (DD/MM/YYYY, MM/DD/YYYY)
- Formato de hora (12h/24h)
- Moneda predeterminada
- Elementos por página
- Notificaciones (email, browser, alertas)

### Sección 5: Integraciones y APIs

```tsx
interface IntegrationSettings {
  ai: {
    enabled: boolean;
    defaultProvider: 'openai' | 'anthropic' | 'local';
    apiKeys: {
      openai: string;
      anthropic: string;
    };
    models: {
      openai: string;
      anthropic: string;
    };
  };
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    testConnection: () => Promise<boolean>;
  };
  storage: {
    provider: 'local' | 's3' | 'azure';
    credentials?: {
      accessKey: string;
      secretKey: string;
      bucket: string;
      region: string;
    };
    maxFileSize: string;
    allowedTypes: string[];
  };
}

const AIIntegrationForm: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings['ai']>(initialSettings);

  const testAIConnection = async (provider: string) => {
    try {
      const { data } = await api.post('/api/settings/test-ai', { provider });
      if (data.success) {
        toast.success(`Conexión con ${provider} exitosa`);
      }
    } catch (error) {
      toast.error('Error al conectar con el proveedor de IA');
    }
  };

  return (
    <div className="ai-integration-settings">
      <h4>Integración de IA</h4>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
          />
          Habilitar consultas con IA
        </label>
      </div>

      <div className="form-group">
        <label>Proveedor Predeterminado</label>
        <select
          value={settings.defaultProvider}
          onChange={(e) => setSettings({
            ...settings,
            defaultProvider: e.target.value as any
          })}
        >
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="local">Modelo Local</option>
        </select>
      </div>

      <div className="api-keys-section">
        <div className="form-group">
          <label>OpenAI API Key</label>
          <div className="input-with-button">
            <input
              type="password"
              value={settings.apiKeys.openai}
              onChange={(e) => setSettings({
                ...settings,
                apiKeys: {...settings.apiKeys, openai: e.target.value}
              })}
              placeholder="sk-..."
            />
            <button onClick={() => testAIConnection('openai')}>
              Probar Conexión
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Anthropic API Key</label>
          <div className="input-with-button">
            <input
              type="password"
              value={settings.apiKeys.anthropic}
              onChange={(e) => setSettings({
                ...settings,
                apiKeys: {...settings.apiKeys, anthropic: e.target.value}
              })}
              placeholder="sk-ant-..."
            />
            <button onClick={() => testAIConnection('anthropic')}>
              Probar Conexión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### API Endpoints de Configuración

```javascript
// GET /api/settings
// Obtener todas las configuraciones del usuario/empresa

// PUT /api/settings/theme
// Actualizar configuración de tema

// PUT /api/settings/company
// Actualizar configuración de empresa

// POST /api/settings/upload-logo
// Upload de logo

// PUT /api/settings/system
// Actualizar preferencias del sistema

// PUT /api/settings/integrations
// Actualizar configuraciones de integraciones

// POST /api/settings/test-ai
// Probar conexión con proveedor de IA

// POST /api/settings/test-email
// Probar configuración de email

// GET /api/settings/export
// Exportar configuraciones

// POST /api/settings/import
// Importar configuraciones
```

### Estructura de la Página

```tsx
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configuración del Sistema</h1>
        <p className="text-muted">Gestiona usuarios, personaliza la apariencia y configura integraciones</p>
      </div>

      <div className="settings-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          <i className="bi bi-people"></i>
          Usuarios
        </button>
        <button
          className={activeTab === 'theme' ? 'active' : ''}
          onClick={() => setActiveTab('theme')}
        >
          <i className="bi bi-palette"></i>
          Tema
        </button>
        <button
          className={activeTab === 'company' ? 'active' : ''}
          onClick={() => setActiveTab('company')}
        >
          <i className="bi bi-building"></i>
          Empresa
        </button>
        <button
          className={activeTab === 'system' ? 'active' : ''}
          onClick={() => setActiveTab('system')}
        >
          <i className="bi bi-gear"></i>
          Sistema
        </button>
        <button
          className={activeTab === 'integrations' ? 'active' : ''}
          onClick={() => setActiveTab('integrations')}
        >
          <i className="bi bi-plug"></i>
          Integraciones
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'users' && <UserManagementSection />}
        {activeTab === 'theme' && <ThemeCustomizationSection />}
        {activeTab === 'company' && <CompanySettingsSection />}
        {activeTab === 'system' && <SystemPreferencesSection />}
        {activeTab === 'integrations' && <IntegrationSettingsSection />}
      </div>
    </div>
  );
};
```

### Librerías Necesarias

```json
{
  "dependencies": {
    "react-color": "^2.19.3",           // Color picker
    "react-dropzone": "^14.2.3",        // File upload
    "react-hot-toast": "^2.4.1",        // Notifications
    "validator": "^13.11.0"             // Validation
  }
}
```

---

## ❌ Módulos Eliminados

### Módulo de Mantenimiento

**Razón:** No será utilizado en el nuevo sistema de almacén.

**Archivos a Eliminar:**
- `frontend/src/pages/modules/MaintenanceModule.tsx`
- `backend/routes/maintenance.js`
- `backend/models/Maintenance.js`

**Impacto:**
- Eliminar del menú de navegación
- Remover referencias en Dashboard
- Limpiar datos de mantenimiento en DB

### Módulo de Movimientos (Reemplazado)

**Razón:** Será reemplazado por sistema de Albaranes y Trazabilidad.

**Nuevo Sistema:**
- Albaranes de Entrada
- Albaranes de Salida
- Trazabilidad de Unidades
- Movimientos Internos

---

## 💾 Modelo de Datos

### Colecciones Nuevas

1. **users** - Usuarios del sistema
2. **clients** - Clientes jerárquicos
3. **warehouses** - Almacenes
4. **locations** - Emplazamientos
5. **articles** - Artículos/Productos
6. **families** - Familias de productos
7. **lots** - Lotes master y expo
8. **stock_units** - Unidades individuales
9. **delivery_notes** - Albaranes
10. **forecasts** - Previsiones
11. **ai_queries** - Consultas a IA
12. **exports** - Histórico de exportaciones
13. **settings** - Configuración del sistema (tema, empresa, integraciones)

### Relaciones

```
Client (1) ─── (N) Warehouses
Warehouse (1) ─── (N) Locations
Article (1) ─── (N) StockUnits
Article (N) ─── (1) Family
Lot (1) ─── (N) StockUnits
DeliveryNote (1) ─── (N) StockUnits
Client (1) ─── (N) Forecasts
```

---

## 📅 Plan de Implementación

### Fase 1: Preparación (Día 1)

- [ ] Crear especificación completa (este documento)
- [ ] Diseñar modelos de datos
- [ ] Crear migraciones de BD
- [ ] Eliminar módulos obsoletos

### Fase 2: Backend Core (Día 2-3)

- [ ] Implementar modelos de datos
- [ ] Crear usuarios admin predefinidos
- [ ] API de gestión de clientes multi-nivel
- [ ] API de gestión de artículos y familias
- [ ] API de trazabilidad y lotes

### Fase 3: Backend Avanzado (Día 4-5)

- [ ] API de albaranes
- [ ] Sistema de cálculo de antigüedad
- [ ] Calendario de vencimientos
- [ ] API de previsiones
- [ ] Integración IA

### Fase 4: Frontend Core (Día 6-7)

- [ ] Nuevo módulo de Clientes
- [ ] Módulo de Artículos
- [ ] Módulo de Almacenes
- [ ] Módulo de Albaranes
- [ ] Sistema de importación CSV

### Fase 5: Frontend Avanzado (Día 8-9)

- [ ] Dashboard de Cuadro de Mando
- [ ] Dashboard de Análisis
- [ ] Calendario de Vencimientos
- [ ] Módulo de Consultas IA
- [ ] Sistema de Exportación
- [ ] Página de Configuración (Settings)
  - [ ] Sección de Usuarios
  - [ ] Sección de Tema (ColorPicker, ThemeProvider)
  - [ ] Sección de Empresa (Logo upload)
  - [ ] Sección de Sistema
  - [ ] Sección de Integraciones

### Fase 6: Testing y Refinamiento (Día 10)

- [ ] Testing unitario
- [ ] Testing de integración
- [ ] Pruebas de usuario
- [ ] Ajustes de UX
- [ ] Optimización de rendimiento

### Fase 7: Deployment (Día 11)

- [ ] Build de producción
- [ ] Deploy local
- [ ] Commit a GitHub
- [ ] Deploy a servidor
- [ ] Verificación final

---

## 📊 Estimación de Esfuerzo

| Componente | Tiempo Estimado |
|------------|----------------|
| Especificación | 2 horas |
| Backend Models | 4 horas |
| Backend APIs | 8 horas |
| Frontend Components | 12 horas |
| Dashboard & Analytics | 6 horas |
| IA Integration | 4 horas |
| Export System | 3 horas |
| Settings Module | 4 horas |
| Testing | 4 horas |
| Deployment | 2 horas |
| **TOTAL** | **49 horas** |

---

## 🎯 Criterios de Éxito

1. ✅ 5 usuarios admin creados y funcionales
2. ✅ Sistema de clientes de 3 niveles implementado
3. ✅ Gestión completa de artículos con SKU/EAN
4. ✅ Trazabilidad por lotes funcionando
5. ✅ Dashboard con todas las métricas
6. ✅ IA respondiendo consultas correctamente
7. ✅ Exportación en 3 formatos funcionando
8. ✅ Página de Configuración completa con 5 secciones funcionales
9. ✅ Tema personalizable aplicándose correctamente
10. ✅ Cero errores en producción
11. ✅ Tiempo de carga < 3 segundos
12. ✅ Responsive en móvil y desktop

---

**Documento generado por:** Claude Code
**Fecha:** 2025-10-17
**Versión:** 2.1.0-spec
**Estado:** En Revisión
