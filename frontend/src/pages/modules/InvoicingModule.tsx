import { useState } from 'react';
import { mockInvoices, mockClients } from '../../data/mockData';

export default function InvoicingModule() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesClient = filterClient === 'all' || invoice.clientId === filterClient;
    return matchesStatus && matchesClient;
  });

  const sentCount = mockInvoices.filter(i => i.status === 'sent').length;
  const paidCount = mockInvoices.filter(i => i.status === 'paid').length;
  const overdueCount = mockInvoices.filter(i => i.status === 'overdue').length;

  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = mockInvoices
    .filter(i => i.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = mockInvoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const statusColors: Record<string, string> = {
    'draft': 'secondary',
    'sent': 'info',
    'paid': 'success',
    'overdue': 'danger',
    'cancelled': 'dark',
  };

  const statusLabels: Record<string, string> = {
    'draft': 'Borrador',
    'sent': 'Enviada',
    'paid': 'Pagada',
    'overdue': 'Vencida',
    'cancelled': 'Cancelada',
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
                  <h6 className="text-muted mb-1">Total Facturado</h6>
                  <h4 className="mb-0">{totalAmount.toLocaleString('es-ES')}€</h4>
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
                  <h4 className="mb-0">{paidAmount.toLocaleString('es-ES')}€</h4>
                  <small className="text-success">{paidCount} facturas</small>
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
                  <h4 className="mb-0">{pendingAmount.toLocaleString('es-ES')}€</h4>
                  <small className="text-info">{sentCount} facturas</small>
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
                  <h4 className="mb-0">{overdueCount}</h4>
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
          <div className="row">
            <div className="col-md-4">
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
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="all">Todos los clientes</option>
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100">
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
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoice.invoiceNumber}</strong>
                    </td>
                    <td>
                      <strong>{invoice.client.name}</strong>
                      <br />
                      <small className="text-muted">{invoice.client.taxId}</small>
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
                    <td className="text-end">{invoice.subtotal.toLocaleString('es-ES')}€</td>
                    <td className="text-end">{invoice.tax.toLocaleString('es-ES')}€</td>
                    <td className="text-end">
                      <strong>{invoice.total.toLocaleString('es-ES')}€</strong>
                    </td>
                    <td>
                      <span className={`badge bg-${statusColors[invoice.status]}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" title="Ver">
                          👁️
                        </button>
                        <button className="btn btn-outline-secondary" title="Descargar PDF">
                          📥
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={4}>Total</th>
                  <th className="text-end">
                    {filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0).toLocaleString('es-ES')}€
                  </th>
                  <th className="text-end">
                    {filteredInvoices.reduce((sum, inv) => sum + inv.tax, 0).toLocaleString('es-ES')}€
                  </th>
                  <th className="text-end">
                    <strong>
                      {filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString('es-ES')}€
                    </strong>
                  </th>
                  <th colSpan={2}></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing Configuration Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">⚙️ Configuración de Tarifas</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="text-muted mb-2">Almacenamiento</h6>
                      <h4 className="mb-0">15€</h4>
                      <small className="text-muted">por m³/mes</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="text-muted mb-2">Manipulación</h6>
                      <h4 className="mb-0">8€</h4>
                      <small className="text-muted">por unidad</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="text-muted mb-2">Transporte</h6>
                      <h4 className="mb-0">50€</h4>
                      <small className="text-muted">por envío</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="text-muted mb-2">IVA</h6>
                      <h4 className="mb-0">21%</h4>
                      <small className="text-muted">general</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline-primary">
                  ⚙️ Editar Tarifas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">📊 Resumen Mensual</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-0">
                <strong>Estadísticas Mensuales</strong>
                <br />
                Próximamente: Gráficas de facturación mensual y proyecciones de ingresos.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
