/*
 * Vaste gegevens van de site. Eén plek, zodat een wijziging niet door
 * templates gejaagd hoeft te worden.
 */

/** Meet-ID uit PROJECT_SPEC.md §17.1. */
export const ga4Id = 'G-PVE54ZRVSR';

/** De release van GTA VI. De aftelbalk en de teksten rekenen hierop. */
export const releaseDate = '2026-11-19T00:00:00Z';

/**
 * De sociale links uit §16. Aangeleverd door Nutri op 10 september 2026.
 * De Discord-uitnodiging is onbeperkt en verloopt niet.
 *
 * De voettekst laat een link weg zolang zijn URL leeg is, dus leeghalen
 * volstaat om er een te verbergen.
 */
export const social = {
  /* `sub_confirmation=1` opent meteen het venster om te abonneren (Nutri,
     18 september 2026). Zonder die parameter kom je gewoon op het kanaal uit. */
  youtube: 'https://www.youtube.com/@nutri_r1?sub_confirmation=1',
  discord: 'https://discord.gg/E7AY5vPwcQ',
};

/**
 * Het pad naar de inzendpagina uit §5.3. Sinds fase 4 bestaat die pagina, dus
 * de knop SUBMIT NEWS staat onder de feed. Leeghalen laat de knop weer
 * verdwijnen; dezelfde regel als bij de sociale links hierboven.
 */
export const submitPath = 'submit';
