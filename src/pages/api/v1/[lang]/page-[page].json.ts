/*
 * /api/v1/<taal>/page-N.json: de lijst, nieuwste eerst, vijftig per pagina.
 *
 * Pagina 1 is altijd de nieuwste vijftig. De app haalt bij het verversen
 * alleen die op; oudere pagina's pas als de lezer terugscrollt. Daardoor kost
 * bijblijven evenveel bij honderd posts als bij tienduizend.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts } from '../../../../lib/posts';
import { locales, type Locale } from '../../../../i18n/ui';
import { API_SCHEMA, PAGE_SIZE, jsonResponse, pageCount, summaryOf } from '../../../../lib/api-feed';

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = [];
  for (const lang of locales) {
    const posts = await getPosts(lang);
    for (let page = 1; page <= pageCount(posts.length); page++) {
      paths.push({ params: { lang, page: String(page) } });
    }
  }
  return paths;
};

export const GET: APIRoute = async ({ params, site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const lang = params.lang as Locale;
  const page = Number(params.page);

  const posts = await getPosts(lang);
  const pages = pageCount(posts.length);
  const slice = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return jsonResponse({
    schema: API_SCHEMA,
    lang,
    page,
    pages,
    total: posts.length,
    /* Wat de app hierna kan ophalen; zo hoeft hij zelf niets te rekenen. */
    next: page < pages ? new URL(`/api/v${API_SCHEMA}/${lang}/page-${page + 1}.json`, base).href : null,
    posts: await Promise.all(slice.map((post) => summaryOf(post, base))),
  });
};
