// @ts-check
import { defineConfig } from 'astro/config';

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

  build: {
    // Nette mappen zodat /nl/ met een slash werkt op GitHub Pages.
    format: 'directory',
  },
});
