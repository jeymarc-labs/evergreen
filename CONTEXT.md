# Evergreen — current facts

Personal website of **Jeymarc Sison**: online CV, personal blog and hub for his profiles.
Brief: `BRIEF.md`. Phases: `ROADMAP.md`. Why: `DECISIONS.md`.

## Where things are

| Path | What |
|---|---|
| `src/pages/`, `src/layouts/` | Pages and layouts (render only); `src/components/` from Phase 1 |
| `src/lib/` | Services: every network call and data shaping (`contact.ts`, `running.ts`) |
| `src/pages/api/contact.ts` | The only server route (Vercel function) |
| `tests/` | Unit tests (`node --test`, run by `check.sh`) |
| `src/content.config.ts` | Typed content models |
| `src/styles/tokens.css` | Design tokens (colours, type, motion) |
| `src/components/sections/` | One component per landing-page section |
| `src/data/sample.ts` | Mockup sample content (placeholders, not facts) |
| `scripts/check.sh` | All deterministic checks in one command |
| `.claude/agents/` | Keystone (review), Shield (privacy/licensing) |
| `.claude/skills/apple-design/` | Apple-style motion and design guidance (MIT) |

## Status (2026-11-08)

- Phase 0 in progress: repo initialised locally (no GitHub remote, nothing committed), docs and
  agents written. Scaffold builds: Astro 7.4, Tailwind 4.3, Node 24 (nvm, `.nvmrc`), one
  placeholder page, light/dark tokens, theme set before paint (follows the system if storage is
  blocked). `scripts/check.sh` passes.
- Shield pass done 2026-11-08: CONDITIONS overall, **Strava API STOP** for public display (see
  DECISIONS). Runs are Strava link + embeds only.
- Phase 1 built locally (2026-11-08); Jeymarc approved the mockup. Long-scroll landing (Hero,
  Now, About, Interests, Running, Travel, Projects, Blog, links, contact), phone menu, theme
  toggle, privacy notice, favicon, stub pages /running /travel /projects /blog.
  - Contact form works end to end in dev with Cloudflare's test keys: validation, honeypot,
    Turnstile, success state. Not yet tested against real Resend (needs Jeymarc's keys).
  - All content is still sample (`SAMPLE_CONTENT = true` shows a pill).
  - `scripts/check.sh` passes (9 unit tests, 6 pages).
- GitHub: `jeymarc-labs/evergreen` is public and empty; local `origin` points at it. Nothing
  pushed. Nothing deployed. Domain not registered.

## Waiting on Jeymarc

- Register the domain (.ch or .com).
- Connect `jeymarc-labs/evergreen` to Vercel Hobby (after the first push).
- Contact form: Resend account + API key, Cloudflare Turnstile site (site key + secret), and
  the recipient address, all as Vercel env vars (`.env.example` lists them). With the domain
  verified in Resend, set CONTACT_FROM to an address on it.
- Switch on Web Analytics in the Vercel dashboard.
- Portrait photo; race results; Majors done/planned; trip list.
- Optionally: switch jeymarc.logs Instagram to a creator account.

## Accounts

GitHub CLI signed in as `jeymarclabs` (org `jeymarc-labs`). Vercel, Strava API app, Resend,
Cloudflare (Turnstile): not set up yet.
