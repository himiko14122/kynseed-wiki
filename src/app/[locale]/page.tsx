import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getBaseMetadata, websiteJsonLd, itemListJsonLd } from '@/lib/seo';
import { HOME_CONFIG } from '@/config/home';
import { getAllContent, getAllContentByDate } from '@/lib/content';
import { translate } from '@/lib/i18n';
import { EXTERNAL_LINKS } from '@/config/site';
import { AD_BANNER_KEY } from '@/config/ads';
import { WEAPONS, CROPS, BUSINESSES, NPCS, TIER_COLOR_MAP } from '@/data/game-data';
import AdBanner from '@/components/AdBanner';
import AutoScrollCarousel from '@/components/AutoScrollCarousel';
import YouTubePlayer from '@/components/YouTubePlayer';
import { ArrowRight, ChevronRight, Swords, Heart, Wheat, Store, Skull } from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return getBaseMetadata('/', locale, t('page_home'), t('page_home_description'));
}

function resolveDynamic(val: string, ctx: Record<string, string>): string {
  return val.startsWith('__') ? (ctx[val] ?? val) : val;
}

function tierColorVal(tier: string): string {
  return TIER_COLOR_MAP[tier] ?? 'var(--color-tier-c)';
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const allGuides = await getAllContent('guides', validLocale);
  const latestContent = await getAllContentByDate(validLocale);
  const firstGuidePath = allGuides.length > 0 ? allGuides[0].path : '/guides';

  const dynCtx: Record<string, string> = {
    '__firstGuide': firstGuidePath,
    '__guideCount': String(allGuides.length),
  };

  const heroBadgeKeys = HOME_CONFIG.hero.badgeKeys;
  const faqKeys = HOME_CONFIG.faq.keys;
  const infoItems = HOME_CONFIG.gameOverview.infoItems;
  const moduleCards = HOME_CONFIG.moduleCards.map((card) => ({
    ...card,
    label: t(card.labelKey),
    title: t(card.titleKey),
    desc: t(card.descKey),
    href: resolveDynamic(card.href, dynCtx),
    stats: card.stats.map((s) => ({ val: resolveDynamic(s.val, dynCtx), label: t(s.labelKey) })),
  }));

  const gameFeatures = HOME_CONFIG.gameFeatures.map((feat) => ({
    ...feat,
    title: t(feat.titleKey),
    desc: t(feat.descKey),
  }));

  const startHereSteps = HOME_CONFIG.startHereSteps.map((step) => ({
    title: t(step.titleKey),
    desc: t(step.descKey),
    href: resolveDynamic(step.href, dynCtx),
  }));

  const adKey = AD_BANNER_KEY;

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-16 md:py-24 full-width-bg">
        <div className="absolute inset-0 opacity-40 hero-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/70 via-transparent to-[var(--color-bg-primary)]/40" />
        <div className="absolute top-1/4 left-[20%] -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/8 rounded-full blur-[120px] pointer-events-none hero-glow" />
        <div className="absolute bottom-1/3 right-[15%] w-[300px] h-[300px] bg-[var(--color-accent-secondary)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest">{t('home_hero_tagline')}</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] gradient-text leading-[1.1] tracking-tight">{t('home_hero_title')}</h1>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">{t('home_hero_description')}</p>
              <div className="flex flex-wrap gap-3">
                {HOME_CONFIG.hero.ctas.map((cta) => (
                  <Link key={cta.labelKey} href={resolveDynamic(cta.href, dynCtx)} title={t(cta.labelKey)} className={cta.style === 'primary' ? 'btn-primary btn-hero-primary' : 'btn-secondary btn-hero-secondary'}>
                    {cta.style === 'primary' && <ArrowRight className="w-4 h-4 mr-0.5" />}
                    {t(cta.labelKey)}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(0, 2).map((key) => (
                  <span key={key} className="hero-badge-primary">{t(key)}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(2, 8).map((key) => (
                  <span key={key} className="hero-badge-secondary">{t(key)}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(8).map((key) => (
                  <span key={key} className="hero-badge-tertiary">{t(key)}</span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--color-accent)]/20 via-transparent to-[var(--color-accent-secondary)]/10 rounded-2xl opacity-50 blur-sm group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <YouTubePlayer videoId={HOME_CONFIG.hero.videoId} />
              </div>
              <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">{t('home_hero_trailer')}</p>
            </div>
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdBanner type="native-banner" />
        </div>
      )}

      <div className="glow-line full-width-bg" />

      {/* ===== LATEST UPDATES ===== */}
      {latestContent.length > 0 && (
        <section className="py-12">
          <AutoScrollCarousel
            items={latestContent.slice(0, 10).map((item, i) => ({
              slug: item.slug,
              title: item.metadata.title || item.slug,
              description: item.metadata.description,
              image: item.metadata.image,
              path: item.path,
              isNew: i < 5,
            }))}
            readMoreText={t('read_more')}
            title={t('latest_updates')}
            priorityCount={3}
          />
        </section>
      )}

      {/* ===== FEATURED GUIDES ===== */}
      {allGuides.length > 0 && (
        <section className="py-12">
          <AutoScrollCarousel
            items={allGuides.slice(0, 20).map((guide) => ({
              slug: guide.slug,
              title: guide.metadata.title || guide.slug,
              description: guide.metadata.description,
              image: guide.metadata.image,
              path: guide.path,
            }))}
            readMoreText={t('read_more')}
            title={t('featured_guides')}
            autoScroll={false}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center">
            <Link href="/guides" title={t('explore_all_guides')} className="text-sm font-semibold text-[var(--color-accent)] hover:underline">{t('explore_all_guides')} →</Link>
          </div>
        </section>
      )}

      {/* ===== START HERE ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="section-label">{t('home_start_label')}</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_start_title')}</h2>
        <p className="text-[var(--color-text-secondary)] mb-10 leading-relaxed text-[0.9375rem]">{t('home_start_subtitle')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {startHereSteps.map((step, idx) => (
            <Link key={idx} href={step.href} title={step.title} className="module-card group block relative overflow-hidden">
              <div className="absolute top-3 right-3 text-4xl font-extrabold font-[var(--font-heading)] text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] opacity-30 group-hover:opacity-60 transition-opacity">{String(idx + 1).padStart(2, '0')}</div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white font-bold text-sm mb-4">{idx + 1}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{step.desc}</p>
              <span className="text-xs text-[var(--color-accent)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {t('read_more')} <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="section-label">{t('home_modules_label')}</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_modules_title')}</h2>
          <p className="text-[var(--color-text-secondary)] mb-10 leading-relaxed text-[0.9375rem]">{t('home_modules_subtitle')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {moduleCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.key} href={card.href} title={card.title} className="group block rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-[var(--color-accent)]/40 transition-all duration-300 backdrop-blur-sm card-accent-bar">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-secondary)]/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{card.label}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">{card.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4">{card.desc}</p>
                  <div className="flex gap-4 mb-4">
                    {card.stats.map((stat, i) => (
                      <div key={i} className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold font-[var(--font-heading)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)]">{stat.val}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
                    {t(card.ctaKey ?? 'home_module_default_cta')}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GAME OVERVIEW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="section-label">{t('home_about_label')}</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_about_title')}</h2>
        <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed text-[0.9375rem]">{t('home_about_p1')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {gameFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm hover:border-[var(--color-accent)]/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--color-accent-secondary)]/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-sm font-bold mb-2">{feat.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_about_p2')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={resolveDynamic(HOME_CONFIG.gameOverview.cta.guideHref, dynCtx)} title={t(HOME_CONFIG.gameOverview.cta.guideLabelKey)} className="btn-primary">
                {t(HOME_CONFIG.gameOverview.cta.guideLabelKey)}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <a href={EXTERNAL_LINKS[HOME_CONFIG.gameOverview.cta.externalLinkKey as keyof typeof EXTERNAL_LINKS]} target="_blank" rel="noopener noreferrer" title={t(HOME_CONFIG.gameOverview.cta.externalLabelKey)} className="btn-secondary">{t(HOME_CONFIG.gameOverview.cta.externalLabelKey)}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {infoItems.map((item) => (
              <div key={item} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <p className="text-xs text-[var(--color-text-muted)]">{t(`home_info_${item}`)}</p>
                <p className="font-bold text-sm text-[var(--color-text-primary)]">{t(`home_info_${item}_value`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <AdBanner type="banner-728x90" />
        </div>
      )}

      <div className="glow-line full-width-bg" />

      {/* ===== WEAPON TABLE (Data-Driven Table 1) ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-label">{t('home_module_combat')}</div>
              <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_weapon_table_title')}</h2>
            </div>
            <Link href="/combat" title={t('home_module_combat')} className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_weapon_table_desc')}</p>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] gap-x-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
              <span></span><span>{t('home_weapon_name')}</span><span>{t('tierList_tierLabel')}</span><span>{t('home_weapon_type')}</span><span>{t('home_weapon_damage')}</span>
            </div>
            {WEAPONS.map((weapon, idx) => {
              const tc = tierColorVal(weapon.tier);
              return (
                <Link key={weapon.id} href="/combat" title={t(weapon.nameKey)} className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] items-center gap-x-4 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-[var(--color-accent)]/5 transition-colors group">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{idx + 1}</span>
                  <span className="flex items-center gap-2 font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                    <Swords className="w-4 h-4 text-[var(--color-accent)]" />
                    {t(weapon.nameKey)}
                  </span>
                  <span className="justify-self-start text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{weapon.tier}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{t(weapon.typeKey)}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{t(weapon.damageKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== NPC CARDS (Data-Driven Cards 1) ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="section-label">{t('home_module_relationships')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_npc_cards_title')}</h2>
          </div>
          <Link href="/relationships" title={t('home_module_relationships')} className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_npc_cards_desc')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {NPCS.map((npc) => {
            const tc = tierColorVal(npc.tier);
            return (
              <Link key={npc.id} href="/relationships" title={t(npc.nameKey)} className="category-card group block rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{t('tierList_tierLabel')} {npc.tier}</span>
                  </div>
                  <h3 className="text-[0.9375rem] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1">{t(npc.nameKey)}</h3>
                  <p className="card-meta text-[0.75rem] text-[var(--color-text-secondary)] mb-2"><span className="meta-label">{t('home_npc_type')}: </span><span className="meta-value">{t(npc.typeKey)}</span></p>
                  <p className="card-desc text-[0.8125rem] text-[var(--color-text-secondary)]">{t('home_npc_gift')}: {t(npc.giftKey)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== BUSINESS TABLE (Data-Driven Table 2) ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-label">{t('home_module_business')}</div>
              <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_business_table_title')}</h2>
            </div>
            <Link href="/business" title={t('home_module_business')} className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_business_table_desc')}</p>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] gap-x-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
              <span></span><span>{t('home_business_name')}</span><span>{t('tierList_tierLabel')}</span><span>{t('home_business_investment')}</span><span>{t('home_business_profit')}</span>
            </div>
            {BUSINESSES.map((business, idx) => {
              const tc = tierColorVal(business.tier);
              return (
                <Link key={business.id} href="/business" title={t(business.nameKey)} className="grid grid-cols-[2rem_1fr_4rem_2fr_2fr] sm:grid-cols-[2.5rem_1.5fr_4rem_2fr_2fr] items-center gap-x-4 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-[var(--color-accent)]/5 transition-colors group">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{idx + 1}</span>
                  <span className="flex items-center gap-2 font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                    <Store className="w-4 h-4 text-[var(--color-accent)]" />
                    {t(business.nameKey)}
                  </span>
                  <span className="justify-self-start text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{business.tier}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{t(business.investmentKey)}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{t(business.profitKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CROP CARDS (Data-Driven Cards 2) ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="section-label">{t('home_module_farming')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_crop_cards_title')}</h2>
          </div>
          <Link href="/farming" title={t('home_module_farming')} className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_crop_cards_desc')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CROPS.map((crop) => {
            const tc = tierColorVal(crop.tier);
            return (
              <Link key={crop.id} href="/farming" title={t(crop.nameKey)} className="category-card group block rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{t('tierList_tierLabel')} {crop.tier}</span>
                  <Wheat className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-[0.9375rem] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1">{t(crop.nameKey)}</h3>
                <p className="card-meta text-[0.75rem] text-[var(--color-text-secondary)] mb-2"><span className="meta-label">{t('home_crop_season')}: </span><span className="meta-value">{t(crop.seasonKey)}</span></p>
                <p className="card-desc text-[0.8125rem] text-[var(--color-text-secondary)]">{t('home_crop_profit')}: {t(crop.profitKey)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="glow-line full-width-bg" />

      {/* ===== FAQ ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="section-label justify-center">{t('section_faq')}</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_faq_title')}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqKeys.map((key) => (
            <details key={key} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between text-sm">
                {t(`faq_${key}`)}
                <span className="text-[var(--color-accent-secondary)] group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">{t(`faq_${key}_answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative overflow-hidden py-16 full-width-bg">
        <div className="absolute inset-0 opacity-20 hero-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-accent)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_cta_title')}</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">{t('home_cta_description')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={resolveDynamic(HOME_CONFIG.bottomCta.guideHref, dynCtx)} title={t(HOME_CONFIG.bottomCta.guideLabelKey)} className="btn-primary">
              {t(HOME_CONFIG.bottomCta.guideLabelKey)}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <a href={EXTERNAL_LINKS[HOME_CONFIG.bottomCta.externalLinkKey as keyof typeof EXTERNAL_LINKS]} target="_blank" rel="noopener noreferrer" title={t(HOME_CONFIG.bottomCta.externalLabelKey)} className="btn-secondary">{t(HOME_CONFIG.bottomCta.externalLabelKey)}</a>
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex justify-center">
          <div className="hidden md:block">
            <AdBanner type="banner-728x90" />
          </div>
          <div className="block md:hidden">
            <AdBanner type="banner-468x60" />
          </div>
        </div>
      )}
    </div>
  );
}
