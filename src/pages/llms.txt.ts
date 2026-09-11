/*
 * /llms.txt (§17): waar de site over gaat en hoe hij in elkaar zit, voor
 * taalmodellen die hem lezen. Bij elke build opnieuw gemaakt, uit dezelfde
 * bronnen als de pagina's, dus hij loopt nooit achter en noemt nooit een
 * sectie die er niet is (§4.1).
 *
 * In het Engels, want dat is de brontaal van de site. De vertalingen staan
 * er als verwijzing bij.
 */

import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';
import { getRegions } from '../lib/regions';
import { getClips, getStreams } from '../lib/feeds';
import { defaultLocale, localeNames, locales, ui } from '../i18n/ui';
import { localizePath } from '../i18n/utils';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const url = (path: string) => new URL(path, base).href;
  const en = ui.en;

  const posts = await getPosts(defaultLocale);
  const regions = await getRegions(defaultLocale);
  const clips = getClips();
  const streams = getStreams();

  const sections = [
    `- [Home](${url('/')}): the full news archive, newest first.`,
    ...(regions.length ? [`- [${en['map.title']}](${url('/game/map/')}): ${en['map.description']}`] : []),
    ...(clips
      ? [`- [${en['clips.title']}](${url('/clips/')}): ${en['clips.description'].replace('{h}', String(clips.rules.windowHours))}`]
      : []),
    ...(streams ? [`- [${en['streams.title']}](${url('/streams/')}): ${en['streams.description']}`] : []),
  ];

  const lines = [
    '# Megamundo',
    '',
    `> ${en['site.description']}`,
    '',
    en['site.disclaimer'],
    '',
    `Every page exists in ${locales.length} languages: ${locales
      .map((locale) => `${localeNames[locale]} (${url(localizePath('', locale))})`)
      .join(', ')}. Posts are written in English and translated. Place names on the map are never translated.`,
    '',
    '## Sections',
    '',
    ...sections,
    '',
    '## News',
    '',
    ...posts.map((post) => `- [${post.title}](${url(post.href)}): ${post.description}`),
    '',
    ...(regions.length
      ? ['## Areas of Leonida', '', ...regions.map((region) => `- [${region.title}](${url(region.href)}): ${region.description}`), '']
      : []),
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
