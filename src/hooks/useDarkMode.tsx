import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    return stored === 'true';
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    // Keep Tailwind `dark:` variants in sync everywhere
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const value = useMemo(() => ({
    darkMode,
    toggleDarkMode: () => setDarkMode(prev => !prev),
  }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default function useDarkMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return ctx;
}
