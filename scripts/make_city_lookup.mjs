// One-off: turns Natural Earth populated places (public domain, naturalearthdata.com) into a
// compact city lookup, src/data/world-cities.json, used at build time only (never shipped), and
// src/data/countries.json for the admin's country dropdown.
//
//   node scripts/make_city_lookup.mjs <ne_10m_populated_places_simple.geojson>
//
// Shape: { countries: { CODE: "Name" }, cities: { CODE: [[name, lat, lng, population], ...] } },
// largest city first per name, coordinates rounded to 2 decimals (about 1 km).
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/make_city_lookup.mjs <ne_10m_populated_places_simple.geojson>');
  process.exit(1);
}

// Shorter everyday names for a few countries.
const FRIENDLY = {
  'United States of America': 'United States',
  "People's Republic of China": 'China',
  'Republic of the Congo': 'Congo',
  'Democratic Republic of the Congo': 'DR Congo',
};

const features = JSON.parse(readFileSync(file, 'utf8')).features;
const countries = {};
const cities = {};
for (const { properties: p } of features.sort((a, b) => b.properties.pop_max - a.properties.pop_max)) {
  const code = p.adm0_a3;
  if (!code || code === '-99') continue;
  countries[code] ??= FRIENDLY[p.adm0name] ?? p.adm0name;
  const round = (n) => Math.round(n * 100) / 100;
  const list = (cities[code] ??= []);
  const names = [...new Set([p.name, p.nameascii, ...(p.namealt ? String(p.namealt).split('|') : [])].filter(Boolean))];
  for (const name of names) if (!list.some(([n]) => n === name)) list.push([name, round(p.latitude), round(p.longitude), p.pop_max]);
}
const sorted = Object.fromEntries(Object.entries(countries).sort(([, a], [, b]) => a.localeCompare(b)));
writeFileSync('src/data/world-cities.json', JSON.stringify({ countries: sorted, cities }));
// The admin's country dropdown only needs the names.
writeFileSync('src/data/countries.json', JSON.stringify(sorted));
const n = Object.values(cities).reduce((s, l) => s + l.length, 0);
console.log(`world-cities.json: ${Object.keys(sorted).length} countries, ${n} names`);
