import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import GuideSidebar from '@/components/GuideSidebar';
import { Link } from '@/i18n/navigation';
import { NAVIGATION_CONFIG, CONTENT_TYPES_WITH_DEDICATED_PAGES, isContentType, getNavigationItem, GUIDE_CATEGORIES, CATEGORY_ORDER, CATEGORY_AFFINITY, type ContentType } from '@/config/navigation';
import { getAllContent, getAllContentPaths, getContent, getPrevNextContent, getTocItems } from '@/lib/content';
import { articleJsonLd, breadcrumbJsonLd, getBaseMetadata, itemListJsonLd } from '@/lib/seo';
import { translate } from '@/lib/i18n';
import AdBanner from '@/components/AdBanner';
import { AD_BANNER_KEY } from '@/config/ads';
import ArticleContent from '@/components/ArticleContent';
import ArticleVideo from '@/components/ArticleVideo';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export async function generateStaticParams() {
  const staticParams = routing.locales.flatMap((locale) =>
    NAVIGATION_CONFIG.filter((item) => item.path !== '/' && !('isContentType' in item && item.isContentType)).map((item) => ({
      locale,
      slug: item.path.slice(1).split('/'),
    }))
  );
  const contentParams = getAllContentPaths('en').flatMap((item) =>
    routing.locales.map((locale) => ({
      locale,
      slug: [item.contentType, ...item.segments],
    }))
  );
  return [...staticParams, ...contentParams];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  const [first, ...rest] = slug;
  const path = `/${slug.join('/')}`;

  if (rest.length > 0 && isContentType(first)) {
    const content = await getContent(validLocale, first, rest);
    if (!content) return {};
    const t = await getTranslations({ locale: validLocale });
    const title = content.metadata.title || content.slug;
    return getBaseMetadata(path, validLocale, title, content.metadata.description || '', 'article', content.metadata.image);
  }

  if (CONTENT_TYPES_WITH_DEDICATED_PAGES.has(first as ContentType) && rest.length === 0) {
    return {};
  }

  if (isContentType(first)) {
    const t = await getTranslations({ locale: validLocale });
    const nav = NAVIGATION_CONFIG.find((item) => item.key === first);
    return getBaseMetadata(path, validLocale, t(nav?.labelKey || 'nav_home'), t('section_guides_desc'));
  }

  const t = await getTranslations({ locale: validLocale });
  const nav = NAVIGATION_CONFIG.find((item) => item.path === path);
  return getBaseMetadata(path, validLocale, t(nav?.labelKey || 'site_title'), t('page_home_description'));
}

