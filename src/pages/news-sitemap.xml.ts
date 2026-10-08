/*
 * /news-sitemap.xml (8 oktober 2026): de Google News-sitemap. Google wil daar
 * alleen nieuws van de laatste twee dagen in, met titel, taal en het exacte
 * moment van publicatie; zo vindt het een nieuwe post sneller dan via de
 * gewone sitemap. Elke taal apart, en alleen een echte vertaling: een
 * Engelse terugval onder /nl/ is geen Nederlands artikel.
 *
 * Gebouwd bij elke deploy, en de site bouwt elk kwartier opnieuw, dus de
 * lijst schuift vanzelf mee. Leeg is geldig: dan is er twee dagen niets
 * nieuws verschenen.
 */

import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';
import { locales } from '../i18n/ui';

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const since = Date.now() - TWO_DAYS;
  const urls: string[] = [];

  for (const locale of locales) {
    for (const post of await getPosts(locale)) {
      if (post.collection !== 'news' || post.isFallback) continue;
      if (post.date.getTime() < since) continue;
      urls.push(`  <url>
    <loc>${esc(new URL(post.href, base).href)}</loc>
    <news:news>
      <news:publication>
        <news:name>Megamundo</news:name>
        <news:language>${locale}</news:language>
      </news:publication>
      <news:publication_date>${post.date.toISOString()}</news:publication_date>
      <news:title>${esc(post.title)}</news:title>
    </news:news>
  </url>`);
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
