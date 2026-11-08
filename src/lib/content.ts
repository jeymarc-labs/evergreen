// Content access for pages. Everything that reads posts or the Keystatic singletons goes through
// here, so components never touch files or collections directly.
import { getCollection, type CollectionEntry } from 'astro:content';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { visiblePosts, readingMinutes } from './blog';
import { isSafeHref } from './links';
import { languageRows } from './languages';
import { mergeNearby, resolvePlace, type CityLookup, type Place } from './places';
import cityLookup from '../data/world-cities.json';

export type Post = CollectionEntry<'posts'>;
export type PostCard = Post['data'] & { id: string; minutes: number };

const reader = createReader(process.cwd(), keystaticConfig);
const showDrafts = import.meta.env.DEV;

export async function getPosts(): Promise<PostCard[]> {
  const entries = await getCollection('posts');
  const cards = entries.map((e) => ({ ...e.data, id: e.id, minutes: readingMinutes(e.body ?? '') }));
  return visiblePosts(cards, showDrafts);
}

export async function getPostEntries(): Promise<Post[]> {
  const entries = await getCollection('posts');
  return entries.filter((e) => showDrafts || !e.data.draft);
}

export async function getNow() {
  const now = await reader.singletons.now.read();
  if (!now) throw new Error('Missing src/content/settings/now.yaml (edit "Now" in /keystatic)');
  return { text: now.text, updated: new Date(now.updated as string) };
}

export async function getProfile() {
  const profile = await reader.singletons.profile.read();
  if (!profile) throw new Error('Missing src/content/settings/profile.yaml (edit "Profile" in /keystatic)');
  // Links are written in the admin: drop anything that isn't a web or email link.
  return { ...profile, links: profile.links.filter((l) => isSafeHref(l.url)), languages: languageRows(profile.languages) };
}

// Read once per build: Travel, About and /travel all use it.
let placesCache: Promise<Place[]> | undefined;
export function getPlaces(): Promise<Place[]> {
  return (placesCache ??= readPlaces());
}

async function readPlaces(): Promise<Place[]> {
  const data = await reader.singletons.places.read();
  if (!data) throw new Error('Missing src/content/settings/places.yaml (edit "Places" in /keystatic)');
  // Coordinates come from the Natural Earth city list unless typed in the admin (the generated
  // JSON has the CityLookup shape; TypeScript widens its tuples, hence the cast). A city that can't
  // be placed stops the build with a message saying which one (the live site stays as it was).
  const resolved = data.places.map((p) => resolvePlace(p, cityLookup as unknown as CityLookup));
  // One pin per spot, named after the bigger city (e.g. Miami Beach → Miami).
  const { kept, merged } = mergeNearby(resolved);
  for (const m of merged) console.info(`Places: "${m.dropped}" is shown as "${m.into}" (same area, bigger city).`);
  return kept;
}
