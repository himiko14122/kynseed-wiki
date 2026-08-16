import { routing, type Locale } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kynseed.wiki';
export const SITE_NAME = 'Kynseed Wiki';
export const HERO_IMAGE = '/images/hero.webp';
export const LOGO_IMAGE = '/logo.svg';
export const TWITTER_HANDLE = '';
export const GA_TRACKING_ID = 'G-M8X8EMETZK';
export const SLUG_PREFIX = '';

export const EXTERNAL_LINKS = {
  steam: 'https://store.steampowered.com/app/758870/Kynseed/',
  discord: '',
  youtube: '',
  twitter: '',
  website: 'https://www.pixelcountstudios.com/',
  communityTool: '',
} as const;

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localizedPath(locale: Locale | string, path = '/') {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized === '/' ? '/' : normalized;
  }
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}
