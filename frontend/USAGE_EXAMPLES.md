# AssetFlow - Ejemplos de Uso

Este documento muestra ejemplos prácticos de cómo usar los componentes y datos creados.

## Índice
1. [Componente SpainMap](#componente-spainmap)
2. [Componente QRCodeGenerator](#componente-qrcodegenerator)
3. [Uso de Datos Mock](#uso-de-datos-mock)
4. [Integración en Páginas](#integración-en-páginas)

---

## Componente SpainMap

### Ejemplo 1: Mapa Básico con Todas las Oficinas

```tsx
import React from 'react';
import { SpainMap } from './components';

function OfficesMapPage() {
  return (
    <div className="container my-4">
      <h2>Mapa de Oficinas de Correos</h2>
      <SpainMap />
    </div>
  );
}
```

### Ejemplo 2: Mapa con Oficinas Filtradas

```tsx
import React, { useState, useEffect } from 'react';
import { SpainMap } from './components';
import { postalOffices } from './data';

function HighOccupancyMap() {
  const [highOccupancyOffices, setHighOccupancyOffices] = useState([]);

  useEffect(() => {
    // Filtrar oficinas con más del 70% de ocupación
    const filtered = postalOffices.filter(office => {
      const occupancy = (office.currentOccupancy / office.capacity) * 100;
      return occupancy > 70;
    });
    setHighOccupancyOffices(filtered);
  }, []);

  return (
    <div className="container my-4">
      <div className="alert alert-warning">
        Mostrando {highOccupancyOffices.length} oficinas con ocupación superior al 70%
      </div>
      <SpainMap
        offices={highOccupancyOffices}
        height="500px"
        showFilters={false}
      />
    </div>
  );
}
```

### Ejemplo 3: Mapa con Interacción

```tsx
import React, { useState } from 'react';
import { SpainMap } from './components';
import { PostalOffice } from './types';

function InteractiveMapPage() {
  const [selectedOffice, setSelectedOffice] = useState<PostalOffice | null>(null);

  const handleOfficeClick = (office: PostalOffice) => {
    setSelectedOffice(office);
    // Aquí podrías abrir un modal, navegar a detalle, etc.
    console.log('Oficina seleccionada:', office);
  };

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-8">
          <SpainMap
            height="600px"
            onOfficeClick={handleOfficeClick}
          />
        </div>
        <div className="col-lg-4">
          {selectedOffice && (
            <div className="card">
              <div className="card-header">
                <h5>{selectedOffice.name}</h5>
              </div>
              <div className="card-body">
                <p><strong>Código:</strong> {selectedOffice.officeCode}</p>
                <p><strong>Dirección:</strong> {selectedOffice.address}</p>
                <p><strong>Ciudad:</strong> {selectedOffice.city}</p>
                <p><strong>Teléfono:</strong> {selectedOffice.phone}</p>
                <p><strong>Email:</strong> {selectedOffice.email}</p>
                <p><strong>Capacidad:</strong> {selectedOffice.currentOccupancy} / {selectedOffice.capacity}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Componente QRCodeGenerator

### Ejemplo 1: QR Simple para Activo

```tsx
import React from 'react';
import { QRCodeGenerator } from './components';

function AssetQRCode({ asset }) {
  return (
    <div className="card">
      <div className="card-body text-center">
        <h5 className="card-title">{asset.name}</h5>
        <QRCodeGenerator
          value={asset.qrCode}
          size={200}
          title="Escanea para ver detalles"
        />
      </div>
    </div>
  );
}
```

### Ejemplo 2: QR para Impresión

```tsx
import React from 'react';
import { QRCodeGenerator } from './components';

function PrintableAssetLabel({ asset }) {
  return (
    <div className="print-label">
      <div className="text-center mb-3">
        <h4>{asset.name}</h4>
        <p className="text-muted">{asset.code}</p>
      </div>

      <QRCodeGenerator
        value={asset.qrCode}
        size={300}
        level="H"
        showCode={true}
        className="mb-3"
      />

      <div className="asset-info">
        <p><strong>Categoría:</strong> {asset.category.name}</p>
        <p><strong>Ubicación:</strong> {asset.location.name}</p>
        <p><strong>Estado:</strong> {asset.status}</p>
      </div>

      <style>{`
        @media print {
          .print-label {
            page-break-after: always;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
```

### Ejemplo 3: QR para Items en Depósito

```tsx
import React from 'react';
import { QRCodeGenerator } from './components';

function DepositItemLabel({ item }) {
  // Crear URL con información del item
  const itemUrl = `${window.location.origin}/deposit/${item.id}`;

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5>Item de Depósito - {item.itemCode}</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <QRCodeGenerator
              value={itemUrl}
              size={250}
              level="H"
              showCode={false}
              title="Escanea para tracking"
            />
          </div>
          <div className="col-md-6">
            <h6>Información del Item</h6>
            <ul className="list-unstyled">
              <li><strong>Cliente:</strong> {item.client.name}</li>
              <li><strong>Tipo:</strong> {item.itemType}</li>
              <li><strong>Cantidad:</strong> {item.quantity}</li>
              <li><strong>Ubicación:</strong> {item.location.name}</li>
              <li><strong>Entrada:</strong> {new Date(item.entryDate).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Uso de Datos Mock

### Ejemplo 1: Lista de Activos

```tsx
import React, { useState, useEffect } from 'react';
import { mockAssets } from './data';

function AssetsList() {
  const [assets, setAssets] = useState(mockAssets);
  const [filter, setFilter] = useState('all');

  const filteredAssets = assets.filter(asset => {
    if (filter === 'all') return true;
    return asset.status === filter;
  });

  return (
    <div className="container my-4">
      <h2>Gestión de Activos</h2>

      <div className="mb-3">
        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="maintenance">En mantenimiento</option>
          <option value="in-deposit">En depósito</option>
          <option value="retired">Retirados</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Valor Actual</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id}>
                <td>{asset.code}</td>
                <td>{asset.name}</td>
                <td>{asset.category.name}</td>
                <td>
                  <span className={`badge bg-${
                    asset.status === 'active' ? 'success' :
                    asset.status === 'maintenance' ? 'warning' :
                    asset.status === 'in-deposit' ? 'info' :
                    'secondary'
                  }`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.location.name}</td>
                <td>{asset.currentValue.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alert alert-info">
        Mostrando {filteredAssets.length} de {assets.length} activos
      </div>
    </div>
  );
}
```

### Ejemplo 2: Dashboard con Estadísticas

```tsx
import React, { useMemo } from 'react';
import { mockAssets, mockDepositItems, mockMaintenances, mockInvoices } from './data';

function Dashboard() {
  const stats = useMemo(() => {
    const totalAssets = mockAssets.length;
    const activeAssets = mockAssets.filter(a => a.status === 'active').length;
    const totalValue = mockAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const pendingMaintenance = mockMaintenances.filter(m => m.status === 'scheduled').length;
    const depositItems = mockDepositItems.filter(d => d.status === 'stored').length;
    const overdueInvoices = mockInvoices.filter(i => i.status === 'overdue').length;

    return {
      totalAssets,
      activeAssets,
      totalValue,
      pendingMaintenance,
      depositItems,
      overdueInvoices
    };
  }, []);

  return (
    <div className="container my-4">
      <h2>Dashboard AssetFlow</h2>

      <div className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5>Activos Totales</h5>
              <h2>{stats.totalAssets}</h2>
              <small>{stats.activeAssets} activos</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5>Valor Total</h5>
              <h2>{stats.totalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</h2>
              <small>En activos</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5>Mantenimientos</h5>
              <h2>{stats.pendingMaintenance}</h2>
              <small>Programados</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5>Items en Depósito</h5>
              <h2>{stats.depositItems}</h2>
              <small>Almacenados</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5>Facturas Vencidas</h5>
              <h2>{stats.overdueInvoices}</h2>
              <small>Requieren atención</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5>Oficinas</h5>
              <h2>24</h2>
              <small>En toda España</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Ejemplo 3: Página Completa con Mapa y Datos

```tsx
import React, { useState } from 'react';
import { SpainMap, QRCodeGenerator } from './components';
import { postalOffices, mockDepositItems, getCapacityStats } from './data';
import { PostalOffice } from './types';

function DepositManagementPage() {
  const [selectedOffice, setSelectedOffice] = useState<PostalOffice | null>(null);
  const capacityStats = getCapacityStats();

  const getOfficeItems = (officeId: string) => {
    return mockDepositItems.filter(item => item.location.id === officeId);
  };

  return (
    <div className="container-fluid my-4">
      <h2>Gestión de Depósitos</h2>

      <div className="row mt-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5>Mapa de Oficinas</h5>
            </div>
            <div className="card-body">
              <SpainMap
                offices={postalOffices}
                height="500px"
                onOfficeClick={setSelectedOffice}
              />
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5>Estadísticas Generales</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h4>{capacityStats.totalOffices}</h4>
                  <small className="text-muted">Oficinas Totales</small>
                </div>
                <div className="col-md-3">
                  <h4>{capacityStats.totalCapacity}</h4>
                  <small className="text-muted">Capacidad Total</small>
                </div>
                <div className="col-md-3">
                  <h4>{capacityStats.totalOccupancy}</h4>
                  <small className="text-muted">Items Almacenados</small>
                </div>
                <div className="col-md-3">
                  <h4>{capacityStats.averageOccupancy}%</h4>
                  <small className="text-muted">Ocupación Media</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {selectedOffice ? (
            <>
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5>{selectedOffice.name}</h5>
                </div>
                <div className="card-body">
                  <p><strong>Código:</strong> {selectedOffice.officeCode}</p>
                  <p><strong>Dirección:</strong><br/>{selectedOffice.address}<br/>
                  {selectedOffice.city}, {selectedOffice.province}</p>
                  <p><strong>Teléfono:</strong> {selectedOffice.phone}</p>
                  <p><strong>Email:</strong> {selectedOffice.email}</p>

                  <hr/>

                  <h6>Capacidad</h6>
                  <div className="progress mb-2" style={{ height: '25px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(selectedOffice.currentOccupancy / selectedOffice.capacity) * 100}%`
                      }}
                    >
                      {Math.round((selectedOffice.currentOccupancy / selectedOffice.capacity) * 100)}%
                    </div>
                  </div>
                  <small>{selectedOffice.currentOccupancy} / {selectedOffice.capacity} items</small>
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-header">
                  <h6>Items en Esta Oficina</h6>
                </div>
                <div className="card-body">
                  {getOfficeItems(selectedOffice.id).length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {getOfficeItems(selectedOffice.id).slice(0, 5).map(item => (
                        <li key={item.id} className="list-group-item px-0">
                          <strong>{item.itemCode}</strong><br/>
                          <small>{item.client.name}</small><br/>
                          <small className="text-muted">{item.description}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No hay items en esta oficina</p>
                  )}
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-header">
                  <h6>Código QR Oficina</h6>
                </div>
                <div className="card-body">
                  <QRCodeGenerator
                    value={selectedOffice.officeCode}
                    size={200}
                    showCode={true}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-info">
              Haz clic en una oficina del mapa para ver sus detalles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositManagementPage;
```

---

## Integración en Rutas

```tsx
// En tu archivo de rutas (routes/index.tsx o similar)
import { Routes, Route } from 'react-router-dom';
import OfficesMapPage from '../pages/OfficesMapPage';
import AssetsList from '../pages/AssetsList';
import Dashboard from '../pages/Dashboard';
import DepositManagementPage from '../pages/DepositManagementPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assets" element={<AssetsList />} />
      <Route path="/offices" element={<OfficesMapPage />} />
      <Route path="/deposits" element={<DepositManagementPage />} />
    </Routes>
  );
}

export default AppRoutes;
```

---

## Notas Importantes

1. **Bootstrap Icons**: Los ejemplos usan iconos de Bootstrap. Asegúrate de que estén incluidos en tu proyecto.

2. **React Router**: Algunos ejemplos asumen el uso de React Router para navegación.

3. **Estilos**: Los componentes usan Bootstrap 5 para estilos. Asegúrate de que esté importado.

4. **TypeScript**: Todos los ejemplos son compatibles con TypeScript y usan los tipos definidos.

5. **Leaflet CSS**: Para el mapa, asegúrate de importar los estilos de Leaflet en tu archivo principal:
   ```tsx
   import 'leaflet/dist/leaflet.css';
   ```

6. **Performance**: Para listas grandes, considera usar paginación o virtualización.
