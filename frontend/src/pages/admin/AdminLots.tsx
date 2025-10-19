import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../config/api';

interface MasterLot {
  _id: string;
  code: string;
  articleId: {
    _id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  expirationDate?: string;
  productionDate?: string;
  active: boolean;
  createdAt: string;
}

interface ExportLot {
  _id: string;
  code: string;
  masterLotId: {
    _id: string;
    code: string;
  };
  quantity: number;
  expirationDate?: string;
  destination?: string;
  createdAt: string;
}

interface TraceCode {
  _id: string;
  code: string;
  exportLotId: {
    _id: string;
    code: string;
    masterLotId: {
      code: string;
    };
  };
  articleId: {
    sku: string;
    name: string;
  };
  warehouseId?: string;
  locationCode?: string;
  status: 'available' | 'assigned' | 'shipped' | 'delivered';
  createdAt: string;
}

interface Article {
  _id: string;
  sku: string;
  name: string;
}

const AdminLots: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'master' | 'export' | 'trace' | 'calendar'>('master');
  const [masterLots, setMasterLots] = useState<MasterLot[]>([]);
  const [exportLots, setExportLots] = useState<ExportLot[]>([]);
  const [traceCodes, setTraceCodes] = useState<TraceCode[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [editingMaster, setEditingMaster] = useState<MasterLot | null>(null);

  const [masterForm, setMasterForm] = useState({
    code: '',
    articleId: '',
    quantity: 0,
    expirationDate: '',
    productionDate: '',
    active: true
  });

  const [exportForm, setExportForm] = useState({
    code: '',
    masterLotId: '',
    quantity: 0,
    destination: '',
    expirationDate: ''
  });

  const [traceForm, setTraceForm] = useState({
    exportLotId: '',
    quantity: 1,
    prefix: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expirationFilter, setExpirationFilter] = useState<'all' | 'expiring' | 'expired'>('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadMasterLots();
    loadArticles();
  }, []);

  useEffect(() => {
    if (activeTab === 'export') {
      loadExportLots();
    } else if (activeTab === 'trace') {
      loadTraceCodes();
    }
  }, [activeTab]);

  const loadMasterLots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/lots/master'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMasterLots(response.data.data.lots);
      }
    } catch (error: any) {
      console.error('Error loading master lots:', error);
      toast.error('Error al cargar lotes maestros');
    } finally {
      setLoading(false);
    }
  };

  const loadExportLots = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/lots/export'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setExportLots(response.data.data.lots);
      }
    } catch (error: any) {
      console.error('Error loading export lots:', error);
    }
  };

  const loadTraceCodes = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/lots/trace'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTraceCodes(response.data.data.codes);
      }
    } catch (error: any) {
      console.error('Error loading trace codes:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/articles'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setArticles(response.data.data.articles);
      }
    } catch (error: any) {
      console.error('Error loading articles:', error);
    }
  };

  const handleCreateMasterLot = async () => {
    try {
      const response = await axios.post(getApiUrl('/api/lots/master'), masterForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Lote maestro creado exitosamente');
        loadMasterLots();
        setShowMasterModal(false);
        resetMasterForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear lote maestro');
    }
  };

  const handleUpdateMasterLot = async () => {
    if (!editingMaster) return;

    try {
      const response = await axios.put(getApiUrl(`/api/lots/master/${editingMaster._id}`), masterForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Lote maestro actualizado exitosamente');
        loadMasterLots();
        setShowMasterModal(false);
        setEditingMaster(null);
        resetMasterForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar lote maestro');
    }
  };

  const handleCreateExportLot = async () => {
    try {
      const response = await axios.post(getApiUrl('/api/lots/export'), exportForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Lote de exportación creado exitosamente');
        loadExportLots();
        setShowExportModal(false);
        resetExportForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear lote de exportación');
    }
  };

  const handleGenerateTraceCodes = async () => {
    try {
      const response = await axios.post(getApiUrl('/api/lots/trace/generate'), traceForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`${traceForm.quantity} códigos de trazabilidad generados exitosamente`);
        loadTraceCodes();
        setShowTraceModal(false);
        resetTraceForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar códigos');
    }
  };

  const resetMasterForm = () => {
    setMasterForm({
      code: '',
      articleId: '',
      quantity: 0,
      expirationDate: '',
      productionDate: '',
      active: true
    });
  };

  const resetExportForm = () => {
    setExportForm({
      code: '',
      masterLotId: '',
      quantity: 0,
      destination: '',
      expirationDate: ''
    });
  };

  const resetTraceForm = () => {
    setTraceForm({
      exportLotId: '',
      quantity: 1,
      prefix: ''
    });
  };

  const openEditMasterModal = (lot: MasterLot) => {
    setEditingMaster(lot);
    setMasterForm({
      code: lot.code,
      articleId: lot.articleId._id,
      quantity: lot.quantity,
      expirationDate: lot.expirationDate ? lot.expirationDate.split('T')[0] : '',
      productionDate: lot.productionDate ? lot.productionDate.split('T')[0] : '',
      active: lot.active
    });
    setShowMasterModal(true);
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const exp = new Date(expirationDate);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationColor = (days: number): string => {
    if (days < 0) return 'danger';
    if (days <= 30) return 'warning';
    if (days <= 90) return 'info';
    return 'success';
  };

  const getExpirationLabel = (days: number): string => {
    if (days < 0) return 'Vencido';
    if (days <= 30) return 'Próximo a vencer';
    if (days <= 90) return 'Vence pronto';
    return 'Vigente';
  };

  const filteredMasterLots = masterLots.filter(lot => {
    const matchesSearch =
      lot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.articleId.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.articleId.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (expirationFilter === 'all') return matchesSearch;

    if (!lot.expirationDate) return false;
    const days = getDaysUntilExpiration(lot.expirationDate);

    if (expirationFilter === 'expired') return matchesSearch && days < 0;
    if (expirationFilter === 'expiring') return matchesSearch && days >= 0 && days <= 30;

    return matchesSearch;
  });

  const totalMasterQuantity = masterLots.reduce((sum, lot) => sum + lot.quantity, 0);
  const activeMasterLots = masterLots.filter(lot => lot.active).length;
  const expiringLots = masterLots.filter(lot =>
    lot.expirationDate && getDaysUntilExpiration(lot.expirationDate) <= 30 && getDaysUntilExpiration(lot.expirationDate) >= 0
  ).length;
  const expiredLots = masterLots.filter(lot =>
    lot.expirationDate && getDaysUntilExpiration(lot.expirationDate) < 0
  ).length;

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
              <h2>Gestión de Lotes</h2>
              <p className="text-muted">Trazabilidad completa desde lote maestro hasta código individual</p>
            </div>
            <div>
              {activeTab === 'master' && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setEditingMaster(null);
                    resetMasterForm();
                    setShowMasterModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nuevo Lote Maestro
                </button>
              )}
              {activeTab === 'export' && (
                <button
                  className="btn btn-info"
                  onClick={() => {
                    resetExportForm();
                    setShowExportModal(true);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Nuevo Lote Expo
                </button>
              )}
              {activeTab === 'trace' && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    resetTraceForm();
                    setShowTraceModal(true);
                  }}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  Generar Códigos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Lotes Maestros</h6>
              <h3>{masterLots.length}</h3>
              <small className="text-muted">{activeMasterLots} activos</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Cantidad Total</h6>
              <h3>{totalMasterQuantity}</h3>
              <small className="text-muted">unidades</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Próximos a Vencer</h6>
              <h3 className="text-warning">{expiringLots}</h3>
              <small className="text-muted">≤ 30 días</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Vencidos</h6>
              <h3 className="text-danger">{expiredLots}</h3>
              <small className="text-muted">requieren atención</small>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'master' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('master'); }}
          >
            Lotes Maestros
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'export' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('export'); }}
          >
            Lotes Expo
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'trace' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('trace'); }}
          >
            Códigos Trazabilidad
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('calendar'); }}
          >
            Calendario Vencimientos
          </a>
        </li>
      </ul>

      {activeTab === 'master' && (
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, SKU o artículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={expirationFilter}
                  onChange={(e) => setExpirationFilter(e.target.value as any)}
                >
                  <option value="all">Todos los lotes</option>
                  <option value="expiring">Próximos a vencer (≤30 días)</option>
                  <option value="expired">Vencidos</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Artículo</th>
                    <th>Cantidad</th>
                    <th>Producción</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMasterLots.length > 0 ? (
                    filteredMasterLots.map((lot) => (
                      <tr key={lot._id}>
                        <td><strong>{lot.code}</strong></td>
                        <td>
                          <div>
                            <strong>{lot.articleId.name}</strong>
                            <br />
                            <small className="text-muted">{lot.articleId.sku}</small>
                          </div>
                        </td>
                        <td>{lot.quantity}</td>
                        <td>
                          {lot.productionDate ? (
                            new Date(lot.productionDate).toLocaleDateString()
                          ) : '-'}
                        </td>
                        <td>
                          {lot.expirationDate ? (
                            <div>
                              {new Date(lot.expirationDate).toLocaleDateString()}
                              <br />
                              <small className={`text-${getExpirationColor(getDaysUntilExpiration(lot.expirationDate))}`}>
                                {getDaysUntilExpiration(lot.expirationDate)} días
                              </small>
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          {lot.expirationDate ? (
                            <span className={`badge bg-${getExpirationColor(getDaysUntilExpiration(lot.expirationDate))}`}>
                              {getExpirationLabel(getDaysUntilExpiration(lot.expirationDate))}
                            </span>
                          ) : (
                            <span className={`badge bg-${lot.active ? 'success' : 'secondary'}`}>
                              {lot.active ? 'Activo' : 'Inactivo'}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditMasterModal(lot)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No hay lotes maestros registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Lotes de Exportación</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Lote Maestro</th>
                    <th>Cantidad</th>
                    <th>Destino</th>
                    <th>Vencimiento</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {exportLots.length > 0 ? (
                    exportLots.map((lot) => (
                      <tr key={lot._id}>
                        <td><strong>{lot.code}</strong></td>
                        <td><code>{lot.masterLotId.code}</code></td>
                        <td>{lot.quantity}</td>
                        <td>{lot.destination || '-'}</td>
                        <td>
                          {lot.expirationDate ? (
                            new Date(lot.expirationDate).toLocaleDateString()
                          ) : '-'}
                        </td>
                        <td>{new Date(lot.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay lotes de exportación registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trace' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Códigos de Trazabilidad Individual</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Lote Expo</th>
                    <th>Lote Maestro</th>
                    <th>Artículo</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {traceCodes.length > 0 ? (
                    traceCodes.map((code) => (
                      <tr key={code._id}>
                        <td><code>{code.code}</code></td>
                        <td>{code.exportLotId.code}</td>
                        <td>{code.exportLotId.masterLotId.code}</td>
                        <td>
                          <div>
                            <strong>{code.articleId.name}</strong>
                            <br />
                            <small className="text-muted">{code.articleId.sku}</small>
                          </div>
                        </td>
                        <td>{code.locationCode || '-'}</td>
                        <td>
                          <span className={`badge bg-${
                            code.status === 'available' ? 'success' :
                            code.status === 'assigned' ? 'info' :
                            code.status === 'shipped' ? 'warning' : 'secondary'
                          }`}>
                            {code.status === 'available' ? 'Disponible' :
                             code.status === 'assigned' ? 'Asignado' :
                             code.status === 'shipped' ? 'Enviado' : 'Entregado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay códigos de trazabilidad generados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Calendario de Vencimientos</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha Vencimiento</th>
                    <th>Código Lote</th>
                    <th>Artículo</th>
                    <th>Cantidad</th>
                    <th>Días Restantes</th>
                    <th>Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {masterLots
                    .filter(lot => lot.expirationDate)
                    .sort((a, b) => {
                      const dateA = new Date(a.expirationDate!).getTime();
                      const dateB = new Date(b.expirationDate!).getTime();
                      return dateA - dateB;
                    })
                    .map((lot) => {
                      const days = getDaysUntilExpiration(lot.expirationDate!);
                      return (
                        <tr key={lot._id}>
                          <td>
                            <strong>{new Date(lot.expirationDate!).toLocaleDateString()}</strong>
                          </td>
                          <td><code>{lot.code}</code></td>
                          <td>
                            <div>
                              <strong>{lot.articleId.name}</strong>
                              <br />
                              <small className="text-muted">{lot.articleId.sku}</small>
                            </div>
                          </td>
                          <td>{lot.quantity}</td>
                          <td>
                            <span className={`text-${getExpirationColor(days)}`}>
                              <strong>{days} días</strong>
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getExpirationColor(days)}`}>
                              {getExpirationLabel(days)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {masterLots.filter(lot => lot.expirationDate).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay lotes con fecha de vencimiento
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Master Lot Modal */}
      {showMasterModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMaster ? 'Editar Lote Maestro' : 'Nuevo Lote Maestro'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMasterModal(false);
                    setEditingMaster(null);
                    resetMasterForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={masterForm.code}
                    onChange={(e) => setMasterForm({...masterForm, code: e.target.value.toUpperCase()})}
                    placeholder="LM-001"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Artículo *</label>
                  <select
                    className="form-select"
                    value={masterForm.articleId}
                    onChange={(e) => setMasterForm({...masterForm, articleId: e.target.value})}
                  >
                    <option value="">Seleccione un artículo</option>
                    {articles.map(article => (
                      <option key={article._id} value={article._id}>
                        {article.sku} - {article.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={masterForm.quantity}
                    onChange={(e) => setMasterForm({...masterForm, quantity: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de Producción</label>
                  <input
                    type="date"
                    className="form-control"
                    value={masterForm.productionDate}
                    onChange={(e) => setMasterForm({...masterForm, productionDate: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={masterForm.expirationDate}
                    onChange={(e) => setMasterForm({...masterForm, expirationDate: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={masterForm.active}
                      onChange={(e) => setMasterForm({...masterForm, active: e.target.checked})}
                      id="activeCheck"
                    />
                    <label className="form-check-label" htmlFor="activeCheck">
                      Lote Activo
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowMasterModal(false);
                    setEditingMaster(null);
                    resetMasterForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={editingMaster ? handleUpdateMasterLot : handleCreateMasterLot}
                >
                  {editingMaster ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMasterModal && <div className="modal-backdrop show" />}

      {/* Export Lot Modal */}
      {showExportModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Lote de Exportación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowExportModal(false);
                    resetExportForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={exportForm.code}
                    onChange={(e) => setExportForm({...exportForm, code: e.target.value.toUpperCase()})}
                    placeholder="LE-001"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Lote Maestro *</label>
                  <select
                    className="form-select"
                    value={exportForm.masterLotId}
                    onChange={(e) => setExportForm({...exportForm, masterLotId: e.target.value})}
                  >
                    <option value="">Seleccione un lote maestro</option>
                    {masterLots.filter(lot => lot.active).map(lot => (
                      <option key={lot._id} value={lot._id}>
                        {lot.code} - {lot.articleId.name} ({lot.quantity} disponibles)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={exportForm.quantity}
                    onChange={(e) => setExportForm({...exportForm, quantity: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Destino</label>
                  <input
                    type="text"
                    className="form-control"
                    value={exportForm.destination}
                    onChange={(e) => setExportForm({...exportForm, destination: e.target.value})}
                    placeholder="País/Cliente destino"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={exportForm.expirationDate}
                    onChange={(e) => setExportForm({...exportForm, expirationDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowExportModal(false);
                    resetExportForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleCreateExportLot}
                >
                  Crear Lote Expo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showExportModal && <div className="modal-backdrop show" />}

      {/* Trace Codes Modal */}
      {showTraceModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generar Códigos de Trazabilidad</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowTraceModal(false);
                    resetTraceForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Lote de Exportación *</label>
                  <select
                    className="form-select"
                    value={traceForm.exportLotId}
                    onChange={(e) => setTraceForm({...traceForm, exportLotId: e.target.value})}
                  >
                    <option value="">Seleccione un lote expo</option>
                    {exportLots.map(lot => (
                      <option key={lot._id} value={lot._id}>
                        {lot.code} - {lot.masterLotId.code} ({lot.quantity} unidades)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cantidad de Códigos *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={traceForm.quantity}
                    onChange={(e) => setTraceForm({...traceForm, quantity: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Prefijo (Opcional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={traceForm.prefix}
                    onChange={(e) => setTraceForm({...traceForm, prefix: e.target.value.toUpperCase()})}
                    placeholder="TC-"
                  />
                  <small className="text-muted">
                    Se generarán códigos como: {traceForm.prefix || 'TC-'}XXXXXX
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTraceModal(false);
                    resetTraceForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleGenerateTraceCodes}
                >
                  Generar Códigos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTraceModal && <div className="modal-backdrop show" />}
    </div>
  );
};

export default AdminLots;
