import { getTranslations } from 'next-intl/server';
import { EXTERNAL_LINKS } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { getAllContent } from '@/lib/content';
import { getLocale } from 'next-intl/server';
import { NAVIGATION_CONFIG } from '@/config/navigation';
import { FOOTER_DATA } from '@/data/game-data';

export default async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const guides = await getAllContent('guides', locale);

  const categoryItems = NAVIGATION_CONFIG.filter(
    (item) => item.showInHeader && item.isContentType
  );

  const guideLinks = guides.slice(0, 5).map((item) => ({
    label: item.metadata.title || item.slug,
    href: item.path,
  }));

  const communityLinks: { label: string; href: string; external?: true }[] = [
    { label: t('footer_playOnSteam'), href: EXTERNAL_LINKS.steam, external: true },
  ];
  if (FOOTER_DATA.officialDiscordUrl) {
    communityLinks.push({ label: t('footer_joinDiscord'), href: FOOTER_DATA.officialDiscordUrl, external: true });
  }
  if (FOOTER_DATA.officialYoutubeUrl) {
    communityLinks.push({ label: t('footer_officialYouTube'), href: FOOTER_DATA.officialYoutubeUrl, external: true });
  }
  if (FOOTER_DATA.communityTool.href) {
    communityLinks.push({ label: FOOTER_DATA.communityTool.label, href: FOOTER_DATA.communityTool.href, external: true });
  }

  const sections = [
    {
      title: t('footer_gameCategories'),
      links: categoryItems.map((item) => ({
        label: t(item.labelKey),
        href: item.path,
      })),
    },
    {
      title: t('nav_guides'),
      links: guideLinks,
    },
    {
      title: t('footer_resources'),
      links: [
        { label: t('guide_beginner'), href: '/guides' },
        { label: t('nav_about'), href: '/about' },
        { label: t('nav_sitemap'), href: '/sitemap' },
      ],
    },
    {
      title: t('footer_community'),
      links: communityLinks,
    },
  ];

  return (
    <footer className="border-t border-[var(--color-border)] mt-16 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h4 className="text-base font-extrabold font-[var(--font-heading)] text-[var(--color-accent)] mb-2 tracking-tight">{t('footer_aboutTitle')}</h4>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{t('footer_about')}</p>
          <p className="text-sm text-[var(--color-text-muted)] italic mt-1.5">{t('footer_description')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-[var(--color-border)]">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold font-[var(--font-heading)] text-[var(--color-text-muted)] mb-3 uppercase tracking-widest">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    {'external' in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" title={link.label} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} title={link.label} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">{t('footer_rights')}</p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/privacy-policy" title={t('nav_privacyPolicy')} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">{t('nav_privacyPolicy')}</Link>
            <Link href="/terms-of-service" title={t('nav_termsOfService')} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">{t('nav_termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
