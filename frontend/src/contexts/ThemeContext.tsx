import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;
}

interface ThemeBackgrounds {
  body: string;
  sidebar: string;
  navbar: string;
  card: string;
}

interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  headingFontFamily: string;
}

interface ThemeSettings {
  colors: ThemeColors;
  backgrounds: ThemeBackgrounds;
  typography: ThemeTypography;
  borderRadius: string;
  boxShadow: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => Promise<void>;
  resetTheme: () => Promise<void>;
  loading: boolean;
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: '#0066CC',
    secondary: '#6C757D',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    light: '#F8F9FA',
    dark: '#343A40'
  },
  backgrounds: {
    body: '#FFFFFF',
    sidebar: '#2C3E50',
    navbar: '#34495E',
    card: '#FFFFFF'
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '14px',
    headingFontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  borderRadius: '0.375rem',
  boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [loading, setLoading] = useState(true);

  // Apply theme to CSS variables
  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;

    // Apply colors
    Object.entries(themeSettings.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      root.style.setProperty(`--bs-${key}`, value);
    });

    // Apply backgrounds
    Object.entries(themeSettings.backgrounds).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family-base', themeSettings.typography.fontFamily);
    root.style.setProperty('--font-size-base', themeSettings.typography.fontSize);
    root.style.setProperty('--font-family-heading', themeSettings.typography.headingFontFamily);

    // Apply other properties
    root.style.setProperty('--border-radius', themeSettings.borderRadius);
    root.style.setProperty('--box-shadow', themeSettings.boxShadow);

    // Apply to body
    document.body.style.backgroundColor = themeSettings.backgrounds.body;
    document.body.style.fontFamily = themeSettings.typography.fontFamily;
    document.body.style.fontSize = themeSettings.typography.fontSize;
  };

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          applyTheme(defaultTheme);
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.data.settings?.themeSettings) {
          const loadedTheme = {
            ...defaultTheme,
            ...response.data.data.settings.themeSettings
          };
          setTheme(loadedTheme);
          applyTheme(loadedTheme);
        } else {
          applyTheme(defaultTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        applyTheme(defaultTheme);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Update theme
  const updateTheme = async (newTheme: Partial<ThemeSettings>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const updatedTheme = {
        ...theme,
        ...newTheme,
        colors: { ...theme.colors, ...(newTheme.colors || {}) },
        backgrounds: { ...theme.backgrounds, ...(newTheme.backgrounds || {}) },
        typography: { ...theme.typography, ...(newTheme.typography || {}) }
      };

      const response = await axios.put(
        '/api/settings/theme',
        { themeSettings: updatedTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  // Reset theme to default
  const resetTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.put(
        '/api/settings/theme',
        { themeSettings: defaultTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { ThemeSettings, ThemeColors, ThemeBackgrounds, ThemeTypography };
