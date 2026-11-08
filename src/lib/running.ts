// Running data shaping. Pure functions; content comes from collections (Phase 3), sample for now.

export type MajorStatus = 'done' | 'planned' | 'open';

export function majorsProgress(majors: { status: MajorStatus }[]) {
  const done = majors.filter((m) => m.status === 'done').length;
  const total = majors.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export const DISTANCES = {
  '5k': { label: '5K', pb: '5K PB' },
  '10k': { label: '10K', pb: '10K PB' },
  half: { label: 'Half marathon', pb: 'Half marathon PB' },
  marathon: { label: 'Marathon', pb: 'Marathon PB' },
  other: { label: 'Other', pb: '' },
} as const;
export type Distance = keyof typeof DISTANCES;
export type Race = { name: string; place: string; date: string; distance: Distance; time: string; note: string };

/** "3:30:20" or "45:12" → seconds; null if it isn't a time. */
export function timeToSeconds(t: string): number | null {
  if (!/^\d{1,2}(:[0-5]\d){1,2}$/.test(t.trim())) return null;
  return t.trim().split(':').map(Number).reduce((a, n) => a * 60 + n, 0);
}

const byDateDesc = (a: Race, b: Race) => b.date.localeCompare(a.date);

/** Fastest time per main distance, in a fixed order; `value: null` while there's no race yet. */
export function personalBests(races: readonly Race[]) {
  return (['5k', '10k', 'half', 'marathon'] as const).map((d) => {
    const best = races
      .filter((r) => r.distance === d && timeToSeconds(r.time) !== null)
      .sort((a, b) => timeToSeconds(a.time)! - timeToSeconds(b.time)! || a.date.localeCompare(b.date))[0];
    return best
      ? { value: best.time, label: `${DISTANCES[d].pb} · ${best.place} ${best.date.slice(0, 4)}`, race: best }
      : { value: null, label: DISTANCES[d].pb, race: null };
  });
}

/** Most recent race, or null. */
export function latestRace(races: readonly Race[]): Race | null {
  return [...races].sort(byDateDesc)[0] ?? null;
}

export function marathonCount(races: readonly Race[]): number {
  return races.filter((r) => r.distance === 'marathon').length;
}
