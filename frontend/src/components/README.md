# Componentes AssetFlow

Este directorio contiene componentes reutilizables para la aplicación AssetFlow.

## Componentes Disponibles

### SpainMap

Componente de mapa interactivo de España que muestra oficinas de Correos.

**Características:**
- Mapa interactivo con React-Leaflet
- Marcadores personalizados según nivel de ocupación (verde, amarillo, rojo)
- Filtros por provincia
- Búsqueda por nombre, ciudad o código
- Popups informativos con datos completos de cada oficina
- Indicador visual de capacidad/ocupación
- Responsive y adaptable

**Uso:**
```tsx
import { SpainMap } from '../components';
import { postalOffices } from '../data';

function MyPage() {
  const handleOfficeClick = (office) => {
    console.log('Oficina seleccionada:', office);
  };

  return (
    <SpainMap
      offices={postalOffices}
      height="600px"
      showFilters={true}
      onOfficeClick={handleOfficeClick}
    />
  );
}
```

**Props:**
- `offices?: PostalOffice[]` - Lista de oficinas a mostrar (por defecto usa todas)
- `height?: string` - Altura del mapa (por defecto "600px")
- `showFilters?: boolean` - Mostrar filtros (por defecto true)
- `onOfficeClick?: (office: PostalOffice) => void` - Callback al hacer clic en una oficina

---

### QRCodeGenerator

Componente para generar y descargar códigos QR.

**Características:**
- Generación de códigos QR usando qrcode.react
- Descarga en formato PNG y SVG
- Muestra el código debajo del QR
- Tamaño y nivel de corrección configurables
- Totalmente reutilizable

**Uso:**
```tsx
import { QRCodeGenerator } from '../components';

function AssetDetail({ asset }) {
  return (
    <QRCodeGenerator
      value={asset.qrCode}
      size={256}
      level="H"
      showCode={true}
      title="Código QR del Activo"
    />
  );
}
```

**Props:**
- `value: string` - Valor a codificar en el QR (requerido)
- `size?: number` - Tamaño del QR en píxeles (por defecto 256)
- `level?: 'L' | 'M' | 'Q' | 'H'` - Nivel de corrección de errores (por defecto 'H')
- `includeMargin?: boolean` - Incluir margen (por defecto true)
- `showCode?: boolean` - Mostrar código debajo del QR (por defecto true)
- `title?: string` - Título opcional
- `className?: string` - Clases CSS adicionales

---

## Importación

Los componentes se pueden importar de forma individual o todos juntos:

```tsx
// Importación individual
import SpainMap from './components/SpainMap';
import QRCodeGenerator from './components/QRCodeGenerator';

// Importación desde el index
import { SpainMap, QRCodeGenerator } from './components';
```

## Dependencias

Estos componentes utilizan:
- `react-leaflet` - Para el mapa interactivo
- `leaflet` - Librería base de mapas
- `qrcode.react` - Para generación de códigos QR
- `bootstrap` y `bootstrap-icons` - Para estilos

Todas las dependencias ya están incluidas en package.json.
