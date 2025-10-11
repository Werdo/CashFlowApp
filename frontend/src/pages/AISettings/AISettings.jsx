import React, { useState, useEffect } from 'react';
import { Bot, Save, Key, Settings as SettingsIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import './AISettings.css';

const AISettings = () => {
  const { success: notifySuccess, error: notifyError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'Eres un asistente financiero experto que ayuda a los usuarios a gestionar su cashflow y tomar decisiones financieras informadas.'
  });

  const models = [
    { value: 'gpt-4', label: 'GPT-4 (Más preciso)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Rápido)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Económico)' }
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/users/ai-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/users/ai-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        notifySuccess('Configuración guardada correctamente');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving AI settings:', error);
      notifyError('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-settings-page">
      {/* Header */}
      <div className="ai-settings-header">
        <div className="ai-settings-header-left">
          <div className="ai-settings-icon-wrapper">
            <Bot size={32} />
          </div>
          <div>
            <h1 className="ai-settings-title">Configuración de IA</h1>
            <p className="ai-settings-subtitle">Personaliza tu asistente financiero</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="ai-settings-content">
        <form onSubmit={handleSave} className="ai-settings-form">
          {/* API Key Section */}
          <div className="ai-settings-section">
            <div className="ai-settings-section-header">
              <Key size={20} />
              <h2 className="ai-settings-section-title">Clave API de OpenAI</h2>
            </div>
            <div className="form-group">
              <label className="form-label">
                API Key
                <span className="form-label-hint">Obtén tu clave en platform.openai.com</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk-..."
                required
              />
            </div>
          </div>

          {/* Model Configuration */}
          <div className="ai-settings-section">
            <div className="ai-settings-section-header">
              <SettingsIcon size={20} />
              <h2 className="ai-settings-section-title">Configuración del Modelo</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Modelo</label>
              <select
                className="form-input"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              >
                {models.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Temperatura ({settings.temperature})
                <span className="form-label-hint">Mayor = más creativo, Menor = más preciso</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              />
              <div className="form-range-labels">
                <span>0 (Preciso)</span>
                <span>1 (Creativo)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Máximo de Tokens
                <span className="form-label-hint">Controla la longitud de las respuestas</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                min="100"
                max="4000"
                step="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Prompt del Sistema
                <span className="form-label-hint">Define el comportamiento del asistente</span>
              </label>
              <textarea
                className="form-textarea"
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                rows={4}
                placeholder="Describe cómo quieres que se comporte el asistente..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="ai-settings-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AISettings;
