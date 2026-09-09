/*
 * De navigatie. Eén plek; een tab bijzetten is hier een regel erbij en
 * geen verbouwing (PROJECT_SPEC.md §4).
 *
 * De harde regel uit §4.1: een sectie is zichtbaar als en alleen als ze
 * gepubliceerde inhoud heeft. Dat wordt hier bij het bouwen geteld, niet
 * met een schakelaar die iemand moet onthouden. Nul items betekent geen
 * navigatie-item, en dus ook geen "binnenkort" in het menu.
 */

import { getCollection } from 'astro:content';
import type { Locale, UIKey } from '../i18n/ui';
import { localizePath } from '../i18n/utils';

/** De zeven Game-submenu's in de vaste volgorde uit §4. */
export const gameSections = [
  'map', 'characters', 'vehicles', 'missions', 'weapons', 'properties', 'cheats',
] as const;
export type GameSection = (typeof gameSections)[number];

/** Labels van de submenu's. `map` heeft een eigen vertaalsleutel. */
const gameSectionKeys: Partial<Record<GameSection, UIKey>> = {
  map: 'nav.map',
};

export type NavItem = {
  id: string;
  /** Sleutel in de vertaalbestanden; nooit een letterlijk label hier. */
  labelKey: UIKey;
  /** Taalloos pad; de taalversie komt uit localizePath. */
  path: string;
  children?: NavItem[];
};

type Section = {
  id: string;
  labelKey: UIKey;
  path: string;
  /** Hoe deze sectie aan inhoud komt. `always` staat er altijd. */
  source: 'always' | 'collection' | 'fetched';
  collection?: 'news' | 'guides' | 'game';
};

/*
 * De vijf tabs. Home staat er altijd; de rest verdient zijn plek.
 *
 * Clips en Streams halen hun inhoud op met GitHub Actions (§10) en hebben
 * dus geen collection. Tot die Actions in fase 7 bestaan, is er niets om
 * te tonen en blijven ze weg. Dat is dezelfde regel, niet een uitzondering.
 */
const sections: Section[] = [
  { id: 'home', labelKey: 'nav.home', path: '', source: 'always' },
  { id: 'game', labelKey: 'nav.game', path: 'game', source: 'collection', collection: 'game' },
  { id: 'guides', labelKey: 'nav.guides', path: 'guides', source: 'collection', collection: 'guides' },
  { id: 'clips', labelKey: 'nav.clips', path: 'clips', source: 'fetched' },
  { id: 'streams', labelKey: 'nav.streams', path: 'streams', source: 'fetched' },
];

/** Alles wat niet als concept gemarkeerd staat, telt als gepubliceerd. */
const published = <T extends { data: { draft?: boolean } }>(entries: T[]) =>
  entries.filter((entry) => !entry.data.draft);

/**
 * De collecties ophalen. Elke pagina heeft dezelfde navigatie nodig, dus bij
 * het bouwen wordt het antwoord onthouden: anders leest elke pagina alle
 * collecties opnieuw in.
 *
 * Alleen bij het bouwen. In `astro dev` blijft de module leven tussen twee
 * verzoeken, en dan zou een nieuwe post pas na een herstart in de navigatie
 * verschijnen.
 */
async function readCollections() {
  const [news, guides, game] = await Promise.all([
    getCollection('news'),
    getCollection('guides'),
    getCollection('game'),
  ]);
  return { news, guides, game };
}

let cache: ReturnType<typeof readCollections> | null = null;

function loadCollections() {
  if (!import.meta.env.PROD) return readCollections();
  if (!cache) cache = readCollections();
  return cache;
}

/**
 * Welke opgehaalde feeds inhoud hebben. Fase 7 vult dit met de bestanden die
 * de Actions wegschrijven; zolang die er niet zijn, is het antwoord nee.
 */
async function fetchedHasContent(_id: string): Promise<boolean> {
  return false;
}

/**
 * Bouwt de zichtbare navigatie voor één taal.
 * Draait bij het bouwen, dus dit kost de bezoeker niets.
 */
export async function getNav(locale: Locale): Promise<NavItem[]> {
  const { news: newsEntries, guides: guideEntries, game: gameEntries } =
    await loadCollections();

  const counts = {
    news: published(newsEntries).length,
    guides: published(guideEntries).length,
    game: published(gameEntries).length,
  };

  /** Submenu's van Game: alleen die met minstens één gepubliceerde pagina. */
  const gameChildren: NavItem[] = gameSections
    .filter((section) =>
      published(gameEntries).some((entry) => entry.data.section === section),
    )
    .map((section) => ({
      id: `game-${section}`,
      labelKey: gameSectionKeys[section] ?? ('nav.game' as UIKey),
      path: localizePath(`game/${section}`, locale),
    }));

  const items: NavItem[] = [];

  for (const section of sections) {
    let visible = false;

    if (section.source === 'always') {
      visible = true;
    } else if (section.source === 'collection' && section.collection) {
      visible = counts[section.collection] > 0;
    } else if (section.source === 'fetched') {
      visible = await fetchedHasContent(section.id);
    }

    if (!visible) continue;

    items.push({
      id: section.id,
      labelKey: section.labelKey,
      path: localizePath(section.path, locale),
      children: section.id === 'game' && gameChildren.length ? gameChildren : undefined,
    });
  }

  return items;
}

/** Hoeveel nieuwsposts er staan; de feed in fase 2 gebruikt dit ook. */
export async function getNewsCount(): Promise<number> {
  const { news } = await loadCollections();
  return published(news).length;
}

/**
 * Is dit navigatie-item de huidige pagina? Vergelijkt zonder slashes zodat
 * `/nl/guides` en `/nl/guides/` hetzelfde antwoord geven.
 */
export function isCurrent(itemPath: string, pathname: string): boolean {
  const a = itemPath.replace(/^\/+|\/+$/g, '');
  const b = pathname.replace(/^\/+|\/+$/g, '');
  if (a === '' || /^[a-z]{2}$/.test(a)) return b === a;
  return b === a || b.startsWith(`${a}/`);
}
