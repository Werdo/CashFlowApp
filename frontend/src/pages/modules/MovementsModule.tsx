import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DeliveryItem {
  _id?: string;
  articleId: {
    _id: string;
    sku: string;
    name: string;
    ean?: string;
  };
  lotId: {
    _id: string;
    code: string;
    expiryDate?: string;
  };
  quantity: number;
  stockUnits?: string[];
  notes?: string;
}

interface DeliveryNote {
  _id: string;
  number: string;
  type: 'entry' | 'exit' | 'transfer';
  date: string;
  clientId: {
    _id: string;
    code: string;
    name: string;
    color?: string;
  };
  warehouseId: string;
  items: DeliveryItem[];
  origin?: {
    supplier?: string;
    reference?: string;
    address?: string;
  };
  destination?: {
    clientId?: string;
    warehouseId?: string;
    address?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  document?: {
    filename?: string;
    url?: string;
    uploadedAt?: string;
  };
  totalUnits: number;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
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

interface Lot {
  _id: string;
  code: string;
  expiryDate?: string;
}

interface DeliveryNoteStats {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  byType: {
    entry: number;
    exit: number;
    transfer: number;
  };
  totalUnits: number;
}

export default function MovementsModule() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [stats, setStats] = useState<DeliveryNoteStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    type: 'entry' as 'entry' | 'exit' | 'transfer',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    warehouseId: '1',
    items: [] as Array<{
      articleId: string;
      lotId: string;
      quantity: number;
      notes?: string;
    }>,
    origin: {
      supplier: '',
      reference: '',
      address: ''
    },
    destination: {
      address: ''
    },
    notes: ''
  });

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role || 'viewer';

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType, filterClient]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.type = filterType;
      if (filterClient) params.clientId = filterClient;
      if (searchTerm) params.search = searchTerm;

      const [notesRes, clientsRes, articlesRes, lotsRes, statsRes] = await Promise.all([
        axios.get('/api/delivery-notes', {
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
        axios.get('/api/stock/lots', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/delivery-notes/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDeliveryNotes(notesRes.data.data || []);
      setClients(clientsRes.data.data.clients || []);
      setArticles(articlesRes.data.data.articles || []);
      setLots(lotsRes.data.data?.lots || []);
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

    if (!formData.clientId || !formData.type || formData.items.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const payload = {
        ...formData,
        items: formData.items.map(item => ({
          articleId: item.articleId,
          lotId: item.lotId,
          quantity: Number(item.quantity),
          notes: item.notes
        }))
      };

      if (showEditModal && selectedNote) {
        await axios.put(`/api/delivery-notes/${selectedNote._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Albarán actualizado exitosamente');
      } else {
        await axios.post('/api/delivery-notes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Albarán creado exitosamente');
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving delivery note:', error);
      toast.error(error.response?.data?.message || 'Error al guardar albarán');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('¿Está seguro de cancelar este albarán?')) {
      return;
    }

    try {
      await axios.delete(`/api/delivery-notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Albarán cancelado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting delivery note:', error);
      if (error.response?.data?.error?.code === 'DELIVERY_NOTE_COMPLETED') {
        toast.error('No se puede eliminar un albarán completado. Cancélelo primero.');
      } else {
        toast.error(error.response?.data?.message || 'Error al cancelar albarán');
      }
    }
  };

  const handleComplete = async (noteId: string) => {
    if (!window.confirm('¿Marcar este albarán como completado?')) {
      return;
    }

    try {
      await axios.post(`/api/delivery-notes/${noteId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Albarán completado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error completing delivery note:', error);
      toast.error(error.response?.data?.message || 'Error al completar albarán');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (note: DeliveryNote) => {
    setSelectedNote(note);
    setFormData({
      type: note.type,
      date: note.date.split('T')[0],
      clientId: note.clientId._id,
      warehouseId: note.warehouseId,
      items: note.items.map(item => ({
        articleId: item.articleId._id,
        lotId: item.lotId._id,
        quantity: item.quantity,
        notes: item.notes
      })),
      origin: note.origin || { supplier: '', reference: '', address: '' },
      destination: note.destination || { address: '' },
      notes: note.notes || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (note: DeliveryNote) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'entry',
      date: new Date().toISOString().split('T')[0],
      clientId: '',
      warehouseId: '1',
      items: [],
      origin: { supplier: '', reference: '', address: '' },
      destination: { address: '' },
      notes: ''
    });
    setSelectedNote(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { articleId: '', lotId: '', quantity: 1, notes: '' }]
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

  const filteredNotes = deliveryNotes.filter(note => {
    const matchesSearch = !searchTerm ||
      note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.clientId.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Type labels and icons
  const typeLabels: Record<string, string> = {
    'entry': 'Entrada',
    'exit': 'Salida',
    'transfer': 'Transferencia'
  };

  const typeIcons: Record<string, string> = {
    'entry': '📥',
    'exit': '📤',
    'transfer': '🔄'
  };

  const typeColors: Record<string, string> = {
    'entry': 'success',
    'exit': 'danger',
    'transfer': 'info'
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };

  const statusColors: Record<string, string> = {
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'cancelled': 'secondary'
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
                  <h6 className="text-muted mb-1">Total Albaranes</h6>
                  <h3 className="mb-0">{stats?.total || 0}</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>📋</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pendientes</h6>
                  <h3 className="mb-0">{stats?.byStatus.pending || 0}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>⏳</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">En Proceso</h6>
                  <h3 className="mb-0">{stats?.byStatus.processing || 0}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>🚚</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Completados</h6>
                  <h3 className="mb-0">{stats?.byStatus.completed || 0}</h3>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>✅</div>
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
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="entry">Entrada</option>
                <option value="exit">Salida</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
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
                ➕ Nuevo Albarán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Notes Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">📋 Albaranes de Entrega ({filteredNotes.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Artículos</th>
                  <th>Unidades</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No se encontraron albaranes
                    </td>
                  </tr>
                ) : (
                  filteredNotes.map(note => (
                    <tr key={note._id}>
                      <td>
                        <strong>{note.number}</strong>
                      </td>
                      <td>
                        <span className={`badge bg-${typeColors[note.type]}`}>
                          {typeIcons[note.type]} {typeLabels[note.type]}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${note.clientId.color || '#3B82F6'}20`,
                            color: note.clientId.color || '#3B82F6',
                            border: `1px solid ${note.clientId.color || '#3B82F6'}`
                          }}
                        >
                          {note.clientId.name}
                        </span>
                      </td>
                      <td>{new Date(note.date).toLocaleDateString('es-ES')}</td>
                      <td>{note.items.length}</td>
                      <td>
                        <strong>{note.totalUnits}</strong>
                      </td>
                      <td>
                        <span className={`badge bg-${statusColors[note.status]}`}>
                          {statusLabels[note.status]}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openViewModal(note)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          {['admin', 'manager'].includes(userRole) && note.status !== 'completed' && note.status !== 'cancelled' && (
                            <>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => openEditModal(note)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleComplete(note._id)}
                                title="Completar"
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(note._id)}
                                title="Cancelar"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
                    {showEditModal ? '✏️ Editar Albarán' : '➕ Nuevo Albarán'}
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
                      <div className="col-md-4">
                        <label className="form-label">Tipo *</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          required
                        >
                          <option value="entry">Entrada</option>
                          <option value="exit">Salida</option>
                          <option value="transfer">Transferencia</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Fecha *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Cliente *</label>
                        <select
                          className="form-select"
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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

                      {formData.type === 'entry' && (
                        <>
                          <div className="col-md-4">
                            <label className="form-label">Proveedor</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.origin.supplier}
                              onChange={(e) => setFormData({
                                ...formData,
                                origin: { ...formData.origin, supplier: e.target.value }
                              })}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Referencia</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.origin.reference}
                              onChange={(e) => setFormData({
                                ...formData,
                                origin: { ...formData.origin, reference: e.target.value }
                              })}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Dirección Origen</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.origin.address}
                              onChange={(e) => setFormData({
                                ...formData,
                                origin: { ...formData.origin, address: e.target.value }
                              })}
                            />
                          </div>
                        </>
                      )}

                      {formData.type === 'exit' && (
                        <div className="col-md-12">
                          <label className="form-label">Dirección Destino</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.destination.address}
                            onChange={(e) => setFormData({
                              ...formData,
                              destination: { ...formData.destination, address: e.target.value }
                            })}
                          />
                        </div>
                      )}

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
                            <div className="col-md-4">
                              <label className="form-label">Artículo</label>
                              <select
                                className="form-select form-select-sm"
                                value={item.articleId}
                                onChange={(e) => updateItem(index, 'articleId', e.target.value)}
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
                            <div className="col-md-3">
                              <label className="form-label">Lote</label>
                              <select
                                className="form-select form-select-sm"
                                value={item.lotId}
                                onChange={(e) => updateItem(index, 'lotId', e.target.value)}
                                required
                              >
                                <option value="">Seleccione</option>
                                {lots.map(lot => (
                                  <option key={lot._id} value={lot._id}>
                                    {lot.code}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Cantidad</label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                required
                              />
                            </div>
                            <div className="col-md-2">
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
                      {showEditModal ? 'Actualizar' : 'Crear'} Albarán
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
      {showViewModal && selectedNote && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">📋 Detalles del Albarán</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedNote(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>Número:</strong>
                      <p>{selectedNote.number}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Tipo:</strong>
                      <p>
                        <span className={`badge bg-${typeColors[selectedNote.type]}`}>
                          {typeIcons[selectedNote.type]} {typeLabels[selectedNote.type]}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Cliente:</strong>
                      <p>{selectedNote.clientId.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Fecha:</strong>
                      <p>{new Date(selectedNote.date).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Estado:</strong>
                      <p>
                        <span className={`badge bg-${statusColors[selectedNote.status]}`}>
                          {statusLabels[selectedNote.status]}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Total Unidades:</strong>
                      <p>{selectedNote.totalUnits}</p>
                    </div>

                    {selectedNote.origin?.supplier && (
                      <div className="col-md-12">
                        <strong>Proveedor:</strong>
                        <p>{selectedNote.origin.supplier}</p>
                      </div>
                    )}

                    {selectedNote.notes && (
                      <div className="col-md-12">
                        <strong>Notas:</strong>
                        <p>{selectedNote.notes}</p>
                      </div>
                    )}

                    <div className="col-md-12">
                      <hr />
                      <h6>Artículos ({selectedNote.items.length})</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Artículo</th>
                              <th>Lote</th>
                              <th>Cantidad</th>
                              <th>Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedNote.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.articleId.sku}</td>
                                <td>{item.articleId.name}</td>
                                <td>{item.lotId.code}</td>
                                <td><strong>{item.quantity}</strong></td>
                                <td>{item.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {selectedNote.processedBy && (
                      <div className="col-md-12">
                        <hr />
                        <strong>Procesado por:</strong>
                        <p>{selectedNote.processedBy.name} el {new Date(selectedNote.processedAt!).toLocaleString('es-ES')}</p>
                      </div>
                    )}

                    <div className="col-md-12">
                      <small className="text-muted">
                        Creado: {new Date(selectedNote.createdAt).toLocaleString('es-ES')}
                        {selectedNote.createdBy && ` por ${selectedNote.createdBy.name}`}
                        <br />
                        Actualizado: {new Date(selectedNote.updatedAt).toLocaleString('es-ES')}
                        {selectedNote.updatedBy && ` por ${selectedNote.updatedBy.name}`}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {['admin', 'manager'].includes(userRole) && selectedNote.status !== 'completed' && selectedNote.status !== 'cancelled' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowViewModal(false);
                        openEditModal(selectedNote);
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
                      setSelectedNote(null);
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
