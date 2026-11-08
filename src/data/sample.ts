/** While true, every page shows a "Preview · sample content" pill. Turn off once real content is in. */
export const SAMPLE_CONTENT = true;

// SAMPLE CONTENT: placeholders, not facts about Jeymarc. Running, Travel and Interests become
// editable in later phases. Now, Profile and posts already live in src/content/ (edit in /keystatic).

export const interests = [
  { key: 'tech', title: 'Tech & Apple', text: 'Products that feel considered, down to the last pixel.' },
  { key: 'ai', title: 'Learning AI', text: 'Learning to build with Claude, in public.' },
  { key: 'running', title: 'Running', text: 'Marathons, city runs and the stories they leave behind.' },
  { key: 'travel', title: 'Travel', text: 'New places, slow mornings, a camera in the pocket.' },
] as const;

// REAL running data from Jeymarc (2026-11-08). Moves to content collections in Phase 3.
/** Personal bests, shortest first. `value: null` shows a placeholder until the time is known. */
export const runningStats: { value: string | null; label: string }[] = [
  { value: null, label: '5K PB' },
  { value: null, label: '10K PB' },
  { value: '1:45:55', label: 'Half marathon PB · Zürich 2025' },
  { value: '3:30:20', label: 'Marathon PB · Chicago 2026' },
];

/** Race results board (Phase 3). Times as h:mm:ss. */
export const races = [
  { name: 'Chicago Marathon', date: '2026-10-11', distance: 'marathon', time: '3:30:20', pb: true },
  { name: 'Berlin Marathon', date: '2025-09-21', distance: 'marathon', time: '3:39:15' },
  { name: 'Zürich Half Marathon', date: '2025-04-13', distance: 'half', time: '1:45:55', pb: true },
  { name: 'Berlin Marathon', date: '2014-09-28', distance: 'marathon', time: '4:18:56' },
] as const;

import type { MajorStatus } from '../lib/running';
export const majors: { city: string; status: MajorStatus; year?: string }[] = [
  { city: 'Tokyo', status: 'open' },
  { city: 'Boston', status: 'open' },
  { city: 'London', status: 'planned', year: '24 April 2027' },
  { city: 'Sydney', status: 'open' },
  { city: 'Berlin', status: 'done', year: '2014 · 2025' },
  { city: 'Chicago', status: 'done', year: '2026' },
  { city: 'New York', status: 'open' },
  // 8th Major from 2027 (confirmed by Abbott WMM, 10 June 2026); first race as a Major 23 May 2027.
  { city: 'Cape Town', status: 'open' },
];

export const latestRace = {
  name: 'Chicago Marathon',
  date: '11 October 2026',
  time: '3:30:20',
  note: 'New marathon personal best.',
};

export const trips = [
  { place: 'Kyoto', country: 'Japan', year: '2025', x: 84, y: 40 },
  { place: 'Lisbon', country: 'Portugal', year: '2025', x: 45, y: 38 },
  { place: 'Patagonia', country: 'Argentina', year: '2024', x: 30, y: 82 },
  { place: 'Reykjavík', country: 'Iceland', year: '2023', x: 43, y: 20 },
  { place: 'Cape Town', country: 'South Africa', year: '2024', x: 53, y: 78 },
];


