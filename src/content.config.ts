/*
 * Content collections. De navigatie wordt hieruit afgeleid (§4.1): nul
 * gepubliceerde items betekent geen navigatie-item, geen route en geen
 * regel in de sitemap. Fase 2 heeft de schema's aangevuld met alles wat de
 * feed en de postpagina nodig hebben.
 *
 * Mapindeling: <collectie>/<taal>/<slug>.md. De Engelse map is de bron; het
 * vertaalscript (§11.1) schrijft de vijf andere. Ontbreekt een vertaling,
 * dan valt de pagina terug op het Engels — een halve vertaling levert dus
 * nooit een lege pagina op.
 *
 * De veldnamen volgen §14. Fase 1 gebruikte `summary` en `sourceName`; die
 * heten nu `description` en `source`, zoals de spec ze noemt. Er stond nog
 * geen content, dus dat kostte niets.
 *
 * De build faalt luid op een foute post (§14). Dat is de bedoeling: liever
 * geen site dan een kapotte pagina.
 */

import { defineCollection, type SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { locales } from './i18n/ui';

/** Velden die elke post deelt, in welke taal dan ook. */
const postFields = ({ image }: SchemaContext) => ({
  title: z.string(),
  /** De samenvatting onder de titel én de metabeschrijving van de pagina. */
  description: z.string(),
  date: z.coerce.date(),
  /** Engelse bron blijft de waarheid; een vertaling verwijst hiernaar. */
  lang: z.enum(locales).default('en'),
  /** Zet op false om iets in het repo te hebben zonder het te publiceren. */
  draft: z.boolean().default(false),
  /** Een met de hand bijgewerkte vertaling wordt nooit overschreven (§11.1). */
  manual: z.boolean().default(false),
  /**
   * Het beeld van Nutri, relatief aan het Markdown-bestand. Astro schaalt en
   * comprimeert het bij het bouwen; aan bestandsgrootte hoeft niemand te
   * denken (§14). Ontbreekt het, dan komt er een gestreepte plek.
   */
  image: image().optional(),
  imageAlt: z.string().optional(),
  /** Eén post staat groot links op de homepage; zonder dit vlagje de nieuwste. */
  featured: z.boolean().default(false),
  /** De primaire bron onderaan een post (§7.1). Platte tekst, geen merk. */
  source: z.string().optional(),
  /*
   * `new-post` schrijft de lege velden voluit uit, zodat zichtbaar is wat er
   * ingevuld kan worden. Een leeg tekstveld is daarom hetzelfde als geen
   * veld — anders zou een post zonder bron de build laten falen.
   */
  sourceUrl: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
  tags: z.array(z.string()).default([]),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: (context) => z.object(postFields(context)),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: (context) =>
    z.object({
      ...postFields(context),
      /** De vier gidstypes, bevestigd 9 september 2026 (§9). */
      game: z.enum(['gta5', 'gta-online', 'trilogy', 'gta6']),
    }),
});

const game = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/game' }),
  schema: (context) =>
    z.object({
      ...postFields(context),
      /**
       * Welk submenu deze pagina vult. Alleen submenu's met inhoud
       * verschijnen; bij lancering is dat alleen `map` (§4, §4.1).
       */
      section: z.enum([
        'map', 'characters', 'vehicles', 'missions', 'weapons', 'properties', 'cheats',
      ]),

      /*
       * De velden hieronder horen bij een gebied op de kaart van Leonida.
       * Eén bestand per gebied is de enige bron: de kaart leest hier zijn
       * klikvlakken uit, de lijst ernaast leest hier zijn namen, en §4.1
       * laat de tab Map vanzelf verschijnen zodra er zo'n bestand staat.
       */

      /** Waar het gebied op lijkt in de echte wereld, als dat bekend is. */
      realName: z.string().optional(),

      /**
       * Het klikvlak op de kaart, als punten [y, x] in het platte
       * coördinatenstelsel van de kaart (zie src/data/map.ts).
       *
       * Bij benadering. Het vlak wordt niet getekend: het vangt alleen de
       * klik en licht zacht op bij hover, zodat een ruwe rand niet opvalt.
       * De grenzen die je ziet zijn die van de kaart zelf.
       */
      polygon: z.array(z.tuple([z.number(), z.number()])).optional(),

      /** Waar het naamplaatje hangt, als [y, x]. */
      labelAt: z.tuple([z.number(), z.number()]).optional(),

      /** Volgorde in de lijst naast de kaart; laag getal staat bovenaan. */
      order: z.number().default(99),
    }),
});

export const collections = { news, guides, game };
