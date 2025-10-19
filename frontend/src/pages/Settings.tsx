import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import ColorPicker from '../components/settings/ColorPicker';
import { useDropzone } from 'react-dropzone';

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

interface CompanySettings {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

interface SystemSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    expiryAlerts: boolean;
    lowStockAlerts: boolean;
  };
}

interface IntegrationSettings {
  ai: {
    enabled: boolean;
    defaultProvider: 'openai' | 'anthropic' | 'local';
    apiKeys: {
      openai?: string;
      anthropic?: string;
    };
  };
  email: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
  };
  storage: {
    provider: 'local' | 's3' | 'azure';
    bucket?: string;
    region?: string;
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'theme' | 'company' | 'system' | 'integrations'>('users');
  const { theme, updateTheme, resetTheme } = useTheme();

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'viewer',
    company: '',
    active: true
  });

  // Company state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: ''
  });

  // System state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'es',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    notifications: {
      email: true,
      browser: true,
      expiryAlerts: true,
      lowStockAlerts: true
    }
  });

  // Integration state
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    ai: {
      enabled: false,
      defaultProvider: 'openai',
      apiKeys: {}
    },
    email: {
      enabled: false,
      provider: 'sendgrid'
    },
    storage: {
      provider: 'local'
    }
  });

  const [savingTheme, setSavingTheme] = useState(false);

  const token = localStorage.getItem('token');
  const currentUserRole = localStorage.getItem('userRole') || 'viewer';

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const settings = response.data.data.settings;
        if (settings.companySettings) {
          // Map logo.url to logo for UI compatibility
          const company = {
            ...settings.companySettings,
            logo: settings.companySettings.logo?.url || settings.companySettings.logo
          };
          setCompanySettings(company);
        }
        if (settings.systemSettings) {
          setSystemSettings(settings.systemSettings);
        }
        if (settings.integrationSettings) {
          setIntegrationSettings(settings.integrationSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuración');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  // User management functions
  const handleCreateUser = async () => {
    try {
      const response = await axios.post('/api/auth/register', userForm, {
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
        `/api/auth/users/${editingUser._id}`,
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
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      const response = await axios.delete(`/api/auth/users/${userId}`, {
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

  // Theme functions
  const handleThemeColorChange = (colorKey: keyof typeof theme.colors, value: string) => {
    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    };
    updateTheme(newTheme);
  };

  const handleThemeBackgroundChange = (bgKey: keyof typeof theme.backgrounds, value: string) => {
    const newTheme = {
      ...theme,
      backgrounds: {
        ...theme.backgrounds,
        [bgKey]: value
      }
    };
    updateTheme(newTheme);
  };

  const handleResetTheme = async () => {
    if (!window.confirm('¿Restablecer el tema a los valores predeterminados?')) return;

    try {
      setSavingTheme(true);
      await resetTheme();
      toast.success('Tema restablecido correctamente');
    } catch (error) {
      toast.error('Error al restablecer el tema');
    } finally {
      setSavingTheme(false);
    }
  };

  // Company functions
  const handleSaveCompanySettings = async () => {
    try {
      const response = await axios.put(
        '/api/settings/company',
        { companySettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Configuración de empresa guardada');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    }
  };

  // System functions
  const handleSaveSystemSettings = async () => {
    try {
      const response = await axios.put(
        '/api/settings/system',
        { systemSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Configuración del sistema guardada');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    }
  };

  // Integration functions
  const handleSaveIntegrationSettings = async () => {
    try {
      const response = await axios.put(
        '/api/settings/integrations',
        { integrationSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Configuración de integraciones guardada');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    }
  };

  // Logo upload
  const onLogoDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axios.post('/api/settings/logo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setCompanySettings({
          ...companySettings,
          logo: response.data.data.logoUrl
        });
        toast.success('Logo subido exitosamente');
        loadSettings(); // Reload settings to get the updated logo URL
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al subir logo';
      toast.error(errorMsg);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  });

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">Configuración</h1>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Usuarios
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveTab('theme')}
              >
                Tema
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                Empresa
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'system' ? 'active' : ''}`}
                onClick={() => setActiveTab('system')}
              >
                Sistema
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'integrations' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrations')}
              >
                Integraciones
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="card">
            <div className="card-body">
              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Gestión de Usuarios</h5>
                    {isAdmin && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setEditingUser(null);
                          resetUserForm();
                          setShowUserModal(true);
                        }}
                      >
                        Crear Usuario
                      </button>
                    )}
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Empresa</th>
                          <th>Estado</th>
                          <th>Último acceso</th>
                          {isAdmin && <th>Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
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
                                ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                                : 'Nunca'}
                            </td>
                            {isAdmin && (
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => openEditModal(user)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* THEME TAB */}
              {activeTab === 'theme' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5>Personalización del Tema</h5>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleResetTheme}
                      disabled={savingTheme}
                    >
                      Restablecer Tema
                    </button>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-3">Colores Principales</h6>
                      <ColorPicker
                        label="Color Primario"
                        color={theme.colors.primary}
                        onChange={(color) => handleThemeColorChange('primary', color)}
                      />
                      <ColorPicker
                        label="Color Secundario"
                        color={theme.colors.secondary}
                        onChange={(color) => handleThemeColorChange('secondary', color)}
                      />
                      <ColorPicker
                        label="Color de Éxito"
                        color={theme.colors.success}
                        onChange={(color) => handleThemeColorChange('success', color)}
                      />
                      <ColorPicker
                        label="Color de Peligro"
                        color={theme.colors.danger}
                        onChange={(color) => handleThemeColorChange('danger', color)}
                      />
                      <ColorPicker
                        label="Color de Advertencia"
                        color={theme.colors.warning}
                        onChange={(color) => handleThemeColorChange('warning', color)}
                      />
                      <ColorPicker
                        label="Color de Información"
                        color={theme.colors.info}
                        onChange={(color) => handleThemeColorChange('info', color)}
                      />
                    </div>

                    <div className="col-md-6">
                      <h6 className="mb-3">Colores de Fondo</h6>
                      <ColorPicker
                        label="Fondo del Cuerpo"
                        color={theme.backgrounds.body}
                        onChange={(color) => handleThemeBackgroundChange('body', color)}
                      />
                      <ColorPicker
                        label="Fondo del Sidebar"
                        color={theme.backgrounds.sidebar}
                        onChange={(color) => handleThemeBackgroundChange('sidebar', color)}
                      />
                      <ColorPicker
                        label="Fondo del Navbar"
                        color={theme.backgrounds.navbar}
                        onChange={(color) => handleThemeBackgroundChange('navbar', color)}
                      />
                      <ColorPicker
                        label="Fondo de Tarjetas"
                        color={theme.backgrounds.card}
                        onChange={(color) => handleThemeBackgroundChange('card', color)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COMPANY TAB */}
              {activeTab === 'company' && (
                <div>
                  <h5 className="mb-4">Información de la Empresa</h5>

                  <div className="mb-4">
                    <label className="form-label">Logo de la Empresa</label>
                    <div
                      {...getRootProps()}
                      className={`border border-2 border-dashed rounded p-4 text-center ${
                        isDragActive ? 'border-primary bg-light' : 'border-secondary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input {...getInputProps()} />
                      {companySettings.logo ? (
                        <img
                          src={companySettings.logo}
                          alt="Logo"
                          style={{ maxWidth: '200px', maxHeight: '100px' }}
                        />
                      ) : (
                        <p className="mb-0">
                          Arrastra el logo aquí o haz clic para seleccionar
                          <br />
                          <small className="text-muted">PNG, JPG, SVG (máx. 5MB)</small>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre de la Empresa</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">NIF/CIF</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.taxId || ''}
                        onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.address || ''}
                        onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.phone || ''}
                        onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={companySettings.email || ''}
                        onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Sitio Web</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.website || ''}
                        onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <button className="btn btn-primary mt-3" onClick={handleSaveCompanySettings}>
                      Guardar Cambios
                    </button>
                  )}
                </div>
              )}

              {/* SYSTEM TAB */}
              {activeTab === 'system' && (
                <div>
                  <h5 className="mb-4">Configuración del Sistema</h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Idioma</label>
                      <select
                        className="form-select"
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Zona Horaria</label>
                      <select
                        className="form-select"
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                      >
                        <option value="Europe/Madrid">Europa/Madrid</option>
                        <option value="Europe/London">Europa/Londres</option>
                        <option value="America/New_York">América/Nueva York</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Formato de Fecha</label>
                      <select
                        className="form-select"
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Moneda</label>
                      <select
                        className="form-select"
                        value={systemSettings.currency}
                        onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <h6 className="mt-4 mb-3">Notificaciones</h6>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={systemSettings.notifications.email}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        notifications: {...systemSettings.notifications, email: e.target.checked}
                      })}
                    />
                    <label className="form-check-label">Notificaciones por Email</label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={systemSettings.notifications.browser}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        notifications: {...systemSettings.notifications, browser: e.target.checked}
                      })}
                    />
                    <label className="form-check-label">Notificaciones del Navegador</label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={systemSettings.notifications.expiryAlerts}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        notifications: {...systemSettings.notifications, expiryAlerts: e.target.checked}
                      })}
                    />
                    <label className="form-check-label">Alertas de Vencimiento</label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={systemSettings.notifications.lowStockAlerts}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        notifications: {...systemSettings.notifications, lowStockAlerts: e.target.checked}
                      })}
                    />
                    <label className="form-check-label">Alertas de Stock Bajo</label>
                  </div>

                  <button className="btn btn-primary mt-3" onClick={handleSaveSystemSettings}>
                    Guardar Cambios
                  </button>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div>
                  <h5 className="mb-4">Integraciones y APIs</h5>

                  {/* AI Integration */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="card-title">Integración de IA</h6>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={integrationSettings.ai.enabled}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            ai: {...integrationSettings.ai, enabled: e.target.checked}
                          })}
                          disabled={!isAdmin}
                        />
                        <label className="form-check-label">Habilitar consultas IA</label>
                      </div>

                      {integrationSettings.ai.enabled && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Proveedor Predeterminado</label>
                            <select
                              className="form-select"
                              value={integrationSettings.ai.defaultProvider}
                              onChange={(e) => setIntegrationSettings({
                                ...integrationSettings,
                                ai: {...integrationSettings.ai, defaultProvider: e.target.value as any}
                              })}
                              disabled={!isAdmin}
                            >
                              <option value="openai">OpenAI</option>
                              <option value="anthropic">Anthropic (Claude)</option>
                              <option value="local">Modelo Local</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">API Key de OpenAI</label>
                            <input
                              type="password"
                              className="form-control"
                              value={integrationSettings.ai.apiKeys.openai || ''}
                              onChange={(e) => setIntegrationSettings({
                                ...integrationSettings,
                                ai: {
                                  ...integrationSettings.ai,
                                  apiKeys: {...integrationSettings.ai.apiKeys, openai: e.target.value}
                                }
                              })}
                              disabled={!isAdmin}
                              placeholder="sk-..."
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">API Key de Anthropic</label>
                            <input
                              type="password"
                              className="form-control"
                              value={integrationSettings.ai.apiKeys.anthropic || ''}
                              onChange={(e) => setIntegrationSettings({
                                ...integrationSettings,
                                ai: {
                                  ...integrationSettings.ai,
                                  apiKeys: {...integrationSettings.ai.apiKeys, anthropic: e.target.value}
                                }
                              })}
                              disabled={!isAdmin}
                              placeholder="sk-ant-..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email Integration */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="card-title">Integración de Email</h6>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={integrationSettings.email.enabled}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            email: {...integrationSettings.email, enabled: e.target.checked}
                          })}
                          disabled={!isAdmin}
                        />
                        <label className="form-check-label">Habilitar envío de emails</label>
                      </div>

                      {integrationSettings.email.enabled && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Proveedor de Email</label>
                            <select
                              className="form-select"
                              value={integrationSettings.email.provider}
                              onChange={(e) => setIntegrationSettings({
                                ...integrationSettings,
                                email: {...integrationSettings.email, provider: e.target.value}
                              })}
                              disabled={!isAdmin}
                            >
                              <option value="sendgrid">SendGrid</option>
                              <option value="mailgun">Mailgun</option>
                              <option value="smtp">SMTP</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">API Key</label>
                            <input
                              type="password"
                              className="form-control"
                              value={integrationSettings.email.apiKey || ''}
                              onChange={(e) => setIntegrationSettings({
                                ...integrationSettings,
                                email: {...integrationSettings.email, apiKey: e.target.value}
                              })}
                              disabled={!isAdmin}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Storage Integration */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="card-title">Almacenamiento de Archivos</h6>
                      <div className="mb-3">
                        <label className="form-label">Proveedor de Almacenamiento</label>
                        <select
                          className="form-select"
                          value={integrationSettings.storage.provider}
                          onChange={(e) => setIntegrationSettings({
                            ...integrationSettings,
                            storage: {...integrationSettings.storage, provider: e.target.value as any}
                          })}
                          disabled={!isAdmin}
                        >
                          <option value="local">Local</option>
                          <option value="s3">Amazon S3</option>
                          <option value="azure">Azure Blob Storage</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button className="btn btn-primary" onClick={handleSaveIntegrationSettings}>
                      Guardar Cambios
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
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
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Empresa</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userForm.company}
                    onChange={(e) => setUserForm({...userForm, company: e.target.value})}
                  />
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={userForm.active}
                    onChange={(e) => setUserForm({...userForm, active: e.target.checked})}
                  />
                  <label className="form-check-label">Usuario Activo</label>
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
                  className="btn btn-primary"
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
    </div>
  );
};

export default Settings;
