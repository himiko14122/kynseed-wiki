import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_URL } from '@/config/site';
import { getAllContent } from '@/lib/content';
import CategoryPage from '@/components/CategoryPage';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const camel = 'guides';
  const navKey = t.has('nav_guides') ? 'nav_guides' : 'nav_home';
  return {
    title: `${t(navKey)} | ${t('site_title')}`,
    description: t.has('page_guides_description') ? t('page_guides_description') : t('site_description'),
    alternates: {
      canonical: `${SITE_URL}/guides`,
      languages: {
        'en': `${SITE_URL}/guides`,
        'ja': `${SITE_URL}/ja/guides`,
        'de': `${SITE_URL}/de/guides`,
        'es': `${SITE_URL}/es/guides`,
        'x-default': `${SITE_URL}/guides`,
      },
    },
  };
}

export default async function guidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);

  const allContent = await getAllContent('guides', validLocale);
  const articles = allContent.map(item => ({ slug: item.slug, metadata: item.metadata }));

  return <CategoryPage catKey="guides" articles={articles} />;
}
