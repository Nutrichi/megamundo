/*
 * De categorieën. Eén plek, zoals §6 eist: een categorie bijzetten is hier
 * een regel erbij en geen verbouwing. Het filter op de homepage, het
 * palmboompje in de pil en het label op de postpagina lezen allemaal hieruit.
 *
 * **Een categorie is het spel waar de post over gaat.** Beslist door Nutri
 * op 10 september 2026. Daarvoor waren de categorieën News en Guides, maar
 * op een nieuwssite is alles nieuws, dus dat onderscheid zei niets.
 *
 * Let op: de categorie bepaalt niet de URL. Een nieuwspost staat op
 * /news/<slug> en een gids op /guides/<slug>, ongeacht het spel. Dat is
 * bewust losgekoppeld: anders verhuist elke post zodra hij een andere
 * categorie krijgt, en verhuizende URL's kosten zoekverkeer.
 *
 * De namen zijn eigennamen en worden nooit vertaald, dus ze staan hier als
 * gewone tekst en niet in de vertaalbestanden (SCHRIJFSTIJL.md §6).
 *
 * De harde bovengrens is ongeveer vijf: elke categorie is een eigen kleur,
 * en voorbij vijf communiceert het kleursysteem niets meer. GTA Trilogy komt
 * erbij zodra er inhoud over is (§9).
 */

export const categoryKeys = ['gta6', 'gta-online', 'gta5'] as const;
export type CategoryKey = (typeof categoryKeys)[number];

export type Category = {
  key: CategoryKey;
  /** De CSS-variabele met de kleur van het ruitje en de badge. */
  color: string;
  /** Wat er op de chip en de badge staat. Nooit vertaald. */
  label: string;
};

export const categories: Record<CategoryKey, Category> = {
  gta6: {
    key: 'gta6',
    color: 'var(--mm-cat-gta6)',
    label: 'GTA VI',
  },
  'gta-online': {
    key: 'gta-online',
    color: 'var(--mm-cat-gta-online)',
    label: 'GTA Online',
  },
  gta5: {
    key: 'gta5',
    color: 'var(--mm-cat-gta5)',
    label: 'GTA V',
  },
};

/** De lijst in de vaste volgorde, voor de filterchips. */
export const categoryList: Category[] = categoryKeys.map((key) => categories[key]);

/** Is dit een categorie die we kennen? Gebruikt door het filter in de URL. */
export function isCategoryKey(value: string | null | undefined): value is CategoryKey {
  return !!value && (categoryKeys as readonly string[]).includes(value);
}

/**
 * Onder welk pad een post staat. Dit volgt de collectie en niet de
 * categorie: nieuws op /news/, gidsen op /guides/.
 */
export const collectionPath = { news: 'news', guides: 'guides' } as const;
