/*
 * De gebieden van de kaart. Eén Markdown-bestand per gebied in de collectie
 * `game` met `section: map`; dat is meteen de inhoud die §4.1 nodig heeft om
 * de tab Game en het submenu Map te laten verschijnen.
 *
 * Dezelfde taalregel als bij de posts: staat de vertaling er, dan die;
 * anders het Engels. Zo is elk gebied in elke taal bereikbaar.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '../i18n/ui';
import { isLocale, localizePath } from '../i18n/utils';

type GameEntry = CollectionEntry<'game'>;

export type Region = {
  slug: string;
  href: string;
  title: string;
  description: string;
  realName?: string;
  polygon?: [number, number][];
  labelAt?: [number, number];
  order: number;
  lang: Locale;
  isFallback: boolean;
  entry: GameEntry;
};

function splitId(entry: GameEntry): { lang: Locale; slug: string } {
  const parts = entry.id.split('/');
  const first = parts[0];
  if (parts.length > 1 && isLocale(first)) {
    return { lang: first, slug: parts.slice(1).join('/') };
  }
  return { lang: entry.data.lang as Locale, slug: entry.id };
}

async function readGame() {
  return getCollection('game');
}

let cache: ReturnType<typeof readGame> | null = null;

function loadGame() {
  if (!import.meta.env.PROD) return readGame();
  if (!cache) cache = readGame();
  return cache;
}

/** Alle gebieden in één taal, in de volgorde uit `order`. */
export async function getRegions(locale: Locale): Promise<Region[]> {
  const all = await loadGame();
  const bySlug = new Map<string, Map<Locale, GameEntry>>();

  for (const entry of all) {
    if (entry.data.draft) continue;
    if (entry.data.section !== 'map') continue;
    const { lang, slug } = splitId(entry);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(lang, entry);
  }

  const regions: Region[] = [];

  for (const [slug, byLang] of bySlug) {
    const lang = byLang.has(locale)
      ? locale
      : byLang.has(defaultLocale)
        ? defaultLocale
        : undefined;
    if (!lang) continue;

    const entry = byLang.get(lang)!;
    const data = entry.data;

    regions.push({
      slug,
      href: localizePath(`game/map/${slug}`, locale),
      title: data.title,
      description: data.description,
      realName: data.realName,
      polygon: data.polygon as [number, number][] | undefined,
      labelAt: data.labelAt as [number, number] | undefined,
      order: data.order,
      lang,
      isFallback: lang !== locale,
      entry,
    });
  }

  return regions.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** Eén gebied opzoeken, voor de gebiedspagina. */
export async function getRegion(slug: string, locale: Locale): Promise<Region | undefined> {
  return (await getRegions(locale)).find((region) => region.slug === slug);
}

/** Elke slug, voor getStaticPaths. */
export async function getRegionSlugs(): Promise<string[]> {
  return (await getRegions(defaultLocale)).map((region) => region.slug);
}
