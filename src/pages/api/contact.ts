// POST /api/contact — runs as a Vercel function (everything else on the site is static).
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { validateContact, verifyTurnstile, buildEmail, sendViaResend } from '../../lib/contact';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Cloudflare's documented always-passes test secret, used only in `astro dev` when no real
// secret is set: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const DEV_TURNSTILE = '1x0000000000000000000000000000000AA';

// A real message is a few KB; refuse anything far bigger before parsing it.
const MAX_BODY_BYTES = 32_000;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'That message is too long.' });
  }

  const dev = import.meta.env.DEV;
  const turnstileSecret = getSecret('TURNSTILE_SECRET_KEY') || (dev ? DEV_TURNSTILE : '');
  const apiKey = getSecret('RESEND_API_KEY');
  const to = getSecret('CONTACT_TO');
  // In production a missing setting is our problem, not the visitor's: say so and log it.
  if (!dev && (!turnstileSecret || !apiKey || !to)) {
    console.error('[contact] missing TURNSTILE_SECRET_KEY, RESEND_API_KEY or CONTACT_TO');
    return json(503, { ok: false, error: "The form isn't working right now. Please try again later." });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'Something went wrong. Please try again.' });
  }
  const fields = Object.fromEntries(form);

  const checked = validateContact(fields);
  // Spam gets a normal-looking success so bots learn nothing.
  if (checked.ok === 'spam') return json(200, { ok: true });
  if (!checked.ok) return json(422, { ok: false, error: checked.error, field: checked.field });

  const human = await verifyTurnstile(String(fields['cf-turnstile-response'] ?? ''), turnstileSecret, clientAddress);
  if (!human) return json(403, { ok: false, error: 'Please complete the check and try again.' });

  if (!apiKey || !to) {
    // Only reachable in `astro dev` (production returned 503 above).
    console.info('[contact] dev mode, Resend not configured: message accepted, not sent');
    return json(200, { ok: true });
  }

  const from = getSecret('CONTACT_FROM') || 'Website <onboarding@resend.dev>';
  const sent = await sendViaResend(buildEmail(checked.value, to, from), apiKey);
  if (!sent) {
    console.error('[contact] Resend send failed');
    return json(502, { ok: false, error: "Your message didn't go through. Please try again later." });
  }
  return json(200, { ok: true });
};
