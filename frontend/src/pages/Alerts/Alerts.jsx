import React, { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, X, Check, TrendingUp, TrendingDown, Hash, Folder, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Alerts.css';

const Alerts = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense_limit',
    category: 'expense',
    threshold: 0,
    hashtag: '',
    group: '',
    frequency: 'monthly',
    isActive: true,
  });

  // Mock data
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: 'Límite Gastos Variables',
      type: 'expense_limit',
      category: 'expense',
      threshold: 500,
      hashtag: '',
      group: 'Gastos Variables',
      frequency: 'monthly',
      isActive: true,
      notifications: [
        { id: 'n1', date: '2025-10-05', message: 'Has superado el 80% del límite', read: false }
      ]
    },
    {
      id: 2,
      name: 'Recordatorio Salario',
      type: 'income_reminder',
      category: 'income',
      threshold: 0,
      hashtag: 'salario',
      group: '',
      frequency: 'monthly',
      isActive: true,
      notifications: []
    },
    {
      id: 3,
      name: 'Vencimiento Alquiler',
      type: 'due_date',
      category: 'expense',
      threshold: 900,
      hashtag: 'alquiler',
      group: '',
      frequency: 'monthly',
      isActive: true,
      notifications: [
        { id: 'n2', date: '2025-09-28', message: 'El pago vence en 3 días', read: true }
      ]
    }
  ]);

  const alertTypes = [
    { value: 'expense_limit', label: 'Límite de Gasto' },
    { value: 'income_reminder', label: 'Recordatorio de Ingreso' },
    { value: 'due_date', label: 'Fecha de Vencimiento' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Diaria' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  const handleOpenModal = (alert = null) => {
    setEditingAlert(alert);
    if (alert) {
      setFormData({ ...alert });
    } else {
      setFormData({
        name: '',
        type: 'expense_limit',
        category: 'expense',
        threshold: 0,
        hashtag: '',
        group: '',
        frequency: 'monthly',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAlert(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API
    console.log('Save alert:', formData);
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta alerta?')) {
      // TODO: Call API
      console.log('Delete alert:', id);
    }
  };

  const handleToggleActive = (id) => {
    // TODO: Call API
    console.log('Toggle active:', id);
  };

  const handleMarkAsRead = (alertId, notificationId) => {
    // TODO: Call API
    console.log('Mark as read:', alertId, notificationId);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'expense_limit': return <TrendingDown size={20} />;
      case 'income_reminder': return <TrendingUp size={20} />;
      case 'due_date': return <Calendar size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const unreadNotifications = alerts.reduce(
    (total, alert) => total + alert.notifications.filter(n => !n.read).length,
    0
  );

  return (
    <div className="alerts-page">
      {/* Header */}
      <div className="alerts-header">
        <div className="alerts-header-left">
          <div className="alerts-icon-wrapper">
            <Bell size={32} />
            {unreadNotifications > 0 && (
              <span className="alerts-badge">{unreadNotifications}</span>
            )}
          </div>
          <div>
            <h1 className="alerts-title">Alertas</h1>
            <p className="alerts-subtitle">
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} configurada{alerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Nueva Alerta
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="alerts-grid">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-card ${!alert.isActive ? 'inactive' : ''}`}>
            <div className="alert-card-header">
              <div className="alert-card-icon">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-card-title-wrapper">
                <h3 className="alert-card-title">{alert.name}</h3>
                <span className="alert-card-type">
                  {alertTypes.find(t => t.value === alert.type)?.label}
                </span>
              </div>
              <div className="alert-card-actions">
                <button className="btn-icon" onClick={() => handleOpenModal(alert)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon btn-danger" onClick={() => handleDelete(alert.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="alert-card-details">
              <div className="alert-detail-item">
                <span className="alert-detail-label">Categoría:</span>
                <span className={`alert-category-badge ${alert.category}`}>
                  {alert.category === 'income' ? (
                    <><TrendingUp size={14} /> Ingreso</>
                  ) : (
                    <><TrendingDown size={14} /> Gasto</>
                  )}
                </span>
              </div>

              {alert.threshold > 0 && (
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Umbral:</span>
                  <span className="alert-detail-value">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(alert.threshold)}
                  </span>
                </div>
              )}

              {alert.hashtag && (
                <div className="alert-detail-item">
                  <Hash size={14} />
                  <span className="alert-detail-value">{alert.hashtag}</span>
                </div>
              )}

              {alert.group && (
                <div className="alert-detail-item">
                  <Folder size={14} />
                  <span className="alert-detail-value">{alert.group}</span>
                </div>
              )}

              <div className="alert-detail-item">
                <span className="alert-detail-label">Frecuencia:</span>
                <span className="alert-detail-value">
                  {frequencies.find(f => f.value === alert.frequency)?.label}
                </span>
              </div>
            </div>

            {/* Notifications */}
            {alert.notifications.length > 0 && (
              <div className="alert-notifications">
                <h4 className="alert-notifications-title">
                  Notificaciones ({alert.notifications.filter(n => !n.read).length} sin leer)
                </h4>
                {alert.notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`alert-notification ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && handleMarkAsRead(alert.id, notification.id)}
                  >
                    <div className="alert-notification-content">
                      <span className="alert-notification-message">{notification.message}</span>
                      <span className="alert-notification-date">
                        {new Date(notification.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {!notification.read && <div className="alert-notification-dot" />}
                  </div>
                ))}
              </div>
            )}

            {/* Toggle Active */}
            <div className="alert-card-footer">
              <label className="alert-toggle">
                <input
                  type="checkbox"
                  checked={alert.isActive}
                  onChange={() => handleToggleActive(alert.id)}
                />
                <span className="alert-toggle-slider" />
                <span className="alert-toggle-label">
                  {alert.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="alerts-empty">
          <Bell size={48} />
          <p>No tienes alertas configuradas</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Crear Primera Alerta
          </button>
        </div>
      )}

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
                  {editingAlert ? 'Editar' : 'Nueva'} Alerta
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
                    placeholder="Ej: Límite de gastos mensuales"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Alerta</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {alertTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <div className="form-radio-group">
                    <label className="form-radio">
                      <input
                        type="radio"
                        value="income"
                        checked={formData.category === 'income'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <TrendingUp size={16} />
                      <span>Ingreso</span>
                    </label>
                    <label className="form-radio">
                      <input
                        type="radio"
                        value="expense"
                        checked={formData.category === 'expense'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <TrendingDown size={16} />
                      <span>Gasto</span>
                    </label>
                  </div>
                </div>

                {formData.type !== 'income_reminder' && (
                  <div className="form-group">
                    <label className="form-label">
                      {formData.type === 'expense_limit' ? 'Límite' : 'Monto'}
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Hashtag (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.hashtag}
                    onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                    placeholder="salario, alquiler, etc."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grupo (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="Ingresos Fijos, Gastos Variables, etc."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Frecuencia</label>
                  <select
                    className="form-input"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>

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

export default Alerts;
