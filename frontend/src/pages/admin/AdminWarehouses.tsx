import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../config/api';

interface Client {
  _id: string;
  code: string;
  name: string;
  warehouses?: Warehouse[];
}

interface Warehouse {
  _id?: string;
  code: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  locations: Location[];
}

interface Location {
  code: string;
  name: string;
  capacity?: number;
  currentOccupancy?: number;
}

const AdminWarehouses: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    phone: ''
  });

  const [locationForm, setLocationForm] = useState({
    code: '',
    name: '',
    capacity: 0
  });

  const [csvImport, setCsvImport] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/clients'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setClients(response.data.data.clients);
        if (response.data.data.clients.length > 0) {
          setSelectedClient(response.data.data.clients[0]);
        }
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async () => {
    if (!selectedClient) {
      toast.error('Seleccione un cliente');
      return;
    }

    try {
      const response = await axios.post(
        getApiUrl(`/api/clients/${selectedClient._id}/warehouses`),
        warehouseForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Almacén creado exitosamente');
        loadClients();
        setShowWarehouseModal(false);
        resetWarehouseForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear almacén');
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!selectedClient || !editingWarehouse || !editingWarehouse._id) return;

    try {
      const response = await axios.put(
        getApiUrl(`/api/clients/${selectedClient._id}/warehouses/${editingWarehouse._id}`),
        warehouseForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Almacén actualizado exitosamente');
        loadClients();
        setShowWarehouseModal(false);
        setEditingWarehouse(null);
        resetWarehouseForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar almacén');
    }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    if (!selectedClient || !window.confirm('¿Está seguro de eliminar este almacén?')) return;

    try {
      const response = await axios.delete(
        getApiUrl(`/api/clients/${selectedClient._id}/warehouses/${warehouseId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Almacén eliminado exitosamente');
        loadClients();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar almacén');
    }
  };

  const handleAddLocation = async () => {
    if (!selectedClient || !selectedWarehouse || !selectedWarehouse._id) {
      toast.error('Seleccione un almacén');
      return;
    }

    try {
      const response = await axios.post(
        getApiUrl(`/api/clients/${selectedClient._id}/warehouses/${selectedWarehouse._id}/locations`),
        locationForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Ubicación añadida exitosamente');
        loadClients();
        setShowLocationModal(false);
        resetLocationForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al añadir ubicación');
    }
  };

  const handleImportLocations = async () => {
    if (!selectedClient || !selectedWarehouse || !selectedWarehouse._id) {
      toast.error('Seleccione un almacén');
      return;
    }

    try {
      const lines = csvImport.split('\n').filter(line => line.trim());
      const locations = lines.map(line => {
        const [code, name, capacity] = line.split(',').map(s => s.trim());
        return {
          code,
          name: name || code,
          capacity: capacity ? parseInt(capacity) : undefined
        };
      });

      const response = await axios.post(
        getApiUrl(`/api/clients/${selectedClient._id}/warehouses/${selectedWarehouse._id}/locations/import`),
        { locations },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`${locations.length} ubicaciones importadas exitosamente`);
        loadClients();
        setCsvImport('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar ubicaciones');
    }
  };

  const resetWarehouseForm = () => {
    setWarehouseForm({
      code: '',
      name: '',
      address: '',
      contactPerson: '',
      phone: ''
    });
  };

  const resetLocationForm = () => {
    setLocationForm({
      code: '',
      name: '',
      capacity: 0
    });
  };

  const openEditWarehouseModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || '',
      contactPerson: warehouse.contactPerson || '',
      phone: warehouse.phone || ''
    });
    setShowWarehouseModal(true);
  };

  const totalWarehouses = clients.reduce((sum, client) => sum + (client.warehouses?.length || 0), 0);
  const totalLocations = clients.reduce((sum, client) => {
    return sum + (client.warehouses?.reduce((wsum, w) => wsum + w.locations.length, 0) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Gestión de Almacenes</h2>
              <p className="text-muted">Administración de almacenes y ubicaciones por cliente</p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => {
                setEditingWarehouse(null);
                resetWarehouseForm();
                setShowWarehouseModal(true);
              }}
              disabled={!selectedClient}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear Almacén
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Almacenes</h6>
              <h3>{totalWarehouses}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Ubicaciones</h6>
              <h3>{totalLocations}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Clientes con Almacenes</h6>
              <h3>{clients.filter(c => c.warehouses && c.warehouses.length > 0).length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Cliente</label>
          <select
            className="form-select"
            value={selectedClient?._id || ''}
            onChange={(e) => {
              const client = clients.find(c => c._id === e.target.value);
              setSelectedClient(client || null);
            }}
          >
            <option value="">Seleccione un cliente</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} ({client.code}) - {client.warehouses?.length || 0} almacenes
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClient && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Almacenes de {selectedClient.name}</h5>
          </div>
          <div className="card-body">
            {selectedClient.warehouses && selectedClient.warehouses.length > 0 ? (
              selectedClient.warehouses.map((warehouse) => (
                <div key={warehouse._id} className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{warehouse.name}</strong>
                      <span className="ms-2 badge bg-secondary">{warehouse.code}</span>
                      <span className="ms-2 text-muted small">
                        {warehouse.locations.length} ubicaciones
                      </span>
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setShowLocationModal(true);
                        }}
                      >
                        Añadir Ubicación
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditWarehouseModal(warehouse)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteWarehouse(warehouse._id!)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {warehouse.address && (
                      <p className="mb-1"><strong>Dirección:</strong> {warehouse.address}</p>
                    )}
                    {warehouse.contactPerson && (
                      <p className="mb-1"><strong>Contacto:</strong> {warehouse.contactPerson}</p>
                    )}
                    {warehouse.phone && (
                      <p className="mb-1"><strong>Teléfono:</strong> {warehouse.phone}</p>
                    )}

                    {warehouse.locations.length > 0 && (
                      <div className="mt-3">
                        <h6>Ubicaciones:</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Capacidad</th>
                                <th>Ocupación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {warehouse.locations.map((location, idx) => (
                                <tr key={idx}>
                                  <td><code>{location.code}</code></td>
                                  <td>{location.name}</td>
                                  <td>{location.capacity || '-'}</td>
                                  <td>{location.currentOccupancy || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-info">
                Este cliente no tiene almacenes registrados. Haga clic en "Crear Almacén" para añadir uno.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {showWarehouseModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingWarehouse ? 'Editar Almacén' : 'Crear Almacén'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowWarehouseModal(false);
                    setEditingWarehouse(null);
                    resetWarehouseForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({...warehouseForm, code: e.target.value.toUpperCase()})}
                    placeholder="ALM-001"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                    placeholder="Almacén Central"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <textarea
                    className="form-control"
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({...warehouseForm, address: e.target.value})}
                    rows={2}
                    placeholder="Dirección completa"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Persona de Contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={warehouseForm.contactPerson}
                    onChange={(e) => setWarehouseForm({...warehouseForm, contactPerson: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={warehouseForm.phone}
                    onChange={(e) => setWarehouseForm({...warehouseForm, phone: e.target.value})}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowWarehouseModal(false);
                    setEditingWarehouse(null);
                    resetWarehouseForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
                >
                  {editingWarehouse ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showWarehouseModal && <div className="modal-backdrop show" />}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Añadir Ubicaciones - {selectedWarehouse?.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedWarehouse(null);
                    resetLocationForm();
                    setCsvImport('');
                  }}
                />
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <a className="nav-link active" data-bs-toggle="tab" href="#single">
                      Ubicación Individual
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#import">
                      Importar CSV
                    </a>
                  </li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="single">
                    <div className="mb-3">
                      <label className="form-label">Código *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locationForm.code}
                        onChange={(e) => setLocationForm({...locationForm, code: e.target.value.toUpperCase()})}
                        placeholder="A1-01"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locationForm.name}
                        onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                        placeholder="Pasillo A, Rack 1, Nivel 1"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Capacidad</label>
                      <input
                        type="number"
                        className="form-control"
                        value={locationForm.capacity}
                        onChange={(e) => setLocationForm({...locationForm, capacity: parseInt(e.target.value)})}
                      />
                    </div>
                    <button className="btn btn-danger" onClick={handleAddLocation}>
                      Añadir Ubicación
                    </button>
                  </div>

                  <div className="tab-pane fade" id="import">
                    <div className="mb-3">
                      <label className="form-label">Formato CSV</label>
                      <small className="form-text text-muted d-block mb-2">
                        Formato: codigo,nombre,capacidad (una línea por ubicación)
                        <br />
                        Ejemplo: A1-01,Pasillo A Rack 1,100
                      </small>
                      <textarea
                        className="form-control font-monospace"
                        value={csvImport}
                        onChange={(e) => setCsvImport(e.target.value)}
                        rows={10}
                        placeholder="A1-01,Pasillo A Rack 1,100&#10;A1-02,Pasillo A Rack 2,100&#10;A2-01,Pasillo A Rack 3,100"
                      />
                    </div>
                    <button className="btn btn-danger" onClick={handleImportLocations}>
                      Importar Ubicaciones
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLocationModal && <div className="modal-backdrop show" />}
    </div>
  );
};

export default AdminWarehouses;
