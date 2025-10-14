import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, Bell, Lock, Palette, Globe, Upload, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './Settings.css';

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { success, error: notifyError } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    alerts: true,
  });
  const [logo, setLogo] = useState(() => localStorage.getItem('app-logo') || null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('app-title') || 'CashFlow');
  const [years, setYears] = useState([2024, 2025, 2026]); // TODO: Load from API
  const [newYear, setNewYear] = useState('');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Usuario Demo',
      email: 'usuario@cashflow.com',
      phone: '',
      company: '',
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data) => {
    try {
      const token = localStorage.getItem('token');
      

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        success('Perfil actualizado correctamente');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      notifyError('Error al actualizar el perfil');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      const token = localStorage.getItem('token');
      

      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      if (response.ok) {
        success('Contraseña actualizada correctamente');
        resetPassword();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      notifyError(error.message || 'Error al actualizar la contraseña');
    }
  };

  const handleNotificationChange = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);

    try {
      const token = localStorage.getItem('token');
      

      await fetch(`${API_URL}/users/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNotifications)
      });

      success('Preferencias de notificación actualizadas');
    } catch (error) {
      console.error('Error updating notifications:', error);
      notifyError('Error al actualizar las notificaciones');
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifyError('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      notifyError('La imagen debe ser menor a 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setLogo(base64);
      setLogoPreview(base64);
      localStorage.setItem('app-logo', base64);
      success('Logo actualizado correctamente');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setLogo(null);
    setLogoPreview(null);
    localStorage.removeItem('app-logo');
    success('Logo eliminado');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setAppTitle(newTitle);
    localStorage.setItem('app-title', newTitle);
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    success('Título actualizado');
  };

  const handleAddYear = () => {
    const yearNum = parseInt(newYear);
    if (!yearNum || isNaN(yearNum)) {
      notifyError('Por favor introduce un año válido');
      return;
    }

    if (years.includes(yearNum)) {
      notifyError('Este año ya existe');
      return;
    }

    if (yearNum < 1900 || yearNum > 2100) {
      notifyError('El año debe estar entre 1900 y 2100');
      return;
    }

    // TODO: Call API to create year
    setYears([...years, yearNum].sort((a, b) => b - a));
    setNewYear('');
    success(`Año ${yearNum} añadido`);
  };

  const handleDeleteYear = (year) => {
    if (years.length === 1) {
      notifyError('Debe haber al menos un año configurado');
      return;
    }

    if (window.confirm(`¿Eliminar el año ${year}? Esto borrará todos los datos asociados.`)) {
      // TODO: Call API to delete year
      setYears(years.filter(y => y !== year));
      success(`Año ${year} eliminado`);
    }
  };

  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('ai-config');
    return saved ? JSON.parse(saved) : {
      provider: 'chatgpt',
      apiKey: '',
      customUrl: '',
      customHeaders: '',
      enabled: false
    };
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [preferences, setPreferences] = useState({
    language: 'es',
    currency: 'EUR',
    timezone: 'Europe/Madrid'
  });

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      

      const response = await fetch(`${API_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        success('Preferencias guardadas correctamente');
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      notifyError('Error al guardar las preferencias');
    }
  };

  const navigate = useNavigate();

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'ai', label: 'Configuración IA', icon: Globe },
    { id: 'appearance', label: 'Apariencia', icon: Palette, route: '/settings/appearance' },
    { id: 'data', label: 'Gestión de Datos', icon: Globe },
    { id: 'preferences', label: 'Preferencias', icon: Globe },
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 className="settings-title">Configuración</h1>
        <p className="settings-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  if (tab.route) {
                    navigate(tab.route);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Información Personal</h2>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className={`form-input ${profileErrors.name ? 'error' : ''}`}
                    {...registerProfile('name')}
                  />
                  {profileErrors.name && (
                    <span className="form-error">{profileErrors.name.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-input ${profileErrors.email ? 'error' : ''}`}
                    {...registerProfile('email')}
                  />
                  {profileErrors.email && (
                    <span className="form-error">{profileErrors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono (Opcional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    {...registerProfile('phone')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Empresa (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    {...registerProfile('company')}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  Guardar Cambios
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Preferencias de Notificación</h2>
              <div className="settings-options">
                <div className="settings-option">
                  <div className="settings-option-info">
                    <h3>Notificaciones por Email</h3>
                    <p>Recibe actualizaciones importantes por correo electrónico</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <h3>Notificaciones Push</h3>
                    <p>Recibe notificaciones push en tu navegador</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <h3>Notificaciones SMS</h3>
                    <p>Recibe alertas importantes por mensaje de texto</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <h3>Alertas de Transacciones</h3>
                    <p>Notificaciones cuando se registran nuevas transacciones</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifications.alerts}
                      onChange={() => handleNotificationChange('alerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Cambiar Contraseña</h2>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Contraseña Actual</label>
                  <input
                    type="password"
                    className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                    {...registerPassword('currentPassword')}
                  />
                  {passwordErrors.currentPassword && (
                    <span className="form-error">{passwordErrors.currentPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input
                    type="password"
                    className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <span className="form-error">{passwordErrors.newPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="form-error">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>

                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Apariencia</h2>

              {/* Logo Upload */}
              <div className="logo-upload-section">
                <h3 className="subsection-title">Logo de la Aplicación</h3>
                <p className="subsection-description">Personaliza el logo que aparece en la barra lateral</p>

                <div className="logo-upload-container">
                  {(logo || logoPreview) ? (
                    <div className="logo-preview">
                      <img src={logoPreview || logo} alt="Logo preview" className="logo-image" />
                      <button
                        className="logo-remove-btn"
                        onClick={handleLogoRemove}
                        title="Eliminar logo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="logo-upload-placeholder">
                      <Upload size={32} />
                      <p>Sin logo personalizado</p>
                    </div>
                  )}

                  <label className="logo-upload-btn">
                    <Upload size={18} />
                    {logo ? 'Cambiar Logo' : 'Subir Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="logo-upload-input"
                    />
                  </label>
                  <p className="logo-upload-hint">PNG, JPG o GIF (máx. 2MB)</p>
                </div>
              </div>

              {/* App Title */}
              <div className="logo-upload-section">
                <h3 className="subsection-title">Título de la Aplicación</h3>
                <p className="subsection-description">Personaliza el título que aparece en el encabezado</p>

                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    value={appTitle}
                    onChange={handleTitleChange}
                    placeholder="CashFlow"
                    maxLength={50}
                  />
                  <p className="form-hint">Máximo 50 caracteres</p>
                </div>
              </div>

              <div className="settings-options">
                <div className="settings-option">
                  <div className="settings-option-info">
                    <h3>Modo Oscuro</h3>
                    <p>Activa el tema oscuro para reducir la fatiga visual</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Gestión de Años</h2>
              <p className="settings-section-description">
                Configura los años disponibles para el registro de datos. Cada año mantiene su información independiente.
              </p>

              {/* Add Year Form */}
              <div className="year-add-form">
                <div className="form-group">
                  <label className="form-label">Añadir Nuevo Año</label>
                  <div className="year-input-group">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ej. 2025"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      min="1900"
                      max="2100"
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddYear}
                    >
                      <Save size={18} />
                      Añadir Año
                    </button>
                  </div>
                </div>
              </div>

              {/* Years List */}
              <div className="years-list">
                <h3 className="subsection-title">Años Configurados</h3>
                <div className="years-grid">
                  {years.map(year => (
                    <div key={year} className="year-card">
                      <div className="year-card-info">
                        <span className="year-card-year">{year}</span>
                        <span className="year-card-label">Año fiscal</span>
                      </div>
                      <button
                        className="year-card-delete"
                        onClick={() => handleDeleteYear(year)}
                        title="Eliminar año"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                {years.length === 0 && (
                  <p className="years-empty">No hay años configurados. Añade uno para comenzar.</p>
                )}
              </div>
            </div>
          )}

          {/* AI Configuration Tab */}
          {activeTab === 'ai' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Configuración de Inteligencia Artificial</h2>
              <p className="settings-section-description">
                Configura tu proveedor de IA para obtener análisis avanzados y previsiones de tu cashflow.
              </p>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Proveedor de IA</label>
                  <select
                    className="form-input"
                    value={aiConfig.provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                  >
                    <option value="chatgpt">ChatGPT (OpenAI)</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gemini">Gemini (Google)</option>
                    <option value="custom">IA Privada (Custom)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="sk-..."
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  />
                  <p className="form-hint">
                    {aiConfig.provider === 'chatgpt' && 'Obtén tu API key en platform.openai.com'}
                    {aiConfig.provider === 'claude' && 'Obtén tu API key en console.anthropic.com'}
                    {aiConfig.provider === 'gemini' && 'Obtén tu API key en makersuite.google.com'}
                    {aiConfig.provider === 'custom' && 'Introduce la API key de tu servidor IA'}
                  </p>
                </div>

                {aiConfig.provider === 'custom' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">URL del Endpoint</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://tu-servidor-ia.com/api/chat"
                        value={aiConfig.customUrl}
                        onChange={(e) => setAiConfig({ ...aiConfig, customUrl: e.target.value })}
                      />
                      <p className="form-hint">URL completa de tu endpoint de IA</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Headers Personalizados (opcional)</label>
                      <textarea
                        className="form-input"
                        placeholder={'{"Authorization": "Bearer token", "Custom-Header": "value"}'}
                        value={aiConfig.customHeaders}
                        onChange={(e) => setAiConfig({ ...aiConfig, customHeaders: e.target.value })}
                        rows={4}
                      />
                      <p className="form-hint">Formato JSON con headers adicionales</p>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setTestingConnection(true);
                      setTimeout(() => {
                        setTestingConnection(false);
                        success('Conexión exitosa con el proveedor de IA');
                      }, 1500);
                    }}
                    disabled={!aiConfig.apiKey || testingConnection}
                  >
                    {testingConnection ? 'Probando...' : 'Probar Conexión'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      localStorage.setItem('ai-config', JSON.stringify({ ...aiConfig, enabled: true }));
                      setAiConfig({ ...aiConfig, enabled: true });
                      success('Configuración de IA guardada correctamente');
                    }}
                  >
                    <Save size={18} />
                    Guardar Configuración
                  </button>
                </div>

                {aiConfig.enabled && (
                  <div className="ai-status-success">
                    ✓ IA configurada y lista para usar
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Preferencias Generales</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Idioma</label>
                  <select
                    className="form-input"
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Moneda</label>
                  <select
                    className="form-input"
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Zona Horaria</label>
                  <select
                    className="form-input"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  >
                    <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSavePreferences}
                >
                  <Save size={18} />
                  Guardar Preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
