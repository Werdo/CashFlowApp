import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './AdminSecurity.css';

const AdminSecurity = () => {
  const { success, error: notifyError } = useNotifications();
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    twoFactorEnabled: false
  });

  const [loginAttempts, setLoginAttempts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch security settings
      const settingsResponse = await fetch(`${API_URL}/admin/security/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setSecuritySettings(settings);
      }

      // Fetch login attempts
      const attemptsResponse = await fetch(`${API_URL}/admin/security/login-attempts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (attemptsResponse.ok) {
        const attempts = await attemptsResponse.json();
        setLoginAttempts(attempts);
      }

      // Fetch active sessions
      const sessionsResponse = await fetch(`${API_URL}/admin/security/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json();
        setActiveSessions(sessions);
      }

    } catch (error) {
      console.error('Error fetching security data:', error);
      notifyError('Error al cargar datos de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/security/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(securitySettings)
      });

      if (response.ok) {
        success('Configuración de seguridad actualizada');
      } else {
        notifyError('Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      notifyError('Error al actualizar configuración');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('¿Estás seguro de revocar esta sesión?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        success('Sesión revocada');
        fetchSecurityData();
      } else {
        notifyError('Error al revocar sesión');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      notifyError('Error al revocar sesión');
    }
  };

  if (loading) {
    return (
      <div className="admin-security-page">
        <div className="loading-state">Cargando configuración de seguridad...</div>
      </div>
    );
  }

  return (
    <div className="admin-security-page">
      {/* Header */}
      <div className="admin-security-header">
        <div className="admin-security-title-section">
          <div className="admin-security-icon-wrapper">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="admin-security-title">Security Management</h1>
            <p className="admin-security-subtitle">Configure security settings and monitor access</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="security-settings-card">
        <h2 className="section-title">
          <Lock size={24} />
          Configuración de Seguridad
        </h2>

        <div className="settings-grid">
          <div className="setting-item">
            <label className="setting-label">
              <Key size={18} />
              Tiempo de sesión (segundos)
            </label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({
                ...securitySettings,
                sessionTimeout: parseInt(e.target.value)
              })}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <AlertTriangle size={18} />
              Intentos máximos de login
            </label>
            <input
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => setSecuritySettings({
                ...securitySettings,
                maxLoginAttempts: parseInt(e.target.value)
              })}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <Lock size={18} />
              Longitud mínima de contraseña
            </label>
            <input
              type="number"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings({
                ...securitySettings,
                passwordMinLength: parseInt(e.target.value)
              })}
              className="setting-input"
            />
          </div>

          <div className="setting-item setting-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={securitySettings.requireSpecialChars}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  requireSpecialChars: e.target.checked
                })}
              />
              <span>Requerir caracteres especiales</span>
            </label>
          </div>

          <div className="setting-item setting-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={securitySettings.requireNumbers}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  requireNumbers: e.target.checked
                })}
              />
              <span>Requerir números</span>
            </label>
          </div>

          <div className="setting-item setting-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={securitySettings.requireUppercase}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  requireUppercase: e.target.checked
                })}
              />
              <span>Requerir mayúsculas</span>
            </label>
          </div>

          <div className="setting-item setting-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  twoFactorEnabled: e.target.checked
                })}
              />
              <span>Autenticación de dos factores (2FA)</span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSaveSettings}>
            <CheckCircle size={20} />
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="sessions-section">
        <h2 className="section-title">
          <Eye size={24} />
          Sesiones Activas ({activeSessions.length})
        </h2>

        {activeSessions.length === 0 ? (
          <div className="empty-state">
            <Eye size={48} />
            <p>No hay sesiones activas</p>
          </div>
        ) : (
          <div className="sessions-list">
            {activeSessions.map((session, index) => (
              <div key={index} className="session-card">
                <div className="session-info">
                  <div className="session-user">
                    <strong>{session.userName || 'Usuario'}</strong>
                    <span className="session-email">{session.email || '---'}</span>
                  </div>
                  <div className="session-details">
                    <span>IP: {session.ip || '---'}</span>
                    <span>Inicio: {session.startTime || '---'}</span>
                  </div>
                </div>
                <button
                  className="btn-revoke"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  <XCircle size={18} />
                  Revocar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Login Attempts */}
      <div className="attempts-section">
        <h2 className="section-title">
          <AlertTriangle size={24} />
          Intentos de Login Recientes
        </h2>

        {loginAttempts.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} />
            <p>No hay intentos de login fallidos recientes</p>
          </div>
        ) : (
          <div className="attempts-list">
            {loginAttempts.slice(0, 10).map((attempt, index) => (
              <div key={index} className={`attempt-card ${attempt.success ? 'success' : 'failed'}`}>
                <div className="attempt-icon">
                  {attempt.success ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
                <div className="attempt-info">
                  <div className="attempt-email">{attempt.email || '---'}</div>
                  <div className="attempt-details">
                    <span>IP: {attempt.ip || '---'}</span>
                    <span>{attempt.timestamp || '---'}</span>
                  </div>
                </div>
                <div className={`attempt-status ${attempt.success ? 'success' : 'failed'}`}>
                  {attempt.success ? 'Exitoso' : 'Fallido'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSecurity;
