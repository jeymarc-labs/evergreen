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
    Turnstile, success state.
  - **Live contact form confirmed 2026-11-08:** Jeymarc sent a message from his own browser and
    the email arrived. Env vars set in Vercel (secrets marked Sensitive; site key plain).
    Turnstile rejects the in-app automated browser (error 600010), so live form tests must be
    done by Jeymarc in a normal browser.
  - Unreviewed: `src/components/BrandIcon.astro` + brand icons on the profile links (Simple
    Icons, CC0) appeared during the build, not written in this session, and went out in the
    first commit. Needs Keystone, and Shield for brand-mark use.
  - All content is still sample (`SAMPLE_CONTENT = true` shows a pill).
  - `scripts/check.sh` passes (9 unit tests, 6 pages).
- GitHub: `jeymarc-labs/evergreen` (public), `main` pushed 2026-11-08. This repo commits as
  `Jeymarc Sison <jeymarc.labs@gmail.com>` (local git config) so Vercel Hobby accepts the
  deploys.
- **Live on Vercel Hobby (team jeymarc-labs): https://evergreen-tan.vercel.app** (2026-11-08).
  Every push to `main` deploys. Checked live: all 6 pages 200, 404 works, HTTPS + HSTS,
  `/api/contact` working. Web Analytics not yet switched on in the dashboard (its script 404s).
  Domain not registered.

## Waiting on Jeymarc

- Register the domain (.ch or .com).
- Switch on Web Analytics in the Vercel dashboard.
- Portrait photo; race results; Majors done/planned; trip list.
- Optionally: switch jeymarc.logs Instagram to a creator account.

## Accounts

GitHub CLI signed in as `jeymarclabs` (org `jeymarc-labs`). Vercel Hobby team `jeymarc-labs`
(project `evergreen`). Cloudflare Turnstile widget "Evergreen contact form" (managed mode,
hostname evergreen-tan.vercel.app; add the domain when registered). Resend: sends from
onboarding@resend.dev to the sign-up address until the domain is verified.