export default async function CatchAllPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const [first, ...rest] = slug;
  const adKey = AD_BANNER_KEY;

  if (isContentType(first)) {
    if (CONTENT_TYPES_WITH_DEDICATED_PAGES.has(first as ContentType) && rest.length === 0) {
      notFound();
    }
    if (rest.length === 0) {
      const items = await getAllContent(first, validLocale);
      const nav = NAVIGATION_CONFIG.find((item) => item.key === first);
      const title = nav ? t(nav.labelKey) : first;

      // ── Helpers ──
      function difficultyClass(d: string | undefined) {
        if (d === 'beginner') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        if (d === 'intermediate') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        if (d === 'advanced') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        return '';
      }

      // Featured: top 3 (by order), then rest grouped by category
      const sorted = [...items].sort((a, b) => (a.metadata.order ?? 99) - (b.metadata.order ?? 99));
      const featured = sorted.slice(0, 3);
      const remaining = sorted.slice(3);

      // Group remaining by category, respecting CATEGORY_ORDER
      const categoryGroups = new Map<string, typeof items>();
      for (const item of remaining) {
        const cat = item.metadata.category || 'general';
        if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
        categoryGroups.get(cat)!.push(item);
      }
      const orderedCategories = CATEGORY_ORDER.filter((c) => categoryGroups.has(c));

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <JsonLd data={itemListJsonLd(items.map((item) => ({ name: item.metadata.title || item.slug, path: item.path })), validLocale)} />

          {/* Page header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{title}</h1>
          <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed text-[0.9375rem]">{t('section_guides_desc')}</p>

          {/* ── Featured Guides ── */}
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-6 font-[var(--font-heading)] text-[var(--color-accent)]">
              ⭐ {t('guides_featured')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((item) => {
                const itemTitle = item.metadata.title || item.slug;
                const diff = item.metadata.difficulty;
                const cat = item.metadata.category;
                const keywords: string[] = item.metadata.keywords || [];
                return (
                  <Link
                    key={item.slug}
                    href={item.path}
                    title={itemTitle}
                    className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden group hover:border-[var(--color-accent)] transition-all duration-200"
                  >
                    {item.metadata.image && (
                      <div className="relative w-full aspect-video overflow-hidden">
                        <Image src={item.metadata.image} alt={item.metadata.title || ''} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {diff && <span className={`text-xs px-2 py-0.5 rounded ${difficultyClass(diff)}`}>{diff}</span>}
                      {!diff && <span className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-[var(--color-text-muted)]">{t('guides_featured')}</span>}
                      {cat && <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">{t(`guide_category_${cat}`)}</span>}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors font-[var(--font-heading)]">{itemTitle}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-3 leading-relaxed">{item.metadata.description}</p>

                    {/* SEO keyword tag pills */}
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {keywords.slice(0, 4).map((kw) => (
                          <span key={kw} className="tag-pill">{kw}</span>
                        ))}
                      </div>
                    )}

                    <span className="text-sm font-semibold text-[var(--color-accent)] group-hover:underline">
                      {t('read_more')} →
                    </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {adKey && (
            <div className="flex justify-center py-4">
              <AdBanner type="native-banner" />
            </div>
          )}

          {/* Glow divider */}
          <div className="glow-line mb-12" />

          {/* ── Category Sections ── */}
          {orderedCategories.map((cat) => {
            const guides = categoryGroups.get(cat)!;
            const catConfig = GUIDE_CATEGORIES[cat];
            const meta = catConfig ? { emoji: catConfig.emoji, key: `guide_category_${cat}` } : { emoji: '📚', key: 'guide_category_general' };
            return (
              <section key={cat} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{meta.emoji}</span>
                  <h2 className="text-2xl font-bold font-[var(--font-heading)]">{t(meta.key)}</h2>
                  <span className="text-sm text-[var(--color-text-muted)]">({guides.length})</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {guides.map((item) => {
                    const itemTitle = item.metadata.title || item.slug;
                    const diff = item.metadata.difficulty;
                    const catLabel = item.metadata.category;
                    const keywords: string[] = item.metadata.keywords || [];
                    return (
                      <Link
                        key={item.slug}
                        href={item.path}
                        title={itemTitle}
                        className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden group hover:border-[var(--color-accent)] transition-all duration-200"
                      >
                        {item.metadata.image && (
                          <div className="relative w-full aspect-video overflow-hidden">
                            <Image src={item.metadata.image} alt={item.metadata.title || ''} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                          </div>
                        )}
                        <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {diff && <span className={`text-xs px-2 py-0.5 rounded ${difficultyClass(diff)}`}>{diff}</span>}
                          {catLabel && <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">{t(`guide_category_${catLabel}`)}</span>}
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors font-[var(--font-heading)]">{itemTitle}</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2 leading-relaxed">{item.metadata.description}</p>

                        {/* SEO keyword tag pills */}
                        {keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {keywords.slice(0, 4).map((kw) => (
                              <span key={kw} className="tag-pill">{kw}</span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          <span className="text-sm text-[var(--color-accent)] group-hover:underline">
                            {t('read_more')} →
                          </span>
                        </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      );
    }

    const content = await getContent(validLocale, first, rest);
    if (!content) notFound();

    const title = content.metadata.title || content.slug;
    const allItems = await getAllContent(first, validLocale);
    const { prev, next } = getPrevNextContent(allItems, content.slug);
    const tocItems = getTocItems(validLocale, first, rest);
    const GUIDE_STOP_WORDS = new Set(['british', 'railway', 'roblox', 'guide', 'guides', 'tier', 'list', 'train', 'trains', 'update', 'updates', 'wiki', 'complete', 'ultimate', 'best', 'build', 'tips', 'walkthrough', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'is', 'it', 'how', 'what', 'all', 'vs', 'game']);
    const currentCategory = content.metadata.category;
    const currentKeywords = (content.metadata.keywords || []).map((k) => k.toLowerCase());
    const currentTitleWords = (content.metadata.title || content.slug).toLowerCase().split(/[\s\-:]+/).filter((w) => w.length > 2 && !GUIDE_STOP_WORDS.has(w));
    const moreGuidesSource = first === 'guides' ? allItems : await getAllContent('guides', validLocale);
    const scored = moreGuidesSource
      .filter((item) => item.slug !== content.slug)
      .map((item) => {
        let score = 0;
        if (item.metadata.category === currentCategory) score += 3;
        if (item.metadata.category && currentCategory) {
          if (CATEGORY_AFFINITY[currentCategory]?.includes(item.metadata.category)) score += 1;
        }
        const itemKeywords = (item.metadata.keywords || []).map((k) => k.toLowerCase());
        const kwOverlap = currentKeywords.filter((k) => itemKeywords.some((ik) => ik.includes(k) || k.includes(ik))).length;
        score += Math.min(kwOverlap, 4);
        const itemTitleWords = (item.metadata.title || item.slug).toLowerCase().split(/[\s\-:]+/).filter((w) => w.length > 2 && !GUIDE_STOP_WORDS.has(w));
        const titleOverlap = currentTitleWords.filter((w) => itemTitleWords.includes(w)).length;
        score += Math.min(titleOverlap, 4);
        if (item.metadata.difficulty === content.metadata.difficulty) score += 1;
        const hash = (content.slug + item.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        score += (hash % 100) / 200;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score || (a.item.metadata.order ?? 99) - (b.item.metadata.order ?? 99));
    const moreGuides = scored.slice(0, 5).map(({ item }) => ({
      title: item.metadata.title || item.slug,
      href: item.path,
      category: item.metadata.category,
    }));

    const ContentComponent = content.Content;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <JsonLd data={articleJsonLd({ title, description: content.metadata.description || '', path: content.path, locale: validLocale, datePublished: content.metadata.date, dateModified: content.metadata.lastModified, image: content.metadata.image })} />
        <JsonLd data={breadcrumbJsonLd([{ name: t('nav_home'), path: '/' }, { name: t(getNavigationItem(first)!.labelKey), path: `/${first}` }, { name: title, path: content.path }], validLocale)} />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
          <Link href="/" title={t('nav_home')} className="hover:text-[var(--color-accent)] transition-colors">{t('nav_home')}</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href={`/${first}`} title={t(getNavigationItem(first)!.labelKey)} className="hover:text-[var(--color-accent)] transition-colors">{t(getNavigationItem(first)!.labelKey)}</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-[var(--color-text-primary)] font-medium">{title}</span>
        </nav>

        <div className="flex gap-10">
          <div className="min-w-0 flex-1 max-w-4xl">
            {/* Fallback notice */}
            {content.isFallback && (
              <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400/80 flex items-center gap-2">
                <span className="text-base">⚠</span> {t('content_fallbackNotice')}
              </div>
            )}

            {/* Article header */}
            <div className="mb-10 pb-8 border-b border-[var(--color-border)] relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-secondary)] to-transparent rounded-t-full opacity-60" />
              <div className="flex items-center gap-2 mb-4 pt-1">
                {content.metadata.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">{t(`guide_category_${content.metadata.category}`)}</span>
                )}
                {content.metadata.difficulty && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)]">{content.metadata.difficulty}</span>
                )}
                {content.metadata.lastModified && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">{t('common_updated')}: {new Date(content.metadata.lastModified).toLocaleDateString(validLocale)}</span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] gradient-text leading-tight mb-5">{title}</h1>
              {content.metadata.description && <p className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed">{content.metadata.description}</p>}
            </div>

            {content.metadata.image && !content.metadata.video && (
              <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-8 border border-[var(--color-border)]">
                <Image src={content.metadata.image} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 900px" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/40 via-transparent to-transparent" />
              </div>
            )}

            {content.metadata.video && (
              <ArticleVideo videoId={content.metadata.video} title={title} />
            )}

            {content.metadata.image && content.metadata.video && (
              <noscript>
                <img src={content.metadata.image} alt={title} loading="lazy" />
              </noscript>
            )}

            {adKey && (
              <div className="flex justify-center py-4 mb-8">
                <AdBanner type="native-banner" />
              </div>
            )}

            {/* Article content */}
            <ArticleContent showAds={!!adKey}>
              <ContentComponent />
            </ArticleContent>

            {adKey && (
              <div className="flex justify-center py-6 mt-6">
                {/* Desktop: 728×90 */}
                <div className="hidden md:block">
                  <AdBanner type="banner-728x90" />
                </div>
                {/* Mobile: 468×60 */}
                <div className="block md:hidden">
                  <AdBanner type="banner-468x60" />
                </div>
              </div>
            )}

            {/* Prev/Next navigation */}
            <div className="mt-14 border-t border-[var(--color-border)] pt-8">
              <div className="flex justify-between gap-4">
                {prev ? (
                  <Link href={prev.path} title={prev.metadata.title || prev.slug} className="group flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] px-5 py-4 flex-1 hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.06)] transition-all duration-300 card-accent-bar">
                    <span className="text-[10px] text-[var(--color-accent)] uppercase tracking-wider font-semibold">{t('guide_nav_prev')}</span>
                    <span className="text-sm font-semibold group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{prev.metadata.title || prev.slug}</span>
                  </Link>
                ) : <div className="flex-1" />}
                {next ? (
                  <Link href={next.path} title={next.metadata.title || next.slug} className="group flex items-center justify-end gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] px-5 py-4 flex-1 text-right hover:border-[var(--color-accent-secondary)]/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.06)] transition-all duration-300 card-accent-bar">
                    <span className="text-[10px] text-[var(--color-accent-secondary)] uppercase tracking-wider font-semibold">{t('guide_nav_next')}</span>
                    <span className="text-sm font-semibold group-hover:text-[var(--color-accent-secondary)] transition-colors line-clamp-2">{next.metadata.title || next.slug}</span>
                  </Link>
                ) : <div className="flex-1" />}
              </div>
              <div className="mt-6">
                <Link href={`/${first}`} title={t('guide_nav_all')} className="btn-secondary">{t('guide_nav_all')}</Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {tocItems.length > 0 && <GuideSidebar tocItems={tocItems} moreGuides={moreGuides} contentType={first} />}
        </div>
      </div>
    );
  }

  notFound();
}
