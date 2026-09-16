/*
 * De JSON-feed van de site (/api/v1). Eén plek die weet hoe een post eruitziet
 * voor een lezer buiten deze site: de iOS-app, en wie er verder naar verwijst.
 *
 * De markdown in src/content blijft de enige waarheid. Deze module vertaalt
 * hem alleen naar JSON; er staat hier geen inhoud en geen redactionele keuze.
 * Wat de feed toont, komt uit `getPosts()`, net als de pagina's, dus de feed
 * kan nooit iets tonen wat de site niet toont. Concepten vallen daar al af.
 *
 * Waarom een versienummer in het pad: verandert de vorm ooit, dan komt
 * /api/v2 ernaast en blijft een geïnstalleerde app gewoon werken tot niemand
 * hem nog gebruikt. Een app die morgen in de App Store staat, updatet niet
 * mee met de site. Het nummer staat daarom ook in elk bestand.
 */

import { getImage } from 'astro:assets';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { heroImage } from './post-image';
import type { Post } from './posts';

/** Verhoog dit alleen samen met een nieuwe map /api/vN. */
export const API_SCHEMA = 1;

/**
 * Hoeveel posts er in één lijstbestand gaan. Dit getal is de reden dat de
 * feed ook bij tienduizend posts werkt: de app haalt nooit meer dan één
 * pagina op om bij te zijn. Verander het niet zonder het versienummer te
 * verhogen, want een app die pagina 3 in de cache heeft, verwacht dezelfde
 * indeling.
 */
export const PAGE_SIZE = 50;

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/** Een pad op deze site als volledige URL. De app kent geen basis-URL. */
function absolute(path: string, site: URL): string {
  return new URL(path, site).href;
}

/*
 * De container die de Markdown van een post naar HTML rendert. Eén keer
 * opzetten en hergebruiken: hij bouwt intern een kleine Astro-omgeving op en
 * dat per post doen zou de build onnodig vertragen.
 *
 * Waarom niet gewoon `entry.rendered.html`: daar staan de beelden nog als
 * `__ASTRO_IMAGE_`-plaatshouders in. De container loopt de echte pijplijn
 * door, dus de app krijgt dezelfde geoptimaliseerde bestanden als het web.
 */
let container: Promise<AstroContainer> | null = null;
function getContainer() {
  if (!container) container = AstroContainer.create();
  return container;
}

/**
 * Wortelrelatieve links absoluut maken. In de app is er geen pagina waar een
 * `/news/...` aan opgehangen kan worden, dus een link zonder domein wijst
 * daar nergens heen.
 */
function absolutise(html: string, site: URL): string {
  return html.replace(/(\s(?:src|href)=")\/(?!\/)/g, `$1${site.origin}/`);
}

/**
 * Het beeld van een post, in dezelfde breedtes als de postpagina zelf
 * gebruikt (`heroImage`). Dat is bewust: zo wijst de feed naar bestanden die
 * de build toch al maakt, en krijgt de app exact wat het web ook krijgt.
 *
 * Nagemeten op 16 september 2026, met en zonder deze feed:
 *
 * - De vier webp-URL's die hier uitkomen zijn **byte voor byte dezelfde
 *   bestanden** als in de `srcset` van de postpagina. De feed dupliceert dus
 *   geen enkel beeld.
 * - De build wint wel precies twee bestanden: 659 zonder de feed, 661 met.
 *   Het zijn twee originele JPEG's van samen 734 KB die Astro naast de
 *   varianten neerzet. Waarom dat gebeurt is niet gevonden, en het verandert
 *   niet door `format` of de terugval anders te kiezen.
 * - **Het schaalt niet mee**: alle 58 posts hebben een eigen beeld en toch
 *   blijven het er twee. Het is dus geen kost per post.
 *
 * De app haalt die twee nooit op, want in de JSON staan alleen de varianten
 * hieronder. Op een site van 327 MB is het 0,2 procent en het is zo gelaten.
 */
async function imageOf(post: Post, site: URL) {
  if (!post.image) return null;

  const result = await getImage({
    src: post.image,
    widths: heroImage.widths,
    sizes: heroImage.sizes,
    format: 'webp',
  });

  /* Per breedte één URL, zodat de app kiest wat bij het scherm past. */
  const src: Record<string, string> = {};
  for (const variant of result.srcSet.values) {
    const width = String(variant.attributes?.width ?? variant.descriptor ?? '').replace('w', '');
    if (width) src[width] = absolute(variant.url, site);
  }

  /*
   * De terugval voor een app die de map niet uitleest. Bewust de grootste
   * breedte uit de lijst hierboven en niet `result.src`: dat laatste is het
   * beeld op ware grootte, een bestand dat de site zelf nergens gebruikt en
   * dat op een telefoon niets toevoegt.
   */
  const widest = Math.max(...heroImage.widths);
  const fallback = src[String(widest)] ?? Object.values(src)[0];

  return {
    alt: post.imageAlt ?? '',
    width: result.attributes?.width ?? null,
    height: result.attributes?.height ?? null,
    src,
    fallback,
  };
}

/**
 * Wat er in een lijst staat. Geen tekst, want een lijst van vijftig posts met
 * volledige artikelen erin zou bij elke verversing onnodig zwaar zijn.
 */
export async function summaryOf(post: Post, site: URL) {
  return {
    /*
     * Dezelfde sleutel als de hartjes op de site (PostLayout.astro), en
     * bewust taalonafhankelijk: een hartje in de app en een hartje op het web
     * tellen daardoor bij elkaar op via dezelfde Supabase-RPC.
     */
    id: `${post.collection}/${post.slug}`,
    slug: post.slug,
    collection: post.collection,
    lang: post.lang,
    /* De tekst is Engels omdat de vertaling ontbreekt, niet omdat dat de keuze was. */
    isFallback: post.isFallback,
    title: post.title,
    description: post.description,
    date: post.date.toISOString(),
    category: post.category,
    tags: post.tags,
    featured: post.featured,
    readingMinutes: post.readingMinutes,
    url: absolute(post.href, site),
    detail: absolute(`/api/v${API_SCHEMA}/${post.lang}/posts/${post.slug}.json`, site),
    image: await imageOf(post, site),
  };
}

/** Het volledige artikel. Eén keer ophalen per post, daarna nooit meer. */
export async function detailOf(post: Post, site: URL) {
  const { Content } = await render(post.entry);
  const html = await (await getContainer()).renderToString(Content);

  return {
    ...(await summaryOf(post, site)),
    source: post.source ?? null,
    sourceUrl: post.sourceUrl ?? null,
    bodyHtml: absolutise(html, site),
  };
}

/** Elk JSON-antwoord van de feed, met de kop die de app verwacht. */
export function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      /* Statische bestanden op een CDN: de app mag ze rustig cachen. */
      'cache-control': 'public, max-age=300',
    },
  });
}
