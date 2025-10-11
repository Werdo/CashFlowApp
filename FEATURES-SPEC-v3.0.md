# 📱 CashFlow v3.0 - Especificaciones Completas de Funcionalidades

**Versión:** 3.0.0
**Última Actualización:** 05 de Octubre de 2025
**Enfoque:** Mobile-First + IA + Analytics Avanzados

---

## 📋 Índice de Funcionalidades

1. [Diseño Responsivo Mobile-First](#1-diseño-responsivo-mobile-first)
2. [Sidebar Colapsible Inteligente](#2-sidebar-colapsible-inteligente)
3. [Theme Toggle (Light/Dark Mode)](#3-theme-toggle-lightdark-mode)
4. [Integración ChatGPT API](#4-integración-chatgpt-api)
5. [Página de Configuración de Usuario](#5-página-de-configuración-de-usuario)
6. [Dashboard Configurable con Widgets](#6-dashboard-configurable-con-widgets)
7. [Sistema de Notificaciones Push](#7-sistema-de-notificaciones-push)
8. [Modo Offline y PWA](#8-modo-offline-y-pwa)
9. [Gestos Táctiles y UX Mobile](#9-gestos-táctiles-y-ux-mobile)
10. [Quick Actions Mobile](#10-quick-actions-mobile)
11. [Escáner OCR para Facturas](#11-escáner-ocr-para-facturas)
12. [Modo Lectura Rápida](#12-modo-lectura-rápida)
13. [Shortcuts de Voz](#13-shortcuts-de-voz)
14. [Análisis Predictivo con IA](#14-análisis-predictivo-con-ia)
15. [Compartir y Colaboración](#15-compartir-y-colaboración)

---

## 1. Diseño Responsivo Mobile-First

### 🎯 Objetivo
Experiencia optimizada en móvil como prioridad, garantizando usabilidad en cualquier dispositivo.

### 📐 Breakpoints

```css
/* Extra Small - Mobile Portrait */
@media (max-width: 374px) { /* xs */ }

/* Small - Mobile Landscape */
@media (min-width: 375px) and (max-width: 640px) { /* sm */ }

/* Medium - Tablet Portrait */
@media (min-width: 641px) and (max-width: 768px) { /* md */ }

/* Large - Tablet Landscape */
@media (min-width: 769px) and (max-width: 1024px) { /* lg */ }

/* Extra Large - Desktop */
@media (min-width: 1025px) and (max-width: 1440px) { /* xl */ }

/* 2XL - Large Desktop */
@media (min-width: 1441px) { /* 2xl */ }
```

### 📱 Comportamiento por Dispositivo

#### **Mobile (< 640px)**
- Layout de 1 columna
- Navegación bottom tabs (estilo app nativa)
- Sidebar como drawer full-screen
- Cards apiladas verticalmente
- Gráficos con scroll horizontal
- Touch-friendly (mínimo 44x44px botones)
- Teclado numérico para inputs de montos
- Calendario en modo compacto

#### **Tablet (641px - 1024px)**
- Layout de 2 columnas
- Sidebar colapsado por defecto
- Drawer lateral para details
- Split-view opcional
- Gráficos a ancho completo

#### **Desktop (> 1024px)**
- Layout de 3-4 columnas
- Sidebar permanente
- Paneles laterales fijos
- Multi-tasking (múltiples vistas simultáneas)
- Atajos de teclado

### 🎨 Componentes Adaptativos

#### **Dashboard Cards**
```javascript
Mobile: 1 columna, stack vertical
Tablet: 2 columnas, grid
Desktop: 4 columnas, grid flexible
```

#### **Gráficos**
```javascript
Mobile:
  - Altura 250px
  - Scroll horizontal si necesario
  - Leyenda abajo
  - Touch para ver detalles

Tablet:
  - Altura 350px
  - Leyenda derecha

Desktop:
  - Altura 500px
  - Tooltips on hover
  - Click para drill-down
```

#### **Tablas**
```javascript
Mobile:
  - Convertir a cards
  - Información apilada
  - Swipe para acciones (editar/eliminar)

Tablet/Desktop:
  - Tabla tradicional
  - Scroll horizontal
  - Sticky headers
  - Ordenamiento por columna
```

---

## 2. Sidebar Colapsible Inteligente

### 🎯 Funcionalidad
Navegación lateral que se adapta al contexto y dispositivo.

### 📱 Comportamiento Mobile (< 640px)

```javascript
Características:
- Drawer overlay desde la izquierda
- Full-screen cuando se abre
- Backdrop oscuro semi-transparente (60% opacity)
- Botón hamburguesa en header superior izquierdo
- Cierra automáticamente al seleccionar item
- Cierra al tocar fuera (backdrop)
- Animación slide 300ms ease-out
- Bloquea scroll del body cuando está abierto
```

### 💻 Comportamiento Tablet/Desktop

```javascript
Tablet (641-1024px):
- Colapsado por defecto (solo iconos)
- Hover para mostrar tooltip con nombre
- Click en icono para expandir temporal
- Toggle button para fijar expandido

Desktop (>1024px):
- Visible permanentemente
- Toggle entre colapsado/expandido
- Estado persistente en localStorage
- Ancho: 240px expandido, 64px colapsado
- Transición suave 250ms
```

### 🎨 Estructura del Sidebar

```javascript
const sidebarSections = [
  {
    title: "Principal",
    items: [
      { icon: "LayoutDashboard", label: "Dashboard", route: "/" },
      { icon: "Calendar", label: "Calendario", route: "/calendar" },
      { icon: "TrendingUp", label: "Analytics", route: "/analytics" }
    ]
  },
  {
    title: "Gestión",
    items: [
      { icon: "Receipt", label: "Transacciones", route: "/transactions" },
      { icon: "Tag", label: "Categorías", route: "/categories" },
      { icon: "AlertCircle", label: "Alertas", route: "/alerts" }
    ]
  },
  {
    title: "Reportes",
    items: [
      { icon: "BarChart3", label: "Reportes", route: "/reports" },
      { icon: "FileText", label: "Documentos", route: "/documents" },
      { icon: "Download", label: "Exportar", route: "/export" }
    ]
  },
  {
    title: "Configuración",
    items: [
      { icon: "Settings", label: "Ajustes", route: "/settings" },
      { icon: "User", label: "Perfil", route: "/profile" },
      { icon: "HelpCircle", label: "Ayuda", route: "/help" }
    ]
  }
];
```

### 📊 Estado Persistente

```javascript
localStorage.setItem('sidebar-state', JSON.stringify({
  isExpanded: true,
  lastRoute: '/dashboard',
  favoriteRoutes: ['/calendar', '/analytics']
}));
```

---

## 3. Theme Toggle (Light/Dark Mode)

### 🎯 Objetivo
Sistema de temas completo con soporte para modo oscuro.

### 🎨 Paletas de Colores

#### **Light Mode**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;

  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;

  --accent-primary: #3b82f6;
  --accent-secondary: #10b981;
  --accent-danger: #ef4444;
  --accent-warning: #f59e0b;

  --border-color: #dee2e6;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

#### **Dark Mode**
```css
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;

  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --text-tertiary: #6c757d;

  --accent-primary: #60a5fa;
  --accent-secondary: #34d399;
  --accent-danger: #f87171;
  --accent-warning: #fbbf24;

  --border-color: #4a4a4a;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
}
```

### 🔄 Implementación

```javascript
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
```

### 📱 Ubicación del Toggle

```javascript
Mobile: Header derecha (icono sol/luna)
Desktop: Sidebar footer o header derecha
Animación: Rotación 180deg + fade 200ms
```

---

## 4. Integración ChatGPT API

### 🤖 Asistente Financiero IA

#### **A. Botón Flotante (FAB)**

```javascript
Posición: Bottom-right (16px margin)
Tamaño: 56x56px (mobile), 64x64px (desktop)
Icono: Sparkles / Robot / MessageCircle
Badge: Contador de mensajes no leídos
Animación: Pulse suave continuo
Color: Gradient azul-morado
```

#### **B. Panel de Chat**

**Mobile:**
```javascript
- Modal full-screen
- Header con título y botón cerrar
- Mensajes scroll vertical
- Input fijo en bottom
- Teclado push-up (no overlay)
```

**Desktop:**
```javascript
- Panel lateral derecho
- Ancho: 400px
- Altura: 70vh
- Posición: Fixed bottom-right
- Resizable opcional
- Minimizable a FAB
```

#### **C. Estructura del Chat**

```javascript
┌─────────────────────────────────────┐
│ 💬 Asistente IA         [_] [X]    │
├─────────────────────────────────────┤
│                                     │
│  Bot: ¡Hola! ¿En qué puedo ayudarte?│
│  [14:30]                            │
│                                     │
│                 Usuario: Balance?   │
│                            [14:31]  │
│                                     │
│  Bot: Tu balance actual es:         │
│  €238,000                           │
│  ↗ +12% vs mes anterior             │
│  [14:31]                            │
│                                     │
│  [Sugerencias rápidas]              │
│  • Gastos del mes                   │
│  • Proyección trimestre             │
│  • Análisis de tendencias           │
│                                     │
├─────────────────────────────────────┤
│ [Escribe un mensaje...] 📎 🎤 ➤    │
└─────────────────────────────────────┘
```

#### **D. Funcionalidades del Chat**

**1. Consultas Predefinidas**
```javascript
const quickActions = [
  {
    icon: "💰",
    label: "¿Cuál es mi balance?",
    query: "balance_current"
  },
  {
    icon: "📊",
    label: "Gastos del mes",
    query: "expenses_month"
  },
  {
    icon: "📈",
    label: "Proyección trimestre",
    query: "projection_quarter"
  },
  {
    icon: "🎯",
    label: "¿Cumplo presupuesto?",
    query: "budget_status"
  },
  {
    icon: "⚠️",
    label: "Alertas pendientes",
    query: "alerts_pending"
  },
  {
    icon: "💡",
    label: "Consejos de ahorro",
    query: "savings_tips"
  }
];
```

**2. Contexto Automático**
```javascript
const buildChatContext = () => ({
  user: {
    name: user.name,
    role: user.role,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  financial: {
    currentBalance: calculateCurrentBalance(),
    monthlyIncome: getMonthlyIncome(),
    monthlyExpenses: getMonthlyExpenses(),
    savingsRate: calculateSavingsRate(),
    topCategories: getTopExpenseCategories(5)
  },
  recent: {
    transactions: getRecentTransactions(10),
    payments: getUpcomingPayments(7),
    alerts: getPendingAlerts()
  },
  historical: {
    last3Months: getLast3MonthsSummary(),
    yearToDate: getYTDSummary()
  },
  goals: {
    budgets: getActiveBudgets(),
    targets: getSavingsTargets()
  }
});
```

**3. Capacidades del Bot**
```javascript
const capabilities = [
  "Consultar balance y estado financiero",
  "Analizar gastos por categoría",
  "Proyectar cashflow futuro",
  "Comparar períodos (mes a mes, año a año)",
  "Detectar anomalías en gastos",
  "Recomendar optimizaciones",
  "Responder preguntas sobre presupuestos",
  "Generar reportes personalizados",
  "Crear recordatorios y alertas",
  "Explicar tendencias financieras"
];
```

**4. Tipos de Respuesta**
```javascript
// Texto simple
"Tu balance actual es de €238,000"

// Con datos estructurados
"📊 Gastos por Categoría (Octubre)
• Operaciones: €45,000 (47%)
• Marketing: €25,000 (26%)
• RRHH: €25,000 (26%)"

// Con gráfico mini
[Renderiza mini chart inline]

// Con acciones sugeridas
"💡 Sugerencia: Reducir gastos de Marketing en 10%
[Crear Presupuesto] [Ver Detalles]"
```

#### **E. Implementación Técnica**

**Backend Proxy (Seguridad)**
```javascript
// backend/routes/ai.js

router.post('/chat', authenticateUser, rateLimiter, async (req, res) => {
  const { messages } = req.body;
  const userId = req.user.id;

  // Obtener contexto del usuario
  const context = await buildUserContext(userId);

  // Construir system prompt
  const systemPrompt = `
    Eres un asistente financiero experto en análisis de cashflow.

    Datos del usuario:
    ${JSON.stringify(context, null, 2)}

    Reglas:
    - Responde en español
    - Sé conciso pero completo
    - Usa emojis para mejor UX
    - Proporciona datos numéricos cuando sea relevante
    - Sugiere acciones cuando sea apropiado
    - Formato markdown para legibilidad
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 600,
      stream: true
    });

    // Stream response
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Rate Limiting**
```javascript
const chatRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 mensajes por hora
  message: "Has alcanzado el límite de mensajes. Intenta en 1 hora."
});
```

**Caché de Respuestas**
```javascript
const cache = new Map();

const getCachedResponse = (query, context) => {
  const key = hashQuery(query, context);
  return cache.get(key);
};

const setCachedResponse = (query, context, response) => {
  const key = hashQuery(query, context);
  cache.set(key, { response, timestamp: Date.now() });

  // Limpiar caché cada 1 hora
  setTimeout(() => cache.delete(key), 60 * 60 * 1000);
};
```

---

## 5. Página de Configuración de Usuario

### ⚙️ Secciones

#### **A. Información Personal**
```javascript
- Avatar (upload + crop)
- Nombre completo
- Email (no editable)
- Teléfono
- Zona horaria
- Idioma preferido
- Moneda base
```

#### **B. Preferencias de Notificaciones**
```javascript
Email:
  ✓ Resumen diario
  ✓ Resumen semanal
  ✓ Alertas de presupuesto
  ✓ Pagos próximos
  ✓ Anomalías detectadas

Push (Web/Mobile):
  ✓ Transacciones grandes (> €1000)
  ✓ Balance bajo (< €10,000)
  ✓ Metas cumplidas

In-App:
  ✓ Recordatorios
  ✓ Sugerencias de IA
```

#### **C. Alertas Financieras**
```javascript
Umbrales Personalizables:
  - Balance mínimo: €10,000
  - Gasto mensual máximo: €100,000
  - Gasto por categoría:
    • Operaciones: €50,000
    • Marketing: €30,000
    • RRHH: €30,000
  - Días de anticipación para pagos: 7 días
  - Variación inusual: ±20%
```

#### **D. Seguridad**
```javascript
- Cambiar contraseña
- Two-Factor Authentication (2FA)
  • SMS
  • Authenticator App (Google/Microsoft)
- Sesiones activas
- Histórico de accesos
- Descargar datos (GDPR)
- Eliminar cuenta
```

#### **E. Integraciones**
```javascript
- Conectar banco (Plaid/Belvo)
- Conectar tarjetas de crédito
- Importar desde Excel/CSV
- Exportar a QuickBooks/Xero
- Webhooks personalizados
- API Keys
```

### 📝 Validación con React Hook Form + Zod

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Teléfono inválido"),
  timezone: z.string(),
  currency: z.enum(['EUR', 'USD', 'MXN', 'COP']),
  notificationEmail: z.boolean(),
  notificationPush: z.boolean(),
  balanceThreshold: z.number().min(0),
  monthlyBudget: z.number().min(0)
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

---

## 6. Dashboard Configurable con Widgets

### 🎨 Widgets Disponibles

```javascript
const availableWidgets = [
  {
    id: 'balance-card',
    name: 'Balance Actual',
    size: 'small', // small, medium, large
    category: 'financiero'
  },
  {
    id: 'monthly-chart',
    name: 'Gráfico Mensual',
    size: 'large',
    category: 'analytics'
  },
  {
    id: 'top-expenses',
    name: 'Top Gastos',
    size: 'medium',
    category: 'gastos'
  },
  {
    id: 'upcoming-payments',
    name: 'Próximos Pagos',
    size: 'medium',
    category: 'calendario'
  },
  {
    id: 'budget-progress',
    name: 'Progreso de Presupuesto',
    size: 'medium',
    category: 'presupuesto'
  },
  {
    id: 'savings-goal',
    name: 'Meta de Ahorro',
    size: 'small',
    category: 'metas'
  },
  {
    id: 'alerts-widget',
    name: 'Alertas Activas',
    size: 'small',
    category: 'notificaciones'
  },
  {
    id: 'cashflow-projection',
    name: 'Proyección 3 Meses',
    size: 'large',
    category: 'analytics'
  },
  {
    id: 'category-breakdown',
    name: 'Desglose por Categoría',
    size: 'medium',
    category: 'gastos'
  },
  {
    id: 'quick-stats',
    name: 'Estadísticas Rápidas',
    size: 'medium',
    category: 'resumen'
  }
];
```

### 📐 Sistema de Grid

```javascript
// Usando react-grid-layout

Desktop:
  - 12 columnas
  - Row height: 100px
  - Widgets resizable y draggable

Tablet:
  - 8 columnas
  - Row height: 80px
  - Solo draggable

Mobile:
  - 4 columnas (stack vertical)
  - Row height: auto
  - No draggable (orden fijo)
```

### 💾 Layouts Guardables

```javascript
const dashboardLayouts = {
  'Default': [
    { i: 'balance-card', x: 0, y: 0, w: 3, h: 2 },
    { i: 'monthly-chart', x: 3, y: 0, w: 9, h: 4 },
    { i: 'top-expenses', x: 0, y: 2, w: 6, h: 3 },
    { i: 'upcoming-payments', x: 6, y: 4, w: 6, h: 3 }
  ],
  'Analytics Focus': [
    { i: 'monthly-chart', x: 0, y: 0, w: 12, h: 5 },
    { i: 'cashflow-projection', x: 0, y: 5, w: 12, h: 5 }
  ],
  'Executive Summary': [
    { i: 'balance-card', x: 0, y: 0, w: 3, h: 2 },
    { i: 'quick-stats', x: 3, y: 0, w: 9, h: 2 },
    { i: 'budget-progress', x: 0, y: 2, w: 6, h: 3 },
    { i: 'top-expenses', x: 6, y: 2, w: 6, h: 3 }
  ]
};
```

---

## 7. Sistema de Notificaciones Push

### 🔔 Tipos de Notificaciones

#### **A. Email Notifications**
```javascript
const emailNotifications = [
  {
    type: 'daily_summary',
    schedule: '08:00 AM',
    enabled: true,
    template: 'Resumen Diario - CashFlow'
  },
  {
    type: 'weekly_summary',
    schedule: 'Monday 09:00 AM',
    enabled: true,
    template: 'Resumen Semanal - CashFlow'
  },
  {
    type: 'budget_alert',
    trigger: 'budget_exceeded',
    threshold: '90%',
    enabled: true
  },
  {
    type: 'payment_reminder',
    trigger: 'days_before',
    days: 3,
    enabled: true
  },
  {
    type: 'anomaly_detected',
    trigger: 'unusual_expense',
    variance: '±30%',
    enabled: true
  }
];
```

#### **B. Web Push Notifications**
```javascript
// Service Worker para push notifications

const webPushNotifications = [
  {
    title: "💰 Balance Bajo",
    body: "Tu balance es menor a €10,000",
    icon: "/icons/alert.png",
    badge: "/icons/badge.png",
    tag: "balance-low",
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver Balance' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  },
  {
    title: "📅 Pago Próximo",
    body: "Proveedor X - €30,000 en 2 días",
    tag: "payment-reminder",
    data: { paymentId: 123, url: '/payments/123' }
  },
  {
    title: "🎯 Meta Cumplida",
    body: "¡Felicitaciones! Ahorraste €50,000 este mes",
    icon: "/icons/success.png",
    tag: "goal-achieved"
  }
];
```

#### **C. In-App Notifications**
```javascript
const inAppNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'Nueva funcionalidad',
    message: 'Ahora puedes exportar reportes a PDF',
    timestamp: '2025-10-05T10:00:00Z',
    read: false,
    action: { label: 'Probar', url: '/reports' }
  },
  {
    id: 2,
    type: 'warning',
    title: 'Presupuesto excedido',
    message: 'Marketing: €28,000 de €25,000 (112%)',
    timestamp: '2025-10-05T09:30:00Z',
    read: false,
    action: { label: 'Ver Detalles', url: '/budgets/marketing' }
  }
];
```

### 🔧 Implementación

```javascript
// Backend: Bull Queue para emails programados

const emailQueue = new Bull('email-notifications');

emailQueue.process(async (job) => {
  const { userId, type, data } = job.data;
  const user = await User.findById(userId);

  if (!user.preferences.emailNotifications[type]) {
    return; // Usuario deshabilitó este tipo
  }

  const emailContent = await generateEmailContent(type, data);

  await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html
  });
});

// Programar resumen diario
cron.schedule('0 8 * * *', async () => {
  const users = await User.find({ 'preferences.dailySummary': true });

  users.forEach(user => {
    emailQueue.add({
      userId: user._id,
      type: 'daily_summary',
      data: await getDailySummary(user._id)
    });
  });
});
```

---

## 8. Modo Offline y PWA

### 📱 Progressive Web App

#### **A. Características PWA**
```javascript
- Instalable en home screen
- Splash screen personalizada
- Funciona offline (básico)
- Cache de datos esenciales
- Sincronización en background
- Push notifications
- Apariencia fullscreen (sin barra de navegador)
```

#### **B. Service Worker**
```javascript
// service-worker.js

const CACHE_NAME = 'cashflow-v3-cache';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch - Network First, Cache Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});
```

#### **C. Manifest.json**
```json
{
  "name": "CashFlow - Gestión Financiera",
  "short_name": "CashFlow",
  "description": "Gestión inteligente de tesorería con IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["finance", "business", "productivity"],
  "shortcuts": [
    {
      "name": "Añadir Gasto",
      "url": "/quick-add?type=expense",
      "icons": [{ "src": "/icons/add-expense.png", "sizes": "96x96" }]
    },
    {
      "name": "Ver Balance",
      "url": "/balance",
      "icons": [{ "src": "/icons/balance.png", "sizes": "96x96" }]
    }
  ]
}
```

#### **D. Modo Offline**
```javascript
const OfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  const addTransactionOffline = (transaction) => {
    // Guardar en IndexedDB
    saveToIndexedDB('pending-transactions', transaction);
    setPendingSync(prev => [...prev, transaction]);

    // Registrar background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-transactions');
      });
    }
  };

  return (
    <div>
      {!isOnline && (
        <Banner type="warning">
          Sin conexión. Los cambios se sincronizarán automáticamente.
          {pendingSync.length > 0 && ` (${pendingSync.length} pendientes)`}
        </Banner>
      )}
    </div>
  );
};
```

---

## 9. Gestos Táctiles y UX Mobile

### 👆 Gestos Implementados

#### **A. Swipe Gestures**
```javascript
// En tablas y listas

Swipe Left (←):
  - Mostrar botones de acción (Editar/Eliminar)
  - Animación: slide + reveal

Swipe Right (→):
  - Marcar como completado
  - Quick action (configurab

le)

Swipe Down (↓):
  - Pull to refresh
  - Animación de carga

Swipe Up (↑):
  - Cargar más items (infinite scroll)
```

#### **B. Long Press**
```javascript
Long Press (500ms):
  - Abrir menú contextual
  - Selección múltiple (modo bulk)
  - Vista previa rápida (peek & pop)
```

#### **C. Pinch to Zoom**
```javascript
En gráficos:
  - Pinch out: Zoom in
  - Pinch in: Zoom out
  - Double tap: Reset zoom
```

#### **D. Pull to Refresh**
```javascript
const usePullToRefresh = (onRefresh) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY) {
      const currentY = e.touches[0].clientY;
      const distance = Math.min(currentY - startY, 120);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
        setIsPulling(distance > 80);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling) {
      onRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  return { isPulling, pullDistance, handlers: {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }};
};
```

---

## 10. Quick Actions Mobile

### ⚡ Floating Action Button (FAB)

```javascript
const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: "Plus",
      label: "Añadir Ingreso",
      color: "green",
      action: () => openModal('add-income')
    },
    {
      icon: "Minus",
      label: "Añadir Gasto",
      color: "red",
      action: () => openModal('add-expense')
    },
    {
      icon: "Camera",
      label: "Escanear Factura",
      color: "blue",
      action: () => openScanner()
    },
    {
      icon: "Mic",
      label: "Comando de Voz",
      color: "purple",
      action: () => startVoiceCommand()
    }
  ];

  return (
    <div className="fab-container">
      {isOpen && actions.map((action, index) => (
        <FABAction
          key={index}
          {...action}
          delay={index * 50}
        />
      ))}
      <FAB onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
    </div>
  );
};
```

### 📸 Bottom Sheet Actions

```javascript
Mobile: Bottom sheet con opciones
Desktop: Dropdown menu

Opciones:
  - Añadir Ingreso
  - Añadir Gasto
  - Transferencia
  - Escanear Factura
  - Recordatorio
  - Ver Resumen
```

---

## 11. Escáner OCR para Facturas

### 📸 Captura de Facturas

```javascript
const InvoiceScanner = () => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    videoRef.current.srcObject = stream;
    setScanning(true);
  };

  const captureAndProcess = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');

    // Enviar a backend para OCR
    const response = await fetch('/api/ocr/invoice', {
      method: 'POST',
      body: JSON.stringify({ image: imageData })
    });

    const data = await response.json();
    setExtractedData(data);
  };

  return (
    <div className="scanner">
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={captureAndProcess}>Capturar</button>

      {extractedData && (
        <InvoicePreview data={extractedData} />
      )}
    </div>
  );
};
```

### 🔍 Extracción de Datos

```javascript
Backend (usando Tesseract.js o Google Vision API):

Datos extraídos:
  - Número de factura
  - Fecha
  - Proveedor/Cliente
  - Total
  - Subtotal
  - IVA
  - Items (si es posible)
  - Método de pago

Validación y corrección manual
Guardado automático como gasto
```

---

## 12. Modo Lectura Rápida

### 📊 Vista Compacta para Móvil

```javascript
const QuickView = () => {
  return (
    <div className="quick-view">
      {/* Balance grande y prominente */}
      <BalanceCard
        amount={238000}
        change="+12%"
        trend="up"
      />

      {/* Sparklines de tendencia */}
      <MiniChart data={last7Days} />

      {/* Top 3 gastos */}
      <TopExpenses limit={3} />

      {/* Próximo pago */}
      <NextPayment />

      {/* Botón para vista completa */}
      <ExpandButton />
    </div>
  );
};
```

---

## 13. Shortcuts de Voz

### 🎤 Comandos de Voz

```javascript
const VoiceCommands = () => {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;

  const commands = {
    "balance": () => speak(`Tu balance es €${getBalance()}`),
    "gastos del mes": () => speak(`Gastos del mes: €${getMonthlyExpenses()}`),
    "añadir gasto *": (amount) => addExpense(parseAmount(amount)),
    "añadir ingreso *": (amount) => addIncome(parseAmount(amount)),
    "próximo pago": () => speak(`Próximo pago: ${getNextPayment()}`),
    "abrir chat": () => openChat(),
    "mostrar gráfico": () => navigateTo('/analytics')
  };

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    executeCommand(command);
  };

  return (
    <button onClick={() => recognition.start()}>
      <Mic size={24} />
    </button>
  );
};
```

---

## 14. Análisis Predictivo con IA

### 🔮 Proyecciones

```javascript
const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    // Backend ML model
    fetch('/api/ai/predict', {
      method: 'POST',
      body: JSON.stringify({
        historicalData: getLast12MonthsData(),
        currentTrends: getCurrentTrends(),
        seasonality: getSeasonalityFactors()
      })
    })
    .then(res => res.json())
    .then(setPredictions);
  }, []);

  return (
    <div>
      <h3>Proyección próximos 3 meses</h3>
      <PredictionChart data={predictions} />

      <Insights>
        • Se espera un incremento del 15% en gastos
        • Riesgo de exceder presupuesto en Marketing
        • Recomendación: Reducir gastos operativos en €5,000
      </Insights>
    </div>
  );
};
```

---

## 15. Compartir y Colaboración

### 👥 Funcionalidades

```javascript
- Compartir dashboard (view-only link)
- Invitar colaboradores (con permisos)
- Comentarios en transacciones
- Aprobación de gastos (workflow)
- Exportar y compartir reportes
- Comparar con otros usuarios (anónimo)
```

---

## 🛠️ Stack Tecnológico Completo

```javascript
Frontend:
  - React 18 + TypeScript
  - Zustand (estado global)
  - React Query (data fetching)
  - React Hook Form + Zod (forms)
  - Tailwind CSS (estilos)
  - Framer Motion (animaciones)
  - React Grid Layout (dashboard)
  - Recharts (gráficos)
  - React Markdown (chat)
  - Lucide React (iconos)
  - Tesseract.js (OCR cliente)
  - Workbox (service worker)

Backend:
  - Node.js + TypeScript
  - Express
  - MongoDB + Mongoose
  - Redis (cache + sessions)
  - Bull (job queues)
  - Socket.io (websockets)
  - Nodemailer (emails)
  - JWT (auth)
  - OpenAI SDK (ChatGPT)
  - Google Vision API (OCR)
  - TensorFlow.js (ML predictions)
  - Web Push (notificaciones)

DevOps:
  - Docker + Docker Compose
  - Kubernetes (producción)
  - GitHub Actions (CI/CD)
  - Prometheus + Grafana (monitoring)
  - Sentry (error tracking)
  - Nginx (reverse proxy)
```

---

## 📅 Timeline de Implementación

**Fase 1 (Mes 1-2): Fundamentos**
- Diseño responsivo completo
- Sidebar + Theme toggle
- Configuración de usuario
- PWA básica

**Fase 2 (Mes 3-4): IA**
- Integración ChatGPT
- Análisis predictivo
- OCR de facturas
- Comandos de voz

**Fase 3 (Mes 5-6): Dashboard**
- Widgets configurables
- Sistema de notificaciones
- Quick actions mobile
- Gestos táctiles

**Fase 4 (Mes 7-8): Polish**
- Optimizaciones de performance
- Testing exhaustivo
- Documentación
- Lanzamiento beta

---

**TOTAL: 15 Funcionalidades Principales + 50+ Sub-funcionalidades**

¿Quieres que profundice en alguna funcionalidad específica o que agregue más detalles móviles?
