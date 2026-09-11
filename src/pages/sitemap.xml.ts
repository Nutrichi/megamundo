/*
 * /sitemap.xml: een sitemap-index die naar de sitemap van @astrojs/sitemap
 * wijst. Die integratie schrijft zelf sitemap-index.xml en sitemap-0.xml;
 * dit adres bestaat omdat Search Console op /sitemap.xml ingesteld is (Nutri,
 * 11 september 2026), en omdat dat de naam is die elke crawler eerst probeert.
 *
 * Eén deel volstaat: de integratie begint pas bij 45.000 adressen aan een
 * tweede. Komt er ooit een sitemap-1.xml bij, dan hoort die hier ook.
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${new URL('/sitemap-0.xml', base).href}</loc></sitemap>
</sitemapindex>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
