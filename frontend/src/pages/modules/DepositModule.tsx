import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DepositItem {
  _id?: string;
  article: {
    _id: string;
    sku: string;
    name: string;
  };
  articleName?: string;
  articleSKU?: string;
  quantity: number;
  unit: string;
  receivedDate: string;
  expiryDate?: string;
  lotNumber?: string;
  notes?: string;
}

interface Deposit {
  _id: string;
  code: string;
  client: {
    _id: string;
    code: string;
    name: string;
    color?: string;
  };
  clientName?: string;
  warehouse?: string;
  warehouseName?: string;
  location?: string;
  items: DepositItem[];
  status: 'active' | 'invoiced' | 'partial' | 'closed' | 'cancelled';
  receivedDate: string;
  dueDate?: string;
  totalValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  updatedBy?: {
    name: string;
    email: string;
  };
  // Virtuals from backend
  daysUntilDue?: number | null;
  isOverdue?: boolean;
  alertLevel?: 'none' | 'info' | 'warning' | 'critical';
}

interface Client {
  _id: string;
  code: string;
  name: string;
  color?: string;
}

interface Article {
  _id: string;
  sku: string;
  name: string;
  ean?: string;
}

interface DepositStats {
  total: number;
  byStatus: {
    active: number;
    invoiced: number;
    partial: number;
    closed: number;
    cancelled: number;
  };
  totalValue: number;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export default function DepositModule() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('');
  const [filterAlertLevel, setFilterAlertLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    client: '',
    warehouse: '',
    location: '',
    items: [] as Array<{
      article: string;
      quantity: number;
      unit: string;
      receivedDate: string;
      expiryDate?: string;
      lotNumber?: string;
      notes?: string;
    }>,
    dueDate: '',
    notes: ''
  });

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role || 'viewer';

  useEffect(() => {
    loadData();
  }, [filterStatus, filterClient, filterAlertLevel]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterClient) params.clientId = filterClient;
      if (filterAlertLevel !== 'all') params.alertLevel = filterAlertLevel;
      if (searchTerm) params.search = searchTerm;

      const [depositsRes, clientsRes, articlesRes, statsRes] = await Promise.all([
        axios.get('/api/deposits', {
          headers: { Authorization: `Bearer ${token}` },
          params
        }),
        axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
          params: { active: true }
        }),
        axios.get('/api/articles', {
          headers: { Authorization: `Bearer ${token}` },
          params: { active: true }
        }),
        axios.get('/api/deposits/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDeposits(depositsRes.data.data || []);
      setClients(clientsRes.data.data.clients || []);
      setArticles(articlesRes.data.data.articles || []);
      setStats(statsRes.data.data || null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client || formData.items.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const payload = {
        ...formData,
        items: formData.items.map(item => ({
          article: item.article,
          quantity: Number(item.quantity),
          unit: item.unit,
          receivedDate: item.receivedDate,
          expiryDate: item.expiryDate || undefined,
          lotNumber: item.lotNumber,
          notes: item.notes
        }))
      };

      if (showEditModal && selectedDeposit) {
        await axios.put(`/api/deposits/${selectedDeposit._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Depósito actualizado exitosamente');
      } else {
        await axios.post('/api/deposits', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Depósito creado exitosamente');
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving deposit:', error);
      toast.error(error.response?.data?.message || 'Error al guardar depósito');
    }
  };

  const handleDelete = async (depositId: string) => {
    if (!window.confirm('¿Está seguro de cancelar este depósito?')) {
      return;
    }

    try {
      await axios.delete(`/api/deposits/${depositId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Depósito cancelado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting deposit:', error);
      if (error.response?.data?.error?.code === 'DEPOSIT_CLOSED') {
        toast.error('No se puede eliminar un depósito cerrado');
      } else if (error.response?.data?.error?.code === 'DEPOSIT_INVOICED') {
        toast.error('No se puede eliminar un depósito facturado');
      } else {
        toast.error(error.response?.data?.message || 'Error al cancelar depósito');
      }
    }
  };

  const handleClose = async (depositId: string) => {
    if (!window.confirm('¿Marcar este depósito como cerrado?')) {
      return;
    }

    try {
      await axios.post(`/api/deposits/${depositId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Depósito cerrado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error closing deposit:', error);
      toast.error(error.response?.data?.message || 'Error al cerrar depósito');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setFormData({
      code: deposit.code,
      client: deposit.client._id,
      warehouse: deposit.warehouse || '',
      location: deposit.location || '',
      items: deposit.items.map(item => ({
        article: item.article._id,
        quantity: item.quantity,
        unit: item.unit,
        receivedDate: item.receivedDate.split('T')[0],
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
        lotNumber: item.lotNumber || '',
        notes: item.notes || ''
      })),
      dueDate: deposit.dueDate ? deposit.dueDate.split('T')[0] : '',
      notes: deposit.notes || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      client: '',
      warehouse: '',
      location: '',
      items: [],
      dueDate: '',
      notes: ''
    });
    setSelectedDeposit(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        article: '',
        quantity: 1,
        unit: 'units',
        receivedDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        lotNumber: '',
        notes: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = !searchTerm ||
      deposit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate alert level (client-side fallback if backend doesn't provide it)
  const calculateAlertLevel = (deposit: Deposit): 'none' | 'info' | 'warning' | 'critical' => {
    if (!deposit.dueDate || !['active', 'partial'].includes(deposit.status)) {
      return 'none';
    }

    const now = new Date();
    const dueDate = new Date(deposit.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'critical';
    if (daysUntilDue <= 7) return 'warning';
    if (daysUntilDue <= 30) return 'info';
    return 'none';
  };

  // Status labels and colors
  const statusLabels: Record<string, string> = {
    'active': 'Activo',
    'invoiced': 'Facturado',
    'partial': 'Parcial',
    'closed': 'Cerrado',
    'cancelled': 'Cancelado'
  };

  const statusColors: Record<string, string> = {
    'active': 'success',
    'invoiced': 'info',
    'partial': 'warning',
    'closed': 'secondary',
    'cancelled': 'dark'
  };

  const alertColors: Record<string, string> = {
    'none': 'secondary',
    'info': 'info',
    'warning': 'warning',
    'critical': 'danger'
  };

  const alertLabels: Record<string, string> = {
    'none': 'Sin alertas',
    'info': 'Vence en 30 días',
    'warning': 'Vence en 7 días',
    'critical': 'Vencido'
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Depósitos</h6>
                  <h3 className="mb-0">{stats?.total || 0}</h3>
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
                  <h3 className="mb-0">{stats?.byStatus.active || 0}</h3>
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
                  <h6 className="text-muted mb-1">Alertas Críticas</h6>
                  <h3 className="mb-0">{stats?.alerts.critical || 0}</h3>
                </div>
                <div className="text-danger" style={{ fontSize: '2rem' }}>⚠️</div>
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
                  <h3 className="mb-0">${stats?.totalValue.toLocaleString() || 0}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="invoiced">Facturado</option>
                <option value="partial">Parcial</option>
                <option value="closed">Cerrado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterAlertLevel}
                onChange={(e) => setFilterAlertLevel(e.target.value)}
              >
                <option value="all">Todas las alertas</option>
                <option value="critical">Críticas</option>
                <option value="warning">Advertencias</option>
                <option value="info">Información</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="">Todos los clientes</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={openCreateModal}
                disabled={!['admin', 'manager'].includes(userRole)}
              >
                ➕ Nuevo Depósito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">📦 Depósitos ({filteredDeposits.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Artículos</th>
                  <th>Ubicación</th>
                  <th>Fecha Recepción</th>
                  <th>Fecha Vencimiento</th>
                  <th>Estado</th>
                  <th>Alerta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      No se encontraron depósitos
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map(deposit => {
                    const alertLevel = calculateAlertLevel(deposit);
                    return (
                      <tr key={deposit._id}>
                        <td>
                          <strong>{deposit.code}</strong>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${deposit.client.color || '#3B82F6'}20`,
                              color: deposit.client.color || '#3B82F6',
                              border: `1px solid ${deposit.client.color || '#3B82F6'}`
                            }}
                          >
                            {deposit.client.name}
                          </span>
                        </td>
                        <td>{deposit.items.length}</td>
                        <td>
                          {deposit.warehouse && (
                            <>
                              <strong>{deposit.warehouse}</strong>
                              {deposit.location && <><br /><small className="text-muted">{deposit.location}</small></>}
                            </>
                          )}
                          {!deposit.warehouse && <span className="text-muted">-</span>}
                        </td>
                        <td>{new Date(deposit.receivedDate).toLocaleDateString('es-ES')}</td>
                        <td>
                          {deposit.dueDate ? (
                            new Date(deposit.dueDate).toLocaleDateString('es-ES')
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge bg-${statusColors[deposit.status]}`}>
                            {statusLabels[deposit.status]}
                          </span>
                        </td>
                        <td>
                          {alertLevel !== 'none' && (
                            <span className={`badge bg-${alertColors[alertLevel]}`}>
                              {alertLabels[alertLevel]}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openViewModal(deposit)}
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                            {['admin', 'manager'].includes(userRole) && deposit.status !== 'closed' && deposit.status !== 'cancelled' && (
                              <>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => openEditModal(deposit)}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleClose(deposit._id)}
                                  title="Cerrar"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(deposit._id)}
                                  title="Cancelar"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {showEditModal ? '✏️ Editar Depósito' : '➕ Nuevo Depósito'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Cliente *</label>
                        <select
                          className="form-select"
                          value={formData.client}
                          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                          required
                        >
                          <option value="">Seleccione cliente</option>
                          {clients.map(client => (
                            <option key={client._id} value={client._id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Fecha de Vencimiento</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Almacén</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.warehouse}
                          onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                          placeholder="Nombre del almacén"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Ubicación</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Pasillo, estantería, etc."
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Notas</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <hr />
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Artículos *</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={addItem}
                          >
                            ➕ Añadir Artículo
                          </button>
                        </div>

                        {formData.items.map((item, index) => (
                          <div key={index} className="row g-2 mb-2 border-bottom pb-2">
                            <div className="col-md-3">
                              <label className="form-label">Artículo</label>
                              <select
                                className="form-select form-select-sm"
                                value={item.article}
                                onChange={(e) => updateItem(index, 'article', e.target.value)}
                                required
                              >
                                <option value="">Seleccione</option>
                                {articles.map(article => (
                                  <option key={article._id} value={article._id}>
                                    {article.sku} - {article.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Cantidad</label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-md-1">
                              <label className="form-label">Unidad</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.unit}
                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Lote</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.lotNumber || ''}
                                onChange={(e) => updateItem(index, 'lotNumber', e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Caducidad</label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={item.expiryDate || ''}
                                onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                              />
                            </div>
                            <div className="col-md-1">
                              <label className="form-label">Notas</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.notes || ''}
                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger w-100"
                                onClick={() => removeItem(index)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}

                        {formData.items.length === 0 && (
                          <div className="alert alert-info mb-0">
                            No hay artículos añadidos. Haga clic en "Añadir Artículo" para comenzar.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {showEditModal ? 'Actualizar' : 'Crear'} Depósito
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedDeposit && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">📦 Detalles del Depósito</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedDeposit(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>Código:</strong>
                      <p>{selectedDeposit.code}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Cliente:</strong>
                      <p>{selectedDeposit.client.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Almacén:</strong>
                      <p>{selectedDeposit.warehouse || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Ubicación:</strong>
                      <p>{selectedDeposit.location || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Fecha Recepción:</strong>
                      <p>{new Date(selectedDeposit.receivedDate).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Fecha Vencimiento:</strong>
                      <p>
                        {selectedDeposit.dueDate ? (
                          <>
                            {new Date(selectedDeposit.dueDate).toLocaleDateString('es-ES')}
                            {calculateAlertLevel(selectedDeposit) !== 'none' && (
                              <span className={`badge bg-${alertColors[calculateAlertLevel(selectedDeposit)]} ms-2`}>
                                {alertLabels[calculateAlertLevel(selectedDeposit)]}
                              </span>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Estado:</strong>
                      <p>
                        <span className={`badge bg-${statusColors[selectedDeposit.status]}`}>
                          {statusLabels[selectedDeposit.status]}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Valor Total:</strong>
                      <p>${selectedDeposit.totalValue.toLocaleString()}</p>
                    </div>

                    {selectedDeposit.notes && (
                      <div className="col-md-12">
                        <strong>Notas:</strong>
                        <p>{selectedDeposit.notes}</p>
                      </div>
                    )}

                    <div className="col-md-12">
                      <hr />
                      <h6>Artículos ({selectedDeposit.items.length})</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Artículo</th>
                              <th>Cantidad</th>
                              <th>Unidad</th>
                              <th>Lote</th>
                              <th>Caducidad</th>
                              <th>Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDeposit.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.article.sku}</td>
                                <td>{item.article.name}</td>
                                <td><strong>{item.quantity}</strong></td>
                                <td>{item.unit}</td>
                                <td>{item.lotNumber || '-'}</td>
                                <td>
                                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('es-ES') : '-'}
                                </td>
                                <td>{item.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <hr />
                      <small className="text-muted">
                        Creado: {new Date(selectedDeposit.createdAt).toLocaleString('es-ES')}
                        {selectedDeposit.createdBy && ` por ${selectedDeposit.createdBy.name}`}
                        <br />
                        Actualizado: {new Date(selectedDeposit.updatedAt).toLocaleString('es-ES')}
                        {selectedDeposit.updatedBy && ` por ${selectedDeposit.updatedBy.name}`}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {['admin', 'manager'].includes(userRole) && selectedDeposit.status !== 'closed' && selectedDeposit.status !== 'cancelled' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowViewModal(false);
                        openEditModal(selectedDeposit);
                      }}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedDeposit(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
