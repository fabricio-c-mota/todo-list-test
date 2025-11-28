export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  input: string;
  primary: string;
  primaryContrast: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  fabBackground: string;
  fabIcon: string;
  checkboxBorder: string;
  shadow: string;
}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
}

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#0F172A',
    surface: '#0F172A',
    card: '#111C34',
    input: '#16213A',
    primary: '#2563EB',
    primaryContrast: '#F8FAFC',
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    muted: '#94A3B8',
    border: '#1E293B',
    success: '#22C55E',
    danger: '#F87171',
    warning: '#F59E0B',
    fabBackground: '#2563EB',
    fabIcon: '#FFFFFF',
    checkboxBorder: '#2F3B52',
    shadow: '#000000',
  },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F1F5F9',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    input: '#F8FAFC',
    primary: '#2563EB',
    primaryContrast: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#1E293B',
    muted: '#64748B',
    border: '#CBD5F5',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#F59E0B',
    fabBackground: '#2563EB',
    fabIcon: '#FFFFFF',
    checkboxBorder: '#94A3B8',
    shadow: '#64748B',
  },
};
