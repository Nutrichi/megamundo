/*
 * Hoe oud een post is, in de grove stappen van de scheidingen in de feed
 * (Nutri, 6 oktober 2026): ouder dan 3 dagen, 1 week, 2 weken, 1 maand,
 * 6 maanden en 1 jaar. Wat jonger is dan 3 dagen krijgt geen scheiding.
 *
 * Gedeeld door de build (PostList zet de scheidingen al in de HTML) en de
 * browser (pill-list.ts zet ze opnieuw, want de build kan uren oud zijn).
 * Maanden en jaren zijn kalendermaanden, geen blokken van 30 dagen.
 */

export const ageBuckets = ['d3', 'w1', 'w2', 'm1', 'm6', 'y1'] as const;
export type AgeBucket = (typeof ageBuckets)[number];

/** Vanaf deze stap laadt de feed niet meer vanzelf bij. */
export const manualFrom: AgeBucket = 'm1';

const DAY = 24 * 60 * 60 * 1000;

/** De grenzen, van oud naar jong, voor één moment `now`. */
export function ageLimits(now: Date): [AgeBucket, number][] {
  const monthsBack = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - months);
    return d.getTime();
  };
  return [
    ['y1', monthsBack(12)],
    ['m6', monthsBack(6)],
    ['m1', monthsBack(1)],
    ['w2', now.getTime() - 14 * DAY],
    ['w1', now.getTime() - 7 * DAY],
    ['d3', now.getTime() - 3 * DAY],
  ];
}

/** De stap van een post, of null als hij jonger is dan 3 dagen. */
export function ageBucket(date: Date | number, limits: [AgeBucket, number][]): AgeBucket | null {
  const time = typeof date === 'number' ? date : date.getTime();
  for (const [bucket, limit] of limits) {
    if (time <= limit) return bucket;
  }
  return null;
}

/** Hoe ver een stap staat: null is 0, d3 is 1, y1 is 6. */
export function ageRank(bucket: AgeBucket | null): number {
  return bucket ? ageBuckets.indexOf(bucket) + 1 : 0;
}
