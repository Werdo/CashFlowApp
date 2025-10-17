import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Client {
  _id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  parentClientId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  warehouses?: any[];
  active: boolean;
  createdAt: string;
}

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [clientForm, setClientForm] = useState({
    code: '',
    name: '',
    type: 'client',
    level: 1,
    parentClientId: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    active: true
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      const response = await axios.post('/api/clients', clientForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Cliente creado exitosamente');
        loadClients();
        setShowModal(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      const response = await axios.put(
        `/api/clients/${editingClient._id}`,
        clientForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Cliente actualizado exitosamente');
        loadClients();
        setShowModal(false);
        setEditingClient(null);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar cliente');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      const response = await axios.delete(`/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Cliente eliminado exitosamente');
        loadClients();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const resetForm = () => {
    setClientForm({
      code: '',
      name: '',
      type: 'client',
      level: 1,
      parentClientId: '',
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      },
      active: true
    });
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      code: client.code,
      name: client.name,
      type: client.type,
      level: client.level,
      parentClientId: client.parentClientId || '',
      contactInfo: {
        email: client.contactInfo?.email || '',
        phone: client.contactInfo?.phone || '',
        address: client.contactInfo?.address || ''
      },
      active: client.active
    });
    setShowModal(true);
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'primary';
      case 2: return 'info';
      case 3: return 'success';
      default: return 'secondary';
    }
  };

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
              <h2>Gestión de Clientes</h2>
              <p className="text-muted">Administración de jerarquía de clientes (3 niveles)</p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => {
                setEditingClient(null);
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Clientes</h6>
              <h3>{clients.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Nivel 1</h6>
              <h3>{clients.filter(c => c.level === 1).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Nivel 2</h6>
              <h3>{clients.filter(c => c.level === 2).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Nivel 3</h6>
              <h3>{clients.filter(c => c.level === 3).length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Nivel</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Almacenes</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td><strong>{client.code}</strong></td>
                    <td>{client.name}</td>
                    <td>
                      <span className="badge bg-secondary">{client.type}</span>
                    </td>
                    <td>
                      <span className={`badge bg-${getLevelBadgeColor(client.level)}`}>
                        Nivel {client.level}
                      </span>
                    </td>
                    <td>{client.contactInfo?.email || '-'}</td>
                    <td>{client.contactInfo?.phone || '-'}</td>
                    <td>{client.warehouses?.length || 0}</td>
                    <td>
                      <span className={`badge bg-${client.active ? 'success' : 'secondary'}`}>
                        {client.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(client)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteClient(client._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClient ? 'Editar Cliente' : 'Crear Cliente'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Código</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientForm.code}
                      onChange={(e) => setClientForm({...clientForm, code: e.target.value.toUpperCase()})}
                      placeholder="CLI-001"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-select"
                      value={clientForm.type}
                      onChange={(e) => setClientForm({...clientForm, type: e.target.value})}
                    >
                      <option value="client">Cliente</option>
                      <option value="sub-client">Sub-Cliente</option>
                      <option value="sub-sub-client">Sub-Sub-Cliente</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nivel</label>
                    <select
                      className="form-select"
                      value={clientForm.level}
                      onChange={(e) => setClientForm({...clientForm, level: parseInt(e.target.value)})}
                    >
                      <option value={1}>Nivel 1</option>
                      <option value={2}>Nivel 2</option>
                      <option value={3}>Nivel 3</option>
                    </select>
                  </div>
                  {clientForm.level > 1 && (
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Cliente Padre</label>
                      <select
                        className="form-select"
                        value={clientForm.parentClientId}
                        onChange={(e) => setClientForm({...clientForm, parentClientId: e.target.value})}
                      >
                        <option value="">Seleccione un cliente padre</option>
                        {clients
                          .filter(c => c.level === clientForm.level - 1)
                          .map(c => (
                            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={clientForm.contactInfo.email}
                      onChange={(e) => setClientForm({
                        ...clientForm,
                        contactInfo: {...clientForm.contactInfo, email: e.target.value}
                      })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientForm.contactInfo.phone}
                      onChange={(e) => setClientForm({
                        ...clientForm,
                        contactInfo: {...clientForm.contactInfo, phone: e.target.value}
                      })}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={clientForm.active}
                        onChange={(e) => setClientForm({...clientForm, active: e.target.checked})}
                      />
                      <label className="form-check-label">Cliente Activo</label>
                    </div>
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Dirección</label>
                    <textarea
                      className="form-control"
                      value={clientForm.contactInfo.address}
                      onChange={(e) => setClientForm({
                        ...clientForm,
                        contactInfo: {...clientForm.contactInfo, address: e.target.value}
                      })}
                      rows={3}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={editingClient ? handleUpdateClient : handleCreateClient}
                >
                  {editingClient ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop show" />}
    </div>
  );
};

export default AdminClients;
