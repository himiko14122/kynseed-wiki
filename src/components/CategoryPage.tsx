'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import AdBanner from '@/components/AdBanner';
import { CATEGORY_AFFINITY, GUIDE_CATEGORIES } from '@/config/navigation';
import type { ContentMetadata } from '@/lib/content';

interface ArticleItem {
  slug: string;
  metadata: ContentMetadata;
}

interface CategoryPageProps {
  catKey: string;
  showHero?: boolean;
  showOnThisPage?: boolean;
  children?: React.ReactNode;
  articles?: ArticleItem[];
}

export default function CategoryPage({ catKey, showHero = true, showOnThisPage = true, children, articles = [] }: CategoryPageProps) {
  const t = useTranslations();

  const hasFeature = !children && t.has(`category_feature_${catKey}_title`);
  const featureTitle = hasFeature ? t.raw(`category_feature_${catKey}_title`) : '';
  const featureHtml = hasFeature ? t.raw(`category_feature_${catKey}_html`) : '';
  const hasIntro = t.has(`category_intro_${catKey}`);
  const hasMechanics = t.has(`category_mechanics_${catKey}`);
  const hasAdvantages = t.has(`category_advantages_${catKey}`);
  const hasWeaknesses = t.has(`category_weaknesses_${catKey}`);
  const hasFaq = t.has(`category_faq_${catKey}_q_0`);
  const hasQt = t.has(`category_qt_${catKey}_0`);
  const hasStat = t.has(`category_stat_${catKey}_0_label`);
  const hasCards = t.has(`category_cards_${catKey}_0_name`);

  const faqCount = [0, 1, 2, 3].filter(i => t.has(`category_faq_${catKey}_q_${i}`)).length;
  const qtCount = [0, 1, 2, 3, 4].filter(i => t.has(`category_qt_${catKey}_${i}`)).length;
  const statCount = [0, 1, 2].filter(i => t.has(`category_stat_${catKey}_${i}_label`)).length;
  const cardCount = Array.from({ length: 20 }, (_, i) => i).filter(i => t.has(`category_cards_${catKey}_${i}_name`)).length;

  const navLabel = t.has(`nav_${catKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
    ? t(`nav_${catKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
    : catKey;

  const descKey = `page_${catKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}_description`;
  const descKeyLower = `page_${catKey.replace(/-/g, '')}_description`;
  const heroDesc = t.has(descKey) ? t(descKey) : t.has(descKeyLower) ? t(descKeyLower) : null;
  if (!heroDesc) {
    console.error(`P0: CategoryPage "${catKey}" hero description missing — no key ${descKey} or ${descKeyLower}`);
  }

  const featured = articles.slice(0, 3);
  const remaining = articles.slice(3);

  const onThisPageItems = [
    hasIntro && { id: 'intro', label: 'Introduction' },
    hasFeature && { id: 'feature', label: featureTitle || 'Data Overview' },
    children && { id: 'custom', label: 'Details' },
    hasCards && { id: 'cards', label: t.has(`category_cards_${catKey}_nav`) ? t(`category_cards_${catKey}_nav`) : 'Overview' },
    hasMechanics && { id: 'mechanics', label: 'Core Mechanics' },
    hasAdvantages && { id: 'advantages', label: 'Advantages' },
    hasWeaknesses && { id: 'weaknesses', label: 'Challenges' },
    hasFaq && { id: 'faq', label: 'FAQ' },
    hasQt && { id: 'quicktips', label: 'Quick Tips' },
    articles.length > 0 && { id: 'articles', label: 'Articles' },
    CATEGORY_AFFINITY[catKey] && CATEGORY_AFFINITY[catKey].length > 0 && { id: 'explore-more', label: 'Explore More' },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {articles.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: navLabel,
              numberOfItems: articles.length,
              itemListElement: articles.map((item, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: item.metadata.title || item.slug,
                url: `/${catKey}/${item.slug}/`,
              })),
            }),
          }}
        />
      )}
      {showHero && (
        <div className="mb-8" id="hero">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-sm font-semibold text-[var(--color-accent)]">{navLabel}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{navLabel}</h1>
          {heroDesc && <p className="text-[var(--color-text-secondary)] text-lg mb-6">{heroDesc}</p>}
          {hasStat && statCount > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {Array.from({ length: statCount }, (_, i) => (
                <div key={i} className="category-card rounded-xl p-4 border border-[var(--color-border)]">
                  <div className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-accent)]">{t(`category_stat_${catKey}_${i}_value`)}</div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">{t(`category_stat_${catKey}_${i}_label`)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showOnThisPage && onThisPageItems.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          <span className="text-[var(--color-text-muted)] font-semibold">On This Page:</span>
          {onThisPageItems.map((item, i) => (
            <span key={item.id}>
              {i > 0 && <span className="text-[var(--color-text-muted)] mx-1">&middot;</span>}
              <a href={`#${item.id}`} title={item.label} className="text-[var(--color-accent)] hover:underline">{item.label}</a>
            </span>
          ))}
        </div>
      )}

      <div className="glow-line mb-10" />

      {hasIntro && (
        <section id="intro" className="mb-10">
          <h2 className="text-2xl font-bold mb-4 font-[var(--font-heading)]">Introduction</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`category_intro_${catKey}`)}</p>
        </section>
      )}

      {hasFeature && (
        <section id="feature" className="mb-10">
          <h2 className="text-2xl font-bold mb-4 font-[var(--font-heading)]">{featureTitle}</h2>
          <div className="feature-table-wrap">
            <div className="feature-table" dangerouslySetInnerHTML={{ __html: featureHtml }} />
          </div>
        </section>
      )}

      {children && (
        <section id="custom" className="mb-10">
          {children}
        </section>
      )}

      {hasCards && cardCount > 0 && (
        <section id="cards" className="mb-10">
          <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t.has(`category_cards_${catKey}_nav`) ? t(`category_cards_${catKey}_nav`) : 'Overview'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: cardCount }, (_, i) => {
              const name = t(`category_cards_${catKey}_${i}_name`);
              const tier = t.has(`category_cards_${catKey}_${i}_tier`) ? t(`category_cards_${catKey}_${i}_tier`) : '';
              const badge = t.has(`category_cards_${catKey}_${i}_badge`) ? t(`category_cards_${catKey}_${i}_badge`) : '';
              const subtitle = t.has(`category_cards_${catKey}_${i}_subtitle`) ? t(`category_cards_${catKey}_${i}_subtitle`) : '';
              const tierColor = tier ? `var(--color-tier-${tier.toLowerCase()})` : 'var(--color-accent)';

              return (
                <div key={i} className="category-card rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors relative">
                  {tier && (
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: tierColor }} />
                  )}
                  <div className="p-4 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      {tier && <span className={`badge badge-${tier.toLowerCase()}`}>{tier}</span>}
                      <h3 className="text-[0.9375rem] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">{name}</h3>
                    </div>
                    {badge && <span className={`badge badge-${badge.toLowerCase()} mr-2 mb-2`}>{badge}</span>}
                    {subtitle && <p className="card-desc text-sm text-[var(--color-text-secondary)] mb-3">{subtitle}</p>}
                    <div className="space-y-2">
                      {[0, 1, 2, 3].filter(j => t.has(`category_cards_${catKey}_${i}_f${j}_label`)).map(j => (
                        <div key={j} className="flex gap-2 text-xs">
                          <span className="text-[var(--color-text-muted)] font-semibold min-w-[80px]" style={{ color: `var(--color-field-${j})` }}>
                            {t(`category_cards_${catKey}_${i}_f${j}_label`)}
                          </span>
                          <span className="text-[var(--color-text-secondary)]">{t(`category_cards_${catKey}_${i}_f${j}_value`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasMechanics && (
        <section id="mechanics" className="mb-10">
          <h2 className="text-2xl font-bold mb-4 font-[var(--font-heading)]">Core Mechanics</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`category_mechanics_${catKey}`)}</p>
        </section>
      )}

      {hasAdvantages && (
        <section id="advantages" className="mb-10">
          <h2 className="text-2xl font-bold mb-4 font-[var(--font-heading)]">Advantages</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`category_advantages_${catKey}`)}</p>
        </section>
      )}

      {hasWeaknesses && (
        <section id="weaknesses" className="mb-10">
          <h2 className="text-2xl font-bold mb-4 font-[var(--font-heading)]">Challenges</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`category_weaknesses_${catKey}`)}</p>
        </section>
      )}

      {hasFaq && faqCount > 0 && (
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {Array.from({ length: faqCount }, (_, i) => (
              <details key={i} className="group rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                  {t(`category_faq_${catKey}_q_${i}`)}
                  <span className="text-[var(--color-accent)] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
                  {t(`category_faq_${catKey}_a_${i}`)}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-center py-4 my-6">
        <AdBanner type="native-banner" />
      </div>

      {hasQt && qtCount > 0 && (
        <section id="quicktips" className="mb-10">
          <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">Quick Tips</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: qtCount }, (_, i) => (
              <div key={i} className="category-card rounded-xl p-4 border border-[var(--color-border)]">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-accent)] text-lg mt-0.5 shrink-0">&#x1F4A1;</span>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{t(`category_qt_${catKey}_${i}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section id="articles">
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">Featured</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((item) => {
                  const kw = item.metadata.keywords || [];
                  return (
                    <Link key={item.slug} href={`/${catKey}/${item.slug}/`} title={item.metadata.title || item.slug} className="card-accent-bar group block rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-accent)] transition-all duration-200">
                      {item.metadata.image && (
                        <div className="relative w-full aspect-video overflow-hidden rounded-t-xl mb-3">
                          <Image src={item.metadata.image} alt={item.metadata.title || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 style={{ fontFamily: 'var(--font-body)' }} className="text-[0.9375rem] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{item.metadata.title}</h3>
                        <p className="card-desc text-[0.8125rem] text-[var(--color-text-secondary)] mt-2 line-clamp-2">{item.metadata.description}</p>
                        {kw.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                            {kw.slice(0, 4).map((k) => (
                              <span key={k} className="tag-pill">{k}</span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-[var(--color-accent)] font-semibold">{t('common_readMore')} &rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {remaining.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">All Articles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remaining.map((item) => {
                  const kw = item.metadata.keywords || [];
                  return (
                    <Link key={item.slug} href={`/${catKey}/${item.slug}/`} title={item.metadata.title || item.slug} className="card-accent-bar group block rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-accent)] transition-all duration-200">
                      {item.metadata.image && (
                        <div className="relative w-full aspect-video overflow-hidden rounded-t-xl mb-3">
                          <Image src={item.metadata.image} alt={item.metadata.title || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 style={{ fontFamily: 'var(--font-body)' }} className="text-[0.9375rem] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{item.metadata.title}</h3>
                        <p className="card-desc text-[0.8125rem] text-[var(--color-text-secondary)] mt-2 line-clamp-2">{item.metadata.description}</p>
                        {kw.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                            {kw.slice(0, 4).map((k) => (
                              <span key={k} className="tag-pill">{k}</span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-[var(--color-accent)] font-semibold">{t('common_readMore')} &rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {CATEGORY_AFFINITY[catKey] && CATEGORY_AFFINITY[catKey].length > 0 && (
        <section id="explore-more" className="mb-10 mt-10">
          <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t.has('explore_more') ? t('explore_more') : 'Explore More'}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_AFFINITY[catKey].map((affKey) => {
              const emoji = GUIDE_CATEGORIES[affKey]?.emoji || '📄';
              const affLabel = t.has(`nav_${affKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
                ? t(`nav_${affKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
                : affKey;
              const affDesc = t.has(`page_${affKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}_description`)
                ? t(`page_${affKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}_description`)
                : '';
              return (
                <Link key={affKey} href={`/${affKey}`} title={affLabel} className="category-card rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="text-[0.9375rem] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">{affLabel}</h3>
                  </div>
                  {affDesc && <p className="card-meta text-[0.8125rem] text-[var(--color-text-secondary)]">{affDesc}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex justify-center py-4 my-8">
        <div className="hidden md:block">
          <AdBanner type="banner-728x90" />
        </div>
        <div className="block md:hidden">
          <AdBanner type="banner-468x60" />
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" title={t('nav_home')} className="btn-secondary">&larr; {t('nav_home')}</Link>
      </div>
    </div>
  );
}
