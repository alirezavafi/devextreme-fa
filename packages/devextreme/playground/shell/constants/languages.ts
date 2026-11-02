export const Languages = {
  en: 'en',
  fa: 'fa',
} as const;

export type Language = typeof Languages[keyof typeof Languages];

export const LANGUAGE_LIST: readonly Language[] = Object.values(Languages);
