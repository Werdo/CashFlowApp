import { useState, useMemo } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import SpainMap from '../../components/SpainMap';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { postalOffices, getPostalOfficeByCode } from '../../data/postalOffices';
import { mockDepositItems, mockClients } from '../../data/mockData';
import { PostalOffice, DepositItem, Client } from '../../types';

// Main Deposit Module with Map View
function DepositMapView() {
  const navigate = useNavigate();
  const [selectedOffice, setSelectedOffice] = useState<PostalOffice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState<string>('all');

  // Calculate items per office
  const officeStats = useMemo(() => {
    const stats = new Map<string, { total: number; stored: number; inTransit: number }>();

    postalOffices.forEach(office => {
      const items = mockDepositItems.filter(item => item.location.id === office.id);
      stats.set(office.id, {
        total: items.length,
        stored: items.filter(i => i.status === 'stored').length,
        inTransit: items.filter(i => i.status === 'in-transit').length,
      });
    });

    return stats;
  }, []);

  // Filter offices
  const filteredOffices = useMemo(() => {
    return postalOffices.filter(office => {
      const matchesSearch = office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           office.officeCode.includes(searchTerm);

      const matchesProvince = filterProvince === 'all' || office.province === filterProvince;

      return matchesSearch && matchesProvince;
    });
  }, [searchTerm, filterProvince]);

  // Get unique provinces
  const provinces = useMemo(() => {
    return Array.from(new Set(postalOffices.map(o => o.province))).sort();
  }, []);

  const handleOfficeClick = (office: PostalOffice) => {
    setSelectedOffice(office);
  };

  const totalItems = mockDepositItems.length;
  const storedItems = mockDepositItems.filter(i => i.status === 'stored').length;
  const inTransitItems = mockDepositItems.filter(i => i.status === 'in-transit').length;
  const totalClients = mockClients.filter(c => c.active).length;

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Items</h6>
                  <h3 className="mb-0">{totalItems}</h3>
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
                  <h6 className="text-muted mb-1">Almacenados</h6>
                  <h3 className="mb-0">{storedItems}</h3>
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
                  <h6 className="text-muted mb-1">En Tránsito</h6>
                  <h3 className="mb-0">{inTransitItems}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>🚚</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Clientes Activos</h6>
                  <h3 className="mb-0">{totalClients}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>👥</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Map Section */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🗺️ Mapa de Oficinas de Correos</h5>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar oficina..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <select
                    className="form-select form-select-sm"
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="all">Todas las provincias</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <SpainMap
                offices={filteredOffices}
                onOfficeClick={handleOfficeClick}
                height="600px"
              />
            </div>
            <div className="card-footer bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Mostrando {filteredOffices.length} de {postalOffices.length} oficinas
                </small>
                <div className="d-flex gap-3">
                  <small><span className="badge bg-success">●</span> &lt; 60% ocupación</small>
                  <small><span className="badge bg-warning">●</span> 60-80% ocupación</small>
                  <small><span className="badge bg-danger">●</span> &gt; 80% ocupación</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Details Section */}
        <div className="col-lg-4">
          {selectedOffice ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">🏢 {selectedOffice.name}</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <small className="text-muted">Código Oficina</small>
                  <div className="fw-bold">{selectedOffice.officeCode}</div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Ubicación</small>
                  <div>{selectedOffice.address}</div>
                  <div>{selectedOffice.postalCode} {selectedOffice.city}</div>
                  <div>{selectedOffice.province}</div>
                </div>

                {selectedOffice.manager && (
                  <div className="mb-3">
                    <small className="text-muted">Responsable</small>
                    <div>{selectedOffice.manager}</div>
                  </div>
                )}

                {selectedOffice.phone && (
                  <div className="mb-3">
                    <small className="text-muted">Teléfono</small>
                    <div>{selectedOffice.phone}</div>
                  </div>
                )}

                {selectedOffice.email && (
                  <div className="mb-3">
                    <small className="text-muted">Email</small>
                    <div>{selectedOffice.email}</div>
                  </div>
                )}

                <div className="mb-3">
                  <small className="text-muted">Capacidad</small>
                  <div className="progress" style={{ height: '20px' }}>
                    <div
                      className={`progress-bar ${
                        (selectedOffice.currentOccupancy / selectedOffice.capacity) * 100 > 80
                          ? 'bg-danger'
                          : (selectedOffice.currentOccupancy / selectedOffice.capacity) * 100 > 60
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                      style={{ width: `${(selectedOffice.currentOccupancy / selectedOffice.capacity) * 100}%` }}
                    >
                      {selectedOffice.currentOccupancy} / {selectedOffice.capacity}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Items en esta oficina</small>
                  <div className="d-flex justify-content-between mt-2">
                    <span>Total: <strong>{officeStats.get(selectedOffice.id)?.total || 0}</strong></span>
                    <span>Almacenados: <strong>{officeStats.get(selectedOffice.id)?.stored || 0}</strong></span>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/deposit/office/${selectedOffice.officeCode}`)}
                >
                  Ver Inventario Detallado
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div style={{ fontSize: '3rem' }}>🗺️</div>
                <h5 className="mt-3">Selecciona una oficina</h5>
                <p className="text-muted">Haz clic en un marcador del mapa para ver los detalles de la oficina</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Acciones Rápidas</h6>
              <div className="d-flex gap-2">
                <Link to="/deposit/items" className="btn btn-outline-primary">
                  📦 Ver Todos los Items
                </Link>
                <Link to="/deposit/clients" className="btn btn-outline-success">
                  👥 Gestionar Clientes
                </Link>
                <Link to="/deposit/new" className="btn btn-primary">
                  ➕ Nuevo Ingreso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Office Detail View
