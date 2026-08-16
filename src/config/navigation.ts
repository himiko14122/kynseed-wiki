import {
  BookOpen, Swords, Wheat, Store, Heart, Hammer, Skull, Scroll, Radio,
  Home, Info,
  type LucideIcon,
} from 'lucide-react';

export const NAVIGATION_CONFIG = [
  { key: 'home', labelKey: 'nav_home', path: '/', icon: Home, showInHeader: false, showInSidebar: true, showInFooter: false, sitemap: true, priority: 1, changeFrequency: 'daily' },
  { key: 'guides', labelKey: 'nav_guides', path: '/guides', icon: BookOpen, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'combat', labelKey: 'nav_combat', path: '/combat', icon: Swords, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'farming', labelKey: 'nav_farming', path: '/farming', icon: Wheat, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'business', labelKey: 'nav_business', path: '/business', icon: Store, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'relationships', labelKey: 'nav_relationships', path: '/relationships', icon: Heart, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'crafting', labelKey: 'nav_crafting', path: '/crafting', icon: Hammer, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'dungeons', labelKey: 'nav_dungeons', path: '/dungeons', icon: Skull, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'lore', labelKey: 'nav_lore', path: '/lore', icon: Scroll, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'updates', labelKey: 'nav_updates', path: '/updates', icon: Radio, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'about', labelKey: 'nav_about', path: '/about', icon: Info, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.7, changeFrequency: 'monthly' },
  { key: 'sitemap', labelKey: 'nav_sitemap', path: '/sitemap', icon: Info, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: false, priority: 0.5, changeFrequency: 'monthly' },
  { key: 'privacy-policy', labelKey: 'nav_privacyPolicy', path: '/privacy-policy', icon: Info, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.4, changeFrequency: 'yearly' },
  { key: 'terms-of-service', labelKey: 'nav_termsOfService', path: '/terms-of-service', icon: Info, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.4, changeFrequency: 'yearly' },
] as const;

export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => 'isContentType' in item && item.isContentType).map((item) => item.key);

export const CONTENT_TYPES_WITH_DEDICATED_PAGES = new Set(CONTENT_TYPES);

export type NavigationItem = (typeof NAVIGATION_CONFIG)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

export function getNavigationItem(path: string) {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return NAVIGATION_CONFIG.find((item) => item.path === normalized || item.key === path);
}

export const CONTENT_DIR_NAMES: Record<ContentType | string, string> = {
  'guides': 'guides',
  'combat': 'combat',
  'farming': 'farming',
  'business': 'business',
  'relationships': 'relationships',
  'crafting': 'crafting',
  'dungeons': 'dungeons',
  'lore': 'lore',
  'updates': 'updates',
} as Record<ContentType, string>;

export function getContentDir(contentType: ContentType): string {
  return CONTENT_DIR_NAMES[contentType] || contentType;
}

export const GUIDE_CATEGORIES: Record<string, { emoji: string; order: number }> = {
  'guides':       { emoji: '📖', order: 1 },
  'combat':       { emoji: '⚔️', order: 2 },
  'farming':      { emoji: '🌾', order: 3 },
  'business':     { emoji: '🏪', order: 4 },
  'relationships': { emoji: '💕', order: 5 },
  'crafting':     { emoji: '🔨', order: 6 },
  'dungeons':     { emoji: '💀', order: 7 },
  'lore':         { emoji: '📜', order: 8 },
  'updates':      { emoji: '📢', order: 9 },
};

export const CATEGORY_ORDER = Object.entries(GUIDE_CATEGORIES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key);

export const CATEGORY_AFFINITY: Record<string, string[]> = {
  'guides':       ['farming', 'relationships', 'combat'],
  'combat':       ['guides', 'dungeons', 'crafting'],
  'farming':      ['guides', 'business', 'relationships'],
  'business':     ['farming', 'crafting', 'relationships'],
  'relationships': ['guides', 'farming', 'lore'],
  'crafting':     ['combat', 'business', 'dungeons'],
  'dungeons':     ['combat', 'crafting', 'lore'],
  'lore':         ['relationships', 'dungeons', 'updates'],
  'updates':      ['lore', 'guides', 'combat'],
};
