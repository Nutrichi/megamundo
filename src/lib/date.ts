/*
 * Datums, in de taal van de pagina. Twee vormen, allebei uit het ontwerp:
 * de korte in de metaregel van het uitgelichte artikel ("08 SEP 2026") en
 * de lange bovenaan een post ("8 September 2026").
 *
 * Intl doet het werk, dus elke taal krijgt zijn eigen maandnaam zonder dat
 * er een lijst in de vertaalbestanden bij hoeft.
 */

import { localeTags, type Locale } from '../i18n/ui';

/*
 * Voor datums is `en` niet genoeg: Intl leest dat als Amerikaans Engels en
 * schrijft "August 1, 2026". Het ontwerp tekent "8 September 2026", dus voor
 * de opmaak gebruiken we en-GB. Het lang-attribuut en de hreflang-tags
 * blijven gewoon `en`; dit gaat alleen over hoe een datum eruitziet.
 */
const dateTags: Partial<Record<Locale, string>> = { en: 'en-GB' };

const tagFor = (locale: Locale) => dateTags[locale] ?? localeTags[locale];

/** Voor het datetime-attribuut van <time>: altijd 2026-09-08. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "08 SEP 2026" — kort, in kapitalen, zoals de metaregel het tekent. */
export function shortDate(date: Date, locale: Locale): string {
  const parts = new Intl.DateTimeFormat(tagFor(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);

  return parts
    .map((part) => (part.type === 'month' ? part.value.replace('.', '') : part.value))
    .join('')
    .toUpperCase();
}

/** "8 September 2026" — de metaregel van de postpagina. */
export function longDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tagFor(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
