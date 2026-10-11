import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
/* eslint-disable react-refresh/only-export-components */

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeContextValue = { preference: ThemePreference; resolvedTheme: 'light' | 'dark'; setPreference: (value: ThemePreference) => void; };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'career-guidance-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [preference, resolvedTheme]);

  const value = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
