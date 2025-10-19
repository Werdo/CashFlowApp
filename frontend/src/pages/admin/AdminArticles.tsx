import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { getApiUrl } from '../../config/api';

interface Article {
  _id: string;
  sku: string;
  ean?: string;
  name: string;
  description?: string;
  familyId?: string;
  images?: string[];
  pricing?: {
    cost: number;
    price: number;
    currency: string;
  };
  specifications?: any;
  active: boolean;
  createdAt: string;
}

interface Family {
  _id: string;
  code: string;
  name: string;
  parentFamilyId?: string;
  level: number;
}

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [articleForm, setArticleForm] = useState({
    sku: '',
    ean: '',
    name: '',
    description: '',
    familyId: '',
    pricing: {
      cost: 0,
      price: 0,
      currency: 'EUR'
    },
    active: true
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadArticles();
    loadFamilies();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/articles'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setArticles(response.data.data.articles);
      }
    } catch (error: any) {
      console.error('Error loading articles:', error);
      toast.error('Error al cargar artículos');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilies = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/articles/families'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFamilies(response.data.data.families);
      }
    } catch (error: any) {
      console.error('Error loading families:', error);
    }
  };

  const handleCreateArticle = async () => {
    try {
      const formData = new FormData();
      formData.append('sku', articleForm.sku);
      formData.append('ean', articleForm.ean);
      formData.append('name', articleForm.name);
      formData.append('description', articleForm.description);
      formData.append('familyId', articleForm.familyId);
      formData.append('pricing', JSON.stringify(articleForm.pricing));
      formData.append('active', String(articleForm.active));

      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(getApiUrl('/api/articles'), formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Artículo creado exitosamente');
        loadArticles();
        setShowModal(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear artículo');
    }
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    try {
      const formData = new FormData();
      formData.append('sku', articleForm.sku);
      formData.append('ean', articleForm.ean);
      formData.append('name', articleForm.name);
      formData.append('description', articleForm.description);
      formData.append('familyId', articleForm.familyId);
      formData.append('pricing', JSON.stringify(articleForm.pricing));
      formData.append('active', String(articleForm.active));

      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.put(
        getApiUrl(`/api/articles/${editingArticle._id}`),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Artículo actualizado exitosamente');
        loadArticles();
        setShowModal(false);
        setEditingArticle(null);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar artículo');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este artículo?')) return;

    try {
      const response = await axios.delete(getApiUrl(`/api/articles/${articleId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Artículo eliminado exitosamente');
        loadArticles();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar artículo');
    }
  };

  const resetForm = () => {
    setArticleForm({
      sku: '',
      ean: '',
      name: '',
      description: '',
      familyId: '',
      pricing: {
        cost: 0,
        price: 0,
        currency: 'EUR'
      },
      active: true
    });
    setUploadedImages([]);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      sku: article.sku,
      ean: article.ean || '',
      name: article.name,
      description: article.description || '',
      familyId: article.familyId || '',
      pricing: article.pricing || {
        cost: 0,
        price: 0,
        currency: 'EUR'
      },
      active: article.active
    });
    setShowModal(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setUploadedImages([...uploadedImages, ...acceptedFiles]);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5242880 // 5MB
  });

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.ean && article.ean.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <h2>Gestión de Artículos</h2>
              <p className="text-muted">Catálogo de productos con SKU, EAN y familias</p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => {
                setEditingArticle(null);
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear Artículo
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Artículos</h6>
              <h3>{articles.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Activos</h6>
              <h3>{articles.filter(a => a.active).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Con EAN</h6>
              <h3>{articles.filter(a => a.ean).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Familias</h6>
              <h3>{families.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, SKU o EAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <th>SKU</th>
                  <th>EAN</th>
                  <th>Nombre</th>
                  <th>Familia</th>
                  <th>Precio</th>
                  <th>Imágenes</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article._id}>
                    <td><strong>{article.sku}</strong></td>
                    <td>{article.ean || '-'}</td>
                    <td>{article.name}</td>
                    <td>
                      {families.find(f => f._id === article.familyId)?.name || '-'}
                    </td>
                    <td>
                      {article.pricing ? `${article.pricing.price} ${article.pricing.currency}` : '-'}
                    </td>
                    <td>{article.images?.length || 0}</td>
                    <td>
                      <span className={`badge bg-${article.active ? 'success' : 'secondary'}`}>
                        {article.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(article)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteArticle(article._id)}
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
                  {editingArticle ? 'Editar Artículo' : 'Crear Artículo'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                    resetForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SKU *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={articleForm.sku}
                      onChange={(e) => setArticleForm({...articleForm, sku: e.target.value.toUpperCase()})}
                      placeholder="ART-001"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">EAN</label>
                    <input
                      type="text"
                      className="form-control"
                      value={articleForm.ean}
                      onChange={(e) => setArticleForm({...articleForm, ean: e.target.value})}
                      placeholder="1234567890123"
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={articleForm.name}
                      onChange={(e) => setArticleForm({...articleForm, name: e.target.value})}
                      placeholder="Nombre del artículo"
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={articleForm.description}
                      onChange={(e) => setArticleForm({...articleForm, description: e.target.value})}
                      rows={3}
                      placeholder="Descripción del artículo"
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Familia</label>
                    <select
                      className="form-select"
                      value={articleForm.familyId}
                      onChange={(e) => setArticleForm({...articleForm, familyId: e.target.value})}
                    >
                      <option value="">Sin familia</option>
                      {families.map(family => (
                        <option key={family._id} value={family._id}>
                          {family.name} ({family.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Costo</label>
                    <input
                      type="number"
                      className="form-control"
                      value={articleForm.pricing.cost}
                      onChange={(e) => setArticleForm({
                        ...articleForm,
                        pricing: {...articleForm.pricing, cost: parseFloat(e.target.value)}
                      })}
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Precio</label>
                    <input
                      type="number"
                      className="form-control"
                      value={articleForm.pricing.price}
                      onChange={(e) => setArticleForm({
                        ...articleForm,
                        pricing: {...articleForm.pricing, price: parseFloat(e.target.value)}
                      })}
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Moneda</label>
                    <select
                      className="form-select"
                      value={articleForm.pricing.currency}
                      onChange={(e) => setArticleForm({
                        ...articleForm,
                        pricing: {...articleForm.pricing, currency: e.target.value}
                      })}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Imágenes</label>
                    <div
                      {...getRootProps()}
                      className={`border border-2 border-dashed rounded p-4 text-center ${
                        isDragActive ? 'border-primary bg-light' : 'border-secondary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input {...getInputProps()} />
                      <p className="mb-0">
                        Arrastra imágenes aquí o haz clic para seleccionar
                        <br />
                        <small className="text-muted">PNG, JPG, WEBP (máx. 5MB cada una)</small>
                      </p>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">{uploadedImages.length} imagen(es) seleccionada(s)</small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={articleForm.active}
                        onChange={(e) => setArticleForm({...articleForm, active: e.target.checked})}
                      />
                      <label className="form-check-label">Artículo Activo</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={editingArticle ? handleUpdateArticle : handleCreateArticle}
                >
                  {editingArticle ? 'Actualizar' : 'Crear'}
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

export default AdminArticles;
