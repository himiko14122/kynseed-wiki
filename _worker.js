// Cloudflare Worker entry for Kynseed Wiki
// Migrated from Pages Functions (functions/[[path]].js + functions/api/indexnow.js)
// Static assets served from ./out via ASSETS binding.
// Locale routing mirrors Pages behavior:
//   - /en/... and /{de,ja,ko}/... served directly
//   - root paths (/, /guides/...) rewritten to /en/...
//   - trailing-slash index.html fallback

const LOCALES = ['de', 'ja', 'ko'];

function hasLocalePrefix(pathname) {
  for (const loc of LOCALES) {
    if (pathname === '/' + loc || pathname.startsWith('/' + loc + '/')) return true;
  }
  return false;
}

function isEnPrefixed(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function isStaticAsset(pathname) {
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/images/') || pathname.startsWith('/ads/')) return true;
  if (pathname.startsWith('/favicon')) return true;
  return /\.(js|css|json|xml|txt|webp|png|jpg|jpeg|svg|ico|woff2?|ttf|map)$/i.test(pathname);
}

async function fetchWithIndexFallback(request, env) {
  let response = await env.ASSETS.fetch(request);

  if (response.status === 404) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    let indexPath;
    if (pathname.endsWith('/')) {
      indexPath = pathname + 'index.html';
    } else {
      indexPath = pathname + '/index.html';
    }
    const indexUrl = new URL(indexPath, url.origin);
    response = await env.ASSETS.fetch(new Request(indexUrl, request));
  }

  return response;
}

// ---- /api/indexnow (migrated from functions/api/indexnow.js) ----
// IndexNow key committed at D7-5: c719147a1b0dab70d60183844a8dd218
const INDEXNOW_KEY = 'cfdaf980934aefcda7e951d040c8fc11';
const HOST = 'www.kynseed.wiki';
const SEARCH_ENGINES = [
  'https://www.bing.com/indexnow',
  'https://api.indexnow.org/indexnow',
  'https://yandex.com/indexnow',
];

async function submitIndexNow(urlList) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList,
  };
  return Promise.allSettled(
    SEARCH_ENGINES.map((engine) =>
      fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )
  );
}

function indexNowJson(summary) {
  return new Response(JSON.stringify({ ok: true, results: summary }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleIndexNow(request) {
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const urls = body.urls;
      if (!Array.isArray(urls) || urls.length === 0) {
        return new Response(JSON.stringify({ error: 'Provide a non-empty "urls" array' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      if (urls.length > 10000) {
        return new Response(JSON.stringify({ error: 'Maximum 10,000 URLs per request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const results = await submitIndexNow(urls);
      const summary = results.map((r, i) => ({
        engine: SEARCH_ENGINES[i],
        status: r.status === 'fulfilled' ? r.value.status : 'failed',
      }));
      return indexNowJson(summary);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (request.method === 'GET') {
    const baseUrl = `https://${HOST}`;
    const locales = ['en', 'de', 'ja', 'ko'];
    const categories = [
      'guides', 'combat', 'farming', 'business', 'relationships',
      'crafting', 'dungeons', 'lore', 'updates',
    ];
    const allUrls = [];
    for (const locale of locales) {
      const prefix = locale === 'en' ? '' : `${locale}/`;
      allUrls.push(`${baseUrl}/${prefix}`);
      for (const cat of categories) {
        allUrls.push(`${baseUrl}/${prefix}${cat}`);
      }
    }
    const result = await submitIndexNow(allUrls);
    const summary = result.map((r, i) => ({
      engine: SEARCH_ENGINES[i],
      status: r.status === 'fulfilled' ? r.value.status : 'failed',
    }));
    return new Response(JSON.stringify({ ok: true, submitted: allUrls.length, results: summary }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // /api/indexnow endpoint
    if (pathname === '/api/indexnow' || pathname.startsWith('/api/indexnow')) {
      return handleIndexNow(request);
    }

    // Locale-aware static serving (migrated from functions/[[path]].js)
    if (hasLocalePrefix(pathname) || isEnPrefixed(pathname) || isStaticAsset(pathname)) {
      const response = await fetchWithIndexFallback(request, env);
      if (response.status !== 404) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=3600');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
      return response;
    }

    // Root paths → English mirror
    const enPath = pathname === '/' ? '/en/' : '/en' + pathname;
    const enUrl = new URL(enPath, url.origin);
    const response = await fetchWithIndexFallback(new Request(enUrl, request), env);

    if (response.status === 404) {
      const enPathNoSlash = pathname.endsWith('/') ? '/en' + pathname.slice(0, -1) : enPath;
      const enUrl2 = new URL(enPathNoSlash, url.origin);
      const fallbackResponse = await env.ASSETS.fetch(new Request(enUrl2, request));
      if (fallbackResponse.status !== 404) {
        const headers = new Headers(fallbackResponse.headers);
        headers.set('Cache-Control', 'public, max-age=3600');
        return new Response(fallbackResponse.body, {
          status: fallbackResponse.status,
          statusText: fallbackResponse.statusText,
          headers,
        });
      }
      return fallbackResponse;
    }

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=3600');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
