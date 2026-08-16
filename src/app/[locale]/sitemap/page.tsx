import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getAllContent } from '@/lib/content';
import { translate } from '@/lib/i18n';
import { CONTENT_TYPES, type ContentType } from '@/config/navigation';
import { SITE_URL } from '@/config/site';


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  return {
    title: `${t('nav_sitemap')} | ${t('site_title')}`,
    description: t('page_sitemap_description'),
    alternates: {
      canonical: `${SITE_URL}/sitemap`,
      languages: {
        'en': `${SITE_URL}/sitemap`,
        'ja': `${SITE_URL}/ja/sitemap`,
        'de': `${SITE_URL}/de/sitemap`,
        'es': `${SITE_URL}/es/sitemap`,
        'x-default': `${SITE_URL}/sitemap`,
      },
    },
  };
}

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  guides: 'nav_guides',
  trains: 'nav_trains',
  routes: 'nav_routes',
  stations: 'nav_stations',
  gameplay: 'nav_gameplay',
  economy: 'nav_economy',
  'tier-list': 'nav_tierList',
  updates: 'nav_updates',
  operators: 'nav_operators',
  community: 'nav_community',
};

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();

  const categoryArticles = await Promise.all(
    CONTENT_TYPES.map(async (ct) => {
      const articles = await getAllContent(ct as ContentType, validLocale);
      return { type: ct, articles };
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-[var(--font-heading)] gradient-text">{t('nav_sitemap')}</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-accent)]">{t('sitemap_mainPages')}</h2>
          <ul className="space-y-2">
            <li><Link href="/" title={t('nav_home')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{t('nav_home')}</Link></li>
            {CONTENT_TYPES.map((ct) => (
              <li key={ct}><Link href={`/${ct}`} title={t(CATEGORY_LABEL_KEYS[ct] || ct)} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{t(CATEGORY_LABEL_KEYS[ct] || ct)}</Link></li>
            ))}
            <li><Link href="/about" title={t('nav_about')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{t('nav_about')}</Link></li>
          </ul>
        </div>

        {categoryArticles.map(({ type, articles }) => (
          <div key={type}>
            <h2 className="text-xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-accent)]">{t(CATEGORY_LABEL_KEYS[type] || type)}</h2>
            {articles.length > 0 ? (
              <ul className="space-y-2">
                {articles.map((article) => {
                  const title = article.metadata.title || article.slug;
                  return (
                    <li key={article.slug}>
                      <Link href={article.path} title={title} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
                        {title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">{t('no_articles_yet')}</p>
            )}
          </div>
        ))}

        <div>
          <h2 className="text-xl font-bold mb-4 font-[var(--font-heading)] text-[var(--color-accent)]">{t('sitemap_legalPages')}</h2>
          <ul className="space-y-2">
            <li><Link href="/privacy-policy" title={t('nav_privacyPolicy')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{t('nav_privacyPolicy')}</Link></li>
            <li><Link href="/terms-of-service" title={t('nav_termsOfService')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{t('nav_termsOfService')}</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
