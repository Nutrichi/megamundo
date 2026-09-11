// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://megamundo.be',

  // Statische uitvoer, geen server. PROJECT_SPEC.md §3.
  output: 'static',
  trailingSlash: 'ignore',

  // Zes talen, bevestigd 9 september 2026 (PROJECT_SPEC.md §11).
  // Engels staat op /, de rest op /nl/ /fr/ /es/ /it/ /de/.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'fr', 'es', 'it', 'de'],
    routing: {
      prefixDefaultLocale: false,
      // Geen automatische doorverwijzing op browsertaal: dat breekt crawlers (§11).
      redirectToDefaultLocale: false,
    },
  },

  // De balk rechtsonder tijdens `npm run dev`. Die zit nooit in de gebouwde
  // site, maar hij staat in de weg en niemand hier gebruikt hem.
  devToolbar: {
    enabled: false,
  },

  build: {
    // Nette mappen zodat /nl/ met een slash werkt op GitHub Pages.
    format: 'directory',
  },

  /*
   * De sitemap (§17, fase 5), bij elke build opnieuw, met de taalversies van
   * elke pagina erbij. Lege secties staan er vanzelf niet in, want die hebben
   * geen pagina (§4.1). De inzendpagina draagt noindex en hoort er dus ook
   * niet in.
   */
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', nl: 'nl', fr: 'fr', es: 'es', it: 'it', de: 'de' },
      },
      filter: (page) => !/\/submit\/?$/.test(new URL(page).pathname),
    }),
  ],

  vite: {
    /*
     * Een eigen cache voor controles en builds naast een draaiende dev-server:
     * `MM_VITE_CACHE=node_modules/.vite-check npx astro check`. Zonder dat
     * bouwt `astro check` de voorgebouwde bibliotheken van de dev-server om,
     * en die serveert dan een lege kaart of een foutpagina (11 september 2026).
     */
    cacheDir: process.env.MM_VITE_CACHE || 'node_modules/.vite',
  },
});
