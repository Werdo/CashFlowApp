import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Search, ChevronDown } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const { success, error: notifyError } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `${API_URL}/admin/users/${editingUser._id}`
        : `${API_URL}/admin/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
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
      role: user.role || 'user'
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
            setFormData({ name: '', email: '', password: '', role: 'user' });
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
      </div>

      {/* Users Table */}
      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-name">
                    {user.name}
                    {user.role === 'admin' && (
                      <Shield size={16} className="admin-badge" />
                    )}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role || 'user'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td>{new Date(user.createdAt || Date.now()).toLocaleDateString('es-ES')}</td>
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

      {/* Modal */}
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
    </div>
  );
};

export default AdminUsers;
