# Decisions

Newest first. One line of why each.

## 2026-11-08 — Phase 1 build

- **Contact form posts to `/api/contact`, the site's only Vercel function.** Every page stays
  static. The function calls Resend's HTTP API directly, so there's no SDK dependency. Spam
  protection: honeypot (bots get a fake success) + Turnstile verified server-side (fails closed)
  + length and line-break checks + a 32 KB body limit. No message content is logged. No rate
  limit: someone solving Turnstile in a loop could use up Resend's free 100 emails a day, which
  is accepted for a personal site.
- **Secrets are read at runtime with `astro:env` (`getSecret`),** not baked into the build, so
  changing a key in Vercel doesn't need a rebuild and keys never sit in the bundle. A missing
  key in production returns 503 with a log line.
- **Turnstile loads only when a visitor first uses the form,** so nothing goes to Cloudflare on a
  normal page view. The form waits up to 10 s for the check before sending.
- **Dev without keys:** `astro dev` uses Cloudflare's documented always-passes test keys, and
  accepts messages without sending. Production without keys returns 503, never a fake success.
- **Unit tests use Node's built-in runner** (`node --test`, TypeScript run natively by Node 24),
  so no test framework dependency. `@types/node` (dev-only, MIT) types the tests.
- **`npm audit` reports 6 issues (3 high) inside `@astrojs/vercel`'s build tools**
  (`@vercel/nft`, `@vercel/routing-utils` → `path-to-regexp`, `minimatch`). They run at deploy
  time on our own route patterns, not in the function or the pages. npm's "fix" downgrades the
  adapter to v8, which doesn't support Astro 7. Accepted; re-check when the adapter updates.
- **Vercel Web Analytics enabled in the adapter;** it also needs switching on in the dashboard.
- **Sample content stays behind `SAMPLE_CONTENT` in `src/data/sample.ts`,** which shows a
  "Preview · sample content" pill on every page until it's turned off.

## 2026-11-08 — after Phase 0 (Jeymarc)

- **Profile links show brand logos** (Jeymarc). Instagram, Strava and GitHub marks are inlined
  from Simple Icons (CC0, no npm dependency). LinkedIn is a simple "in" mark drawn here, because
  Simple Icons removed LinkedIn at LinkedIn's request. Used only to link to his own profiles.
- **Runs: Strava link + official Strava embeds only** (click-to-load), for the runs Jeymarc picks.
  This keeps it simple and inside Strava's terms. There is no run feed, no sync and no GPX. Run
  reports, the race results board and the Majors tracker stay as written content.
- **The landing page is a long scroll through every section.** Each section (Now, About, Running,
  Travel, Projects, Blog, Contact) is a full chapter of its own with real content: highlights,
  latest items and stats. Each ends in a "deep dive" link to that section's own page. The
  landing page should tell the whole story on its own; the section pages go deeper.
- **Domain: Jeymarc registers it** (a .ch or .com, his choice). The site config takes it once
  known.


## 2026-11-08 — Shield pass (overall CONDITIONS; Strava API STOP)

- **Strava API is out for public display.** The API Policy (effective 2026-06-01) §2.3 lets an app
  show a user's data "only to that user", and §6.2 forbids showing it to any third party or caching
  it longer than 7 days. There is no exception for your own data. Strava staff confirmed this
  (2024-11-15). The webhook → build pipeline is dropped. **Replacement pending Jeymarc's choice**
  (see CONTEXT › Waiting on Jeymarc). Official Strava embeds are allowed on a personal page (needs
  profile and activity set to "Everyone"), behind click-to-load.
- **Repo must be public:** Vercel Hobby can't deploy a private repo in a GitHub organisation.
  So `jeymarc-labs/evergreen` is public, and commits must be authored by the Vercel Hobby owner.
  Drafts and photo originals in the repo are public too.
