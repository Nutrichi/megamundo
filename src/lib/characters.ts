/*
 * De personages van GTA VI (/game/characters). Eén Markdown-bestand per
 * personage in de collectie `game` met `section: characters`, net zoals de
 * gebieden van de kaart. Zodra er één staat, verschijnt het submenu
 * Characters vanzelf (§4.1).
 *
 * De bron is de pagina "Only in Leonida" op de site van Rockstar. De tekst
 * is herschreven in de schrijfstem van de site.
 */

import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { defaultLocale, type Locale } from '../i18n/ui';
import { localizePath } from '../i18n/utils';
import { getSectionEntries } from './regions';

/*
 * De officiële screenshots per personage, uit de downloads op
 * rockstargames.com/VI (§2.4, uitzondering van 13 september 2026).
 *
 * Eén map per personage: src/assets/characters/<slug>/. De volgorde van de
 * bestandsnamen is de volgorde op de pagina, en het eerste bestand (00.jpg)
 * staat op de kaart in het overzicht en bovenaan de pagina. De beelden zijn
 * in elke taal dezelfde, dus ze staan niet in de zes Markdown-bestanden: een
 * beeld bijzetten is een bestand erbij.
 */
const shotFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/characters/*/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

function shotsFor(slug: string): ImageMetadata[] {
  return Object.entries(shotFiles)
    .filter(([path]) => path.split('/').at(-2) === slug)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, file]) => file.default);
}

export type Character = {
  slug: string;
  href: string;
  title: string;
  description: string;
  /** Jason en Lucia: bovenaan het overzicht, apart van de rest. */
  lead: boolean;
  order: number;
  source?: string;
  sourceUrl?: string;
  /** De screenshots, het omslagbeeld eerst. Leeg als er geen map is. */
  images: ImageMetadata[];
  lang: Locale;
  isFallback: boolean;
  entry: CollectionEntry<'game'>;
};

/** Alle personages in één taal: eerst de hoofdpersonages, dan `order`. */
export async function getCharacters(locale: Locale): Promise<Character[]> {
  const entries = await getSectionEntries('characters', locale);

  return entries
    .map(({ slug, lang, entry }) => ({
      slug,
      href: localizePath(`game/characters/${slug}`, locale),
      title: entry.data.title,
      description: entry.data.description,
      lead: entry.data.lead,
      order: entry.data.order,
      source: entry.data.source,
      sourceUrl: entry.data.sourceUrl,
      images: shotsFor(slug),
      lang,
      isFallback: lang !== locale,
      entry,
    }))
    .sort((a, b) =>
      Number(b.lead) - Number(a.lead) || a.order - b.order || a.title.localeCompare(b.title),
    );
}

/** Eén personage opzoeken, voor de pagina van dat personage. */
export async function getCharacter(slug: string, locale: Locale): Promise<Character | undefined> {
  return (await getCharacters(locale)).find((character) => character.slug === slug);
}

/** Elke slug, voor getStaticPaths. */
export async function getCharacterSlugs(): Promise<string[]> {
  return (await getCharacters(defaultLocale)).map((character) => character.slug);
}

/**
 * De initialen voor een personage zonder beeld: "Jason Duval" wordt "JD",
 * "Real Dimez" wordt "RD". Hoogstens twee letters.
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
