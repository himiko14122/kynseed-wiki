import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { WEAPONS, TIER_COLOR_MAP } from '@/data/game-data';
import { getAllContent } from '@/lib/content';
import CategoryPage from '@/components/CategoryPage';
import { Swords } from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  return {
    title: `${t('nav_combat')} | ${t('site_title')}`,
    description: t.has('page_combat_description') ? t('page_combat_description') : t('site_description'),
    alternates: {
      canonical: `/combat`,
      languages: {
        'en': `/combat`,
        'de': `/de/combat`,
        'es': `/es/combat`,
        'ja': `/ja/combat`,
        'x-default': `/combat`,
      },
    },
  };
}

function tierColorVal(tier: string): string {
  return TIER_COLOR_MAP[tier] ?? 'var(--color-tier-c)';
}

export default async function CombatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();

  const allContent = await getAllContent('combat', validLocale);
  const articles = allContent.map((item) => ({ slug: item.slug, metadata: item.metadata }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ===== CUSTOM HERO + WEAPON TABLE (mirrors homepage) ===== */}
      <div className="mb-8" id="hero">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-sm font-semibold text-[var(--color-accent)]">{t('nav_combat')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('nav_combat')}</h1>
        {t.has('page_combat_description') && (
          <p className="text-[var(--color-text-secondary)] text-lg mb-6">{t('page_combat_description')}</p>
        )}
      </div>

      <section id="weapon-table" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label">{t('home_module_combat')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_weapon_table_title')}</h2>
          </div>
        </div>
        <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_weapon_table_desc')}</p>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] gap-x-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
            <span></span><span>{t('home_weapon_name')}</span><span>{t('tierList_tierLabel')}</span><span>{t('home_weapon_type')}</span><span>{t('home_weapon_damage')}</span>
          </div>
          {WEAPONS.map((weapon, idx) => {
            const tc = tierColorVal(weapon.tier);
            return (
              <div key={weapon.id} className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] items-center gap-x-4 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-[var(--color-accent)]/5 transition-colors group">
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{idx + 1}</span>
                <span className="flex items-center gap-2 font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                  <Swords className="w-4 h-4 text-[var(--color-accent)]" />
                  {t(weapon.nameKey)}
                </span>
                <span className="justify-self-start text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{weapon.tier}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{t(weapon.typeKey)}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{t(weapon.damageKey)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="glow-line mb-10" />

      <CategoryPage catKey="combat" showHero={false} articles={articles} />
    </div>
  );
}