# Datos AssetFlow

Este directorio contiene datos de ejemplo y configuración para la aplicación AssetFlow.

## Archivos de Datos

### postalOffices.ts

Base de datos de 24 oficinas principales de Correos en España.

**Contenido:**
- 24 oficinas distribuidas por toda España
- Datos completos: código, nombre, dirección, coordenadas, capacidad, contacto
- Funciones helper para filtrar y obtener estadísticas

**Funciones Disponibles:**

```typescript
// Obtener oficina por código
const office = getPostalOfficeByCode('28001');

// Obtener oficinas por provincia
const madridOffices = getPostalOfficesByProvince('Madrid');

// Obtener lista de provincias únicas
const provinces = getProvinces();

// Obtener estadísticas de capacidad
const stats = getCapacityStats();
// Retorna: {
//   totalOffices: 24,
//   totalCapacity: 5420,
//   totalOccupancy: 3890,
//   averageOccupancy: 72,
//   availableSpace: 1530
// }
```

**Ejemplo de Oficina:**
```typescript
{
  id: 'po-001',
  officeCode: '28001',
  name: 'Oficina Principal de Madrid',
  type: 'postal-office',
  address: 'Calle Alcalá, 45',
  city: 'Madrid',
  province: 'Madrid',
  postalCode: '28014',
  country: 'España',
  coordinates: { lat: 40.4168, lng: -3.7038 },
  capacity: 500,
  currentOccupancy: 350,
  manager: 'Carlos Rodríguez García',
  phone: '+34 915 555 001',
  email: 'madrid.principal@correos.es',
  operatingHours: 'L-V: 8:30-20:30, S: 9:30-13:00',
  services: ['Paquetería', 'Certificados', 'Depósito', 'Telegrafía', 'Burofax']
}
```

---

### mockData.ts

Datos de demostración completos para desarrollo y testing.

**Contenido:**

#### 1. Categorías de Activos (6 categorías)
```typescript
assetCategories: AssetCategory[]
```
- Equipos Informáticos
- Mobiliario
- Vehículos
- Maquinaria
- Herramientas
- Electrónica

#### 2. Clientes (10 clientes)
```typescript
mockClients: Client[]
```
Empresas de diferentes provincias de España con datos completos.

#### 3. Activos (50 activos)
```typescript
mockAssets: Asset[]
```
Variedad de activos con diferentes:
- Estados: active, maintenance, in-deposit, retired
- Categorías: portátiles, vehículos, mobiliario, herramientas, etc.
- Valores: desde 85€ hasta 35.000€
- Ubicaciones distribuidas por todas las oficinas

#### 4. Items en Depósito (30 items)
```typescript
mockDepositItems: DepositItem[]
```
Items almacenados con:
- Tipos: box, pallet, document, other
- Estados: stored, in-transit, delivered, returned
- Dimensiones y pesos
- Fechas de entrada/salida

#### 5. Mantenimientos (15 registros)
```typescript
mockMaintenances: Maintenance[]
```
Mantenimientos con:
- Tipos: preventive, corrective, inspection
- Estados: scheduled, in-progress, completed, cancelled
- Costes y técnicos asignados

#### 6. Movimientos (20 movimientos)
```typescript
mockMovements: Movement[]
```
Movimientos de:
- Tipos: transfer, assignment, return, disposal, deposit-entry, deposit-exit
- Estados: pending, in-transit, completed
- Trazabilidad completa

#### 7. Facturas (5 facturas)
```typescript
mockInvoices: Invoice[]
```
Facturas con:
- Items detallados (storage, handling, transport)
- Cálculos de IVA (21%)
- Estados: draft, sent, paid, overdue, cancelled

**Uso:**

```typescript
import {
  mockData,
  mockClients,
  mockAssets,
  mockDepositItems,
  mockMaintenances,
  mockMovements,
  mockInvoices,
  assetCategories
} from '../data';

// Usar todos los datos
console.log(mockData);

// O usar datos específicos
const activeAssets = mockAssets.filter(a => a.status === 'active');
const paidInvoices = mockInvoices.filter(i => i.status === 'paid');
```

---

## Datos Realistas

Todos los datos están diseñados para ser realistas:
- Nombres de empresas y personas españoles
- Direcciones reales de ciudades españolas
- Provincias y códigos postales correctos
- Coordenadas GPS precisas
- NIF/CIF con formato correcto
- Precios de mercado actuales
- Fechas coherentes (2023-2024)

## Integración con Backend

Estos datos pueden usarse como:
1. **Datos de desarrollo** - Para trabajar sin backend
2. **Datos de testing** - Para pruebas automatizadas
3. **Datos de seed** - Para inicializar base de datos
4. **Referencia** - Para validar estructura de datos del backend

## Importación

```typescript
// Desde el index
import {
  postalOffices,
  getProvinces,
  mockAssets,
  mockClients
} from '../data';

// Importación directa
import { postalOffices } from '../data/postalOffices';
import { mockAssets } from '../data/mockData';
```

## Tipos TypeScript

Todos los datos cumplen con los tipos definidos en `../types/index.ts`:
- `PostalOffice`
- `Asset`
- `Client`
- `DepositItem`
- `Maintenance`
- `Movement`
- `Invoice`
- `AssetCategory`
