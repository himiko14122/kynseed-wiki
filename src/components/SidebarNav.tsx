'use client';

import { useTranslations } from 'next-intl';
import { NAVIGATION_CONFIG } from '@/config/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import AdBanner from '@/components/AdBanner';
import { AD_BANNER_KEY } from '@/config/ads';
import { SIDEBAR_CODES } from '@/data/game-data';

type NavDropdownMap = Record<string, { label: string; path: string }[]>;

export default function SidebarNav({ navDropdownItems = {} as NavDropdownMap }) {
  const t = useTranslations();
  const pathname = usePathname();
  const adKey = AD_BANNER_KEY;
  const items = NAVIGATION_CONFIG.filter((item) => item.showInSidebar);
  const hasRealCodes = SIDEBAR_CODES.length > 0 && !SIDEBAR_CODES.every(c => c.code === 'None');

  const isChildActive = (childPath: string) => {
    const normalized = pathname.replace(/\/+$/, '');
    return normalized === childPath || normalized === childPath + '/';
  };

  return (
    <aside className="w-64 shrink-0 hidden xl:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
      <div className="card" style={{ padding: '1rem' }}>
        <h3 className="text-sm font-bold font-[var(--font-heading)] text-[var(--color-accent)] mb-4 uppercase tracking-wider">{t('sidebar_wikiNav')}</h3>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path || (item.path !== '/' && (pathname.startsWith(item.path + '/') || pathname === item.path));
            const children = navDropdownItems[item.key];
            const hasChildren = children && children.length > 0;

            return (
              <div key={item.key}>
                <Link
                  href={item.path}
                  title={t(item.labelKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{t(item.labelKey)}</span>
                  {hasChildren && (
                    <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">{children.length}</span>
                  )}
                </Link>
                {active && hasChildren && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-[var(--color-border)] pl-3">
                    {children.map((child) => {
                      const childActive = isChildActive(child.path);
                      return (
                        <Link key={child.path} href={child.path} title={child.label} className={`block py-1.5 px-2 rounded-md text-xs transition-colors ${childActive ? 'text-[var(--color-accent)] font-semibold bg-[var(--color-accent)]/10 border-l-2 border-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'}`}>{child.label}</Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <h4 className="text-xs font-bold font-[var(--font-heading)] text-[var(--color-accent)] mb-2 uppercase tracking-wider">{t('sidebar_activeCodes')}</h4>
          {SIDEBAR_CODES.length > 0 ? (
            <div className="space-y-2">
              {SIDEBAR_CODES.map((item, idx) => (
                <div key={idx} className="rounded-md bg-[var(--color-bg-secondary)] px-3 py-2">
                  <p className="text-xs font-mono font-bold text-[var(--color-accent)]">{item.code}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{item.reward}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">{t('sidebar_noCodes')}</p>
          )}
          {hasRealCodes && <Link href="/codes" title={t('sidebar_viewAllCodes')} className="block mt-2 text-xs text-[var(--color-accent)] hover:underline">{t('sidebar_viewAllCodes')} &rarr;</Link>}
        </div>
      </div>

      {adKey && (
        <div className="mt-4 flex justify-center">
          <AdBanner type="banner-160x300" />
        </div>
      )}
    </aside>
  );
}
