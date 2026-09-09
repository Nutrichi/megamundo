/*
 * Hulpjes rond taal. Eén plek die weet hoe een URL met taalvoorvoegsel
 * eruitziet, zodat geen enkel component dat zelf hoeft samen te stellen.
 */

import { defaultLocale, locales, localeTags, ui, type Locale, type UIKey } from './ui';

/** Is dit een taal die we kennen? */
export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Haalt de taal uit een pad. `/nl/clips` geeft `nl`, `/clips` geeft `en`.
 * Astro geeft `Astro.currentLocale`, maar dat is undefined op paden zonder
 * voorvoegsel; dit is de terugval die altijd een taal teruggeeft.
 */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

/**
 * Vertaalt. Ontbreekt de sleutel in deze taal, dan komt de Engelse tekst,
 * zodat een halve vertaling nooit een lege plek oplevert.
 */
export function useTranslations(locale: Locale) {
  const fallback = ui[defaultLocale] as Record<UIKey, string>;
  return function t(key: UIKey): string {
    const table = ui[locale] as Partial<Record<UIKey, string>>;
    return table[key] ?? fallback[key];
  };
}

/**
 * Bouwt een pad in een bepaalde taal. Engels krijgt geen voorvoegsel (§11).
 * `path` is altijd zonder taal, met of zonder leidende slash.
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (!clean) return prefix === '' ? '/' : `${prefix}/`;
  return `${prefix}/${clean}`;
}

/**
 * Haalt het taalloze deel uit een pad, zodat de taalkiezer op dezelfde
 * pagina kan blijven staan bij het wisselen van taal.
 */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  return parts.join('/');
}

/** Het lang-attribuut voor <html>. */
export function htmlLang(locale: Locale): string {
  return localeTags[locale];
}

/** Alle talen met hun absolute URL, voor de hreflang-tags. */
export function alternateLinks(pathname: string, site: URL | undefined) {
  const bare = stripLocale(pathname);
  const origin = site ? site.origin : 'https://megamundo.be';
  return locales.map((locale) => ({
    locale,
    hreflang: localeTags[locale],
    href: new URL(localizePath(bare, locale), origin).href,
  }));
}

export { defaultLocale, locales, type Locale };
