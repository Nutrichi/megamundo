/* /nl/rss.xml en de andere talen. De opbouw staat in src/lib/rss.ts. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { defaultLocale, locales, type Locale } from '../../i18n/ui';
import { rssResponse } from '../../lib/rss';

export const getStaticPaths: GetStaticPaths = () =>
  locales.filter((lang) => lang !== defaultLocale).map((lang) => ({ params: { lang } }));

export const GET: APIRoute = ({ params, site }) => rssResponse(params.lang as Locale, site);
