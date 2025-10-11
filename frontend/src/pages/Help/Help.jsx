import React, { useState } from 'react';
import { HelpCircle, Book, ChevronRight } from 'lucide-react';
import './Help.css';

const Help = () => {
  const [activeSection, setActiveSection] = useState(null);

  const manualContent = `
# Manual de Usuario - CashFlow v3.0

---

## Índice

1. [Introducción](#introduccion)
2. [Calendario](#calendario)
3. [Transacciones](#transacciones)
4. [Categorías](#categorias)
5. [Alertas](#alertas)
6. [Reportes](#reportes)
7. [Documents](#documentos)
8. [Analytics](#analytics)
9. [Exportar/Importar](#exportar-importar)
10. [Perfil](#perfil)
11. [Ajustes](#ajustes)

---

## <a name="introduccion"></a>1. Introducción

**CashFlow v3.0** es una aplicación completa de gestión financiera personal que te permite controlar tus ingresos y gastos de manera eficiente.

### Características principales:
- 📅 **Calendario interactivo** con visualización mensual, semanal y anual
- 💰 **Gestión de transacciones** con filtros avanzados
- 🏷️ **Sistema de categorías** con hashtags y grupos
- 🔔 **Alertas personalizables** para gastos e ingresos
- 📊 **Reportes detallados** con análisis comparativo
- 📁 **Gestión de documentos** asociados al cashflow
- 📈 **Analytics** con visualización de patrones
- 🤖 **Análisis con IA** para insights y previsiones

---

## <a name="calendario"></a>2. Calendario

El calendario es la vista principal donde visualizas y gestionas tus ingresos y gastos.

### Vistas disponibles:

#### Vista Mensual
- Muestra el mes completo en formato de calendario
- Cada día muestra los ingresos y gastos totales
- Colores: **verde** para ingresos, **rojo** para gastos
- Panel lateral con resumen del mes

#### Vista Semanal
- Visualización de 7 días con detalle
- Muestra todas las transacciones del día
- Permite agregar transacciones rápidamente

#### Vista Anual
- Resumen de los 12 meses del año
- Comparativa de ingresos vs gastos por mes
- Ideal para análisis de tendencias

### Agregar Transacción:
1. Haz clic en cualquier día del calendario
2. Selecciona tipo: **Ingreso** o **Gasto**
3. Rellena los campos:
   - **Descripción**: Nombre de la transacción
   - **Cantidad**: Importe
   - **Hashtags**: Etiquetas para clasificar
   - **Grupo**: Categoría principal
   - **Notas**: Información adicional
4. Haz clic en **Guardar**

### Editar/Eliminar:
- Click en la transacción para ver opciones
- Icono de lápiz para **editar**
- Icono de papelera para **eliminar**

---

## <a name="transacciones"></a>3. Transacciones

Vista completa de todas tus transacciones con sistema de filtros.

### Filtros disponibles:

#### Por Tipo
- **Todas**: Muestra ingresos y gastos
- **Ingresos**: Solo entradas de dinero
- **Gastos**: Solo salidas de dinero

#### Por Fecha
- **Desde**: Fecha de inicio
- **Hasta**: Fecha de fin
- Permite rangos personalizados

#### Por Hashtag
- Selecciona uno o varios hashtags
- Filtra transacciones etiquetadas

#### Por Grupo
- Filtra por categoría principal
- Ej: Gastos Fijos, Ingresos Variables

#### Búsqueda de texto
- Busca en descripción y notas
- Búsqueda en tiempo real

### Puntear Transacciones:
- Marca transacciones como **verificadas**
- Icono de check ✓ en cada transacción
- Útil para conciliar con extractos bancarios
- Las transacciones puntuadas afectan el saldo confirmado

### Edición Inline:
1. Haz clic en el icono de **editar** (lápiz)
2. Los campos se vuelven editables
3. Modifica los datos necesarios
4. Haz clic en **guardar** (check)
5. O **cancelar** (X) para descartar

---

## <a name="categorias"></a>4. Categorías

Sistema de organización con hashtags y grupos.

### Hashtags

#### Crear Hashtag:
1. Ve a la pestaña **Hashtags**
2. Haz clic en **Crear Hashtag**
3. Rellena:
   - **Nombre**: Ej. #comida, #transporte
   - **Color**: Selecciona del picker
   - **Grupo**: (opcional) Asigna a un grupo
4. Haz clic en **Guardar**

#### Recurrencia:
- Activa **Recurrencia** para gastos/ingresos fijos
- Tipos: Diaria, Semanal, Mensual, Anual
- Define **cantidad estimada**
- El sistema te alertará si te desvías

### Grupos

#### Crear Grupo:
1. Ve a la pestaña **Grupos**
2. Haz clic en **Crear Grupo**
3. Rellena:
   - **Nombre**: Ej. Gastos Fijos, Ingresos Variables
   - **Color**: Identificación visual
4. Haz clic en **Guardar**

### Organización:
- Los hashtags pueden pertenecer a un grupo
- Los grupos agrupan hashtags relacionados
- Facilita filtrado y análisis

---

## <a name="alertas"></a>5. Alertas

Sistema de notificaciones para control de gastos e ingresos.

### Tipos de Alertas:

#### Límite de Gasto
- Define un **tope máximo** de gasto
- Por categoría (hashtag o grupo)
- Frecuencia: Diaria, Semanal, Mensual
- Recibes alerta cuando superas el límite

#### Recordatorio de Ingreso
- Te recuerda **ingresos esperados**
- Útil para nóminas, rentas, etc.
- Configuración de fechas recurrentes

#### Fecha de Vencimiento
- Alertas para **pagos pendientes**
- Previene recargos por retrasos
- Notificación con antelación

### Crear Alerta:
1. Haz clic en **Crear Alerta**
2. Selecciona **tipo de alerta**
3. Elige **categoría**: Ingreso o Gasto
4. Define:
   - **Nombre**: Identificación
   - **Umbral**: Cantidad límite
   - **Hashtag/Grupo**: (opcional)
   - **Frecuencia**: Periodicidad
5. Haz clic en **Guardar**

### Notificaciones:
- Panel de notificaciones en la alerta
- Estado: **Leído** / **No leído**
- Click para marcar como leída
- Historial completo de alertas

---

## <a name="reportes"></a>6. Reportes

Generación de informes financieros detallados.

### Tipos de Período:

#### Por Día
- Reporte de un día específico
- Detalle completo de transacciones

#### Por Semana
- Análisis semanal
- Comparación con semana anterior

#### Por Mes
- Informe mensual completo
- Desglose por categorías

#### Por Trimestre
- Q1 (Ene-Mar), Q2 (Abr-Jun)
- Q3 (Jul-Sep), Q4 (Oct-Dic)

#### Por Año
- Resumen anual completo
- Evolución mes a mes

#### Personalizado
- Rango de fechas a medida
- Sin comparación con período anterior

### Generar Reporte:
1. Selecciona **tipo de período**
2. Elige fecha/rango según el tipo
3. Haz clic en **Generar Reporte**

### Contenido del Reporte:
- **Total Ingresos**: Suma de entradas
- **Total Gastos**: Suma de salidas
- **Balance**: Diferencia (ingresos - gastos)
- **Desglose por categoría**: Ingresos y gastos detallados
- **Comparación**: Con período anterior (si aplica)

### Exportación:
- **PDF**: Documento imprimible
- **Excel**: Para análisis adicional
- Click en el botón correspondiente

---

## <a name="documentos"></a>7. Documentos

Gestión de archivos relacionados con el cashflow.

### Subir Documento:
1. Haz clic en **Subir Documento**
2. Selecciona el archivo (máx 10MB)
3. Formatos soportados:
   - PDF (.pdf)
   - Word (.doc, .docx)
   - Excel (.xls, .xlsx)
   - Imágenes (.jpg, .jpeg, .png)
4. El archivo se sube automáticamente

### Gestión:
- **Lista de documentos** con:
  - Nombre del archivo
  - Tamaño
  - Fecha de subida
- **Descargar**: Icono de descarga
- **Eliminar**: Icono de papelera (con confirmación)

### Casos de uso:
- Facturas relacionadas con gastos
- Contratos de alquiler
- Recibos de pago
- Documentación fiscal

---

## <a name="analytics"></a>8. Analytics

Visualización de patrones de gasto e ingreso.

### Vistas Disponibles:

#### Vista Semanal
- Gráfico de barras: 7 días
- Comparación diaria de ingresos vs gastos
- Promedio semanal

#### Vista Mensual
- 4 semanas del mes
- Evolución semanal
- Tendencias detectadas

#### Vista Anual
- 12 meses del año
- Análisis de estacionalidad
- Proyecciones anuales

### Métricas Mostradas:
- **Total Ingresos**: Del período seleccionado
- **Total Gastos**: Del período seleccionado
- **Balance**: Superávit o déficit
- **Promedios**: Por día/semana/mes

### Top Categorías:
- Las 5 categorías con más gasto
- Visualización con barras de progreso
- Colores personalizados por categoría

### Interactividad:
- Hover sobre barras para ver detalles
- Valores exactos de cada período
- Leyenda con código de colores

---

## <a name="exportar-importar"></a>9. Exportar/Importar

Gestión de datos del cashflow en formato JSON.

### Exportar Datos:

#### Configuración:
1. **Rango de fechas**: Desde/Hasta
2. **Tipo de transacción**:
   - Todas
   - Solo Ingresos
   - Solo Gastos
3. **Datos adicionales**:
   - ✓ Incluir Categorías
   - ✓ Incluir Alertas
   - ✓ Incluir Documentos

#### Proceso:
1. Configura filtros
2. Haz clic en **Exportar Datos**
3. Se descarga archivo JSON
4. Nombre: \`cashflow-export-YYYY-MM-DD.json\`

### Importar Datos:

#### Plantilla:
- Click en **Descargar Plantilla**
- Archivo JSON de ejemplo
- Estructura correcta pre-configurada

#### Validación:
1. Selecciona archivo JSON
2. El sistema **valida automáticamente**:
   - Estructura del JSON
   - Campos obligatorios
   - Tipos de datos
3. Muestra **errores** si los hay
4. O muestra **vista previa** si es válido

#### Vista Previa:
- Número de transacciones
- Número de categorías
- Número de alertas
- Resumen antes de importar

#### Importar:
1. Revisa la vista previa
2. Haz clic en **Importar Datos**
3. Confirmación de importación exitosa

---

## <a name="perfil"></a>10. Perfil

Gestión de información personal del usuario.

### Información Personal:
- **Nombre completo**
- **Fecha de nacimiento**
- **Avatar**: Foto de perfil (upload)

### Información de Contacto:
- **Email**
- **Teléfono**
- **Dirección**

### Editar Perfil:
1. Haz clic en **Editar Perfil**
2. Los campos se vuelven editables
3. Modifica la información
4. Haz clic en **Guardar Cambios**
5. O **Cancelar** para descartar

### Avatar:
- Click en el icono de **cámara**
- Selecciona imagen (JPG, PNG)
- Vista previa inmediata
- Se guarda con el perfil

---

## <a name="ajustes"></a>11. Ajustes

Configuración de la aplicación y preferencias.

### Configuración de IA:

#### Proveedores Disponibles:
- **ChatGPT** (OpenAI)
- **Claude** (Anthropic)
- **Gemini** (Google)
- **IA Privada** (servidor propio)

#### Configurar API:
1. Selecciona **proveedor de IA**
2. Introduce **API Key**
3. Para IA Privada:
   - URL del endpoint
   - Headers personalizados (opcional)
4. Haz clic en **Probar Conexión**
5. **Guardar Configuración**

### Análisis con IA:

#### Funcionalidades:
- **Análisis de patrones**: Detecta hábitos de gasto
- **Previsiones**: Proyecciones futuras
- **Qué pasaría si**: Simulaciones de escenarios
- **Recomendaciones**: Sugerencias de ahorro
- **Detección de anomalías**: Gastos inusuales

#### Usar Análisis:
1. Ve a la sección **Análisis IA**
2. Selecciona tipo de análisis
3. O escribe pregunta personalizada:
   - "¿Cuánto gasto en comida al mes?"
   - "¿Podré ahorrar €500 en 3 meses?"
   - "¿Qué pasaría si reduzco gastos un 10%?"
4. Click en **Analizar**
5. La IA procesa y responde

### Otros Ajustes:
- **Moneda**: EUR, USD, GBP, etc.
- **Idioma**: Español, English
- **Zona horaria**: Configuración regional
- **Notificaciones**: Email/Push
- **Tema**: Claro/Oscuro (próximamente)

---

## Soporte

¿Tienes dudas? Contáctanos:
- **Email**: soporte@cashflow.app
- **GitHub**: github.com/cashflow/issues

---

**CashFlow v3.0** - Gestión Financiera Inteligente
© 2025 Todos los derechos reservados
`;

  const tableOfContents = [
    { id: 'introduccion', title: '1. Introducción' },
    { id: 'calendario', title: '2. Calendario' },
    { id: 'transacciones', title: '3. Transacciones' },
    { id: 'categorias', title: '4. Categorías' },
    { id: 'alertas', title: '5. Alertas' },
    { id: 'reportes', title: '6. Reportes' },
    { id: 'documentos', title: '7. Documentos' },
    { id: 'analytics', title: '8. Analytics' },
    { id: 'exportar-importar', title: '9. Exportar/Importar' },
    { id: 'perfil', title: '10. Perfil' },
    { id: 'ajustes', title: '11. Ajustes' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="help-header-left">
          <div className="help-icon-wrapper">
            <HelpCircle size={32} />
          </div>
          <div>
            <h1 className="help-title">Centro de Ayuda</h1>
            <p className="help-subtitle">Manual completo de CashFlow v3.0</p>
          </div>
        </div>
      </div>

      <div className="help-container">
        {/* Table of Contents */}
        <aside className="help-sidebar">
          <div className="sidebar-header">
            <Book size={20} />
            <h3>Índice</h3>
          </div>
          <nav className="sidebar-nav">
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
              >
                <ChevronRight size={16} />
                {item.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Manual Content */}
        <main className="help-content">
          <div className="markdown-body">
            {manualContent.split('\n## ').map((section, idx) => {
              if (idx === 0) {
                return (
                  <div key={idx} dangerouslySetInnerHTML={{
                    __html: section
                      .replace(/### (.*)/g, '<h3>$1</h3>')
                      .replace(/## (.*)/g, '<h2>$1</h2>')
                      .replace(/# (.*)/g, '<h1>$1</h1>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/- (.*)/g, '<li>$1</li>')
                      .replace(/\n\n/g, '<br/><br/>')
                  }} />
                );
              }
              const [titleLine, ...contentLines] = section.split('\n');
              const match = titleLine.match(/<a name="(.*)"><\/a>(.*)/);
              const sectionId = match ? match[1] : '';
              const sectionTitle = match ? match[2] : titleLine;
              const content = contentLines.join('\n');

              return (
                <section key={idx} id={sectionId} className="manual-section">
                  <h2>{sectionTitle}</h2>
                  <div dangerouslySetInnerHTML={{
                    __html: content
                      .replace(/#### (.*)/g, '<h4>$1</h4>')
                      .replace(/### (.*)/g, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/- (.*)/g, '<li>$1</li>')
                      .replace(/(\d+)\. (.*)/g, '<ol><li>$2</li></ol>')
                      .replace(/\n\n/g, '<br/><br/>')
                  }} />
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
