// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Pages are static (prerendered). Only routes that export `prerender = false`
// (e.g. /api/contact) run as Vercel functions.
export default defineConfig({
  // Used for canonical and share-preview URLs. Switch to the real domain once it's registered.
  site: 'https://evergreen-tan.vercel.app',
  // Web Analytics also needs switching on in the Vercel dashboard (Project › Analytics).
  adapter: vercel({ webAnalytics: { enabled: true } }),
  // React runs the Keystatic admin only; public pages ship no React.
  integrations: [react(), markdoc(), keystatic()],
  // Secrets are read at runtime on the server (never bundled, never sent to the browser).
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      // Keystatic GitHub mode (created by the /keystatic setup flow on the live site).
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  vite: { plugins: [tailwindcss()] },
});
