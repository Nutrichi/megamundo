/*
 * /api/v1/<taal>/posts/<slug>.json: één artikel, met de tekst erin.
 *
 * De app haalt dit één keer op en bewaart het. Daarom staat de tekst hier en
 * niet in de lijst: zo blijft verversen licht en is een gelezen artikel
 * daarna offline beschikbaar.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts } from '../../../../../lib/posts';
import { locales } from '../../../../../i18n/ui';
import { detailOf, jsonResponse } from '../../../../../lib/api-feed';

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = [];
  for (const lang of locales) {
    for (const post of await getPosts(lang)) {
      paths.push({ params: { lang, slug: post.slug }, props: { post } });
    }
  }
  return paths;
};

export const GET: APIRoute = async ({ props, site }) => {
  const base = site ?? new URL('https://megamundo.be');
  return jsonResponse(await detailOf(props.post, base));
};
