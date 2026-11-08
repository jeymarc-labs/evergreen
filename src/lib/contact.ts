// Contact form service: validation, spam checks, Turnstile verification and sending via Resend.
// Pure functions take their dependencies as arguments so they run under `node --test`
// without Astro. No message content is ever logged.

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: ContactMessage }
  | { ok: false; error: string; field?: keyof ContactMessage };

export const LIMITS = { name: 100, email: 200, message: 5000, minMessage: 10 } as const;

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

/** Validates raw form fields. `website` is the honeypot: humans never see or fill it. */
export function validateContact(fields: Record<string, unknown>): ValidationResult | { ok: 'spam' } {
  const text = (k: string) => (typeof fields[k] === 'string' ? (fields[k] as string).trim() : '');
  if (text('website') !== '') return { ok: 'spam' };

  const name = text('name');
  const email = text('email');
  const message = text('message');

  if (!name) return { ok: false, field: 'name', error: 'Please add your name.' };
  if (name.length > LIMITS.name) return { ok: false, field: 'name', error: 'That name is too long.' };
  if (!EMAIL.test(email) || email.length > LIMITS.email)
    return { ok: false, field: 'email', error: 'Please check your email address.' };
  if (message.length < LIMITS.minMessage)
    return { ok: false, field: 'message', error: 'Please write a little more.' };
  if (message.length > LIMITS.message)
    return { ok: false, field: 'message', error: `Please keep it under ${LIMITS.message} characters.` };
  // Header injection guard: name and email end up in email headers.
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email))
    return { ok: false, error: 'Please remove line breaks from your name and email.' };

  return { ok: true, value: { name, email, message } };
}

type Fetch = typeof fetch;

/** Asks Cloudflare whether the Turnstile token is valid. Fails closed. */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | undefined,
  fetchFn: Fetch = fetch,
): Promise<boolean> {
  if (!token || !secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Builds the email Jeymarc receives. Reply-To is the visitor, so "Reply" just works. */
export function buildEmail(msg: ContactMessage, to: string, from: string) {
  return {
    from,
    to: [to],
    reply_to: msg.email,
    subject: `Website message from ${msg.name}`,
    text: `${msg.message}\n\n— ${msg.name} <${msg.email}>`,
    html: `<p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p><p>— ${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;</p>`,
  };
}

/** Sends through Resend's HTTP API (no SDK dependency). */
export async function sendViaResend(
  email: ReturnType<typeof buildEmail>,
  apiKey: string,
  fetchFn: Fetch = fetch,
): Promise<boolean> {
  try {
    const res = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
