/*
 * Content collections. Fase 1 zet ze op omdat de navigatie eruit afgeleid
 * wordt (PROJECT_SPEC.md §4.1): nul gepubliceerde items betekent geen
 * navigatie-item, geen route en geen regel in de sitemap.
 *
 * Fase 2 vult de schema's aan met wat de feed en de postpagina nodig hebben.
 * Wat hier staat is het minimum waarop de navigatie kan rekenen.
 */

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** Velden die elke post deelt, in welke taal dan ook. */
const postFields = {
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  /** Engelse bron blijft de waarheid; een vertaling verwijst hiernaar. */
  lang: z.string().default('en'),
  /** Zet op false om iets in het repo te hebben zonder het te publiceren. */
  draft: z.boolean().default(false),
  /** Een met de hand bijgewerkte vertaling wordt nooit overschreven (§11.1). */
  manual: z.boolean().default(false),
  /** Beeldslot; ontbreekt voorlopig, want er is nog geen eigen artwork. */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  /** De primaire bron onderaan een post (§7.1). */
  sourceName: z.string().optional(),
  sourceUrl: z.url().optional(),
};

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object(postFields),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    ...postFields,
    /** De vier gidstypes, bevestigd 9 september 2026 (§9). */
    game: z.enum(['gta5', 'gta-online', 'trilogy', 'gta6']),
  }),
});

const game = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/game' }),
  schema: z.object({
    ...postFields,
    /**
     * Welk submenu deze pagina vult. Alleen submenu's met inhoud verschijnen;
     * bij lancering is dat alleen `map` (§4, §4.1).
     */
    section: z.enum([
      'map', 'characters', 'vehicles', 'missions', 'weapons', 'properties', 'cheats',
    ]),
  }),
});

export const collections = { news, guides, game };
