/*
 * /api/v1/manifest.json: het enige bestand dat de app bij elke start ophaalt.
 * Een paar honderd bytes, ongeacht hoeveel posts er zijn.
 *
 * Is `latestId` gelijk aan wat de app al heeft, dan is er niets te doen en
 * stopt het daar. Dat is ook wat de meldingen straks vergelijken: een nieuwe
 * `latestId` betekent een nieuwe post, een nieuwe `generated` niet, want de
 * site bouwt zichzelf een paar keer per dag opnieuw voor Clips en Streams.
 */

import type { APIRoute } from 'astro';
import { getPosts } from '../../../lib/posts';
import { locales } from '../../../i18n/ui';
import { API_SCHEMA, PAGE_SIZE, jsonResponse, pageCount } from '../../../lib/api-feed';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const languages: Record<string, unknown> = {};

  for (const locale of locales) {
    const posts = await getPosts(locale);
    const newest = posts[0];
    languages[locale] = {
      posts: posts.length,
      pages: pageCount(posts.length),
      latest: newest ? newest.date.toISOString() : null,
      latestId: newest ? `${newest.collection}/${newest.slug}` : null,
      index: new URL(`/api/v${API_SCHEMA}/${locale}/page-1.json`, base).href,
    };
  }

  return jsonResponse({
    schema: API_SCHEMA,
    generated: new Date().toISOString(),
    site: base.origin,
    pageSize: PAGE_SIZE,
    languages,
  });
};
