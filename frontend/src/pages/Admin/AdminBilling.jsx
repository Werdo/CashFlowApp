import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './AdminBilling.css';

const AdminBilling = () => {
  const { success, error: notifyError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [manualPaymentData, setManualPaymentData] = useState({
    amount: '',
    currency: 'EUR',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [statsRes, subsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/billing/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/billing/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/billing/payments?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) setSubscriptions(await subsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());

    } catch (error) {
      console.error('Error fetching billing data:', error);
      notifyError('Error al cargar datos de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/billing/subscriptions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        success('Estado de suscripción actualizado');
        fetchData();
      } else {
        notifyError('Error al actualizar suscripción');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      notifyError('Error al actualizar suscripción');
    }
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/billing/manual-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          amount: parseFloat(manualPaymentData.amount),
          currency: manualPaymentData.currency,
          notes: manualPaymentData.notes
        })
      });

      if (response.ok) {
        success('Pago manual registrado exitosamente');
        setShowManualPaymentModal(false);
        setSelectedUser(null);
        setManualPaymentData({ amount: '', currency: 'EUR', notes: '' });
        fetchData();
      } else {
        notifyError('Error al registrar pago');
      }
    } catch (error) {
      console.error('Error creating manual payment:', error);
      notifyError('Error al registrar pago');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={18} className="status-icon-success" />;
      case 'past_due':
        return <Clock size={18} className="status-icon-warning" />;
      case 'canceled':
        return <XCircle size={18} className="status-icon-danger" />;
      default:
        return <Clock size={18} className="status-icon-info" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'past_due': return 'status-past-due';
      case 'canceled': return 'status-canceled';
      case 'trial': return 'status-trial';
      default: return 'status-inactive';
    }
  };

  if (loading) {
    return (
      <div className="admin-billing-page">
        <div className="loading-state">Cargando datos de facturación...</div>
      </div>
    );
  }

  return (
    <div className="admin-billing-page">
      {/* Header */}
      <div className="admin-billing-header">
        <div className="admin-billing-title-section">
          <div className="admin-billing-icon-wrapper">
            <CreditCard size={32} />
          </div>
          <div>
            <h1 className="admin-billing-title">Billing Management</h1>
            <p className="admin-billing-subtitle">Gestiona suscripciones y pagos</p>
          </div>
        </div>
        <button className="btn-primary" onClick={fetchData}>
          <RefreshCw size={20} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="billing-stats">
          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Ingresos Totales</div>
              <div className="stat-value">€{stats.revenue.total.toFixed(2)}</div>
              <div className="stat-detail">Este mes: €{stats.revenue.thisMonth.toFixed(2)}</div>
            </div>
          </div>

          <div className="stat-card stat-subscriptions">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Suscripciones Activas</div>
              <div className="stat-value">{stats.subscriptions.active}</div>
              <div className="stat-detail">de {stats.subscriptions.total} totales</div>
            </div>
          </div>

          <div className="stat-card stat-payments">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Pagos Exitosos</div>
              <div className="stat-value">{stats.payments.successful}</div>
              <div className="stat-detail">Fallidos: {stats.payments.failed}</div>
            </div>
          </div>

          <div className="stat-card stat-trial">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">En Prueba</div>
              <div className="stat-value">{stats.subscriptions.trial}</div>
              <div className="stat-detail">Impagados: {stats.subscriptions.pastDue}</div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="subscriptions-section">
        <h2 className="section-title">Suscripciones</h2>
        <div className="table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Proveedor</th>
                <th>Modo Solo Lectura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-name">{sub.userId?.name || 'N/A'}</div>
                      <div className="user-email">{sub.userId?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="plan-badge">{sub.plan}</span>
                  </td>
                  <td>
                    <div className={`status-badge ${getStatusClass(sub.status)}`}>
                      {getStatusIcon(sub.status)}
                      {sub.status}
                    </div>
                  </td>
                  <td>{sub.paymentProvider || 'N/A'}</td>
                  <td>
                    <span className={`readonly-badge ${sub.isReadOnly ? 'readonly-yes' : 'readonly-no'}`}>
                      {sub.isReadOnly ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {sub.status !== 'active' && (
                        <button
                          className="btn-action btn-activate"
                          onClick={() => handleStatusChange(sub.userId._id, 'active')}
                        >
                          Activar
                        </button>
                      )}
                      <button
                        className="btn-action btn-payment"
                        onClick={() => {
                          setSelectedUser(sub.userId);
                          setShowManualPaymentModal(true);
                        }}
                      >
                        Pago Manual
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-section">
        <h2 className="section-title">Últimos Pagos</h2>
        <div className="table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Proveedor</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-name">{payment.userId?.name || 'N/A'}</div>
                      <div className="user-email">{payment.userId?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="amount-cell">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </td>
                  <td>
                    <div className={`status-badge ${getStatusClass(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </div>
                  </td>
                  <td>{payment.paymentProvider}</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowManualPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Pago Manual</h2>
              <button onClick={() => setShowManualPaymentModal(false)}>×</button>
            </div>
            <form onSubmit={handleManualPayment}>
              <div className="form-group">
                <label>Usuario</label>
                <input type="text" value={selectedUser?.name || ''} disabled />
              </div>
              <div className="form-group">
                <label>Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualPaymentData.amount}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Moneda</label>
                <select
                  value={manualPaymentData.currency}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, currency: e.target.value })}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea
                  value={manualPaymentData.notes}
                  onChange={(e) => setManualPaymentData({ ...manualPaymentData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowManualPaymentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;
