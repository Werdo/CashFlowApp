import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeConfigContext = createContext();

export const useThemeConfig = () => {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error('useThemeConfig must be used within ThemeConfigProvider');
  }
  return context;
};

const DEFAULT_CONFIG = {
  primaryColor: '#6c5dd3',
  secondaryColor: '#ffa2c0',
  backgroundColor: '#ffffff',
  textColor: '#323232',
  appTitle: 'CashFlow',
  appSubtitle: 'Gestión de Flujo de Caja'
};

export const ThemeConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('theme-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    applyThemeConfig(config);
    localStorage.setItem('theme-config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));
  }, [config]);

  const applyThemeConfig = (themeConfig) => {
    const root = document.documentElement;

    root.style.setProperty('--facit-primary', themeConfig.primaryColor);
    root.style.setProperty('--facit-secondary', themeConfig.secondaryColor);
    root.style.setProperty('--facit-body-bg', themeConfig.backgroundColor);
    root.style.setProperty('--facit-text-primary', themeConfig.textColor);

    // Convert hex to RGB for variables that need it
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
    };

    root.style.setProperty('--facit-primary-rgb', hexToRgb(themeConfig.primaryColor));
    root.style.setProperty('--facit-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const value = {
    config,
    updateConfig,
    resetToDefaults,
    DEFAULT_CONFIG
  };

  return (
    <ThemeConfigContext.Provider value={value}>
      {children}
    </ThemeConfigContext.Provider>
  );
};

export default ThemeConfigContext;