- **Photo originals must have EXIF/GPS stripped before commit** (sharp strips them only from
  built images, not from the originals in a public repo). `check.sh` gets a GPS-metadata check.
- **Privacy notice page is required** (Phase 1): it names OpenFreeMap, Vercel Analytics, Resend
  (keeps mail 30 days), Cloudflare Turnstile, and Strava/Instagram embeds (click-to-load).
- **Instagram:** a creator account plus Standard Access is enough, with no app review. The token
  lasts 60 days and is refreshed by a daily Vercel cron. Hand-copied embeds need no app and go
  behind click-to-load.
- **Map:** MapLibre (BSD-3) + OpenFreeMap: no key, no cookies, no view limit, attribution visible,
  no SLA (keep the map style swappable).
- **Keystatic GitHub mode:** a GitHub App on the org (jeymarclabs installs it), its secrets only in
  Vercel env, and `/keystatic` needs the Vercel adapter.
- **Licences clear:** Astro, Tailwind, Motion, Keystatic MIT; Lucide ISC; MapLibre BSD-3. SF Pro
  is mock-ups only, so stay on the system font stack.

## 2026-11-08

- **Stack: Astro + TypeScript, Tailwind CSS v4, deployed on Vercel Hobby.** The site is mostly
  static content; Astro ships little JavaScript and its typed content collections are the models.
  Vercel's free tier covers the few serverless functions (contact, Strava webhook).
- **Maps: MapLibre GL JS + OpenFreeMap tiles, two custom green styles** (light/dark) instead of
  Mapbox, as in CityRun: no token in the page, no telemetry, no usage billing.
- **CMS: Keystatic in GitHub mode** (admin at `/keystatic`). Free, no extra account, content and
  photos stay in the repo. Sanity is the fallback if photos outgrow the repo.
- ~~Strava: webhook → Vercel function → deploy hook → build fetches activities~~ (superseded by the
  Shield pass above). New runs appear
  within minutes with no database. If Strava's terms forbid showing data to visitors, fall back
  to official activity embeds or GPX uploads. All runs are shown by default; a start date is a
  setting. Routes are trimmed ~500 m at each end; single runs can be hidden.
- **Instagram (jeymarc.logs): live feed only once it's a creator account** (Basic Display API is
  gone since Dec 2024). Until then, a hand-picked set of posts. Personal Instagram is a link only.
- **Polarsteps: link out only** (no public API). The site keeps its own curated trip content.
- **Contact form: Vercel function + Resend + honeypot and Cloudflare Turnstile.** No form service
  holds the messages. Recipient address is an env var, still to be set by Jeymarc.
- **Analytics: Vercel Web Analytics (cookieless)**, so no consent banner; named in the privacy notice.
- **Type and icons: system font stack and Lucide.** SF Pro and SF Symbols may not be served on the
  web under Apple's licence; the system stack still shows SF on Apple devices.
- **Repo in the `jeymarc-labs` GitHub organisation**, as with CityRun. Vercel Hobby may not
  import private organisation repos, so the repo is likely public (it's a public site anyway;
  drafts in Keystatic would be visible in the repo). Shield to confirm before creating it.
- **Domain: jeymarc.com as the main address, jeymarcsison.com redirecting to it.** Both were
  unregistered in whois on 2026-11-08 (as were jeymarc.ch and jeymarcsison.ch). No .ch for now.
- **Agent setup slimmed like Brain:** Keystone (review) and Shield (privacy/licensing) plus
  `scripts/check.sh`. CityRun's Compass/Builder/board setup is too much for a personal site.
- **Theme tokens are per-theme CSS variables** behind Tailwind colour names, so components never
  repeat a `dark:` colour; the toggle sets `data-theme`, with the system setting as the fallback.
- **Vercel adapter (`@astrojs/vercel`) added when the first function lands** (contact form,
  Phase 1), not before: the site is fully static until then.
- **Placeholders for content** (portrait, race results, Majors, trips) until Jeymarc supplies it.
