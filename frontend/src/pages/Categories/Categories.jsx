import React, { useState } from 'react';
import { Tag, Folder, Plus, Edit2, Trash2, X, Check, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Categories.css';

const Categories = () => {
  const [activeTab, setActiveTab] = useState('hashtags'); // 'hashtags' or 'groups'
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hashtag',
    color: '#6c5dd3',
    parentGroup: null,
    recurrence: {
      enabled: false,
      type: 'monthly',
      amount: 0,
    },
  });

  // Mock data
  const [hashtags, setHashtags] = useState([
    { id: 1, name: 'salario', color: '#10b981', parentGroup: { id: 1, name: 'Ingresos Fijos' }, recurrence: { enabled: true, type: 'monthly', amount: 3500 } },
    { id: 2, name: 'freelance', color: '#3b82f6', parentGroup: { id: 2, name: 'Ingresos Variables' }, recurrence: { enabled: false } },
    { id: 3, name: 'alquiler', color: '#ef4444', parentGroup: { id: 3, name: 'Gastos Fijos' }, recurrence: { enabled: true, type: 'monthly', amount: 900 } },
    { id: 4, name: 'supermercado', color: '#f59e0b', parentGroup: { id: 4, name: 'Gastos Variables' }, recurrence: { enabled: false } },
  ]);

  const [groups, setGroups] = useState([
    { id: 1, name: 'Ingresos Fijos', color: '#10b981', count: 1 },
    { id: 2, name: 'Ingresos Variables', color: '#3b82f6', count: 1 },
    { id: 3, name: 'Gastos Fijos', color: '#ef4444', count: 1 },
    { id: 4, name: 'Gastos Variables', color: '#f59e0b', count: 1 },
  ]);

  const recurrenceTypes = [
    { value: 'daily', label: 'Diaria' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
  ];

  const predefinedColors = [
    '#6c5dd3', '#10b981', '#3b82f6', '#ef4444',
    '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
  ];

  const handleOpenModal = (type, item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ ...item, type });
    } else {
      setFormData({
        name: '',
        type,
        color: '#6c5dd3',
        parentGroup: null,
        recurrence: { enabled: false, type: 'monthly', amount: 0 },
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API
    console.log('Save:', formData);
    handleCloseModal();
  };

  const handleDelete = (id, type) => {
    if (window.confirm('¿Eliminar este elemento?')) {
      // TODO: Call API
      console.log('Delete:', id, type);
    }
  };

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="categories-header">
        <div className="categories-header-left">
          <div className="categories-icon-wrapper">
            <Tag size={32} />
          </div>
          <div>
            <h1 className="categories-title">Categorías y Hashtags</h1>
            <p className="categories-subtitle">Organiza tus transacciones</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal(activeTab === 'hashtags' ? 'hashtag' : 'group')}
        >
          <Plus size={18} />
          {activeTab === 'hashtags' ? 'Nuevo Hashtag' : 'Nuevo Grupo'}
        </button>
      </div>

      {/* Tabs */}
      <div className="categories-tabs">
        <button
          className={`category-tab ${activeTab === 'hashtags' ? 'active' : ''}`}
          onClick={() => setActiveTab('hashtags')}
        >
          <Hash size={18} />
          Hashtags ({hashtags.length})
        </button>
        <button
          className={`category-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <Folder size={18} />
          Grupos ({groups.length})
        </button>
      </div>

      {/* Content */}
      <div className="categories-content">
        {activeTab === 'hashtags' ? (
          <div className="categories-grid">
            {hashtags.map(tag => (
              <div key={tag.id} className="category-card">
                <div className="category-card-header">
                  <div className="category-color" style={{ backgroundColor: tag.color }} />
                  <h3 className="category-name">#{tag.name}</h3>
                  <div className="category-actions">
                    <button className="btn-icon" onClick={() => handleOpenModal('hashtag', tag)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(tag.id, 'hashtag')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {tag.parentGroup && (
                  <div className="category-group">
                    <Folder size={14} />
                    <span>{tag.parentGroup.name}</span>
                  </div>
                )}
                {tag.recurrence?.enabled && (
                  <div className="category-recurrence">
                    <span className="recurrence-badge">
                      Recurrente: {recurrenceTypes.find(r => r.value === tag.recurrence.type)?.label}
                    </span>
                    {tag.recurrence.amount > 0 && (
                      <span className="recurrence-amount">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(tag.recurrence.amount)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="categories-grid">
            {groups.map(group => (
              <div key={group.id} className="category-card">
                <div className="category-card-header">
                  <div className="category-color" style={{ backgroundColor: group.color }} />
                  <h3 className="category-name">{group.name}</h3>
                  <div className="category-actions">
                    <button className="btn-icon" onClick={() => handleOpenModal('group', group)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(group.id, 'group')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="category-stats">
                  <span>{group.count} hashtag{group.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <div className="modal-backdrop" onClick={handleCloseModal} />
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingItem ? 'Editar' : 'Nuevo'} {formData.type === 'hashtag' ? 'Hashtag' : 'Grupo'}
                </h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formData.type === 'hashtag' ? 'salario' : 'Ingresos Fijos'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-picker">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                {formData.type === 'hashtag' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Grupo</label>
                      <select
                        className="form-input"
                        value={formData.parentGroup?.id || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          parentGroup: e.target.value ? groups.find(g => g.id === parseInt(e.target.value)) : null
                        })}
                      >
                        <option value="">Sin grupo</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.recurrence.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            recurrence: { ...formData.recurrence, enabled: e.target.checked }
                          })}
                        />
                        <span>Recurrente</span>
                      </label>
                    </div>

                    {formData.recurrence.enabled && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Tipo de recurrencia</label>
                          <select
                            className="form-input"
                            value={formData.recurrence.type}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurrence: { ...formData.recurrence, type: e.target.value }
                            })}
                          >
                            {recurrenceTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Monto estimado (opcional)</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.recurrence.amount}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurrence: { ...formData.recurrence, amount: parseFloat(e.target.value) || 0 }
                            })}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} />
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
