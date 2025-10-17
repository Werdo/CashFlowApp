import { useState } from 'react';
import { mockAssets, assetCategories } from '../../data/mockData';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { Asset } from '../../types';

export default function AssetsModule() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showQR, setShowQR] = useState(false);

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.category.id === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const activeAssets = mockAssets.filter(a => a.status === 'active').length;
  const inMaintenanceAssets = mockAssets.filter(a => a.status === 'maintenance').length;

  const statusColors: Record<string, string> = {
    'active': 'success',
    'inactive': 'secondary',
    'maintenance': 'warning',
    'retired': 'danger',
    'in-deposit': 'info',
  };

  const statusLabels: Record<string, string> = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'maintenance': 'Mantenimiento',
    'retired': 'Retirado',
    'in-deposit': 'En Depósito',
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Activos</h6>
                  <h3 className="mb-0">{mockAssets.length}</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>📦</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Activos</h6>
                  <h3 className="mb-0">{activeAssets}</h3>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>✅</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">En Mantenimiento</h6>
                  <h3 className="mb-0">{inMaintenanceAssets}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>🔧</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Valor Total</h6>
                  <h3 className="mb-0">{totalValue.toLocaleString('es-ES')}€</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código, nombre o nº serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {assetCategories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="retired">Retirado</option>
                <option value="in-deposit">En Depósito</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100">
                ➕ Nuevo Activo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">📦 Activos ({filteredAssets.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Valor Actual</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id}>
                    <td>
                      <strong>{asset.code}</strong>
                      {asset.serialNumber && (
                        <>
                          <br />
                          <small className="text-muted">S/N: {asset.serialNumber}</small>
                        </>
                      )}
                    </td>
                    <td>{asset.name}</td>
                    <td>
                      <span style={{ color: asset.category.color }}>
                        {asset.category.icon} {asset.category.name}
                      </span>
                    </td>
                    <td>
                      {asset.location.name}
                      <br />
                      <small className="text-muted">{asset.location.city}</small>
                    </td>
                    <td>{asset.currentValue.toLocaleString('es-ES')}€</td>
                    <td>
                      <span className={`badge bg-${statusColors[asset.status]}`}>
                        {statusLabels[asset.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowQR(true);
                        }}
                      >
                        QR
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && selectedAsset && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowQR(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Código QR - {selectedAsset.code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowQR(false)}></button>
              </div>
              <div className="modal-body text-center">
                <QRCodeGenerator
                  value={selectedAsset.qrCode || selectedAsset.code}
                  title={`${selectedAsset.code} - ${selectedAsset.name}`}
                  size={256}
                />
                <div className="mt-3">
                  <p className="mb-1"><strong>{selectedAsset.name}</strong></p>
                  <p className="text-muted mb-0">{selectedAsset.category.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
