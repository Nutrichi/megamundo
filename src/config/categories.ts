/*
 * De categorieën. Eén plek, zoals §6 eist: een categorie bijzetten is hier
 * een regel erbij — sleutel, kleur, icoon, label — en geen verbouwing.
 * Navigatie, filter, pil en postpagina lezen allemaal uit deze definitie.
 *
 * Twee bij de lancering. Uitbreiding is geparkeerd (§20); verzin er dus
 * geen bij. De harde bovengrens is ongeveer vijf: elke categorie is een
 * eigen kleur, en voorbij vijf communiceert het kleursysteem niets meer.
 *
 * Let op het onderscheid uit §6.1: een categorie is het sóórt post. Een
 * bron (Rockstar Games, IGN) is iets anders en krijgt nooit een kleur,
 * een icoon of een label.
 */

import type { UIKey } from '../i18n/ui';

export const categoryKeys = ['news', 'guides'] as const;
export type CategoryKey = (typeof categoryKeys)[number];

export type Category = {
  key: CategoryKey;
  /** De CSS-variabele met de kleur van het ruitje en de badge. */
  color: string;
  /** Label in de vertaalbestanden; nooit een letterlijk label hier. */
  labelKey: UIKey;
  /** Het pad waaronder de posts van deze categorie staan: /news/<slug>. */
  path: string;
};

export const categories: Record<CategoryKey, Category> = {
  news: {
    key: 'news',
    color: 'var(--mm-cat-news)',
    labelKey: 'cat.news',
    path: 'news',
  },
  guides: {
    key: 'guides',
    color: 'var(--mm-cat-guides)',
    labelKey: 'cat.guides',
    path: 'guides',
  },
};

/** De lijst in de vaste volgorde, voor de filterchips. */
export const categoryList: Category[] = categoryKeys.map((key) => categories[key]);

/** Is dit een categorie die we kennen? Gebruikt door het filter in de URL. */
export function isCategoryKey(value: string | null | undefined): value is CategoryKey {
  return !!value && (categoryKeys as readonly string[]).includes(value);
}