function OfficeDetailView() {
  const navigate = useNavigate();
  const officeCode = window.location.pathname.split('/').pop() || '';
  const office = getPostalOfficeByCode(officeCode);
  const [selectedItem, setSelectedItem] = useState<DepositItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  if (!office) {
    return (
      <div className="alert alert-warning">
        <h5>Oficina no encontrada</h5>
        <button className="btn btn-primary" onClick={() => navigate('/deposit')}>
          Volver al Mapa
        </button>
      </div>
    );
  }

  // Get items for this office
  const officeItems = mockDepositItems.filter(item => item.location.id === office.id);

  // Filter items
  const filteredItems = officeItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesClient = filterClient === 'all' || item.clientId === filterClient;
    return matchesStatus && matchesClient;
  });

  // Get unique clients for this office
  const officeClients = Array.from(new Set(officeItems.map(item => item.clientId)))
    .map(clientId => mockClients.find(c => c.id === clientId))
    .filter(Boolean) as Client[];

  const statusColors: Record<string, string> = {
    'stored': 'success',
    'in-transit': 'warning',
    'delivered': 'info',
    'returned': 'secondary',
  };

  const statusLabels: Record<string, string> = {
    'stored': 'Almacenado',
    'in-transit': 'En Tránsito',
    'delivered': 'Entregado',
    'returned': 'Devuelto',
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/deposit')}>
            ← Volver al Mapa
          </button>
          <h4 className="mb-0">🏢 {office.name}</h4>
          <small className="text-muted">Código: {office.officeCode} | {office.city}, {office.province}</small>
        </div>
        <div>
          <span className={`badge bg-${
            (office.currentOccupancy / office.capacity) * 100 > 80 ? 'danger' :
            (office.currentOccupancy / office.capacity) * 100 > 60 ? 'warning' : 'success'
          } me-2`}>
            {Math.round((office.currentOccupancy / office.capacity) * 100)}% Ocupación
          </span>
          <button className="btn btn-primary btn-sm">
            ➕ Nuevo Ingreso
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h2>{officeItems.length}</h2>
              <small className="text-muted">Total Items</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h2>{officeItems.filter(i => i.status === 'stored').length}</h2>
              <small className="text-muted">Almacenados</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h2>{officeClients.length}</h2>
              <small className="text-muted">Clientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h2>{office.capacity - office.currentOccupancy}</h2>
              <small className="text-muted">Espacio Disponible</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label small text-muted">Estado</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="stored">Almacenado</option>
                <option value="in-transit">En Tránsito</option>
                <option value="delivered">Entregado</option>
                <option value="returned">Devuelto</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Cliente</label>
              <select
                className="form-select"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="all">Todos los clientes</option>
                {officeClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={() => {
                setFilterStatus('all');
                setFilterClient('all');
              }}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">📦 Inventario ({filteredItems.length} items)</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Fecha Ingreso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.itemCode}</strong>
                      <br />
                      <small className="text-muted">{item.qrCode}</small>
                    </td>
                    <td>
                      {item.itemType === 'box' && '📦 Caja'}
                      {item.itemType === 'pallet' && '🟫 Pallet'}
                      {item.itemType === 'document' && '📄 Documento'}
                      {item.itemType === 'other' && '📋 Otro'}
                    </td>
                    <td>
                      <strong>{item.client.name}</strong>
                      <br />
                      <small className="text-muted">{item.client.code}</small>
                    </td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.entryDate).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={`badge bg-${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedItem(item)}
                      >
                        Ver QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedItem && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedItem(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Código QR - {selectedItem.itemCode}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedItem(null)}></button>
              </div>
              <div className="modal-body text-center">
                <QRCodeGenerator
                  value={selectedItem.qrCode}
                  title={`${selectedItem.itemCode} - ${selectedItem.client.name}`}
                  size={256}
                />
                <div className="mt-3">
                  <p className="mb-1"><strong>{selectedItem.description}</strong></p>
                  <p className="text-muted mb-0">{selectedItem.client.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// All Items View
function AllItemsView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOffice, setFilterOffice] = useState<string>('all');

  const filteredItems = mockDepositItems.filter(item => {
    const matchesSearch = item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesOffice = filterOffice === 'all' || item.location.officeCode === filterOffice;

    return matchesSearch && matchesStatus && matchesOffice;
  });

  const statusColors: Record<string, string> = {
    'stored': 'success',
    'in-transit': 'warning',
    'delivered': 'info',
    'returned': 'secondary',
  };

  const statusLabels: Record<string, string> = {
    'stored': 'Almacenado',
    'in-transit': 'En Tránsito',
    'delivered': 'Entregado',
    'returned': 'Devuelto',
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/deposit')}>
            ← Volver al Mapa
          </button>
          <h4 className="mb-0">📦 Todos los Items de Depósito</h4>
        </div>
        <button className="btn btn-primary">
          ➕ Nuevo Ingreso
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código, descripción o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="stored">Almacenado</option>
                <option value="in-transit">En Tránsito</option>
                <option value="delivered">Entregado</option>
                <option value="returned">Devuelto</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterOffice}
                onChange={(e) => setFilterOffice(e.target.value)}
              >
                <option value="all">Todas las oficinas</option>
                {postalOffices.map(office => (
                  <option key={office.id} value={office.officeCode}>
                    {office.officeCode} - {office.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterOffice('all');
              }}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">Mostrando {filteredItems.length} de {mockDepositItems.length} items</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Oficina</th>
                  <th>Cantidad</th>
                  <th>Fecha Ingreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{item.itemCode}</strong>
                      <br />
                      <small className="text-muted">{item.qrCode}</small>
                    </td>
                    <td>
                      {item.itemType === 'box' && '📦 Caja'}
                      {item.itemType === 'pallet' && '🟫 Pallet'}
                      {item.itemType === 'document' && '📄 Documento'}
                      {item.itemType === 'other' && '📋 Otro'}
                    </td>
                    <td>
                      <strong>{item.client.name}</strong>
                      <br />
                      <small className="text-muted">{item.client.code}</small>
                    </td>
                    <td>{item.description}</td>
                    <td>
                      <strong>{item.location.officeCode}</strong>
                      <br />
                      <small className="text-muted">{item.location.city}</small>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.entryDate).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={`badge bg-${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Module Router
export default function DepositModule() {
  return (
    <Routes>
      <Route path="/" element={<DepositMapView />} />
      <Route path="/office/:officeCode" element={<OfficeDetailView />} />
      <Route path="/items" element={<AllItemsView />} />
    </Routes>
  );
}
