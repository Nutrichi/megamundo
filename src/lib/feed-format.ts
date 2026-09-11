/*
 * Getallen, tijden en talen voor Daily Clips en Streams, in de taal van de
 * pagina. Intl doet het werk, net als in date.ts: geen lijsten met taal- of
 * maandnamen in de vertaalbestanden.
 *
 * Alles wordt bij het bouwen berekend. "3 hr. ago" klopt dus op het moment
 * van de build; de site wordt elk kwartier opnieuw gebouwd, en de tijd van
 * de laatste ophaling staat er zichtbaar bij (§10.3).
 */

import { localeTags, type Locale } from '../i18n/ui';

/** Zelfde reden als in date.ts: `en` leest Intl als Amerikaans Engels. */
const formatTags: Partial<Record<Locale, string>> = { en: 'en-GB' };
const tagFor = (locale: Locale) => formatTags[locale] ?? localeTags[locale];

/** De tijdzone van de site. De handoff tekent `Last fetched 14:02 CET`. */
const TIME_ZONE = 'Europe/Brussels';

/**
 * 14200 wordt "14.2K" in het Engels en "14,2K" in het Nederlands. Hier
 * juist wel Amerikaans Engels: en-GB schrijft "14.2k", de handoff tekent
 * "14.2K".
 */
export function compactNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : tagFor(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** 1000 wordt "1,000" of "1.000". */
export function wholeNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(tagFor(locale)).format(value);
}

/** 204 seconden wordt "3:24". */
export function clipDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** "19:04", in de tijdzone van de site. */
export function clockTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tagFor(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "3 hr. ago", "45 min. ago". */
export function timeAgo(date: Date, now: Date, locale: Locale): string {
  const format = new Intl.RelativeTimeFormat(tagFor(locale), { numeric: 'auto', style: 'short' });
  const minutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 60) return format.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 48) return format.format(-hours, 'hour');
  return format.format(-Math.round(hours / 24), 'day');
}

/** "en" wordt "English", "Engels" of "anglais". */
export function languageName(code: string, locale: Locale): string {
  if (!code) return '';
  try {
    return new Intl.DisplayNames([tagFor(locale)], { type: 'language' }).of(code) ?? code;
  } catch {
    return code.toUpperCase();
  }
}
