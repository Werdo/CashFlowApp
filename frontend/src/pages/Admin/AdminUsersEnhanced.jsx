import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Search, ChevronDown, Lock, Unlock, Key, Link as LinkIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './AdminUsers.css';

const AdminUsersEnhanced = () => {
  const { success, error: notifyError } = useNotifications();
  const [users, setUsers] = useState([]);
  const [cashflows, setCashflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserForLink, setSelectedUserForLink] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true,
    subscriptionStatus: 'free'
  });

  useEffect(() => {
    fetchUsers();
    fetchCashflows();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        notifyError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notifyError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchCashflows = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/cashflows`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCashflows(data);
      }
    } catch (error) {
      console.error('Error fetching cashflows:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `${API_URL}/admin/users/${editingUser._id}`
        : `${API_URL}/admin/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (editingUser && !formData.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user', isActive: true, subscriptionStatus: 'free' });
        fetchUsers();
      } else {
        notifyError('Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      notifyError('Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      subscriptionStatus: user.subscriptionStatus || 'free'
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('Usuario eliminado');
        fetchUsers();
      } else {
        notifyError('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      notifyError('Error al eliminar usuario');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        success(currentStatus ? 'Usuario desactivado' : 'Usuario activado');
        fetchUsers();
      } else {
        notifyError('Error al cambiar estado del usuario');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      notifyError('Error al cambiar estado del usuario');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('¿Enviar email para resetear contraseña?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('Email de reseteo enviado');
      } else {
        notifyError('Error al enviar email');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      notifyError('Error al resetear contraseña');
    }
  };

  const handleLinkCashflow = (user) => {
    setSelectedUserForLink(user);
    setShowLinkModal(true);
  };

  const handleToggleCashflowLink = async (cashflowId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/cashflows/${cashflowId}/link-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: selectedUserForLink._id })
      });

      if (response.ok) {
        success('Vinculación actualizada');
        fetchCashflows();
      } else {
        notifyError('Error al vincular cashflow');
      }
    } catch (error) {
      console.error('Error linking cashflow:', error);
      notifyError('Error al vincular cashflow');
    }
  };

  const isUserLinkedToCashflow = (cashflow, user) => {
    return cashflow.sharedWith?.includes(user._id) || cashflow.userId === user._id;
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-header">
          <div className="admin-users-title-section">
            <Users size={32} />
            <h1>Gestión de Usuarios</h1>
          </div>
        </div>
        <div className="loading-state">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="admin-users-header">
        <div className="admin-users-title-section">
          <div className="admin-users-icon-wrapper">
            <Users size={32} />
          </div>
          <div>
            <h1 className="admin-users-title">Gestión de Usuarios</h1>
            <p className="admin-users-subtitle">Administra los usuarios de la plataforma</p>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user', isActive: true, subscriptionStatus: 'free' });
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="admin-users-search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="admin-users-stats">
        <div className="stat-card">
          <div className="stat-label">Total Usuarios</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Administradores</div>
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Usuarios Activos</div>
          <div className="stat-value">{users.filter(u => u.isActive !== false).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suscriptores Premium</div>
          <div className="stat-value">{users.filter(u => u.subscriptionStatus === 'premium').length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Suscripción</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  {user.isActive !== false ? (
                    <CheckCircle size={20} className="status-active" title="Activo" />
                  ) : (
                    <XCircle size={20} className="status-inactive" title="Inactivo" />
                  )}
                </td>
                <td>
                  <div className="user-name">
                    {user.name}
                    {user.role === 'admin' && (
                      <Shield size={16} className="admin-badge" />
                    )}
                  </div>
                </td>
                <td className="user-email">{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role || 'user'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td>
                  <span className={`subscription-badge subscription-${user.subscriptionStatus || 'free'}`}>
                    {user.subscriptionStatus || 'free'}
                  </span>
                </td>
                <td className="user-date">{new Date(user.createdAt || Date.now()).toLocaleDateString('es-ES')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-action btn-link"
                      onClick={() => handleLinkCashflow(user)}
                      title="Vincular Cashflows"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button
                      className="btn-action btn-reset"
                      onClick={() => handleResetPassword(user._id)}
                      title="Resetear Contraseña"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      className="btn-action btn-toggle"
                      onClick={() => handleToggleActive(user._id, user.isActive !== false)}
                      title={user.isActive !== false ? "Desactivar" : "Activar"}
                    >
                      {user.isActive !== false ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(user._id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser && '(dejar en blanco para no cambiar)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado de Suscripción</label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Usuario Activo
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Cashflow Modal */}
      {showLinkModal && selectedUserForLink && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Vincular Cashflows a {selectedUserForLink.name}</h2>
              <button onClick={() => setShowLinkModal(false)}>×</button>
            </div>
            <div className="cashflow-link-list">
              {cashflows.length === 0 ? (
                <p className="empty-message">No hay cashflows disponibles</p>
              ) : (
                cashflows.map(cashflow => (
                  <div key={cashflow._id} className="cashflow-link-item">
                    <div className="cashflow-info">
                      <div className="cashflow-name">
                        Cashflow {cashflow.year}
                        {cashflow.userId === selectedUserForLink._id && (
                          <span className="owner-badge">Propietario</span>
                        )}
                      </div>
                      <div className="cashflow-details">
                        {cashflow.sharedWith?.length || 0} usuarios vinculados
                      </div>
                    </div>
                    <button
                      className={`btn-toggle-link ${isUserLinkedToCashflow(cashflow, selectedUserForLink) ? 'linked' : ''}`}
                      onClick={() => handleToggleCashflowLink(cashflow._id)}
                      disabled={cashflow.userId === selectedUserForLink._id}
                    >
                      {isUserLinkedToCashflow(cashflow, selectedUserForLink) ? 'Desvincular' : 'Vincular'}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowLinkModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersEnhanced;
