# Jeymarc Sison – Personal Website Brief

A build brief for Claude Code. Name is always spelled **Jeymarc Sison**.

## Purpose

A personal home on the web: an online CV and public personal blog. No specific target audience; open to anyone (future employers, friends, family). It also acts as the central hub linking to all of Jeymarc's profiles.

## Look and feel

- Minimalist, modern, Apple-ish: think Apple product pages, with content gliding and revealing on scroll.
- Rich scroll motion and animation, but the structure stays simple.
- Accent colour: emerald / forest green.
- Light mode and dark mode (with toggle).
- Clean line icons in an Apple-like style, tinted green, optionally subtly animated, blending into the design.
- Portrait of Jeymarc on the landing page, cut out from its background and merged into the design (not a plain rectangular photo), ideally with subtle scroll motion. Use a placeholder until he supplies the photo.
- Language: English only.

## Structure

Few pages. A landing page acts as the hub, with links into the other sections.

### Landing page

- Hero with the merged portrait and a short intro line.
- **Now** section: a line or two on what he is currently up to (editable via the admin).
- Short About: one-liner on career, worked in finance his whole career at two big banks, role as consultant / product manager. No detail on the actual work; link to LinkedIn for more.
- Interests: running, travel, tech and Apple, and learning AI with Claude.
- Entry points to Running, Travel, Projects and Blog.
- Contact form at the very end, plus social links.

### Running

- Running brand **jeymarc.logs** is featured here.
- Every run pulled automatically from Strava (route map and stats).
- Written run reports with photos, blog-style, for races and special runs only.
- Race results board.
- World Marathon Majors tracker showing which majors are done and which are planned.
- Feed of posts from the running Instagram account.

### Travel

- Interactive map as the entry point (Mapbox, styled in the green palette for light and dark mode).
- Each pin opens a trip with curated photo highlights and a short story.
- Trips are logged on the go in Polarsteps; each trip on the site links out to the full Polarsteps journey. The site keeps its own curated content so it never depends on Polarsteps.

### Projects

- Only projects that are well underway. Currently: **City Run** (iOS GPS-guided running-tour app; note the name is City Run, not RunCity).
- Easy to add more later.

### Blog

- Posts on what he is working on and his interests, written by Jeymarc together with Claude.
- A recurring series documenting his journey learning AI ("learning AI in public").

## Links hub

LinkedIn, personal Instagram, running Instagram (jeymarc.logs), Strava, and optionally GitHub.

## Content editing

- A simple web admin (e.g. Decap CMS or Sanity) where Jeymarc can write and edit posts, update the Now section, and upload photos in the browser.
- No drag-and-drop layout editing; layout is handled in code.

## Integrations and technical notes

- **Strava API** for his own activities.
- **Instagram**: pulling posts likely requires a business or creator account; check the current API requirements and advise.
- **Mapbox** for the travel map.
- Contact form via a free form service or serverless function.
- Hosting: free tier (e.g. Vercel). Budget is lean; only the domain costs money.

## Domain

Something simple based on his name: jeymarc.com or jeymarcsison.com (a .ch variant is an option). Check availability.

## Open items

- Jeymarc to choose the portrait photo.
- Final domain choice.
- Decide on GitHub link.
- Set up Polarsteps and, if needed, switch the running Instagram to a creator account.
