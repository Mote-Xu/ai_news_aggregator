import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

// ── 调色板 ────────────────────────────────────────────
export const LightColors = {
  bg: '#F5F6FA',
  card: '#FFFFFF',
  headerBg: '#FFFFFF',
  headerBorder: '#E0E0E0',
  title: '#1A1A1A',
  subtitle: '#999999',
  meta: '#888888',
  metaDot: '#CCCCCC',
  summary: '#555555',
  accent: '#4A90D9',
  errorTitle: '#333333',
  errorDetail: '#888888',
  separator: '#E0E0E0',
  modalOverlay: 'rgba(0,0,0,0.5)',
  modalBg: '#FFFFFF',
  modalTitle: '#1A1A1A',
  modalMeta: '#888888',
  modalSummary: '#333333',
  modalClose: '#4A90D9',
  shadowColor: '#000000',
  statusBar: 'dark' as const,
} as const;

export const DarkColors: ThemeColors = {
  bg: '#0D1117',
  card: '#161B22',
  headerBg: '#161B22',
  headerBorder: '#30363D',
  title: '#E6EDF3',
  subtitle: '#8B949E',
  meta: '#8B949E',
  metaDot: '#484F58',
  summary: '#8B949E',
  accent: '#58A6FF',
  errorTitle: '#E6EDF3',
  errorDetail: '#8B949E',
  separator: '#30363D',
  modalOverlay: 'rgba(0,0,0,0.7)',
  modalBg: '#161B22',
  modalTitle: '#E6EDF3',
  modalMeta: '#8B949E',
  modalSummary: '#C9D1D9',
  modalClose: '#58A6FF',
  shadowColor: '#000000',
  statusBar: 'light' as const,
};

export type ThemeColors = Record<keyof typeof LightColors, string> & {
  statusBar: 'dark' | 'light';
};

// ── Context ───────────────────────────────────────────
interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
