// About section data: quick facts and the icon set for "Beyond work". Pure and testable.

/** Icons offered in the admin for "Beyond work" (Lucide names, rendered in BeyondWork.astro). */
export const BEYOND_ICONS = {
  laptop: 'Laptop',
  sparkles: 'Sparkles (AI)',
  footprints: 'Running',
  plane: 'Travel',
  book: 'Reading',
  coffee: 'Coffee',
  camera: 'Photography',
  music: 'Music',
  heart: 'Heart',
  code: 'Code',
} as const;
export type BeyondIcon = keyof typeof BEYOND_ICONS;

export type Fact = { value: number; label: string };

/** The facts row: only numbers that are set and above zero, in a fixed order. */
export function quickFacts(input: { yearsInFinance: number | null; marathons: number | null; cities: number; languages: number }): Fact[] {
  const facts: [number | null, string, string][] = [
    [input.yearsInFinance, 'year in finance', 'years in finance'],
    [input.marathons, 'marathon run', 'marathons run'],
    [input.cities, 'city visited', 'cities visited'],
    [input.languages, 'language', 'languages'],
  ];
  return facts
    .filter(([n]) => typeof n === 'number' && Number.isFinite(n) && n > 0)
    .map(([n, one, many]) => ({ value: Math.round(n!), label: n === 1 ? one : many }));
}
