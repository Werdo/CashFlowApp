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
  locations: Location[];
}

interface Location {
  code: string;
  name: string;
  capacity?: number;
  currentOccupancy?: number;
}

interface Article {
  _id: string;
  sku: string;
  ean: string;
  name: string;
  familyId: {
    _id: string;
    name: string;
  };
}

interface StockItem {
  _id: string;
  articleId: Article;
  warehouseId: string;
  locationCode: string;
  quantity: number;
  lotId?: {
    _id: string;
    code: string;
  };
  expirationDate?: string;
  lastMovement?: string;
  createdAt: string;
}

interface Movement {
  _id: string;
  type: 'entry' | 'exit' | 'transfer' | 'adjustment';
  articleId: Article;
  warehouseId: string;
  locationCode: string;
  quantity: number;
  lotId?: {
    code: string;
  };
  destinationWarehouseId?: string;
  destinationLocationCode?: string;
  reason?: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
}

const AdminStock: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'aging'>('stock');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [movementForm, setMovementForm] = useState({
    type: 'entry' as 'entry' | 'exit' | 'adjustment',
    articleId: '',
    locationCode: '',
    quantity: 0,
    lotCode: '',
    reason: ''
  });

  const [transferForm, setTransferForm] = useState({
    articleId: '',
    originLocationCode: '',
    destinationWarehouseId: '',
    destinationLocationCode: '',
    quantity: 0,
    reason: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [minStockFilter, setMinStockFilter] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClients();
    loadArticles();
  }, []);

  useEffect(() => {
    if (selectedClient && selectedWarehouse) {
      loadStock();
      loadMovements();
    }
  }, [selectedClient, selectedWarehouse]);

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
          if (response.data.data.clients[0].warehouses && response.data.data.clients[0].warehouses.length > 0) {
            setSelectedWarehouse(response.data.data.clients[0].warehouses[0]);
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
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

  const loadStock = async () => {
    if (!selectedWarehouse?._id) return;

    try {
      const response = await axios.get(getApiUrl(`/api/stock/warehouse/${selectedWarehouse._id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStockItems(response.data.data.stock);
      }
    } catch (error: any) {
      console.error('Error loading stock:', error);
      toast.error('Error al cargar stock');
    }
  };

  const loadMovements = async () => {
    if (!selectedWarehouse?._id) return;

    try {
      const response = await axios.get(getApiUrl(`/api/stock/movements/warehouse/${selectedWarehouse._id}?limit=50`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMovements(response.data.data.movements);
      }
    } catch (error: any) {
      console.error('Error loading movements:', error);
    }
  };

  const handleCreateMovement = async () => {
    if (!selectedWarehouse?._id) {
      toast.error('Seleccione un almacén');
      return;
    }

    try {
      const payload = {
        ...movementForm,
        warehouseId: selectedWarehouse._id,
        lotCode: movementForm.lotCode || undefined
      };

      const response = await axios.post(getApiUrl('/api/stock/movements'), payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Movimiento registrado exitosamente');
        loadStock();
        loadMovements();
        setShowMovementModal(false);
        resetMovementForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  const handleCreateTransfer = async () => {
    if (!selectedWarehouse?._id) {
      toast.error('Seleccione un almacén');
      return;
    }

    try {
      const payload = {
        articleId: transferForm.articleId,
        originWarehouseId: selectedWarehouse._id,
        originLocationCode: transferForm.originLocationCode,
        destinationWarehouseId: transferForm.destinationWarehouseId,
        destinationLocationCode: transferForm.destinationLocationCode,
        quantity: transferForm.quantity,
        reason: transferForm.reason
      };

      const response = await axios.post(getApiUrl('/api/stock/transfer'), payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Transferencia realizada exitosamente');
        loadStock();
        loadMovements();
        setShowTransferModal(false);
        resetTransferForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al realizar transferencia');
    }
  };

  const resetMovementForm = () => {
    setMovementForm({
      type: 'entry',
      articleId: '',
      locationCode: '',
      quantity: 0,
      lotCode: '',
      reason: ''
    });
  };

  const resetTransferForm = () => {
    setTransferForm({
      articleId: '',
      originLocationCode: '',
      destinationWarehouseId: '',
      destinationLocationCode: '',
      quantity: 0,
      reason: ''
    });
  };

  const calculateAging = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAgingColor = (days: number): string => {
    if (days <= 30) return 'success';
    if (days <= 60) return 'warning';
    return 'danger';
  };

  const filteredStock = stockItems.filter(item => {
    const matchesSearch =
      item.articleId.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMinStock = !minStockFilter || item.quantity < 10;

    return matchesSearch && matchesMinStock;
  });

  const totalItems = filteredStock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = stockItems.filter(item => item.quantity < 10).length;
  const uniqueArticles = new Set(stockItems.map(item => item.articleId._id)).size;

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
              <h2>Control de Stock</h2>
              <p className="text-muted">Gestión de inventario y movimientos</p>
            </div>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => setShowMovementModal(true)}
                disabled={!selectedWarehouse}
              >
                <i className="bi bi-arrow-down-circle me-2"></i>
                Nuevo Movimiento
              </button>
              <button
                className="btn btn-info"
                onClick={() => setShowTransferModal(true)}
                disabled={!selectedWarehouse}
              >
                <i className="bi bi-arrow-left-right me-2"></i>
                Transferir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Items</h6>
              <h3>{totalItems}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Artículos Diferentes</h6>
              <h3>{uniqueArticles}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Stock Bajo</h6>
              <h3 className="text-danger">{lowStockCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Ubicaciones</h6>
              <h3>{selectedWarehouse?.locations.length || 0}</h3>
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
              if (client?.warehouses && client.warehouses.length > 0) {
                setSelectedWarehouse(client.warehouses[0]);
              } else {
                setSelectedWarehouse(null);
              }
            }}
          >
            <option value="">Seleccione un cliente</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} ({client.code})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Almacén</label>
          <select
            className="form-select"
            value={selectedWarehouse?._id || ''}
            onChange={(e) => {
              const warehouse = selectedClient?.warehouses?.find(w => w._id === e.target.value);
              setSelectedWarehouse(warehouse || null);
            }}
            disabled={!selectedClient}
          >
            <option value="">Seleccione un almacén</option>
            {selectedClient?.warehouses?.map(warehouse => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('stock'); }}
          >
            Stock Actual
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'movements' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('movements'); }}
          >
            Movimientos
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'aging' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('aging'); }}
          >
            Aging Report
          </a>
        </li>
      </ul>

      {activeTab === 'stock' && (
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por SKU, nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={minStockFilter}
                    onChange={(e) => setMinStockFilter(e.target.checked)}
                    id="minStockFilter"
                  />
                  <label className="form-check-label" htmlFor="minStockFilter">
                    Solo stock bajo (menos de 10 unidades)
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Artículo</th>
                    <th>Familia</th>
                    <th>Ubicación</th>
                    <th>Cantidad</th>
                    <th>Lote</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.length > 0 ? (
                    filteredStock.map((item) => (
                      <tr key={item._id}>
                        <td><code>{item.articleId.sku}</code></td>
                        <td>{item.articleId.name}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {item.articleId.familyId.name}
                          </span>
                        </td>
                        <td><code>{item.locationCode}</code></td>
                        <td>
                          <span className={`badge bg-${item.quantity < 10 ? 'danger' : 'success'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>{item.lotId ? item.lotId.code : '-'}</td>
                        <td>
                          {item.expirationDate ? (
                            <span className="text-muted">
                              {new Date(item.expirationDate).toLocaleDateString()}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {selectedWarehouse ? 'No hay stock registrado' : 'Seleccione un almacén'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Últimos 50 Movimientos</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Artículo</th>
                    <th>Ubicación</th>
                    <th>Cantidad</th>
                    <th>Lote</th>
                    <th>Usuario</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length > 0 ? (
                    movements.map((movement) => (
                      <tr key={movement._id}>
                        <td>{new Date(movement.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${
                            movement.type === 'entry' ? 'success' :
                            movement.type === 'exit' ? 'danger' :
                            movement.type === 'transfer' ? 'info' : 'warning'
                          }`}>
                            {movement.type === 'entry' ? 'Entrada' :
                             movement.type === 'exit' ? 'Salida' :
                             movement.type === 'transfer' ? 'Transferencia' : 'Ajuste'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong>{movement.articleId.name}</strong>
                            <br />
                            <small className="text-muted">{movement.articleId.sku}</small>
                          </div>
                        </td>
                        <td>
                          <code>{movement.locationCode}</code>
                          {movement.destinationLocationCode && (
                            <span> → <code>{movement.destinationLocationCode}</code></span>
                          )}
                        </td>
                        <td>{movement.quantity}</td>
                        <td>{movement.lotId ? movement.lotId.code : '-'}</td>
                        <td>{movement.createdBy.name}</td>
                        <td>{movement.reason || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        No hay movimientos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aging' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Aging Report - Antigüedad de Stock</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Artículo</th>
                    <th>Ubicación</th>
                    <th>Cantidad</th>
                    <th>Fecha Entrada</th>
                    <th>Días en Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.length > 0 ? (
                    filteredStock
                      .map(item => ({
                        ...item,
                        agingDays: calculateAging(item.createdAt)
                      }))
                      .sort((a, b) => b.agingDays - a.agingDays)
                      .map((item) => (
                        <tr key={item._id}>
                          <td><code>{item.articleId.sku}</code></td>
                          <td>{item.articleId.name}</td>
                          <td><code>{item.locationCode}</code></td>
                          <td>{item.quantity}</td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td>
                            <strong>{item.agingDays} días</strong>
                          </td>
                          <td>
                            <span className={`badge bg-${getAgingColor(item.agingDays)}`}>
                              {item.agingDays <= 30 ? 'Reciente' :
                               item.agingDays <= 60 ? 'Medio' : 'Antiguo'}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No hay stock para analizar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Movimiento</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMovementModal(false);
                    resetMovementForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tipo de Movimiento *</label>
                  <select
                    className="form-select"
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({...movementForm, type: e.target.value as any})}
                  >
                    <option value="entry">Entrada</option>
                    <option value="exit">Salida</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Artículo *</label>
                  <select
                    className="form-select"
                    value={movementForm.articleId}
                    onChange={(e) => setMovementForm({...movementForm, articleId: e.target.value})}
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
                  <label className="form-label">Ubicación *</label>
                  <select
                    className="form-select"
                    value={movementForm.locationCode}
                    onChange={(e) => setMovementForm({...movementForm, locationCode: e.target.value})}
                  >
                    <option value="">Seleccione una ubicación</option>
                    {selectedWarehouse?.locations.map(location => (
                      <option key={location.code} value={location.code}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({...movementForm, quantity: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Código de Lote</label>
                  <input
                    type="text"
                    className="form-control"
                    value={movementForm.lotCode}
                    onChange={(e) => setMovementForm({...movementForm, lotCode: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <textarea
                    className="form-control"
                    value={movementForm.reason}
                    onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                    rows={2}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowMovementModal(false);
                    resetMovementForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreateMovement}
                >
                  Registrar Movimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMovementModal && <div className="modal-backdrop show" />}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transferencia de Stock</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowTransferModal(false);
                    resetTransferForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Artículo *</label>
                  <select
                    className="form-select"
                    value={transferForm.articleId}
                    onChange={(e) => setTransferForm({...transferForm, articleId: e.target.value})}
                  >
                    <option value="">Seleccione un artículo</option>
                    {articles.map(article => (
                      <option key={article._id} value={article._id}>
                        {article.sku} - {article.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Ubicación Origen *</label>
                    <select
                      className="form-select"
                      value={transferForm.originLocationCode}
                      onChange={(e) => setTransferForm({...transferForm, originLocationCode: e.target.value})}
                    >
                      <option value="">Seleccione origen</option>
                      {selectedWarehouse?.locations.map(location => (
                        <option key={location.code} value={location.code}>
                          {location.code} - {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cantidad *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={transferForm.quantity}
                      onChange={(e) => setTransferForm({...transferForm, quantity: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Almacén Destino *</label>
                    <select
                      className="form-select"
                      value={transferForm.destinationWarehouseId}
                      onChange={(e) => setTransferForm({...transferForm, destinationWarehouseId: e.target.value})}
                    >
                      <option value="">Seleccione almacén destino</option>
                      {selectedClient?.warehouses?.map(warehouse => (
                        <option key={warehouse._id} value={warehouse._id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ubicación Destino *</label>
                    <select
                      className="form-select"
                      value={transferForm.destinationLocationCode}
                      onChange={(e) => setTransferForm({...transferForm, destinationLocationCode: e.target.value})}
                      disabled={!transferForm.destinationWarehouseId}
                    >
                      <option value="">Seleccione destino</option>
                      {selectedClient?.warehouses
                        ?.find(w => w._id === transferForm.destinationWarehouseId)
                        ?.locations.map(location => (
                          <option key={location.code} value={location.code}>
                            {location.code} - {location.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <textarea
                    className="form-control"
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})}
                    rows={2}
                    placeholder="Motivo de la transferencia"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTransferModal(false);
                    resetTransferForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleCreateTransfer}
                >
                  Realizar Transferencia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTransferModal && <div className="modal-backdrop show" />}
    </div>
  );
};

export default AdminStock;
