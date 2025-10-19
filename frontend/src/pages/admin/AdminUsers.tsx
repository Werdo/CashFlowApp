import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../config/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

interface AccessLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  action: 'login' | 'logout' | 'failed_login';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'access'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'viewer',
    company: '',
    active: true
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'viewer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    } else if (activeTab === 'access') {
      loadAccessLogs();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/auth/users'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/audit-logs?limit=100'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAuditLogs(response.data.data.logs);
      }
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast.error('Error al cargar logs de auditoría');
    }
  };

  const loadAccessLogs = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/access-logs?limit=100'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAccessLogs(response.data.data.logs);
      }
    } catch (error: any) {
      console.error('Error loading access logs:', error);
      toast.error('Error al cargar logs de acceso');
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await axios.post(getApiUrl('/api/auth/register'), userForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Usuario creado exitosamente');
        loadUsers();
        setShowUserModal(false);
        resetUserForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await axios.put(
        getApiUrl(`/api/auth/users/${editingUser._id}`),
        userForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Usuario actualizado exitosamente');
        loadUsers();
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const response = await axios.delete(getApiUrl(`/api/auth/users/${userId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Usuario eliminado exitosamente');
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(
        getApiUrl(`/api/auth/users/${userId}/toggle-status`),
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await axios.post(
        getApiUrl(`/api/auth/users/${selectedUser._id}/reset-password`),
        { newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Contraseña restablecida exitosamente');
        setShowPasswordModal(false);
        setSelectedUser(null);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      name: '',
      password: '',
      role: 'viewer',
      company: '',
      active: true
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      company: user.company,
      active: user.active
    });
    setShowUserModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const managerUsers = users.filter(u => u.role === 'manager').length;

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
              <h2>Gestión de Usuarios</h2>
              <p className="text-muted">Administración completa de usuarios y permisos del sistema</p>
            </div>
            {activeTab === 'users' && (
              <button
                className="btn btn-danger"
                onClick={() => {
                  setEditingUser(null);
                  resetUserForm();
                  setShowUserModal(true);
                }}
              >
                <i className="bi bi-person-plus me-2"></i>
                Crear Usuario
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Usuarios</h6>
              <h3>{totalUsers}</h3>
              <small className="text-muted">{activeUsers} activos</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Administradores</h6>
              <h3 className="text-danger">{adminUsers}</h3>
              <small className="text-muted">acceso completo</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Managers</h6>
              <h3 className="text-warning">{managerUsers}</h3>
              <small className="text-muted">acceso medio</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Viewers</h6>
              <h3 className="text-info">{totalUsers - adminUsers - managerUsers}</h3>
              <small className="text-muted">solo lectura</small>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}
          >
            Usuarios
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('audit'); }}
          >
            Auditoría
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'access' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('access'); }}
          >
            Historial de Accesos
          </a>
        </li>
      </ul>

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Empresa</th>
                    <th>Estado</th>
                    <th>Último acceso</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div>
                            <strong>{user.name}</strong>
                            <br />
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${
                            user.role === 'admin' ? 'danger' :
                            user.role === 'manager' ? 'warning' : 'info'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.company}</td>
                        <td>
                          <span className={`badge bg-${user.active ? 'success' : 'secondary'}`}>
                            {user.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString('es-ES')
                            : 'Nunca'}
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEditModal(user)}
                              title="Editar usuario"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => openPasswordModal(user)}
                              title="Resetear contraseña"
                            >
                              <i className="bi bi-key"></i>
                            </button>
                            <button
                              className={`btn btn-outline-${user.active ? 'secondary' : 'success'}`}
                              onClick={() => handleToggleUserStatus(user._id, user.active)}
                              title={user.active ? 'Desactivar' : 'Activar'}
                            >
                              <i className={`bi bi-${user.active ? 'pause' : 'play'}`}></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                              title="Eliminar usuario"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Auditoría de Acciones (Últimas 100)</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-sm">
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Recurso</th>
                    <th>Detalles</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString('es-ES')}</td>
                        <td>
                          <div>
                            <strong>{log.userId.name}</strong>
                            <br />
                            <small className="text-muted">{log.userId.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${
                            log.action === 'create' ? 'success' :
                            log.action === 'update' ? 'warning' :
                            log.action === 'delete' ? 'danger' : 'info'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td><code>{log.resource}</code></td>
                        <td>{log.details || '-'}</td>
                        <td><small className="text-muted">{log.ipAddress || '-'}</small></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay logs de auditoría disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Historial de Accesos (Últimos 100)</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-sm">
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>IP Address</th>
                    <th>Navegador</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.length > 0 ? (
                    accessLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString('es-ES')}</td>
                        <td><strong>{log.userId.name}</strong></td>
                        <td>
                          <span className={`badge bg-${
                            log.action === 'login' ? 'success' :
                            log.action === 'logout' ? 'secondary' : 'danger'
                          }`}>
                            {log.action === 'login' ? 'Inicio de sesión' :
                             log.action === 'logout' ? 'Cierre de sesión' : 'Intento fallido'}
                          </span>
                        </td>
                        <td><code>{log.ipAddress || '-'}</code></td>
                        <td>
                          <small className="text-muted">
                            {log.userAgent ? log.userAgent.substring(0, 50) + '...' : '-'}
                          </small>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No hay logs de acceso disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="usuario@empresa.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    placeholder={editingUser ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    <option value="viewer">Viewer (Solo lectura)</option>
                    <option value="manager">Manager (Lectura/Escritura)</option>
                    <option value="admin">Admin (Acceso completo)</option>
                  </select>
                  <small className="text-muted">
                    {userForm.role === 'viewer' && 'Acceso de solo lectura'}
                    {userForm.role === 'manager' && 'Puede crear y editar registros'}
                    {userForm.role === 'admin' && 'Acceso completo al sistema'}
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Empresa *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userForm.company}
                    onChange={(e) => setUserForm({...userForm, company: e.target.value})}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={userForm.active}
                    onChange={(e) => setUserForm({...userForm, active: e.target.checked})}
                    id="activeCheck"
                  />
                  <label className="form-check-label" htmlFor="activeCheck">
                    Usuario Activo
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showUserModal && <div className="modal-backdrop show" />}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Resetear Contraseña - {selectedUser.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Está a punto de resetear la contraseña para <strong>{selectedUser.email}</strong>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva Contraseña *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Repetir contraseña"
                  />
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword &&
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <div className="alert alert-danger">
                    Las contraseñas no coinciden
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleResetPassword}
                  disabled={!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                >
                  Resetear Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPasswordModal && <div className="modal-backdrop show" />}
    </div>
  );
};

export default AdminUsers;
