import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { Appearance } from 'react-native';

import { AppTheme, ThemeMode, darkTheme, lightTheme } from './themes';

export interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = Appearance.getColorScheme();
  const initialMode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo<AppTheme>(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, toggleTheme, setMode }),
    [theme, mode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
