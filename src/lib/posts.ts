/*
 * Eén plek die weet wat een post is. De homepage, de postpagina, de
 * navigatie en straks de sitemap lezen allemaal hiervandaan, zodat de regels
 * uit §4.1, §5 en §11 maar op één plek staan.
 *
 * Drie dingen gebeuren hier:
 *
 * 1. Concepten eruit. `draft: true` wordt nooit gebouwd of geïndexeerd (§14).
 * 2. Taal kiezen. Een post bestaat per taal als een eigen bestand onder
 *    <collectie>/<taal>/<slug>.md. Ontbreekt de vertaling, dan komt de
 *    Engelse tekst. Zo levert een halve vertaling nooit een lege pagina op.
 * 3. Nieuwste eerst. De hele feed is één lijst, ongeacht categorie: een gids
 *    wordt als nieuwsitem in dezelfde feed aangekondigd (§5).
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { categoryKeys, collectionPath, type CategoryKey } from '../config/categories';
import { defaultLocale, locales, type Locale } from '../i18n/ui';
import { isLocale, localizePath } from '../i18n/utils';

/** De twee collecties die als post in de feed verschijnen. */
type PostCollection = 'news' | 'guides';
type PostEntry = CollectionEntry<'news'> | CollectionEntry<'guides'>;

export type Post = {
  slug: string;
  /** Waar de post staat: news of guides. Bepaalt de URL. */
  collection: PostCollection;
  /** Het spel waar hij over gaat. Bepaalt kleur, label en filter (§6). */
  category: CategoryKey;
  /** Het pad naar deze post in de gevraagde taal. */
  href: string;
  /** De taal van de tekst die je hier krijgt; niet altijd de gevraagde taal. */
  lang: Locale;
  /** Waar de tekst nog Engels is omdat de vertaling ontbreekt. */
  isFallback: boolean;
  title: string;
  description: string;
  date: Date;
  featured: boolean;
  tags: string[];
  source?: string;
  sourceUrl?: string;
  image?: PostEntry['data']['image'];
  imageAlt?: string;
  /** Nodig om de Markdown te renderen op de postpagina. */
  entry: PostEntry;
  /** Ongeveer hoeveel minuten lezen; de metaregel van de postpagina. */
  readingMinutes: number;
};

/**
 * Splitst de id van de glob-loader. `en/trailer-two` geeft taal `en` en slug
 * `trailer-two`. Staat een bestand per ongeluk zonder taalmap, dan wint het
 * `lang`-veld uit de frontmatter en is de hele id de slug.
 */
function splitId(entry: PostEntry): { lang: Locale; slug: string } {
  const parts = entry.id.split('/');
  const first = parts[0];
  if (parts.length > 1 && isLocale(first)) {
    return { lang: first, slug: parts.slice(1).join('/') };
  }
  return { lang: entry.data.lang as Locale, slug: entry.id };
}

/** Ruwe schatting: 200 woorden per minuut, minimaal één. */
function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Alles inlezen. Elke pagina heeft dezelfde feed nodig, dus bij het bouwen
 * wordt het antwoord onthouden. In `astro dev` niet: daar blijft de module
 * leven tussen twee verzoeken, en dan zou een nieuwe post pas na een
 * herstart verschijnen.
 */
async function readAll() {
  const [news, guides] = await Promise.all([
    getCollection('news'),
    getCollection('guides'),
  ]);
  return { news, guides } as Record<PostCollection, PostEntry[]>;
}

let cache: ReturnType<typeof readAll> | null = null;

function loadAll() {
  if (!import.meta.env.PROD) return readAll();
  if (!cache) cache = readAll();
  return cache;
}

/**
 * Bouwt één post op uit de entry die voor deze taal gekozen is.
 */
function toPost(
  entry: PostEntry,
  collection: PostCollection,
  slug: string,
  lang: Locale,
  wanted: Locale,
): Post {
  const data = entry.data;
  return {
    slug,
    collection,
    category: data.category as CategoryKey,
    href: localizePath(`${collectionPath[collection]}/${slug}`, wanted),
    lang,
    isFallback: lang !== wanted,
    title: data.title,
    description: data.description,
    date: data.date,
    featured: data.featured,
    tags: data.tags,
    source: data.source,
    sourceUrl: data.sourceUrl,
    image: data.image,
    imageAlt: data.imageAlt,
    entry,
    readingMinutes: readingMinutes(entry.body),
  };
}

/**
 * Alle gepubliceerde posts in één taal, nieuwste eerst.
 * Nieuws en gidsen door elkaar, want ze delen één feed (§5).
 */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const all = await loadAll();
  const posts: Post[] = [];

  for (const collection of Object.keys(all) as PostCollection[]) {
    /** Per slug de bestanden per taal; concepten gaan er meteen uit. */
    const bySlug = new Map<string, Map<Locale, PostEntry>>();

    for (const entry of all[collection]) {
      if (entry.data.draft) continue;
      const { lang, slug } = splitId(entry);
      if (!bySlug.has(slug)) bySlug.set(slug, new Map());
      bySlug.get(slug)!.set(lang, entry);
    }

    for (const [slug, byLang] of bySlug) {
      /*
       * De gevraagde taal, anders het Engels. Bestaat een post alleen in een
       * derde taal, dan hoort hij nergens: de bron is per definitie Engels
       * (§11), dus dat is een fout in de content en geen geldige post.
       */
      const chosenLang = byLang.has(locale)
        ? locale
        : byLang.has(defaultLocale)
          ? defaultLocale
          : undefined;
      if (!chosenLang) continue;

      posts.push(toPost(byLang.get(chosenLang)!, collection, slug, chosenLang, locale));
    }
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Het uitgelichte artikel: de post met `featured: true`, en anders de
 * nieuwste. Eén artikel, dat niet doorrolt — een carousel blijft verboden (§5).
 */
export function pickFeatured(posts: Post[]): Post | undefined {
  return posts.find((post) => post.featured) ?? posts[0];
}

/** Eén post opzoeken, voor de postpagina. */
export async function getPost(
  collection: PostCollection,
  slug: string,
  locale: Locale,
): Promise<Post | undefined> {
  const posts = await getPosts(locale);
  return posts.find((post) => post.collection === collection && post.slug === slug);
}

/**
 * Elke slug van één categorie, voor `getStaticPaths`. De routes worden per
 * taal gebouwd, ook als de vertaling nog ontbreekt: de pagina toont dan de
 * Engelse tekst en blijft vindbaar.
 */
export async function getSlugs(collection: PostCollection): Promise<string[]> {
  const posts = await getPosts(defaultLocale);
  return posts.filter((post) => post.collection === collection).map((post) => post.slug);
}

/**
 * Welke categorieën echt posts hebben, in de vaste volgorde van
 * config/categories.ts. Het filter gebruikt dit: een chip die altijd nul
 * resultaten geeft, is dezelfde fout als een tab naar een lege sectie
 * (§4.1). Staat er nog geen gids, dan hoort de knop Guides er niet te zijn.
 */
export async function getUsedCategories(locale: Locale): Promise<CategoryKey[]> {
  const posts = await getPosts(locale);
  return categoryKeys.filter((key) => posts.some((post) => post.category === key));
}

/** Hoeveel posts er in deze taal staan; de teller boven de lijst. */
export async function getPostCount(locale: Locale): Promise<number> {
  return (await getPosts(locale)).length;
}

/** Alle talen, voor de routes met taalvoorvoegsel. */
export const otherLocales = locales.filter((locale) => locale !== defaultLocale);
