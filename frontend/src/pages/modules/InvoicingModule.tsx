import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES
// ============================================================================

interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'storage' | 'handling' | 'transport' | 'other';
  period?: {
    from?: string;
    to?: string;
  };
  relatedDeposit?: string;
  relatedDeliveryNote?: string;
}

interface Client {
  _id: string;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  color?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  clientName: string;
  clientTaxId?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  paymentMethod?: 'transfer' | 'cash' | 'card' | 'check' | 'other';
  paymentReference?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  daysUntilDue?: number | null;
  isOverdue?: boolean;
  daysOverdue?: number;
  paymentStatus?: string;
}

interface InvoiceStats {
  total: number;
  byStatus: {
    draft?: number;
    sent?: number;
    paid?: number;
    overdue?: number;
    cancelled?: number;
    refunded?: number;
  };
  amounts: {
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  };
  overdueCount: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoicingModule() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    client: '',
    items: [{
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      type: 'other' as const,
      period: { from: '', to: '' }
    }] as InvoiceItem[],
    subtotal: 0,
    taxRate: 21,
    tax: 0,
    discount: 0,
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft' as const,
    paymentMethod: 'transfer' as const,
    notes: '',
    internalNotes: ''
  });

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    loadData();
  }, [filterStatus, filterClient]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterClient !== 'all') params.clientId = filterClient;

      const [invoicesRes, clientsRes, statsRes] = await Promise.all([
        axios.get('/api/invoices', { headers, params }),
        axios.get('/api/clients', { headers }),
        axios.get('/api/invoices/stats', { headers })
      ]);

      setInvoices(invoicesRes.data.data || []);
      setClients(clientsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredInvoices = invoices.filter(invoice => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.clientName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculateTotals = (items: InvoiceItem[], discount: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + tax;
    return { subtotal, tax, total };
  };

  const updateItemTotal = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;

    const { subtotal, tax, total } = calculateTotals(newItems, formData.discount, formData.taxRate);

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      tax,
      total
    });
  };

  const updateDiscount = (discount: number) => {
    const { tax, total } = calculateTotals(formData.items, discount, formData.taxRate);
    setFormData({ ...formData, discount, tax, total });
  };

  const updateTaxRate = (taxRate: number) => {
    const { tax, total } = calculateTotals(formData.items, formData.discount, taxRate);
    setFormData({ ...formData, taxRate, tax, total });
  };

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        type: 'other',
        period: { from: '', to: '' }
      }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error('La factura debe tener al menos un concepto');
      return;
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    const { subtotal, tax, total } = calculateTotals(newItems, formData.discount, formData.taxRate);

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      tax,
      total
    });
  };

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === 'period.from' || field === 'period.to') {
      const periodField = field.split('.')[1];
      newItems[index].period = newItems[index].period || { from: '', to: '' };
      newItems[index].period![periodField as 'from' | 'to'] = value;
    } else {
      (newItems[index] as any)[field] = value;
    }

    setFormData({ ...formData, items: newItems });
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const handleCreate = () => {
    setModalMode('create');
    setSelectedInvoice(null);
    setFormData({
      client: '',
      items: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        type: 'other',
        period: { from: '', to: '' }
      }],
      subtotal: 0,
      taxRate: 21,
      tax: 0,
      discount: 0,
      total: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      paymentMethod: 'transfer',
      notes: '',
      internalNotes: ''
    });
    setShowModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setModalMode('edit');
    setSelectedInvoice(invoice);
    setFormData({
      client: invoice.client._id,
      items: invoice.items.map(item => ({
        ...item,
        period: item.period || { from: '', to: '' }
      })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate.split('T')[0],
      status: invoice.status,
      paymentMethod: invoice.paymentMethod || 'transfer',
      notes: invoice.notes || '',
      internalNotes: invoice.internalNotes || ''
    });
    setShowModal(true);
  };

  const handleView = (invoice: Invoice) => {
    setModalMode('view');
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.client) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Añade al menos un concepto');
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      if (!formData.items[i].description) {
        toast.error(`Descripción requerida en concepto ${i + 1}`);
        return;
      }
    }

    if (!formData.dueDate) {
      toast.error('Fecha de vencimiento requerida');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (modalMode === 'create') {
        await axios.post('/api/invoices', formData, { headers });
        toast.success('Factura creada exitosamente');
      } else if (modalMode === 'edit') {
        await axios.put(`/api/invoices/${selectedInvoice?._id}`, formData, { headers });
        toast.success('Factura actualizada exitosamente');
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving invoice:', error);

      if (error.response?.data?.error?.code === 'INVOICE_PAID') {
        toast.error('No se puede modificar una factura pagada');
      } else if (error.response?.data?.error?.code === 'INVOICE_CANCELLED') {
        toast.error('No se puede modificar una factura cancelada');
      } else {
        toast.error(error.response?.data?.message || 'Error al guardar factura');
      }
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta factura?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`/api/invoices/${invoiceId}`, { headers });
      toast.success('Factura cancelada exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting invoice:', error);

      if (error.response?.data?.error?.code === 'INVOICE_PAID') {
        toast.error('No se puede eliminar una factura pagada. Usa reembolso en su lugar.');
      } else if (error.response?.data?.error?.code === 'INVOICE_ALREADY_CANCELLED') {
        toast.error('Esta factura ya está cancelada');
      } else {
        toast.error(error.response?.data?.message || 'Error al cancelar factura');
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const paymentData = {
        paidDate: new Date().toISOString(),
        paymentMethod: 'transfer',
        paymentReference: ''
      };

      await axios.post(`/api/invoices/${invoiceId}/mark-paid`, paymentData, { headers });
      toast.success('Factura marcada como pagada');
      loadData();
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast.error(error.response?.data?.message || 'Error al marcar como pagada');
    }
  };

  const handleSend = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`/api/invoices/${invoiceId}/send`, { emails: [] }, { headers });
      toast.success('Factura enviada exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(error.response?.data?.message || 'Error al enviar factura');
    }
  };

  // ============================================================================
  // STATUS HELPERS
  // ============================================================================

  const statusColors: Record<string, string> = {
    'draft': 'secondary',
    'sent': 'info',
    'paid': 'success',
    'overdue': 'danger',
    'cancelled': 'dark',
    'refunded': 'warning'
  };

  const statusLabels: Record<string, string> = {
    'draft': 'Borrador',
    'sent': 'Enviada',
    'paid': 'Pagada',
    'overdue': 'Vencida',
    'cancelled': 'Cancelada',
    'refunded': 'Reembolsada'
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
                  <h6 className="text-muted mb-1">Total Facturado</h6>
                  <h4 className="mb-0">{(stats?.amounts.totalAmount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pagado</h6>
                  <h4 className="mb-0">{(stats?.amounts.totalPaid || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  <small className="text-success">{stats?.byStatus.paid || 0} facturas</small>
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
                  <h6 className="text-muted mb-1">Pendiente</h6>
                  <h4 className="mb-0">{(stats?.amounts.totalPending || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  <small className="text-info">{stats?.byStatus.sent || 0} facturas</small>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>⏳</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Vencidas</h6>
                  <h4 className="mb-0">{stats?.overdueCount || 0}</h4>
                  <small className="text-danger">Requieren atención</small>
                </div>
                <div className="text-danger" style={{ fontSize: '2rem' }}>⚠️</div>
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
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="paid">Pagada</option>
                <option value="overdue">Vencida</option>
                <option value="cancelled">Cancelada</option>
                <option value="refunded">Reembolsada</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="all">Todos los clientes</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={handleCreate}>
                ➕ Nueva Factura
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">💰 Facturas ({filteredInvoices.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nº Factura</th>
                  <th>Cliente</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Vencimiento</th>
                  <th className="text-end">Subtotal</th>
                  <th className="text-end">IVA</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <p className="text-muted mb-0">No se encontraron facturas</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice._id}>
                      <td>
                        <strong>{invoice.invoiceNumber}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {invoice.client.color && (
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: invoice.client.color
                              }}
                            />
                          )}
                          <div>
                            <strong>{invoice.clientName}</strong>
                            {invoice.clientTaxId && (
                              <>
                                <br />
                                <small className="text-muted">{invoice.clientTaxId}</small>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</td>
                      <td>
                        {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                        {invoice.paidDate && (
                          <>
                            <br />
                            <small className="text-success">
                              Pagado: {new Date(invoice.paidDate).toLocaleDateString('es-ES')}
                            </small>
                          </>
                        )}
                      </td>
                      <td className="text-end">{invoice.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      <td className="text-end">{invoice.tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      <td className="text-end">
                        <strong>{invoice.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</strong>
                      </td>
                      <td>
                        <span className={`badge bg-${statusColors[invoice.status]}`}>
                          {statusLabels[invoice.status]}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="Ver"
                            onClick={() => handleView(invoice)}
                          >
                            👁️
                          </button>
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <>
                              <button
                                className="btn btn-outline-secondary"
                                title="Editar"
                                onClick={() => handleEdit(invoice)}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-outline-success"
                                title="Marcar como pagada"
                                onClick={() => handleMarkAsPaid(invoice._id)}
                              >
                                ✓
                              </button>
                              {invoice.status === 'draft' && (
                                <button
                                  className="btn btn-outline-info"
                                  title="Enviar"
                                  onClick={() => handleSend(invoice._id)}
                                >
                                  📧
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger"
                                title="Cancelar"
                                onClick={() => handleDelete(invoice._id)}
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
              {filteredInvoices.length > 0 && (
                <tfoot className="table-light">
                  <tr>
                    <th colSpan={4}>Total</th>
                    <th className="text-end">
                      {filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    </th>
                    <th className="text-end">
                      {filteredInvoices.reduce((sum, inv) => sum + inv.tax, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                    </th>
                    <th className="text-end">
                      <strong>
                        {filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                      </strong>
                    </th>
                    <th colSpan={2}></th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && modalMode !== 'view' && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'create' ? '➕ Nueva Factura' : '✏️ Editar Factura'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Cliente *</label>
                      <select
                        className="form-select"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar cliente...</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.name} ({client.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Emisión *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Vencimiento *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="draft">Borrador</option>
                        <option value="sent">Enviada</option>
                        <option value="paid">Pagada</option>
                        <option value="overdue">Vencida</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Método de Pago</label>
                      <select
                        className="form-select"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      >
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="check">Cheque</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">IVA (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.taxRate}
                        onChange={(e) => updateTaxRate(parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="card mb-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <strong>Conceptos</strong>
                      <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
                        ➕ Añadir Concepto
                      </button>
                    </div>
                    <div className="card-body">
                      {formData.items.map((item, index) => (
                        <div key={index} className="border rounded p-3 mb-3 position-relative">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            🗑️
                          </button>

                          <div className="row mb-2">
                            <div className="col-md-12">
                              <label className="form-label">Descripción *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={item.description}
                                onChange={(e) => updateItemField(index, 'description', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-md-2">
                              <label className="form-label">Cantidad *</label>
                              <input
                                type="number"
                                className="form-control"
                                value={item.quantity}
                                onChange={(e) => updateItemTotal(index, 'quantity', parseFloat(e.target.value))}
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Precio Unitario *</label>
                              <input
                                type="number"
                                className="form-control"
                                value={item.unitPrice}
                                onChange={(e) => updateItemTotal(index, 'unitPrice', parseFloat(e.target.value))}
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Total</label>
                              <input
                                type="text"
                                className="form-control"
                                value={item.total.toFixed(2)}
                                disabled
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Tipo</label>
                              <select
                                className="form-select"
                                value={item.type}
                                onChange={(e) => updateItemField(index, 'type', e.target.value)}
                              >
                                <option value="storage">Almacenamiento</option>
                                <option value="handling">Manipulación</option>
                                <option value="transport">Transporte</option>
                                <option value="other">Otro</option>
                              </select>
                            </div>
                          </div>

                          {item.type === 'storage' && (
                            <div className="row">
                              <div className="col-md-3">
                                <label className="form-label">Periodo Desde</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={item.period?.from || ''}
                                  onChange={(e) => updateItemField(index, 'period.from', e.target.value)}
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Periodo Hasta</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={item.period?.to || ''}
                                  onChange={(e) => updateItemField(index, 'period.to', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8"></div>
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>Subtotal:</strong>
                            <span>{formData.subtotal.toFixed(2)}€</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <strong>Descuento:</strong>
                            <input
                              type="number"
                              className="form-control form-control-sm w-50"
                              value={formData.discount}
                              onChange={(e) => updateDiscount(parseFloat(e.target.value))}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <strong>IVA ({formData.taxRate}%):</strong>
                            <span>{formData.tax.toFixed(2)}€</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <strong className="fs-5">TOTAL:</strong>
                            <strong className="fs-5">{formData.total.toFixed(2)}€</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Notas (visibles para el cliente)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Notas Internas (no visibles)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'create' ? 'Crear Factura' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && modalMode === 'view' && selectedInvoice && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">👁️ Factura {selectedInvoice.invoiceNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Invoice Header */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Cliente</h6>
                    <p>
                      <strong>{selectedInvoice.clientName}</strong><br />
                      {selectedInvoice.clientTaxId && <><small>CIF: {selectedInvoice.clientTaxId}</small><br /></>}
                      {selectedInvoice.clientEmail && <><small>Email: {selectedInvoice.clientEmail}</small><br /></>}
                      {selectedInvoice.clientAddress && <><small>{selectedInvoice.clientAddress}</small></>}
                    </p>
                  </div>
                  <div className="col-md-6 text-end">
                    <h6>Información de Factura</h6>
                    <p>
                      <strong>Número:</strong> {selectedInvoice.invoiceNumber}<br />
                      <strong>Fecha Emisión:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString('es-ES')}<br />
                      <strong>Fecha Vencimiento:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')}<br />
                      {selectedInvoice.paidDate && (
                        <><strong>Fecha Pago:</strong> {new Date(selectedInvoice.paidDate).toLocaleDateString('es-ES')}<br /></>
                      )}
                      <strong>Estado:</strong> <span className={`badge bg-${statusColors[selectedInvoice.status]}`}>
                        {statusLabels[selectedInvoice.status]}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Items */}
                <table className="table">
                  <thead className="table-light">
                    <tr>
                      <th>Descripción</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">P. Unitario</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.description}
                          {item.period?.from && item.period?.to && (
                            <><br /><small className="text-muted">
                              Periodo: {new Date(item.period.from).toLocaleDateString('es-ES')} - {new Date(item.period.to).toLocaleDateString('es-ES')}
                            </small></>
                          )}
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">{item.unitPrice.toFixed(2)}€</td>
                        <td className="text-end">{item.total.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3} className="text-end"><strong>Subtotal:</strong></td>
                      <td className="text-end">{selectedInvoice.subtotal.toFixed(2)}€</td>
                    </tr>
                    {selectedInvoice.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="text-end"><strong>Descuento:</strong></td>
                        <td className="text-end">-{selectedInvoice.discount.toFixed(2)}€</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="text-end"><strong>IVA ({selectedInvoice.taxRate}%):</strong></td>
                      <td className="text-end">{selectedInvoice.tax.toFixed(2)}€</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-end"><strong className="fs-5">TOTAL:</strong></td>
                      <td className="text-end"><strong className="fs-5">{selectedInvoice.total.toFixed(2)}€</strong></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="mt-3">
                    <h6>Notas</h6>
                    <p className="text-muted">{selectedInvoice.notes}</p>
                  </div>
                )}

                {selectedInvoice.internalNotes && (
                  <div className="mt-3">
                    <h6>Notas Internas</h6>
                    <p className="text-muted">{selectedInvoice.internalNotes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => alert('Función de descarga PDF próximamente')}>
                  📥 Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
