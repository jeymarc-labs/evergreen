// Blog data shaping. Pure functions (no Astro imports) so they run under `node --test`.

export type SeriesKey = 'none' | 'learning-ai';

export const SERIES: Record<Exclude<SeriesKey, 'none'>, { title: string; blurb: string }> = {
  'learning-ai': {
    title: 'Learning AI in public',
    blurb: 'Notes from learning to build with AI, written as I go.',
  },
};

export interface PostMeta {
  id: string;
  title: string;
  date: Date;
  draft: boolean;
  series: SeriesKey;
  part?: number | null;
}

/** Drafts are hidden on the live site; in `astro dev` they show (with a badge) for previewing. */
export function visiblePosts<T extends PostMeta>(posts: T[], showDrafts: boolean): T[] {
  return posts.filter((p) => showDrafts || !p.draft).sort(byNewest);
}

export function byNewest(a: PostMeta, b: PostMeta): number {
  return b.date.getTime() - a.date.getTime() || a.id.localeCompare(b.id);
}

/** Posts of one series in reading order: by part number, then date. */
export function seriesPosts<T extends PostMeta>(posts: T[], series: SeriesKey): T[] {
  if (series === 'none') return [];
  return posts
    .filter((p) => p.series === series)
    .sort((a, b) => (a.part ?? Infinity) - (b.part ?? Infinity) || a.date.getTime() - b.date.getTime());
}

/** Previous (older) and next (newer) post in the visible, newest-first list. */
export function neighbours<T extends PostMeta>(sorted: T[], id: string): { older?: T; newer?: T } {
  const i = sorted.findIndex((p) => p.id === id);
  if (i === -1) return {};
  return { newer: sorted[i - 1], older: sorted[i + 1] };
}

/** Minutes to read, from the raw Markdoc source (tags and image syntax don't count). */
export function readingMinutes(source: string, wordsPerMinute = 220): number {
  const text = source
    .replace(/\{%[\s\S]*?%\}/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
