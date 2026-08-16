import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { CROPS, TIER_COLOR_MAP } from '@/data/game-data';
import { getAllContent } from '@/lib/content';
import CategoryPage from '@/components/CategoryPage';
import { Wheat } from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  return {
    title: `${t('nav_farming')} | ${t('site_title')}`,
    description: t.has('page_farming_description') ? t('page_farming_description') : t('site_description'),
    alternates: {
      canonical: `/farming`,
      languages: {
        'en': `/farming`,
        'de': `/de/farming`,
        'es': `/es/farming`,
        'ja': `/ja/farming`,
        'x-default': `/farming`,
      },
    },
  };
}

function tierColorVal(tier: string): string {
  return TIER_COLOR_MAP[tier] ?? 'var(--color-tier-c)';
}

export default async function FarmingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();

  const allContent = await getAllContent('farming', validLocale);
  const articles = allContent.map((item) => ({ slug: item.slug, metadata: item.metadata }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ===== CUSTOM HERO + CROP CARDS (mirrors homepage) ===== */}
      <div className="mb-8" id="hero">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-sm font-semibold text-[var(--color-accent)]">{t('nav_farming')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('nav_farming')}</h1>
        {t.has('page_farming_description') && (
          <p className="text-[var(--color-text-secondary)] text-lg mb-6">{t('page_farming_description')}</p>
        )}
      </div>

      <section id="crop-cards" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label">{t('home_module_farming')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_crop_cards_title')}</h2>
          </div>
        </div>
        <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_crop_cards_desc')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CROPS.map((crop) => {
            const tc = tierColorVal(crop.tier);
            return (
              <div key={crop.id} className="category-card group block rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{t('tierList_tierLabel')} {crop.tier}</span>
                  <Wheat className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-[0.9375rem] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1">{t(crop.nameKey)}</h3>
                <p className="card-meta text-[0.75rem] text-[var(--color-text-secondary)] mb-2"><span className="meta-label">{t('home_crop_season')}: </span><span className="meta-value">{t(crop.seasonKey)}</span></p>
                <p className="card-desc text-[0.8125rem] text-[var(--color-text-secondary)]">{t('home_crop_profit')}: {t(crop.profitKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="glow-line mb-10" />

      <CategoryPage catKey="farming" showHero={false} articles={articles} />
    </div>
  );
}