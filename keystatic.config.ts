// Keystatic admin (/keystatic). In `astro dev` it edits files on disk; on the live site it reads
// and commits to GitHub as the signed-in user (jeymarclabs), which Vercel then deploys.
import { config, collection, singleton, fields } from '@keystatic/core';
import countries from './src/data/countries.json';
import { LEVELS } from './src/lib/languages';
import { BEYOND_ICONS } from './src/lib/about';
import { DISTANCES } from './src/lib/running';

// Images live under src/assets so Astro optimises them (and strips metadata from what it serves).
// publicPath is relative to the content file, so Astro's image() schema can resolve it.
const postImages = { directory: 'src/assets/posts', publicPath: '../../assets/posts/' };
const instagramImages = { directory: 'src/assets/instagram', publicPath: '../../assets/instagram/' };
const PHOTO_ADVICE =
  'JPEG or PNG. Turn off location first (iPhone share sheet › Options › Location off): the repo is public, and an automatic clean-up runs after upload but the original stays in its history.';

export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: { owner: 'jeymarc-labs', name: 'evergreen' } }
    : { kind: 'local' },

  ui: {
    brand: { name: 'Jeymarc Sison' },
    navigation: { Writing: ['posts'], 'Home page': ['now', 'profile', 'running', 'places', 'site'] },
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
    running: singleton({
      label: 'Running',
      path: 'src/content/settings/running',
      format: 'yaml',
      schema: {
        races: fields.array(
          fields.object({
            name: fields.text({ label: 'Race', description: 'e.g. Chicago Marathon', validation: { length: { min: 1, max: 80 } } }),
            place: fields.text({ label: 'City', description: 'Shown with personal bests, e.g. “Marathon PB · Chicago 2026”.', validation: { length: { min: 1, max: 40 } } }),
            date: fields.date({ label: 'Race day', validation: { isRequired: true } }),
            distance: fields.select({
              label: 'Distance',
              options: Object.entries(DISTANCES).map(([value, d]) => ({ value, label: d.label })),
              defaultValue: 'marathon',
            }),
            time: fields.text({
              label: 'Finish time',
              description: 'h:mm:ss or mm:ss, e.g. 3:30:20',
              validation: { length: { min: 4, max: 8 }, pattern: { regex: /^\d{1,2}(:[0-5]\d){1,2}$/, message: 'Use h:mm:ss or mm:ss, e.g. 3:30:20' } },
            }),
            note: fields.text({ label: 'Note (optional)', description: 'Shown for the latest race, e.g. “New marathon personal best.”', validation: { length: { max: 120 } } }),
          }),
          {
            label: 'Races',
            description: 'Personal bests, the latest race and the marathon count are worked out from this list. Only add races that are done.',
            itemLabel: (p) => `${p.fields.name.value || 'Race'} ${p.fields.date.value?.slice(0, 4) ?? ''} · ${p.fields.time.value}`,
          },
        ),
        majors: fields.array(
          fields.object({
            city: fields.text({ label: 'City', validation: { length: { min: 1, max: 40 } } }),
            flag: fields.text({ label: 'Flag emoji', validation: { length: { min: 1, max: 8 } } }),
            status: fields.select({
              label: 'Status',
              options: [
                { value: 'done', label: 'Done' },
                { value: 'planned', label: 'Planned' },
                { value: 'open', label: 'Someday' },
              ],
              defaultValue: 'open',
            }),
            when: fields.text({ label: 'Year(s) (optional)', description: 'e.g. “2014 · 2025”. For planned races, a public race date tells people where you’ll be.', validation: { length: { max: 40 } } }),
          }),
          { label: 'World Marathon Majors', itemLabel: (p) => `${p.fields.city.value || 'Major'}: ${p.fields.status.value}` },
        ),
        instagram: fields.array(
          fields.object({
            photo: fields.image({ label: 'Photo', description: PHOTO_ADVICE, ...instagramImages, validation: { isRequired: true } }),
            url: fields.url({ label: 'Link to the post', description: 'From the post: ⋯ › Copy link, e.g. https://www.instagram.com/p/…', validation: { isRequired: true } }),
            alt: fields.text({ label: 'What the photo shows', description: 'For screen readers, e.g. “Crossing the Chicago finish line”.', validation: { length: { min: 1, max: 150 } } }),
          }),
          {
            label: 'Instagram picks',
            description: 'Up to 4 of your own posts, shown under “From @jeymarc.logs” in this order. Upload your own copy of the photo; nothing loads from Instagram.',
            itemLabel: (p) => p.fields.alt.value || 'Post',
            validation: { length: { max: 4 } },
          },
        ),
      },
    }),
    site: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      format: 'yaml',
      schema: {
        showSamplePill: fields.checkbox({
          label: 'Show the “Preview · sample content” pill',
          description: 'Turn off once the placeholders (about texts, interests, projects) are replaced with your own.',
          defaultValue: true,
        }),
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
        yearsInFinance: fields.integer({
          label: 'Quick facts: years in finance',
          description: 'Leave empty to hide. Marathons, cities and languages are counted automatically.',
          validation: { min: 0, max: 60 },
        }),
        principles: fields.array(
          fields.object({
            title: fields.text({ label: 'Principle', description: 'Short, e.g. “Find the problem first”.', validation: { length: { min: 1, max: 60 } } }),
            text: fields.text({ label: 'One sentence', multiline: true, validation: { length: { min: 1, max: 180 } } }),
          }),
          { label: 'How I work', description: 'Three or four work best.', itemLabel: (p) => p.fields.title.value || 'Principle' },
        ),
        beyond: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { length: { min: 1, max: 50 } } }),
            text: fields.text({ label: 'One line', multiline: true, validation: { length: { min: 1, max: 140 } } }),
            icon: fields.select({
              label: 'Icon',
              options: Object.entries(BEYOND_ICONS).map(([value, label]) => ({ value, label })),
              defaultValue: 'heart',
            }),
          }),
          { label: 'Beyond work', description: 'A few things that make you you.', itemLabel: (p) => p.fields.title.value || 'Item' },
        ),
        languages: fields.array(
          fields.object({
            language: fields.text({ label: 'Language', validation: { length: { min: 1, max: 40 } } }),
            level: fields.select({
              label: 'Level',
              options: Object.entries(LEVELS).map(([value, l]) => ({ value, label: l.name })),
              defaultValue: 'conversational',
            }),
          }),
          {
            label: 'Languages',
            description: 'Shown in About, in this order.',
            itemLabel: (p) => `${p.fields.language.value || 'Language'}: ${LEVELS[p.fields.level.value as keyof typeof LEVELS]?.name ?? ''}`,
          },
        ),
      },
    }),
  },
});
