/** While true, every page shows a "Preview · sample content" pill. Turn off once real content is in. */
export const SAMPLE_CONTENT = true;

// SAMPLE CONTENT for the Phase 1 build. Every value here is a placeholder, not a fact
// about Jeymarc. Replaced by Keystatic content collections in Phase 2+.

export const now = {
  updated: 'November 2026',
  text: 'Building this site with Claude, training for the next marathon, and getting City Run ready for its first runners in Zürich.',
};

export const about = {
  line: 'A career in finance at two global banks, working as a consultant and product manager.',
  linkedin: 'https://www.linkedin.com/',
};

export const interests = [
  { key: 'running', title: 'Running', text: 'Marathons, city runs and the stories they leave behind.' },
  { key: 'travel', title: 'Travel', text: 'New places, slow mornings, a camera in the pocket.' },
  { key: 'tech', title: 'Tech & Apple', text: 'Products that feel considered, down to the last pixel.' },
  { key: 'ai', title: 'Learning AI', text: 'Learning to build with Claude, in public.' },
] as const;

export const runningStats = [
  { value: '12', label: 'Marathons' },
  { value: '3:24', label: 'Marathon PB' },
  { value: '4,800', label: 'km this year' },
];

import type { MajorStatus } from '../lib/running';
export const majors: { city: string; status: MajorStatus; year?: string }[] = [
  { city: 'Tokyo', status: 'planned', year: '2027' },
  { city: 'Boston', status: 'open' },
  { city: 'London', status: 'done', year: '2024' },
  { city: 'Sydney', status: 'open' },
  { city: 'Berlin', status: 'done', year: '2023' },
  { city: 'Chicago', status: 'planned', year: '2026' },
  { city: 'New York', status: 'done', year: '2025' },
];

export const latestRace = {
  name: 'Sample City Marathon',
  date: 'October 2026',
  time: '3:31:08',
  note: 'Negative split, strong last 10 km.',
};

export const trips = [
  { place: 'Kyoto', country: 'Japan', year: '2025', x: 84, y: 40 },
  { place: 'Lisbon', country: 'Portugal', year: '2025', x: 45, y: 38 },
  { place: 'Patagonia', country: 'Argentina', year: '2024', x: 30, y: 82 },
  { place: 'Reykjavík', country: 'Iceland', year: '2023', x: 43, y: 20 },
  { place: 'Cape Town', country: 'South Africa', year: '2024', x: 53, y: 78 },
];

export const posts = [
  { series: 'Learning AI in public', part: 'Part 1', title: 'Why I started building with Claude', date: 'Nov 2026', featured: true },
  { title: 'Designing a running-tour app, one landmark at a time', date: 'Oct 2026' },
  { title: 'What a marathon taught me about product work', date: 'Sep 2026' },
];

export const links = [
  { label: 'LinkedIn', brand: 'linkedin' as const, href: 'https://www.linkedin.com/' },
  { label: 'Instagram', brand: 'instagram' as const, href: 'https://www.instagram.com/' },
  { label: 'jeymarc.logs', brand: 'instagram' as const, href: 'https://www.instagram.com/jeymarc.logs/' },
  { label: 'Strava', brand: 'strava' as const, href: 'https://www.strava.com/' },
  { label: 'GitHub', brand: 'github' as const, href: 'https://github.com/' },
];
