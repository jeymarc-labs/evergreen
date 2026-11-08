// Running data shaping. Pure functions; content comes from collections (Phase 3), sample for now.

export type MajorStatus = 'done' | 'planned' | 'open';

export function majorsProgress(majors: { status: MajorStatus }[]) {
  const done = majors.filter((m) => m.status === 'done').length;
  const total = majors.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
