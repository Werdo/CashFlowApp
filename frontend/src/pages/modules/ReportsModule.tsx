import { useState } from 'react';
import { mockAssets, mockDepositItems, mockMaintenances, mockMovements } from '../../data/mockData';
import { postalOffices } from '../../data/postalOffices';

export default function ReportsModule() {
  const [reportType, setReportType] = useState<string>('assets');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Calculate various statistics
  const assetsByCategory = mockAssets.reduce((acc, asset) => {
    const category = asset.category.name;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assetsByStatus = mockAssets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const depositItemsByOffice = mockDepositItems.reduce((acc, item) => {
    const office = item.location.officeCode;
    acc[office] = (acc[office] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maintenancesByType = mockMaintenances.reduce((acc, maint) => {
    acc[maint.type] = (acc[maint.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const movementsByType = mockMovements.reduce((acc, mov) => {
    acc[mov.type] = (acc[mov.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAssetValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const maintenanceCost = mockMaintenances
    .filter(m => m.cost)
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <div>
      {/* Report Type Selection */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Tipo de Reporte</h6>
              <div className="btn-group w-100" role="group">
                <button
                  className={`btn ${reportType === 'assets' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('assets')}
                >
                  📦 Activos
                </button>
                <button
                  className={`btn ${reportType === 'deposit' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('deposit')}
                >
                  🏢 Depósito
                </button>
                <button
                  className={`btn ${reportType === 'maintenance' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('maintenance')}
                >
                  🔧 Mantenimiento
                </button>
                <button
                  className={`btn ${reportType === 'movements' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('movements')}
                >
                  🔄 Movimientos
                </button>
                <button
                  className={`btn ${reportType === 'financial' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('financial')}
                >
                  💰 Financiero
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label small">Fecha Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">Fecha Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-success w-100">
                    📥 Exportar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Report */}
      {reportType === 'assets' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Activos por Categoría</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(assetsByCategory).map(([category, count]) => (
                      <tr key={category}>
                        <td>{category}</td>
                        <td className="text-end">{count}</td>
                        <td className="text-end">
                          {((count / mockAssets.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Total</th>
                      <th className="text-end">{mockAssets.length}</th>
                      <th className="text-end">100%</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Activos por Estado</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(assetsByStatus).map(([status, count]) => (
                      <tr key={status}>
                        <td className="text-capitalize">{status}</td>
                        <td className="text-end">{count}</td>
                        <td className="text-end">
                          {((count / mockAssets.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Total</th>
                      <th className="text-end">{mockAssets.length}</th>
                      <th className="text-end">100%</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">💰 Valor Total de Activos</h6>
              </div>
              <div className="card-body">
                <h2 className="mb-0">{totalAssetValue.toLocaleString('es-ES')} €</h2>
                <small className="text-muted">Valor actual de todos los activos registrados</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Report */}
      {reportType === 'deposit' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Items por Oficina de Correos</h6>
              </div>
              <div className="card-body">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Oficina</th>
                      <th>Ciudad</th>
                      <th className="text-end">Items</th>
                      <th className="text-end">Capacidad</th>
                      <th className="text-end">Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postalOffices.map((office: any) => {
                      const itemCount = depositItemsByOffice[office.officeCode] || 0;
                      const occupancy = ((office.currentOccupancy / office.capacity) * 100).toFixed(1);
                      return (
                        <tr key={office.id}>
                          <td><strong>{office.officeCode}</strong></td>
                          <td>{office.name}</td>
                          <td>{office.city}</td>
                          <td className="text-end">{itemCount}</td>
                          <td className="text-end">{office.currentOccupancy} / {office.capacity}</td>
                          <td className="text-end">
                            <span className={`badge bg-${
                              parseFloat(occupancy) > 80 ? 'danger' :
                              parseFloat(occupancy) > 60 ? 'warning' : 'success'
                            }`}>
                              {occupancy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Report */}
      {reportType === 'maintenance' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Mantenimientos por Tipo</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(maintenancesByType).map(([type, count]) => (
                      <tr key={type}>
                        <td className="text-capitalize">{type}</td>
                        <td className="text-end">{count}</td>
                        <td className="text-end">
                          {((count / mockMaintenances.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">💰 Coste Total de Mantenimiento</h6>
              </div>
              <div className="card-body">
                <h2 className="mb-0">{maintenanceCost.toLocaleString('es-ES')} €</h2>
                <small className="text-muted">Suma de todos los costes de mantenimiento</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movements Report */}
      {reportType === 'movements' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Movimientos por Tipo</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(movementsByType).map(([type, count]) => (
                      <tr key={type}>
                        <td className="text-capitalize">{type}</td>
                        <td className="text-end">{count}</td>
                        <td className="text-end">
                          {((count / mockMovements.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Total</th>
                      <th className="text-end">{mockMovements.length}</th>
                      <th className="text-end">100%</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {reportType === 'financial' && (
        <div className="row">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center">
                <div className="text-primary" style={{ fontSize: '3rem' }}>💰</div>
                <h3 className="mt-3">{totalAssetValue.toLocaleString('es-ES')} €</h3>
                <p className="text-muted mb-0">Valor Total Activos</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center">
                <div className="text-danger" style={{ fontSize: '3rem' }}>💸</div>
                <h3 className="mt-3">{maintenanceCost.toLocaleString('es-ES')} €</h3>
                <p className="text-muted mb-0">Costes Mantenimiento</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center">
                <div className="text-success" style={{ fontSize: '3rem' }}>📈</div>
                <h3 className="mt-3">{(totalAssetValue - maintenanceCost).toLocaleString('es-ES')} €</h3>
                <p className="text-muted mb-0">Valor Neto</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
