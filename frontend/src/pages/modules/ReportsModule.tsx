import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES
// ============================================================================

interface ReportData {
  inventory?: any;
  movements?: any;
  deposits?: any;
  financial?: any;
  clients?: any;
  dashboard?: any;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsModule() {
  const [reportType, setReportType] = useState<string>('dashboard');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({});

  // ============================================================================
  // LOAD REPORT DATA
  // ============================================================================

  useEffect(() => {
    loadReportData();
  }, [reportType, dateFrom, dateTo]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      let response;
      switch (reportType) {
        case 'dashboard':
          response = await axios.get('/api/reports/dashboard', { headers });
          setReportData({ dashboard: response.data.data });
          break;
        case 'inventory':
          response = await axios.get('/api/reports/inventory', { headers, params });
          setReportData({ inventory: response.data.data });
          break;
        case 'movements':
          response = await axios.get('/api/reports/movements', { headers, params });
          setReportData({ movements: response.data.data });
          break;
        case 'deposits':
          response = await axios.get('/api/reports/deposits', { headers, params });
          setReportData({ deposits: response.data.data });
          break;
        case 'financial':
          response = await axios.get('/api/reports/financial', { headers, params });
          setReportData({ financial: response.data.data });
          break;
        case 'clients':
          response = await axios.get('/api/reports/clients', { headers });
          setReportData({ clients: response.data.data });
          break;
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error(error.response?.data?.message || 'Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // EXPORT FUNCTIONS
  // ============================================================================

  const handleExportPDF = () => {
    toast.success('Función de exportación PDF próximamente');
  };

  const handleExportCSV = () => {
    toast.success('Función de exportación CSV próximamente');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
                  className={`btn ${reportType === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('dashboard')}
                >
                  📊 Dashboard
                </button>
                <button
                  className={`btn ${reportType === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('inventory')}
                >
                  📦 Inventario
                </button>
                <button
                  className={`btn ${reportType === 'movements' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('movements')}
                >
                  🔄 Movimientos
                </button>
                <button
                  className={`btn ${reportType === 'deposits' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('deposits')}
                >
                  🏢 Depósitos
                </button>
                <button
                  className={`btn ${reportType === 'financial' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('financial')}
                >
                  💰 Financiero
                </button>
                <button
                  className={`btn ${reportType === 'clients' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setReportType('clients')}
                >
                  👥 Clientes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter & Export */}
      {reportType !== 'dashboard' && reportType !== 'clients' && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small">Fecha Desde</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">Fecha Hasta</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-success w-100" onClick={handleExportPDF}>
                      📥 Exportar PDF
                    </button>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-outline-success w-100" onClick={handleExportCSV}>
                      📥 Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* DASHBOARD REPORT */}
      {!loading && reportType === 'dashboard' && reportData.dashboard && (
        <div className="row">
          {/* Inventory Section */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📦 Inventario</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <p className="text-muted mb-1">Total Artículos</p>
                    <h4>{reportData.dashboard.inventory.totalArticles}</h4>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Unidades Stock</p>
                    <h4>{reportData.dashboard.inventory.totalStockUnits}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clients Section */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">👥 Clientes</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12">
                    <p className="text-muted mb-1">Total Clientes</p>
                    <h4>{reportData.dashboard.clients.totalClients}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operations Section */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">🔄 Operaciones</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <p className="text-muted mb-1">Albaranes</p>
                    <h4>{reportData.dashboard.operations.totalDeliveryNotes}</h4>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Depósitos</p>
                    <h4>{reportData.dashboard.operations.totalDeposits}</h4>
                  </div>
                </div>
                <hr />
                <p className="text-muted mb-1">Valor Total Depósitos</p>
                <h5>{reportData.dashboard.operations.totalDepositValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">💰 Financiero</h6>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted mb-1">Total Facturas</p>
                    <h4>{reportData.dashboard.financial.totalInvoices}</h4>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Facturado</p>
                    <h4>{reportData.dashboard.financial.totalInvoiced.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <p className="text-success mb-1">Pagado</p>
                    <h5 className="text-success">{reportData.dashboard.financial.totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                  <div className="col-6">
                    <p className="text-warning mb-1">Pendiente</p>
                    <h5 className="text-warning">{reportData.dashboard.financial.totalPending.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT */}
      {!loading && reportType === 'inventory' && reportData.inventory && (
        <div className="row">
          {/* Summary */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Resumen de Inventario</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Total Artículos</p>
                    <h4>{reportData.inventory.summary.totalArticles}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Unidades Stock</p>
                    <h4>{reportData.inventory.summary.totalStockUnits}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Cantidad Total</p>
                    <h4>{reportData.inventory.summary.totalQuantity.toLocaleString('es-ES')}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Valor Total</p>
                    <h4>{reportData.inventory.summary.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* By Family */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Familia</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Familia</th>
                      <th className="text-end">Artículos</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.inventory.byFamily).map(([family, data]: [string, any]) => (
                      <tr key={family}>
                        <td>{family}</td>
                        <td className="text-end">{data.articles}</td>
                        <td className="text-end">{data.totalQuantity.toLocaleString('es-ES')}</td>
                        <td className="text-end">{data.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* By Warehouse */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Almacén</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Almacén</th>
                      <th className="text-end">Stock Units</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.inventory.byWarehouse).map(([warehouse, data]: [string, any]) => (
                      <tr key={warehouse}>
                        <td>{warehouse}</td>
                        <td className="text-end">{data.stockUnits}</td>
                        <td className="text-end">{data.totalQuantity.toLocaleString('es-ES')}</td>
                        <td className="text-end">{data.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENTS REPORT */}
      {!loading && reportType === 'movements' && reportData.movements && (
        <div className="row">
          {/* Summary */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Resumen de Movimientos</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Total Albaranes</p>
                    <h4>{reportData.movements.summary.totalDeliveryNotes}</h4>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Total Items</p>
                    <h4>{reportData.movements.summary.totalItems}</h4>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Cantidad Total</p>
                    <h4>{reportData.movements.summary.totalQuantity.toLocaleString('es-ES')}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* By Type */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Tipo</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th className="text-end">Albaranes</th>
                      <th className="text-end">Items</th>
                      <th className="text-end">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.movements.byType).map(([type, data]: [string, any]) => (
                      <tr key={type}>
                        <td className="text-capitalize">{type}</td>
                        <td className="text-end">{data.count}</td>
                        <td className="text-end">{data.items}</td>
                        <td className="text-end">{data.totalQuantity.toLocaleString('es-ES')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Estado</h6>
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
                    {Object.entries(reportData.movements.byStatus).map(([status, count]: [string, any]) => (
                      <tr key={status}>
                        <td className="text-capitalize">{status}</td>
                        <td className="text-end">{count}</td>
                        <td className="text-end">
                          {((count / reportData.movements.summary.totalDeliveryNotes) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSITS REPORT */}
      {!loading && reportType === 'deposits' && reportData.deposits && (
        <div className="row">
          {/* Summary */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Resumen de Depósitos</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Total Depósitos</p>
                    <h4>{reportData.deposits.summary.totalDeposits}</h4>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Total Items</p>
                    <h4>{reportData.deposits.summary.totalItems}</h4>
                  </div>
                  <div className="col-md-4">
                    <p className="text-muted mb-1">Valor Total</p>
                    <h4>{reportData.deposits.summary.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Estado</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th className="text-end">Depósitos</th>
                      <th className="text-end">Items</th>
                      <th className="text-end">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.deposits.byStatus).map(([status, data]: [string, any]) => (
                      <tr key={status}>
                        <td className="text-capitalize">{status}</td>
                        <td className="text-end">{data.count}</td>
                        <td className="text-end">{data.items}</td>
                        <td className="text-end">{data.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* By Alert Level */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">⚠️ Por Nivel de Alerta</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Nivel</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge bg-danger">Crítico</span></td>
                      <td className="text-end">{reportData.deposits.byAlertLevel.critical}</td>
                      <td className="text-end">
                        {((reportData.deposits.byAlertLevel.critical / reportData.deposits.summary.totalDeposits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-warning">Advertencia</span></td>
                      <td className="text-end">{reportData.deposits.byAlertLevel.warning}</td>
                      <td className="text-end">
                        {((reportData.deposits.byAlertLevel.warning / reportData.deposits.summary.totalDeposits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info">Info</span></td>
                      <td className="text-end">{reportData.deposits.byAlertLevel.info}</td>
                      <td className="text-end">
                        {((reportData.deposits.byAlertLevel.info / reportData.deposits.summary.totalDeposits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-secondary">Normal</span></td>
                      <td className="text-end">{reportData.deposits.byAlertLevel.none}</td>
                      <td className="text-end">
                        {((reportData.deposits.byAlertLevel.none / reportData.deposits.summary.totalDeposits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL REPORT */}
      {!loading && reportType === 'financial' && reportData.financial && (
        <div className="row">
          {/* Summary */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Resumen Financiero</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-2">
                    <p className="text-muted mb-1">Facturas</p>
                    <h4>{reportData.financial.summary.totalInvoices}</h4>
                  </div>
                  <div className="col-md-2">
                    <p className="text-muted mb-1">Subtotal</p>
                    <h5>{reportData.financial.summary.totalSubtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                  <div className="col-md-2">
                    <p className="text-muted mb-1">IVA</p>
                    <h5>{reportData.financial.summary.totalTax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                  <div className="col-md-2">
                    <p className="text-muted mb-1">Total</p>
                    <h5>{reportData.financial.summary.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                  <div className="col-md-2">
                    <p className="text-success mb-1">Pagado</p>
                    <h5 className="text-success">{reportData.financial.summary.totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                  <div className="col-md-2">
                    <p className="text-warning mb-1">Pendiente</p>
                    <h5 className="text-warning">{reportData.financial.summary.totalPending.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Por Estado</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th className="text-end">Facturas</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.financial.byStatus).map(([status, data]: [string, any]) => (
                      <tr key={status}>
                        <td className="text-capitalize">{status}</td>
                        <td className="text-end">{data.count}</td>
                        <td className="text-end">{data.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Aging (Overdue Analysis) */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">⏳ Análisis de Vencimientos</h6>
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Periodo</th>
                      <th className="text-end">Facturas</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Al corriente</td>
                      <td className="text-end">{reportData.financial.aging.current.count}</td>
                      <td className="text-end">{reportData.financial.aging.current.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    </tr>
                    <tr className="table-warning">
                      <td>1-30 días vencido</td>
                      <td className="text-end">{reportData.financial.aging.days_1_30.count}</td>
                      <td className="text-end">{reportData.financial.aging.days_1_30.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    </tr>
                    <tr className="table-warning">
                      <td>31-60 días vencido</td>
                      <td className="text-end">{reportData.financial.aging.days_31_60.count}</td>
                      <td className="text-end">{reportData.financial.aging.days_31_60.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    </tr>
                    <tr className="table-danger">
                      <td>61-90 días vencido</td>
                      <td className="text-end">{reportData.financial.aging.days_61_90.count}</td>
                      <td className="text-end">{reportData.financial.aging.days_61_90.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    </tr>
                    <tr className="table-danger">
                      <td>+90 días vencido</td>
                      <td className="text-end">{reportData.financial.aging.days_90_plus.count}</td>
                      <td className="text-end">{reportData.financial.aging.days_90_plus.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENTS REPORT */}
      {!loading && reportType === 'clients' && reportData.clients && (
        <div className="row">
          {/* Summary */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">📊 Resumen de Clientes</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Total Clientes</p>
                    <h4>{reportData.clients.summary.totalClients}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-success mb-1">Activos</p>
                    <h4 className="text-success">{reportData.clients.summary.activeClients}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Inactivos</p>
                    <h4>{reportData.clients.summary.inactiveClients}</h4>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Total Facturado</p>
                    <h4>{reportData.clients.summary.totalInvoiced.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">🏆 Top 10 Clientes</h6>
              </div>
              <div className="card-body">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th className="text-end">Albaranes</th>
                      <th className="text-end">Depósitos</th>
                      <th className="text-end">Facturas</th>
                      <th className="text-end">Facturado</th>
                      <th className="text-end">Pagado</th>
                      <th className="text-end">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.clients.topClients.map((item: any, index: number) => (
                      <tr key={item.client._id}>
                        <td>
                          <strong>#{index + 1}</strong> {item.client.name}
                          <br />
                          <small className="text-muted">{item.client.code}</small>
                        </td>
                        <td className="text-end">{item.activity.deliveryNotes}</td>
                        <td className="text-end">{item.activity.deposits}</td>
                        <td className="text-end">{item.activity.invoices}</td>
                        <td className="text-end">{item.financial.totalInvoiced.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                        <td className="text-end text-success">{item.financial.totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                        <td className="text-end text-warning">{item.financial.totalPending.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
