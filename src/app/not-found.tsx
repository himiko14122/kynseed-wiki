'use client';

import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    const p = window.location.pathname;
    const locales = ['en', 'de', 'es', 'ja'];
    const hasLocale = locales.some(
      (l) => p === `/${l}/` || p === `/${l}` || p.startsWith(`/${l}/`)
    );
    if (hasLocale && !p.endsWith('/')) {
      window.location.replace(p + '/');
      return;
    }
    if (!hasLocale && p !== '/') {
      const nav = navigator.language.split('-')[0];
      const target = locales.includes(nav) ? nav : 'en';
      window.location.replace(`/${target}${p}`);
    }
  }, []);

  return (
    <html>
      <body>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1b2a',
          color: '#94a3b8',
        }}>
          Redirecting...
        </div>
      </body>
    </html>
  );
}
