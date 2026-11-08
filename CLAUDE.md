# Evergreen — how Claude works in this repo

Evergreen is the codename for **Jeymarc Sison**'s personal website (always spelled that way).
The codename never appears on the site.

Read **CONTEXT.md** (current facts, short), **ROADMAP.md** (phases, what's next) and the
**DECISIONS.md** entries the work touches. The original brief is `BRIEF.md`.

## How we work

- **Plan first, wait for Jeymarc's go.** Small change → a few lines: what, files, how it's checked,
  done when. Bigger change (new service, content model, data flow, anything touching privacy)
  → also the alternative not taken and the risks. Never assume a go from an earlier one.
- **Small steps, no wholesale rewrites.** Edit what exists. Show the result, then the next step.
- **Design changes are shown before they're built out:** a mockup or preview URL first.
- **Record decisions** in DECISIONS.md (dated, one line of why). Keep CONTEXT.md current, not long.
- **Report plainly:** what changed, how it was checked (with counts), what's not verified, what's
  waiting on Jeymarc. If an agent ran, end with one "Agents:" line (e.g. *Keystone: APPROVE*).

## Economy — quality without waste

- **Scripts check, agents judge.** `scripts/check.sh` runs every deterministic check (secrets, image
  sizes, shellcheck, `astro check` types, build). Run it instead of asking an agent to "test things".
- **Models:** plan and design on Opus; routine code and reviews on Sonnet; reading big files or
  logs on Haiku. Shield (Opus) only when its trigger fits.
- **When to call an agent:**
  | Agent | Call when | Skip when |
  |---|---|---|
  | **Keystone** (Sonnet) | Code change ready to commit, more than a trivial edit | Docs, content, one-line fixes (say you skipped it) |
  | **Shield** (Opus) | Before adopting any outside service, API, library, font, icon set, map data or paid plan; before anything shows personal data (routes, photos, locations) publicly | Everything else |
- Cut long output (builds, logs) to the summary before it reaches the main conversation.

## Code rules

- **Astro + TypeScript (strict).** Static by default; client JavaScript only in islands that need
  it (map, theme toggle, contact form, motion). No framework (React etc.) without a reason in
  DECISIONS.md.
- **Layers:** `src/pages` and `src/components` render only → `src/lib/` services
  (Instagram, contact, map) do every network call and data shaping → `src/content.config.ts`
  typed content models (zod). Components never call `fetch` themselves.
- **Design tokens** live in one place (`src/styles/tokens.css`) as per-theme CSS variables, so a
  component uses one class (`text-accent`) with no `dark:` variant for colour. No hard-coded
  colours elsewhere.
  Every colour pair passes WCAG AA in light and dark.
- **Motion:** every animation has a `prefers-reduced-motion` path. Never hijack scrolling.
  Follow the `apple-design` skill.
- **Images:** through Astro's image pipeline (AVIF/WebP, sizes). Originals in the repo stay under
  the size limit `check.sh` enforces.
- **Privacy in code:** no run data, routes or Strava embeds on the site; Strava is a profile link
  only. No exact home location ever ships. Photo EXIF/GPS is stripped from
  originals before commit.
- No new dependency (npm package, service, font, tiles) without Shield first. The core stack
  (Astro, Tailwind) was adopted with the 2026-11-08 stack decision and is in that day's Shield pass.

## Standing rules

- **Secrets** never in the repo. Local: `~/.config/evergreen/` or a git-ignored `.env`; deployed:
  Vercel environment variables. `scripts/check_secrets.sh` guards it.
- **Account-level actions are Jeymarc's:** domain registration and DNS, GitHub repo creation and
  settings, Vercel, Strava API app, Instagram/Meta, Resend. Prepare them and say exactly what
  happens; Jeymarc does them.
- **Never touch anything outside this repo.** Other projects (Brain, CityRun) are read-only
  references.
- **Spend nothing:** free tiers only, checks run locally, no paid plan without asking.
