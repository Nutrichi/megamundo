/*
 * /api/v1/<taal>/game.json: alles uit Game voor de iOS-app, in één bestand.
 *
 * De kaart (waar de tegels staan en hoe het coördinatenstelsel loopt), de
 * gebieden met hun omtrek en tekst, en de personages met hun beelden. Het is
 * klein genoeg om in één keer op te halen: een paar dozijn gebieden en
 * personages, geen duizenden posts. De app bewaart het en werkt daarna
 * offline.
 *
 * De bron blijft de Markdown in src/content/game, via dezelfde functies als de
 * pagina's (getRegions, getCharacters). De app kan dus niets tonen wat de site
 * niet toont.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getRegions } from '../../../../lib/regions';
import { getCharacters } from '../../../../lib/characters';
import * as map from '../../../../data/map';
import { locales, type Locale } from '../../../../i18n/ui';
import {
  API_SCHEMA, absolute, imageVariants, jsonResponse, paragraphsOf,
} from '../../../../lib/api-feed';

/* Dezelfde breedtes als het grote beeld op de pagina van een personage
   (CharacterLayout.astro), zodat de app zoveel mogelijk bestaande bestanden
   krijgt. */
const CHARACTER_WIDTHS = [480, 660, 960, 1320];

export const getStaticPaths: GetStaticPaths = () => locales.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params, site }) => {
  const base = site ?? new URL('https://megamundo.be');
  const lang = params.lang as Locale;

  const regions = await getRegions(lang);
  const characters = await getCharacters(lang);

  return jsonResponse({
    schema: API_SCHEMA,
    lang,
    map: {
      version: map.version,
      versionDate: map.versionDate,
      /* Het patroon met {z}/{x}/{y}, als volledige URL. Aan elkaar geplakt en
         niet via `new URL`, want die zet de accolades om in %7B en %7D. */
      tiles: `${base.origin}${map.tileUrl}`,
      /* [[minY, minX], [maxY, maxX]], y omhoog, zoals Leaflet het noteert. */
      fullBounds: map.fullBounds,
      islandBounds: map.islandBounds,
      minZoom: map.minZoom,
      maxZoom: map.maxZoom,
      maxNativeZoom: map.maxNativeZoom,
      credit: map.credit,
    },
    regions: regions.map((region) => ({
      slug: region.slug,
      title: region.title,
      description: region.description,
      realName: region.realName ?? null,
      order: region.order,
      isFallback: region.isFallback,
      polygon: region.polygon ?? null,
      labelAt: region.labelAt ?? null,
      url: absolute(region.href, base),
      paragraphs: paragraphsOf(region.entry.body),
    })),
    characters: await Promise.all(characters.map(async (character) => ({
      slug: character.slug,
      title: character.title,
      description: character.description,
      lead: character.lead,
      order: character.order,
      isFallback: character.isFallback,
      source: character.source ?? null,
      sourceUrl: character.sourceUrl ?? null,
      url: absolute(character.href, base),
      paragraphs: paragraphsOf(character.entry.body),
      images: await Promise.all(character.images.map((image) =>
        imageVariants(image, CHARACTER_WIDTHS, character.title, base))),
    }))),
  });
};
