/*
 * Daily Clips en Streams (§10), klaar voor de pagina en de navigatie.
 *
 * De opgehaalde lijsten staan in src/data/generated/, geschreven door
 * scripts/fetch-feeds.mjs vlak voor de build. Die map staat niet in git
 * (afspraak 11 september 2026). Is er niets opgehaald, dan is er geen
 * bestand, en dus geen pagina en geen tab: dezelfde regel als bij elke
 * andere sectie (§4.1).
 *
 * Het uitgelichte staat apart, in src/data/featured.json, want de fetcher
 * overschrijft zijn eigen bestanden bij elke run (§10.4). De vorm:
 *
 *   {
 *     "streams": [{ "channel": "twitchlogin", "order": 1 }],
 *     "clips":   [{ "video": "YouTube-video-ID", "order": 1,
 *                   "from": "2026-10-01", "until": "2026-10-31", "sponsored": true }]
 *   }
 *
 * `order` is de volgorde, `from` en `until` zijn optioneel, en `sponsored`
 * zet het label op SPONSORED zodra er geld tegenover staat. Zonder betaling
 * blijft het FEATURED. De fetcher leest dit bestand ook: hij haalt de
 * gegevens van elk uitgelicht kanaal of elke uitgelichte video mee op.
 */

import featuredFile from '../data/featured.json';

export type FeedKind = 'clips' | 'streams';

export type Stream = {
  channel: string;
  name: string;
  title: string;
  game: string;
  viewers: number;
  /** Null als het kanaal offline was. */
  startedAt: string | null;
  language: string;
  thumbnail: string | null;
  url: string;
  /** Live bij de laatste ophaling. Alleen een uitgelicht kanaal kan offline zijn. */
  live: boolean;
};

export type Clip = {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  views: number;
  publishedAt: string;
  /** In seconden. */
  duration: number;
  language: string;
  thumbnail: string | null;
  url: string;
};

export type StreamRules = { game: string; minViewers: number };
export type ClipRules = {
  query: string;
  windowHours: number;
  minViews: number;
  /** Ontbreekt in bestanden van vóór 11 september. */
  minSeconds?: number;
  maxMinutes: number;
  language: string;
};

type FeedFile<T, R> = { fetchedAt: string; rules: R; items: T[]; featured: T[] };

type Pick = { order?: number; from?: string; until?: string; sponsored?: boolean };

/** Eén item op de pagina, met of het een handmatige keuze is. */
export type Entry<T> = { item: T; picked: boolean; sponsored: boolean };

export type Feed<T, R> = {
  fetchedAt: Date;
  rules: R;
  /** Het grote blok links. */
  lead: Entry<T>;
  /** De lijst rechts: eerst de rest van het uitgelichte, dan het opgehaalde. */
  list: Entry<T>[];
};

/*
 * Bij het bouwen ingelezen. Bestaat een bestand niet, dan ontbreekt het
 * gewoon in dit object; dat is geen fout.
 */
const generated = import.meta.glob('../data/generated/*.json', { eager: true, import: 'default' });

function read<T, R>(kind: FeedKind): FeedFile<T, R> | null {
  const file = generated[`../data/generated/${kind}.json`] as FeedFile<T, R> | undefined;
  return file && Array.isArray(file.items) && Array.isArray(file.featured) ? file : null;
}

/** De keuzes die vandaag gelden, in hun volgorde. */
function activePicks<P extends Pick>(picks: P[], now: Date): P[] {
  const today = now.toISOString().slice(0, 10);
  return picks
    .filter((pick) => (!pick.from || pick.from <= today) && (!pick.until || today <= pick.until))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/*
 * Legt het uitgelichte over het opgehaalde (§10.4): eerst de keuzes in hun
 * volgorde, dan de lijst met die keuzes eruit, zodat niets dubbel staat.
 *
 * Groot links komt de eerste keuze die daar mag staan. Zonder keuze is dat
 * het item met de meeste kijkers of weergaven; dat krijgt dan geen label,
 * want niemand heeft het uitgekozen.
 *
 * Geen groot blok betekent niets om te tonen, en dan geen pagina.
 */
function assemble<T, R, P extends Pick>(options: {
  file: FeedFile<T, R> | null;
  picks: P[];
  pickKey: (pick: P) => string;
  itemKey: (item: T) => string;
  /** Mag dit item groot links staan? Een offline kanaal niet. */
  canLead: (item: T) => boolean;
  /** Wat het beste is als er niets uitgelicht is. */
  rank: (item: T) => number;
  now: Date;
}): Feed<T, R> | null {
  const { file, picks, pickKey, itemKey, canLead, rank, now } = options;
  if (!file) return null;

  const featured = new Map(file.featured.map((item) => [itemKey(item), item]));
  const picked: Entry<T>[] = activePicks(picks, now).flatMap((pick) => {
    const item = featured.get(pickKey(pick));
    return item ? [{ item, picked: true, sponsored: pick.sponsored === true }] : [];
  });

  const pickedKeys = new Set(picked.map((entry) => itemKey(entry.item)));
  const fetched: Entry<T>[] = file.items
    .filter((item) => !pickedKeys.has(itemKey(item)))
    .map((item) => ({ item, picked: false, sponsored: false }));

  const best = fetched.reduce<Entry<T> | undefined>(
    (top, entry) => (!top || rank(entry.item) > rank(top.item) ? entry : top),
    undefined,
  );
  const lead = picked.find((entry) => canLead(entry.item)) ?? best;
  if (!lead) return null;

  return {
    fetchedAt: new Date(file.fetchedAt),
    rules: file.rules,
    lead,
    list: [...picked, ...fetched].filter((entry) => entry !== lead),
  };
}

export function getStreams(now = new Date()): Feed<Stream, StreamRules> | null {
  return assemble({
    file: read<Stream, StreamRules>('streams'),
    picks: featuredFile.streams as Array<Pick & { channel: string }>,
    pickKey: (pick) => pick.channel.toLowerCase(),
    itemKey: (stream) => stream.channel.toLowerCase(),
    canLead: (stream) => stream.live,
    rank: (stream) => stream.viewers,
    now,
  });
}

export function getClips(now = new Date()): Feed<Clip, ClipRules> | null {
  return assemble({
    file: read<Clip, ClipRules>('clips'),
    picks: featuredFile.clips as Array<Pick & { video: string }>,
    pickKey: (pick) => pick.video,
    itemKey: (clip) => clip.id,
    canLead: () => true,
    rank: (clip) => clip.views,
    now,
  });
}

/** Voor de navigatie en de routes: is er iets om te tonen? */
export function feedHasContent(kind: FeedKind, now = new Date()): boolean {
  return (kind === 'clips' ? getClips(now) : getStreams(now)) !== null;
}
