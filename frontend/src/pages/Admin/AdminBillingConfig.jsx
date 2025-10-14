import React, { useState, useEffect } from 'react';
import { Settings, Save, TestTube, Eye, EyeOff, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';

const AdminBillingConfig = () => {
  const { success, error: notifyError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [showSecrets, setShowSecrets] = useState({});
  const [editingConfig, setEditingConfig] = useState({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/billing/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
        // Initialize editing state
        const initialEdit = {};
        data.forEach(cfg => {
          initialEdit[cfg.provider] = { ...cfg };
        });
        setEditingConfig(initialEdit);
      } else {
        notifyError('Error al cargar configuración');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      notifyError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (provider) => {
    try {
      const token = localStorage.getItem('token');
      const configData = editingConfig[provider];

      const response = await fetch(`${API_URL}/admin/billing/config/${provider}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isEnabled: configData.isEnabled,
          config: configData.config
        })
      });

      if (response.ok) {
        success(`Configuración de ${provider} actualizada`);
        fetchConfigs();
      } else {
        notifyError('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      notifyError('Error al guardar configuración');
    }
  };

  const handleTestConnection = async (provider) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/billing/config/${provider}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        success(`${provider}: ${result.message}`);
      } else {
        notifyError('Error al probar conexión');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      notifyError('Error al probar conexión');
    }
  };

  const updateConfig = (provider, field, value) => {
    setEditingConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        config: {
          ...prev[provider].config,
          [field]: value
        }
      }
    }));
  };

  const toggleEnabled = (provider) => {
    setEditingConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        isEnabled: !prev[provider].isEnabled
      }
    }));
  };

  if (loading) {
    return <div className="loading-state">Cargando configuración...</div>;
  }

  return (
    <div className="billing-config-section">
      <h2 className="section-title">
        <Settings size={24} />
        Configuración de Proveedores de Pago
      </h2>

      {/* Stripe Configuration */}
      {editingConfig.stripe && (
        <div className="config-card">
          <div className="config-card-header">
            <div className="config-title">
              <CreditCard size={24} />
              <h3>Stripe</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={editingConfig.stripe.isEnabled}
                  onChange={() => toggleEnabled('stripe')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {editingConfig.stripe.isEnabled && (
              <span className="config-status-active">Activo</span>
            )}
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>Publishable Key</label>
              <div className="input-with-toggle">
                <input
                  type={showSecrets.stripePublic ? 'text' : 'password'}
                  value={editingConfig.stripe.config.publishableKey || ''}
                  onChange={(e) => updateConfig('stripe', 'publishableKey', e.target.value)}
                  placeholder="pk_test_..."
                />
                <button
                  type="button"
                  className="btn-toggle-secret"
                  onClick={() => setShowSecrets(prev => ({ ...prev, stripePublic: !prev.stripePublic }))}
                >
                  {showSecrets.stripePublic ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Secret Key</label>
              <div className="input-with-toggle">
                <input
                  type={showSecrets.stripeSecret ? 'text' : 'password'}
                  value={editingConfig.stripe.config.secretKey || ''}
                  onChange={(e) => updateConfig('stripe', 'secretKey', e.target.value)}
                  placeholder="sk_test_..."
                />
                <button
                  type="button"
                  className="btn-toggle-secret"
                  onClick={() => setShowSecrets(prev => ({ ...prev, stripeSecret: !prev.stripeSecret }))}
                >
                  {showSecrets.stripeSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Webhook Secret</label>
              <div className="input-with-toggle">
                <input
                  type={showSecrets.stripeWebhook ? 'text' : 'password'}
                  value={editingConfig.stripe.config.webhookSecret || ''}
                  onChange={(e) => updateConfig('stripe', 'webhookSecret', e.target.value)}
                  placeholder="whsec_..."
                />
                <button
                  type="button"
                  className="btn-toggle-secret"
                  onClick={() => setShowSecrets(prev => ({ ...prev, stripeWebhook: !prev.stripeWebhook }))}
                >
                  {showSecrets.stripeWebhook ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="config-actions">
              <button className="btn-secondary" onClick={() => handleTestConnection('stripe')}>
                <TestTube size={18} />
                Probar Conexión
              </button>
              <button className="btn-primary" onClick={() => handleSaveConfig('stripe')}>
                <Save size={18} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revolut Configuration */}
      {editingConfig.revolut && (
        <div className="config-card">
          <div className="config-card-header">
            <div className="config-title">
              <CreditCard size={24} />
              <h3>Revolut</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={editingConfig.revolut.isEnabled}
                  onChange={() => toggleEnabled('revolut')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {editingConfig.revolut.isEnabled && (
              <span className="config-status-active">Activo</span>
            )}
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-toggle">
                <input
                  type={showSecrets.revolutApi ? 'text' : 'password'}
                  value={editingConfig.revolut.config.apiKey || ''}
                  onChange={(e) => updateConfig('revolut', 'apiKey', e.target.value)}
                  placeholder="rev_api_..."
                />
                <button
                  type="button"
                  className="btn-toggle-secret"
                  onClick={() => setShowSecrets(prev => ({ ...prev, revolutApi: !prev.revolutApi }))}
                >
                  {showSecrets.revolutApi ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Merchant Public Key</label>
              <input
                type="text"
                value={editingConfig.revolut.config.merchantPublicKey || ''}
                onChange={(e) => updateConfig('revolut', 'merchantPublicKey', e.target.value)}
                placeholder="pk_..."
              />
            </div>

            <div className="form-group">
              <label>Webhook Secret</label>
              <div className="input-with-toggle">
                <input
                  type={showSecrets.revolutWebhook ? 'text' : 'password'}
                  value={editingConfig.revolut.config.webhookSecret || ''}
                  onChange={(e) => updateConfig('revolut', 'webhookSecret', e.target.value)}
                  placeholder="whsec_..."
                />
                <button
                  type="button"
                  className="btn-toggle-secret"
                  onClick={() => setShowSecrets(prev => ({ ...prev, revolutWebhook: !prev.revolutWebhook }))}
                >
                  {showSecrets.revolutWebhook ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editingConfig.revolut.config.sandboxMode || false}
                  onChange={(e) => updateConfig('revolut', 'sandboxMode', e.target.checked)}
                />
                <span>Modo Sandbox (Pruebas)</span>
              </label>
            </div>

            <div className="config-actions">
              <button className="btn-secondary" onClick={() => handleTestConnection('revolut')}>
                <TestTube size={18} />
                Probar Conexión
              </button>
              <button className="btn-primary" onClick={() => handleSaveConfig('revolut')}>
                <Save size={18} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Configuration */}
      {editingConfig.system && (
        <div className="config-card">
          <div className="config-card-header">
            <div className="config-title">
              <Settings size={24} />
              <h3>Configuración del Sistema</h3>
            </div>
          </div>

          <div className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label>Días de Prueba</label>
                <input
                  type="number"
                  value={editingConfig.system.config.trialDays || 30}
                  onChange={(e) => updateConfig('system', 'trialDays', parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Días de Gracia (Impago)</label>
                <input
                  type="number"
                  value={editingConfig.system.config.gracePeriodDays || 90}
                  onChange={(e) => updateConfig('system', 'gracePeriodDays', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Mensual</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.system.config.monthlyPrice || 9.99}
                  onChange={(e) => updateConfig('system', 'monthlyPrice', parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Precio Anual</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.system.config.yearlyPrice || 99.99}
                  onChange={(e) => updateConfig('system', 'yearlyPrice', parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Moneda</label>
                <select
                  value={editingConfig.system.config.currency || 'EUR'}
                  onChange={(e) => updateConfig('system', 'currency', e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="config-actions">
              <button className="btn-primary" onClick={() => handleSaveConfig('system')}>
                <Save size={18} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBillingConfig;
