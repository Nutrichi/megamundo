/* /rss.xml: de Engelse feed. De opbouw staat in src/lib/rss.ts. */
import type { APIRoute } from 'astro';
import { defaultLocale } from '../i18n/ui';
import { rssResponse } from '../lib/rss';

export const GET: APIRoute = ({ site }) => rssResponse(defaultLocale, site);
