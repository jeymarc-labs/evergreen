// Language levels in plain words (no CEFR codes): five steps.

export const LEVELS = {
  native: { step: 5, name: 'Native' },
  fluent: { step: 4, name: 'Fluent' },
  conversational: { step: 3, name: 'Conversational' },
  basic: { step: 2, name: 'Basic' },
  learning: { step: 1, name: 'Learning' },
} as const;
export type Level = keyof typeof LEVELS;
export const MAX_STEP = 5;

export type LanguageRow = { language: string; level: Level; step: number; name: string; delay: number };

/**
 * Rows for the page, in the admin's order. `delay` is how many dots fill before this row's
 * first one, so the dots fill one by one, row after row.
 */
export function languageRows(entries: readonly { language: string; level: string }[]): LanguageRow[] {
  let delay = 0;
  return entries
    .filter((e) => e.language.trim() !== '' && e.level in LEVELS)
    .map((e) => {
      const lvl = LEVELS[e.level as Level];
      const row = { language: e.language.trim(), level: e.level as Level, ...lvl, delay };
      delay += lvl.step;
      return row;
    });
}
