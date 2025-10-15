import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, Palette, Upload, X } from 'lucide-react';
import { useThemeConfig } from '../../contexts/ThemeConfigContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './Appearance.css';

const Appearance = () => {
  const { config, updateConfig, resetToDefaults, DEFAULT_CONFIG } = useThemeConfig();
  const { success, error: notifyError } = useNotifications();

  const [localConfig, setLocalConfig] = useState(config);
  const [previewMode, setPreviewMode] = useState(false);
  const [logo, setLogo] = useState(() => localStorage.getItem('app-logo') || null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (field, value) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);

    if (previewMode) {
      updateConfig(newConfig);
    }
  };

  const handleSave = () => {
    updateConfig(localConfig);
    success('Configuración de apariencia guardada');
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar la configuración por defecto?')) {
      resetToDefaults();
      setLocalConfig(DEFAULT_CONFIG);
      success('Configuración restaurada a valores por defecto');
    }
  };

  const togglePreview = () => {
    if (previewMode) {
      updateConfig(config);
    }
    setPreviewMode(!previewMode);
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
      window.dispatchEvent(new Event('storage'));
      success('Logo actualizado correctamente');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setLogo(null);
    setLogoPreview(null);
    localStorage.removeItem('app-logo');
    window.dispatchEvent(new Event('storage'));
    success('Logo eliminado');
  };

  return (
    <div className="appearance-page">
      <div className="appearance-header">
        <div className="appearance-title-section">
          <Palette size={32} className="appearance-icon" />
          <div>
            <h1 className="appearance-title">Configuración de Apariencia</h1>
            <p className="appearance-subtitle">Personaliza los colores y textos de tu aplicación</p>
          </div>
        </div>
        <div className="appearance-actions">
          <button
            className="btn-preview"
            onClick={togglePreview}
            title={previewMode ? 'Desactivar vista previa' : 'Activar vista previa en tiempo real'}
          >
            <Eye size={18} />
            {previewMode ? 'Vista Previa ON' : 'Vista Previa OFF'}
          </button>
        </div>
      </div>

      <div className="appearance-content">
        {/* Colors Section */}
        <div className="appearance-section">
          <h2 className="section-title">Colores</h2>
          <div className="color-grid">
            <div className="color-control">
              <label className="color-label">
                <span className="label-text">Color Primario</span>
                <span className="label-hint">Botones principales, acentos</span>
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={localConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="color-text"
                  placeholder="#6c5dd3"
                />
                <div
                  className="color-preview"
                  style={{ backgroundColor: localConfig.primaryColor }}
                />
              </div>
            </div>

            <div className="color-control">
              <label className="color-label">
                <span className="label-text">Color Secundario</span>
                <span className="label-hint">Elementos secundarios, destacados</span>
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={localConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="color-text"
                  placeholder="#ffa2c0"
                />
                <div
                  className="color-preview"
                  style={{ backgroundColor: localConfig.secondaryColor }}
                />
              </div>
            </div>

            <div className="color-control">
              <label className="color-label">
                <span className="label-text">Color de Fondo</span>
                <span className="label-hint">Fondo principal de la aplicación</span>
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={localConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="color-text"
                  placeholder="#ffffff"
                />
                <div
                  className="color-preview"
                  style={{ backgroundColor: localConfig.backgroundColor }}
                />
              </div>
            </div>

            <div className="color-control">
              <label className="color-label">
                <span className="label-text">Color de Texto</span>
                <span className="label-hint">Texto principal</span>
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={localConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="color-text"
                  placeholder="#323232"
                />
                <div
                  className="color-preview"
                  style={{ backgroundColor: localConfig.textColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="appearance-section">
          <h2 className="section-title">Logo de la Aplicación</h2>
          <div className="logo-section">
            <div className="logo-upload-area">
              {(logo || logoPreview) ? (
                <div className="logo-preview-container">
                  <img
                    src={logoPreview || logo}
                    alt="Logo"
                    className="logo-preview-image"
                  />
                  <button
                    className="logo-remove-btn"
                    onClick={handleLogoRemove}
                    title="Eliminar logo"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="logo-upload-label">
                  <Upload size={32} />
                  <span>Haz clic para subir tu logo</span>
                  <span className="logo-hint">PNG, JPG o SVG (máx. 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="logo-input-hidden"
                  />
                </label>
              )}
            </div>
            <div className="logo-info">
              <h3>Recomendaciones:</h3>
              <ul>
                <li>Tamaño recomendado: 200x60 píxeles</li>
                <li>Fondo transparente (PNG)</li>
                <li>Formato: PNG, JPG o SVG</li>
                <li>Tamaño máximo: 2MB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Text Configuration Section */}
        <div className="appearance-section">
          <h2 className="section-title">Textos</h2>
          <div className="text-controls">
            <div className="form-group">
              <label className="form-label">
                Título de la Aplicación
                <span className="label-hint">Aparece en el header y sidebar</span>
              </label>
              <input
                type="text"
                value={localConfig.appTitle}
                onChange={(e) => handleChange('appTitle', e.target.value)}
                className="form-input"
                placeholder="CashFlow"
                maxLength={50}
              />
              <span className="char-count">{localConfig.appTitle.length}/50</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Subtítulo de la Aplicación
                <span className="label-hint">Texto descriptivo en el dashboard</span>
              </label>
              <input
                type="text"
                value={localConfig.appSubtitle}
                onChange={(e) => handleChange('appSubtitle', e.target.value)}
                className="form-input"
                placeholder="Gestión de Flujo de Caja"
                maxLength={100}
              />
              <span className="char-count">{localConfig.appSubtitle.length}/100</span>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="appearance-section">
          <h2 className="section-title">Vista Previa</h2>
          <div className="preview-container">
            <div className="preview-card" style={{
              backgroundColor: localConfig.backgroundColor,
              color: localConfig.textColor,
              borderLeft: `4px solid ${localConfig.primaryColor}`
            }}>
              <h3 className="preview-title" style={{ color: localConfig.textColor }}>
                {localConfig.appTitle}
              </h3>
              <p className="preview-subtitle" style={{ opacity: 0.7 }}>
                {localConfig.appSubtitle}
              </p>
              <button
                className="preview-button-primary"
                style={{
                  backgroundColor: localConfig.primaryColor,
                  color: '#ffffff'
                }}
              >
                Botón Primario
              </button>
              <button
                className="preview-button-secondary"
                style={{
                  backgroundColor: localConfig.secondaryColor,
                  color: '#ffffff'
                }}
              >
                Botón Secundario
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="appearance-footer">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RefreshCw size={18} />
            Restaurar Valores por Defecto
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
