import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeColors {
  primary: string;
  text: string;
  textMuted: string;
  surface: string;
  accentGold: string;
  accentBlue: string;
  accentGreen: string;
  accentRed: string;
  accentOrange: string;
  accentPurple: string;
  sidebarHover: string;
  border: string;
  cardBg: string;
  inputBg: string;
  headerBg: string;
  pageBg: string;
  buttonGradient: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const gradient = 'linear-gradient(90deg, #5B2EFF 0%, #8A2BE2 40%, #FF6A00 100%)';

const getColors = (mode: ThemeMode): ThemeColors =>
  mode === 'light'
    ? {
        primary: '#f7f8fc',
        text: '#111827',
        textMuted: '#4b5563',
        surface: '#ffffff',
        accentGold: '#FFD700',
        accentBlue: '#4169E1',
        accentGreen: '#16a34a',
        accentRed: '#dc2626',
        accentOrange: '#f97316',
        accentPurple: '#7c3aed',
        sidebarHover: 'rgba(91,46,255,0.08)',
        border: 'rgba(17,24,39,0.12)',
        cardBg: '#ffffff',
        inputBg: '#ffffff',
        headerBg: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,251,0.98) 100%)',
        pageBg: 'linear-gradient(180deg, #f7f8fc 0%, #eef2ff 100%)',
        buttonGradient: gradient,
      }
    : {
        primary: '#080321',
        text: '#ffffff',
        textMuted: 'rgba(255,255,255,0.75)',
        surface: '#0f0a2d',
        accentGold: '#FFD700',
        accentBlue: '#4169E1',
        accentGreen: '#32CD32',
        accentRed: '#FF4444',
        accentOrange: '#FFA500',
        accentPurple: '#9370DB',
        sidebarHover: 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.14)',
        cardBg: '#1a123f',
        inputBg: '#120a34',
        headerBg: 'linear-gradient(180deg, rgba(8,3,33,0.98) 0%, rgba(15,10,45,0.98) 100%)',
        pageBg: 'linear-gradient(180deg, #080321 0%, #0d072b 100%)',
        buttonGradient: gradient,
      };

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('vendorThemeMode');
    return saved === 'light' ? 'light' : 'dark';
  });

  const colors = useMemo(() => getColors(mode), [mode]);

  useEffect(() => {
    localStorage.setItem('vendorThemeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.setProperty('--primary-bg', colors.primary);
    document.documentElement.style.setProperty('--primary-text', colors.text);
    document.documentElement.style.setProperty('--text-muted', colors.textMuted);
    document.documentElement.style.setProperty('--border-color', colors.border);
    document.documentElement.style.setProperty('--card-bg', colors.cardBg);
    document.documentElement.style.setProperty('--input-bg', colors.inputBg);
    document.documentElement.style.setProperty('--button-gradient', colors.buttonGradient);
  }, [mode, colors]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme: () => setMode((current) => (current === 'light' ? 'dark' : 'light')),
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
