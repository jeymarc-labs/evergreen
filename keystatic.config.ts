// Keystatic admin (/keystatic). In `astro dev` it edits files on disk; on the live site it reads
// and commits to GitHub as the signed-in user (jeymarclabs), which Vercel then deploys.
import { config, collection, singleton, fields } from '@keystatic/core';
import countries from './src/data/countries.json';

// Images live under src/assets so Astro optimises them (and strips metadata from what it serves).
// publicPath is relative to the content file, so Astro's image() schema can resolve it.
const postImages = { directory: 'src/assets/posts', publicPath: '../../assets/posts/' };
const PHOTO_ADVICE =
  'JPEG or PNG. Turn off location first (iPhone share sheet › Options › Location off): the repo is public, and an automatic clean-up runs after upload but the original stays in its history.';

export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: { owner: 'jeymarc-labs', name: 'evergreen' } }
    : { kind: 'local' },

  ui: {
    brand: { name: 'Jeymarc Sison' },
    navigation: { Writing: ['posts'], 'Home page': ['now', 'profile', 'places'] },
  },

  collections: {
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date', 'draft'],
      previewUrl: '/blog/{slug}',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two sentences. Shown on the blog list and when the post is shared.',
          multiline: true,
          validation: { length: { min: 1, max: 280 } },
        }),
        cover: fields.image({ label: 'Cover photo (optional)', description: PHOTO_ADVICE, ...postImages }),
        coverAlt: fields.text({
          label: 'Cover photo description',
          description:
            'What the photo shows, for people who can’t see it. Required with a cover photo: without it the site won’t publish the change.',
        }),
        series: fields.select({
          label: 'Series',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Learning AI in public', value: 'learning-ai' },
          ],
          defaultValue: 'none',
        }),
        part: fields.integer({ label: 'Part number in the series (optional)', validation: { min: 1 } }),
        draft: fields.checkbox({
          label: 'Draft',
          description:
            'Drafts don’t appear on the live site (the preview link shows “not found” until you untick this). They are still visible in the public GitHub repo.',
          defaultValue: true,
        }),
        content: fields.markdoc({
          label: 'Post',
          description: 'Use “Heading 2” for section titles; the post title is the main heading.',
          options: { image: postImages },
        }),
      },
    }),
  },

  singletons: {
    now: singleton({
      label: 'Now',
      path: 'src/content/settings/now',
      format: 'yaml',
      schema: {
        text: fields.text({
          label: 'What I’m up to',
          description: 'A line or two. Shown large on the home page.',
          multiline: true,
          validation: { length: { min: 1, max: 300 } },
        }),
        updated: fields.date({ label: 'Last updated', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
      },
    }),
    places: singleton({
      label: 'Places',
      path: 'src/content/settings/places',
      format: 'yaml',
      schema: {
        places: fields.array(
          fields.object({
            city: fields.text({
              label: 'City',
              description: 'The pin is placed automatically for cities (e.g. Lisbon, Kyoto).',
              validation: { length: { min: 1, max: 60 } },
            }),
            country: fields.select({
              label: 'Country',
              options: Object.entries(countries).map(([value, label]) => ({ value, label })),
              defaultValue: 'FRA',
            }),
            lat: fields.number({
              label: 'Latitude (only if needed)',
              description:
                'Leave empty for cities. Only for islands, regions or small towns the site can’t find (e.g. Bohol): in Google Maps, right-click the centre and copy the first number. Never a hotel or home address.',
              step: 0.01,
              validation: { min: -58, max: 84 },
            }),
            lng: fields.number({
              label: 'Longitude (only if needed)',
              description: 'The second number from Google Maps (west is negative). Fill in both or neither.',
              step: 0.01,
              validation: { min: -180, max: 180 },
            }),
          }),
          {
            label: 'Cities visited',
            description:
              'One pin per place on the travel map; it appears about a minute after saving. No dates and no home city: the list is public. If a city can’t be found, the site won’t update and Vercel emails you why.',
            itemLabel: (p) => `${p.fields.city.value || 'New place'}, ${countries[p.fields.country.value as keyof typeof countries] ?? ''}`,
          },
        ),
      },
    }),
    profile: singleton({
      label: 'Profile',
      path: 'src/content/settings/profile',
      format: 'yaml',
      schema: {
        intro: fields.text({ label: 'Intro line (under your name)', multiline: true, validation: { length: { min: 1, max: 160 } } }),
        about: fields.text({ label: 'About (one line on your career)', multiline: true, validation: { length: { min: 1, max: 240 } } }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { length: { min: 1 } } }),
            url: fields.url({ label: 'Link', validation: { isRequired: true } }),
            hint: fields.text({
              label: 'Screen-reader hint (optional)',
              description: 'Only when the label doesn’t name the service, e.g. “Instagram:” before jeymarc.logs.',
            }),
          }),
          { label: 'Profile links', itemLabel: (props) => props.fields.label.value || 'Link' },
        ),
      },
    }),
  },
});
