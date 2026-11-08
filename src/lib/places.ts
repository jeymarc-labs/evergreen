// Places Jeymarc has visited, and the map maths. Pure and testable; also used by
// scripts/make_world_map.mjs so the land outline and the pins share one projection.

export type Place = { city: string; country: string; lat: number; lng: number };
export type Region = 'europe' | 'americas' | 'asia' | 'other';
export type Box = { x: number; y: number; w: number; h: number };

/** Map width in SVG units. Height follows from the Equal Earth aspect ratio and the crop below. */
export const MAP_W = 1000;
// Equal Earth (Šavrič, Patterson, Jenny 2018) constants.
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const X_MAX = 2.7063; // projected x at lng ±180, lat 0
const SCALE = MAP_W / (2 * X_MAX);
/** Crop: Antarctica and the far Arctic aren't needed for anyone's travels. */
export const LAT_TOP = 84;
export const LAT_BOTTOM = -58;

function raw(lat: number, lng: number): [number, number] {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const t = Math.asin(M * Math.sin(phi));
  const t2 = t * t, t6 = t2 * t2 * t2;
  const x = (lambda * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}
const Y_TOP = raw(LAT_TOP, 0)[1];
export const MAP_H = Math.round((Y_TOP - raw(LAT_BOTTOM, 0)[1]) * SCALE);

/** lat/lng → SVG x/y (origin top-left, x 0…MAP_W). */
export function project(lat: number, lng: number): { x: number; y: number } {
  const [x, y] = raw(lat, lng);
  return { x: (x + X_MAX) * SCALE, y: (Y_TOP - y) * SCALE };
}

export function isValidPlace(p: Partial<Place>): p is Place {
  return (
    typeof p.city === 'string' && p.city.trim() !== '' &&
    typeof p.country === 'string' && p.country.trim() !== '' &&
    typeof p.lat === 'number' && p.lat >= LAT_BOTTOM && p.lat <= LAT_TOP &&
    typeof p.lng === 'number' && p.lng >= -180 && p.lng <= 180
  );
}

const REGION_OF: Record<string, Region> = {
  'United States': 'americas', Canada: 'americas', Mexico: 'americas',
  Philippines: 'asia', China: 'asia', Japan: 'asia', 'South Korea': 'asia', Thailand: 'asia',
  Vietnam: 'asia', Singapore: 'asia', Indonesia: 'asia', Malaysia: 'asia', 'Hong Kong': 'asia',
  Taiwan: 'asia',
};
/** Listed countries first; otherwise by position (so any country from the admin fits somewhere). */
export function regionOf(p: Place): Region {
  if (REGION_OF[p.country]) return REGION_OF[p.country];
  if (p.lng < -30) return 'americas';
  if (p.lng < 45 && p.lat > 34) return 'europe';
  if (p.lng >= 60 && p.lat > -12) return 'asia';
  return 'other';
}
export const REGION_LABEL: Record<Region, string> = { europe: 'Europe', americas: 'Americas', asia: 'Asia', other: 'Elsewhere' };

/** Countries in first-visit-list order, each with its cities. */
export function byCountry(places: Place[]): { country: string; cities: Place[] }[] {
  const groups = new Map<string, Place[]>();
  for (const p of places) groups.set(p.country, [...(groups.get(p.country) ?? []), p]);
  return [...groups].map(([country, cities]) => ({ country, cities }));
}

export function counts(places: Place[]) {
  return { cities: places.length, countries: new Set(places.map((p) => p.country)).size };
}

/**
 * The view box that shows these places with some room around them, never narrower than
 * `minW` (so a single city doesn't zoom in absurdly), in the given width/height ratio
 * (default: the map's own).
 */
export function fitBox(places: Place[], minW = 90, pad = 0.25, aspect = MAP_W / MAP_H): Box {
  if (places.length === 0) return { x: 0, y: 0, w: MAP_W, h: MAP_H };
  const pts = places.map((p) => project(p.lat, p.lng));
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let w = Math.max(minW, (x1 - x0) * (1 + 2 * pad), (y1 - y0) * (1 + 2 * pad) * aspect);
  w = Math.min(w, MAP_W, MAP_H * aspect);
  const h = w / aspect;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return {
    x: Math.min(Math.max(cx - w / 2, 0), MAP_W - w),
    y: Math.min(Math.max(cy - h / 2, 0), MAP_H - h),
    w,
    h,
  };
}

/** A row as written in the admin: country is a code from the dropdown; coordinates are optional. */
export type PlaceEntry = { city: string; country: string; lat?: number | null; lng?: number | null };
export type CityLookup = { countries: Record<string, string>; cities: Record<string, [string, number, number, number?][]> };
/** A resolved place plus the city's population when it came from the lookup (for merging). */
export type SizedPlace = Place & { pop: number };

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Turns an admin row into a pin: typed coordinates win, otherwise the city is looked up by name
 * within its country (largest city first). Throws a message meant for Jeymarc when it can't.
 */
export function resolvePlace(entry: PlaceEntry, lookup: CityLookup): SizedPlace {
  const city = entry.city.trim();
  const country = lookup.countries[entry.country];
  if (!country) throw new Error(`Places: "${city}" has an unknown country (${entry.country}). Pick one from the list in /keystatic.`);
  const typed = typeof entry.lat === 'number' && typeof entry.lng === 'number';
  if (typed) {
    const place = { city, country, lat: round2(entry.lat!), lng: round2(entry.lng!), pop: 0 };
    if (!isValidPlace(place)) throw new Error(`Places: the latitude/longitude for "${city}" are out of range.`);
    return place;
  }
  if (entry.lat != null || entry.lng != null) throw new Error(`Places: "${city}" has only one of latitude/longitude. Fill in both, or neither.`);
  const hit = (lookup.cities[entry.country] ?? []).find(([name]) => norm(name) === norm(city));
  if (!hit) {
    throw new Error(`Places: can't find "${city}" in ${country}. Check the spelling, or add its latitude and longitude in /keystatic (Places).`);
  }
  const found = { city, country, lat: hit[1], lng: hit[2], pop: hit[3] ?? 0 };
  if (!isValidPlace(found)) throw new Error(`Places: "${city}" is too far north or south for the map.`);
  return found;
}

/** Great-circle distance in km. */
export function distanceKm(a: Place, b: Place): number {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * One pin per spot: places closer than `km` merge into the bigger city (by population; typed
 * coordinates count as smallest). Keeps the admin's order. Returns the kept places and what merged.
 */
export function mergeNearby(places: SizedPlace[], km = 30): { kept: Place[]; merged: { dropped: string; into: string }[] } {
  const bySize = places.map((p, i) => ({ p, i })).sort((a, b) => b.p.pop - a.p.pop || a.i - b.i);
  const keep: { p: SizedPlace; i: number }[] = [];
  const merged: { dropped: string; into: string }[] = [];
  for (const c of bySize) {
    const near = keep.find((k) => distanceKm(k.p, c.p) < km);
    if (near) merged.push({ dropped: c.p.city, into: near.p.city });
    else keep.push(c);
  }
  const kept = keep.sort((a, b) => a.i - b.i).map(({ p: { pop: _pop, ...place } }) => place);
  return { kept, merged };
}
