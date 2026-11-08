// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Pages are static (prerendered). Only routes that export `prerender = false`
// (e.g. /api/contact) run as Vercel functions.
export default defineConfig({
  site: 'https://jeymarc.com',
  // Web Analytics also needs switching on in the Vercel dashboard (Project › Analytics).
  adapter: vercel({ webAnalytics: { enabled: true } }),
  // Secrets are read at runtime on the server (never bundled, never sent to the browser).
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  vite: { plugins: [tailwindcss()] },
});
