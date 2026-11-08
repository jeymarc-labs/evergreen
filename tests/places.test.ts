import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAP_H, MAP_W, byCountry, counts, fitBox, isValidPlace, mergeNearby, project, regionOf, resolvePlace, type CityLookup, type Place, type PlaceEntry } from '../src/lib/places.ts';

const yaml = readFileSync(new URL('../src/content/settings/places.yaml', import.meta.url), 'utf8');
const lookup = JSON.parse(readFileSync(new URL('../src/data/world-cities.json', import.meta.url), 'utf8')) as CityLookup;
// Minimal reader for the admin's flat YAML list, enough for a data check.
const entries: PlaceEntry[] = yaml
  .split(/\n\s*- /)
  .slice(1)
  .map((block) => {
    const get = (k: string) => block.match(new RegExp(`(?:^|\\n)\\s*${k}: (.+)`))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
    const num = (k: string) => (get(k) === undefined ? null : Number(get(k)));
    return { city: get('city') ?? '', country: get('country') ?? '', lat: num('lat'), lng: num('lng') };
  });

test('every place in places.yaml resolves to a valid, unique pin', () => {
  assert.ok(entries.length >= 30, `only ${entries.length} places parsed`);
  const places = entries.map((e) => resolvePlace(e, lookup));
  for (const p of places) assert.ok(isValidPlace(p), JSON.stringify(p));
  const names = places.map((p) => `${p.city}|${p.country}`);
  assert.equal(new Set(names).size, names.length, 'duplicate city');
});

test('lookup: right country, accents and case ignored, typed coordinates win', () => {
  const at = (city: string, country: string) => resolvePlace({ city, country }, lookup);
  const london = at('London', 'GBR'), florence = at('Florence', 'ITA'), dublin = at('dublin', 'IRL');
  assert.ok(london.lat > 51 && london.lat < 52 && london.lng > -1 && london.lng < 1, 'London, UK');
  assert.ok(florence.lat > 43 && florence.lat < 44.5, 'Florence, Italy');
  assert.ok(dublin.lng < -6 && dublin.lng > -7, 'Dublin, Ireland');
  assert.equal(dublin.city, 'dublin');
  assert.equal(at('Zürich', 'CHE').country, 'Switzerland');
  assert.equal(at('Zurich', 'CHE').lat, at('Zürich', 'CHE').lat);
  assert.deepEqual(resolvePlace({ city: 'Bohol', country: 'PHL', lat: 9.8512, lng: 124.1449 }, lookup), { city: 'Bohol', country: 'Philippines', lat: 9.85, lng: 124.14, pop: 0 });
});

test('lookup: clear errors for Jeymarc', () => {
  assert.throws(() => resolvePlace({ city: 'Atlantis', country: 'GRC' }, lookup), /can't find "Atlantis" in Greece/);
  assert.throws(() => resolvePlace({ city: 'Paris', country: 'XXX' }, lookup), /unknown country/);
  assert.throws(() => resolvePlace({ city: 'Bohol', country: 'PHL', lat: 9.85 }, lookup), /both, or neither/);
  assert.throws(() => resolvePlace({ city: 'Pole', country: 'NOR', lat: 89, lng: 0 }, lookup), /out of range/);
});

test('projection: map edges and known cities', () => {
  const left = project(0, -180), right = project(0, 180);
  assert.ok(Math.abs(left.x) < 0.5 && Math.abs(right.x - MAP_W) < 0.5);
  const london = project(51.5, -0.13), manila = project(14.6, 121), nyc = project(40.7, -74);
  assert.ok(Math.abs(london.x - MAP_W / 2) < 2, 'London near the centre line');
  assert.ok(manila.x > london.x && nyc.x < london.x, 'east/west order');
  assert.ok(manila.y > london.y, 'Manila south of London');
  for (const p of [london, manila, nyc]) assert.ok(p.y > 0 && p.y < MAP_H);
});

const sample: Place[] = [
  { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
  { city: 'Reims', country: 'France', lat: 49.26, lng: 4.03 },
  { city: 'Manila', country: 'Philippines', lat: 14.6, lng: 120.98 },
  { city: 'Chicago', country: 'United States', lat: 41.88, lng: -87.63 },
];

test('grouping, counts and regions', () => {
  assert.deepEqual(byCountry(sample).map((g) => [g.country, g.cities.length]), [['France', 2], ['Philippines', 1], ['United States', 1]]);
  assert.deepEqual(counts(sample), { cities: 4, countries: 3 });
  assert.deepEqual(sample.map(regionOf), ['europe', 'europe', 'asia', 'americas']);
});

test('fitBox stays inside the map and keeps its aspect', () => {
  for (const set of [sample, sample.slice(0, 1), sample.slice(0, 2), []]) {
    const b = fitBox(set);
    assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= MAP_W + 1e-9 && b.y + b.h <= MAP_H + 1e-9, JSON.stringify(b));
    assert.ok(Math.abs(b.w / b.h - MAP_W / MAP_H) < 1e-9);
  }
  assert.ok(fitBox(sample.slice(0, 1)).w >= 90, 'single city has a minimum zoom');
});

test('fitBox follows a square (phone) map', () => {
  const b = fitBox(sample.slice(0, 2), 90, 0.25, 1);
  assert.ok(Math.abs(b.w - b.h) < 1e-9 && b.y >= 0 && b.y + b.h <= MAP_H + 1e-9, JSON.stringify(b));
});

test('nearby places merge into the bigger city, far ones stay', () => {
  const at = (city: string, country: string) => resolvePlace({ city, country }, lookup);
  const { kept, merged } = mergeNearby([at('Miami Beach', 'USA'), at('London', 'GBR'), at('Miami', 'USA'), at('Oxford', 'GBR')]);
  assert.deepEqual(kept.map((p) => p.city), ['London', 'Miami', 'Oxford']);
  assert.deepEqual(merged, [{ dropped: 'Miami Beach', into: 'Miami' }]);
  assert.ok(!('pop' in kept[0]), 'population is not passed on to the page');
  // Typed coordinates count as the smaller place.
  const typed = resolvePlace({ city: 'South Beach', country: 'USA', lat: 25.78, lng: -80.13 }, lookup);
  assert.deepEqual(mergeNearby([typed, at('Miami', 'USA')]).kept.map((p) => p.city), ['Miami']);
});

test('places.yaml has no two pins in the same area', () => {
  const { merged } = mergeNearby(entries.map((e) => resolvePlace(e, lookup)));
  assert.deepEqual(merged, [], 'remove the smaller one from Places');
});
