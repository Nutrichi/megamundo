/*
 * De RSS-feeds (8 oktober 2026): /rss.xml in het Engels en /nl/rss.xml enz.
 * in de andere talen. Nieuwsaggregators als Google News, Feedly en Flipboard
 * vinden een nieuwssite vooral via zo'n feed. Uit dezelfde bron als de
 * pagina's (getPosts), dus een ingeplande of concept-post staat er nooit in.
 *
 * Zonder pakket: RSS 2.0 is een handvol tags, en zo blijft er geen
 * afhankelijkheid bij die bij een update van Astro kan breken.
 */

import { getPosts } from './posts';
import { categories } from '../config/categories';
import { localeTags, type Locale } from '../i18n/ui';
import { localizePath, useTranslations } from '../i18n/utils';

/** Hoeveel posts de feed draagt. Een lezer haalt alleen het nieuwste op. */
const LIMIT = 50;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function rssResponse(locale: Locale, site: URL | undefined): Promise<Response> {
  const base = site ?? new URL('https://megamundo.be');
  const abs = (path: string) => new URL(path, base).href;
  const t = useTranslations(locale);
  const posts = (await getPosts(locale)).slice(0, LIMIT);
  const self = abs(localizePath('rss.xml', locale));
  const home = abs(localizePath('', locale));

  const items = posts.map((post) => {
    const link = abs(post.href);
    const image = post.image ? abs(post.image.src) : undefined;
    return [
      '    <item>',
      `      <title>${esc(post.title)}</title>`,
      `      <link>${esc(link)}</link>`,
      `      <guid isPermaLink="true">${esc(link)}</guid>`,
      `      <pubDate>${post.date.toUTCString()}</pubDate>`,
      `      <description>${esc(post.description)}</description>`,
      `      <category>${esc(categories[post.category].label)}</category>`,
      ...(image ? [`      <media:content url="${esc(image)}" medium="image" />`] : []),
      '    </item>',
    ].join('\n');
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(t('site.homeTitle'))}</title>
    <link>${esc(home)}</link>
    <description>${esc(t('site.description'))}</description>
    <language>${localeTags[locale]}</language>
    <atom:link href="${esc(self)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${esc(abs('/assets/icon-192.png'))}</url>
      <title>${esc(t('site.homeTitle'))}</title>
      <link>${esc(home)}</link>
    </image>
${posts[0] ? `    <lastBuildDate>${posts[0].date.toUTCString()}</lastBuildDate>\n` : ''}${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
