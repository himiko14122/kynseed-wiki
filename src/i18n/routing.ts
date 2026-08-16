import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'ja', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
};
