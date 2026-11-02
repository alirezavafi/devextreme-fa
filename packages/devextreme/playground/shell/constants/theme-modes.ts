// Dark is the DevBox UI Kit's default; light is a single attribute flip.
export const ThemeModes = {
  dark: 'dark',
  light: 'light',
} as const;

export type ThemeMode = typeof ThemeModes[keyof typeof ThemeModes];

export const THEME_MODE_LIST: readonly ThemeMode[] = Object.values(ThemeModes);
