/*
 * De verbinding met Supabase (PROJECT_SPEC.md §8).
 *
 * Twee dingen praten met Supabase en verder niets: de likes en het
 * inzendformulier uit §5.3. Alle andere pagina's blijven volledig statisch.
 *
 * **Deze sleutel hoort openbaar te zijn.** Hij staat in de JavaScript van de
 * site en dus in de publieke repo; zo werkt Supabase. De beveiliging zit niet
 * in de sleutel maar in `supabase/schema.sql`: row level security laat een
 * bezoeker alleen de tellingen lezen en twee functies aanroepen. De
 * `secret`-sleutel van hetzelfde project mag hier nooit staan.
 *
 * Valt Supabase weg, dan blijft elke pagina gewoon werken. De teller toont
 * dan wat er bij het bouwen in stond en het formulier zegt eerlijk dat het
 * versturen niet lukte (§8.2).
 */

export const supabaseUrl = 'https://onryvgtkejqwzkhpovzf.supabase.co';

/** De publishable key. Openbaar bedoeld; zie hierboven. */
export const supabaseKey = 'sb_publishable_ifWlDIauQgalCgZ2a1JL2g_-EkPla_7';

/** Waar de sleutel in localStorage staat die één browser identificeert. */
export const identityKey = 'mm-identity';
