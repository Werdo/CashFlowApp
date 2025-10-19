import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCodeGenerator from '../../components/QRCodeGenerator';

interface Family {
  _id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentFamilyId?: string;
  active: boolean;
}

interface Article {
  _id: string;
  sku: string;
  ean?: string;
  name: string;
  description?: string;
  familyId: Family;
  specifications?: {
    brand?: string;
    model?: string;
    attributes?: Map<string, any>;
  };
  pricing?: {
    cost: number;
    price: number;
    currency: string;
  };
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit?: string;
  };
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleFormData {
  sku: string;
  ean: string;
  name: string;
  description: string;
  familyId: string;
  brand: string;
  model: string;
  cost: number;
  price: number;
  currency: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  notes: string;
  active: boolean;
}

export default function AssetsModule() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('true');
  const [showQR, setShowQR] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [formData, setFormData] = useState<ArticleFormData>({
    sku: '',
    ean: '',
    name: '',
    description: '',
    familyId: '',
    brand: '',
    model: '',
    cost: 0,
    price: 0,
    currency: 'EUR',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    notes: '',
    active: true
  });

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || 'viewer';
  const canEdit = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    loadData();
  }, [filterActive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesRes, familiesRes] = await Promise.all([
        axios.get('/api/articles', {
          headers: { Authorization: `Bearer ${token}` },
          params: { active: filterActive !== 'all' ? filterActive : undefined }
        }),
        axios.get('/api/articles/families', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (articlesRes.data.success) {
        setArticles(articlesRes.data.data.articles);
      }

      if (familiesRes.data.success) {
        setFamilies(familiesRes.data.data.families);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.ean?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFamily = filterFamily === 'all' || article.familyId?._id === filterFamily;

    return matchesSearch && matchesFamily;
  });

  const totalValue = articles.reduce((sum, article) => sum + (article.pricing?.price || 0), 0);
  const activeArticles = articles.filter(a => a.active).length;
  const familiesCount = families.length;

  const openCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      sku: '',
      ean: '',
      name: '',
      description: '',
      familyId: families.length > 0 ? families[0]._id : '',
      brand: '',
      model: '',
      cost: 0,
      price: 0,
      currency: 'EUR',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      notes: '',
      active: true
    });
    setShowModal(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      sku: article.sku,
      ean: article.ean || '',
      name: article.name,
      description: article.description || '',
      familyId: article.familyId?._id || '',
      brand: article.specifications?.brand || '',
      model: article.specifications?.model || '',
      cost: article.pricing?.cost || 0,
      price: article.pricing?.price || 0,
      currency: article.pricing?.currency || 'EUR',
      length: article.dimensions?.length || 0,
      width: article.dimensions?.width || 0,
      height: article.dimensions?.height || 0,
      weight: article.dimensions?.weight || 0,
      notes: article.notes || '',
      active: article.active
    });
    setShowModal(true);
  };

  const openViewModal = (article: Article) => {
    setSelectedArticle(article);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        sku: formData.sku,
        ean: formData.ean || undefined,
        name: formData.name,
        description: formData.description,
        familyId: formData.familyId,
        specifications: {
          brand: formData.brand,
          model: formData.model
        },
        pricing: {
          cost: formData.cost,
          price: formData.price,
          currency: formData.currency
        },
        dimensions: {
          length: formData.length,
          width: formData.width,
          height: formData.height,
          weight: formData.weight,
          unit: 'cm/kg'
        },
        notes: formData.notes,
        active: formData.active
      };

      if (editingArticle) {
        const response = await axios.put(
          `/api/articles/${editingArticle._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success('Artículo actualizado exitosamente');
          loadData();
          setShowModal(false);
        }
      } else {
        const response = await axios.post(
          '/api/articles',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success('Artículo creado exitosamente');
          loadData();
          setShowModal(false);
        }
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.response?.data?.message || 'Error al guardar artículo');
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Artículo eliminado exitosamente');
        loadData();
      }
    } catch (error: any) {
      console.error('Error deleting article:', error);

      // Handle specific error for articles with deposits
      if (error.response?.data?.error?.code === 'ARTICLE_HAS_DEPOSITS') {
        const deposits = error.response.data.error.activeDeposits;
        const depositsList = deposits.map((d: any) => `${d.code} (${d.client})`).join(', ');
        toast.error(
          `No se puede eliminar: El artículo está en los depósitos activos: ${depositsList}`,
          { duration: 6000 }
        );
      } else {
        toast.error(error.response?.data?.message || 'Error al eliminar artículo');
      }
    }
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
                  <h6 className="text-muted mb-1">Total Artículos</h6>
                  <h3 className="mb-0">{articles.length}</h3>
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
                  <h3 className="mb-0">{activeArticles}</h3>
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
                  <h6 className="text-muted mb-1">Familias</h6>
                  <h3 className="mb-0">{familiesCount}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>📑</div>
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
                  <h3 className="mb-0">{totalValue.toLocaleString('es-ES')}€</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por SKU, EAN, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterFamily}
                onChange={(e) => setFilterFamily(e.target.value)}
              >
                <option value="all">Todas las familias</option>
                {families.map((family) => (
                  <option key={family._id} value={family._id}>
                    {family.icon} {family.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={openCreateModal}
                disabled={!canEdit}
              >
                ➕ Nuevo Artículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">📦 Artículos ({filteredArticles.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>SKU / EAN</th>
                  <th>Nombre</th>
                  <th>Familia</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map(article => (
                  <tr key={article._id}>
                    <td>
                      <strong>{article.sku}</strong>
                      {article.ean && (
                        <>
                          <br />
                          <small className="text-muted">EAN: {article.ean}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {article.name}
                      {article.description && (
                        <>
                          <br />
                          <small className="text-muted">{article.description.substring(0, 50)}{article.description.length > 50 ? '...' : ''}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {article.familyId && (
                        <span style={{ color: article.familyId.color }}>
                          {article.familyId.icon} {article.familyId.name}
                        </span>
                      )}
                    </td>
                    <td>{article.specifications?.brand || '-'}</td>
                    <td>{(article.pricing?.price || 0).toLocaleString('es-ES')} {article.pricing?.currency}</td>
                    <td>
                      <span className={`badge bg-${article.active ? 'success' : 'secondary'}`}>
                        {article.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowQR(true);
                        }}
                        title="Ver QR"
                      >
                        QR
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => openViewModal(article)}
                        title="Ver detalles"
                      >
                        Ver
                      </button>
                      {canEdit && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() => openEditModal(article)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(article._id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && selectedArticle && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowQR(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Código QR - {selectedArticle.sku}</h5>
                <button type="button" className="btn-close" onClick={() => setShowQR(false)}></button>
              </div>
              <div className="modal-body text-center">
                <QRCodeGenerator
                  value={selectedArticle.sku}
                  title={`${selectedArticle.sku} - ${selectedArticle.name}`}
                  size={256}
                />
                <div className="mt-3">
                  <p className="mb-1"><strong>{selectedArticle.name}</strong></p>
                  <p className="text-muted mb-0">{selectedArticle.familyId?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">SKU *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">EAN</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ean}
                        onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Familia *</label>
                      <select
                        className="form-select"
                        value={formData.familyId}
                        onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar familia...</option>
                        {families.map((family) => (
                          <option key={family._id} value={family._id}>
                            {family.icon} {family.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Marca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Modelo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Moneda</label>
                      <select
                        className="form-select"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Coste</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio de Venta</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Largo (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Ancho (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Alto (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Notas</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <label className="form-check-label">Activo</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingArticle ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedArticle && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Artículo</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>SKU:</strong> {selectedArticle.sku}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>EAN:</strong> {selectedArticle.ean || 'N/A'}
                  </div>
                  <div className="col-md-12 mb-3">
                    <strong>Nombre:</strong> {selectedArticle.name}
                  </div>
                  {selectedArticle.description && (
                    <div className="col-md-12 mb-3">
                      <strong>Descripción:</strong> {selectedArticle.description}
                    </div>
                  )}
                  <div className="col-md-6 mb-3">
                    <strong>Familia:</strong> {selectedArticle.familyId?.icon} {selectedArticle.familyId?.name}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Marca:</strong> {selectedArticle.specifications?.brand || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Modelo:</strong> {selectedArticle.specifications?.model || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Estado:</strong>{' '}
                    <span className={`badge bg-${selectedArticle.active ? 'success' : 'secondary'}`}>
                      {selectedArticle.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Coste:</strong> {selectedArticle.pricing?.cost?.toLocaleString('es-ES')} {selectedArticle.pricing?.currency}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Precio:</strong> {selectedArticle.pricing?.price?.toLocaleString('es-ES')} {selectedArticle.pricing?.currency}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Margen:</strong> {((selectedArticle.pricing?.price || 0) - (selectedArticle.pricing?.cost || 0)).toLocaleString('es-ES')} {selectedArticle.pricing?.currency}
                  </div>
                  {selectedArticle.dimensions && (
                    <>
                      <div className="col-md-12 mb-2">
                        <strong>Dimensiones:</strong>
                      </div>
                      <div className="col-md-3">
                        Largo: {selectedArticle.dimensions.length || 0} cm
                      </div>
                      <div className="col-md-3">
                        Ancho: {selectedArticle.dimensions.width || 0} cm
                      </div>
                      <div className="col-md-3">
                        Alto: {selectedArticle.dimensions.height || 0} cm
                      </div>
                      <div className="col-md-3">
                        Peso: {selectedArticle.dimensions.weight || 0} kg
                      </div>
                    </>
                  )}
                  {selectedArticle.notes && (
                    <div className="col-md-12 mb-3 mt-3">
                      <strong>Notas:</strong>
                      <p className="mb-0">{selectedArticle.notes}</p>
                    </div>
                  )}
                  <div className="col-md-6 mb-3">
                    <small className="text-muted">Creado: {new Date(selectedArticle.createdAt).toLocaleDateString('es-ES')}</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <small className="text-muted">Actualizado: {new Date(selectedArticle.updatedAt).toLocaleDateString('es-ES')}</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Cerrar
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedArticle);
                    }}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <div className="modal-backdrop show" />}
      {showViewModal && <div className="modal-backdrop show" />}
    </div>
  );
}
