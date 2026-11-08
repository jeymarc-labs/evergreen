import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, verifyTurnstile, buildEmail, sendViaResend } from '../src/lib/contact.ts';

const good = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, nice site!' };

test('valid message passes and is trimmed', () => {
  const r = validateContact({ ...good, name: '  Ada  ' });
  assert.deepEqual(r, { ok: true, value: good });
});

test('honeypot filled is spam', () => {
  assert.deepEqual(validateContact({ ...good, website: 'http://spam' }), { ok: 'spam' });
});

test('missing or bad fields are rejected with the field name', () => {
  assert.equal((validateContact({ ...good, name: '' }) as { field: string }).field, 'name');
  assert.equal((validateContact({ ...good, email: 'nope' }) as { field: string }).field, 'email');
  assert.equal((validateContact({ ...good, message: 'hi' }) as { field: string }).field, 'message');
  assert.equal((validateContact({ ...good, message: 'x'.repeat(5001) }) as { field: string }).field, 'message');
  assert.equal((validateContact({ ...good, name: 'x'.repeat(101) }) as { field: string }).field, 'name');
});

test('non-string fields are treated as empty', () => {
  assert.equal(validateContact({ name: 42, email: [], message: {} }).ok, false);
});

test('line breaks in name are rejected (header injection)', () => {
  assert.equal(validateContact({ ...good, name: 'Ada\r\nBcc: x@y.z' }).ok, false);
});

const fakeFetch = (status: number, json: unknown, seen?: { body?: string; url?: string }) =>
  (async (url: string, init?: RequestInit) => {
    if (seen) { seen.url = String(url); seen.body = String(init?.body); }
    return new Response(JSON.stringify(json), { status });
  }) as unknown as typeof fetch;

test('turnstile: success, failure, http error, network error, empty token', async () => {
  assert.equal(await verifyTurnstile('t', 's', '1.2.3.4', fakeFetch(200, { success: true })), true);
  assert.equal(await verifyTurnstile('t', 's', undefined, fakeFetch(200, { success: false })), false);
  assert.equal(await verifyTurnstile('t', 's', undefined, fakeFetch(500, {})), false);
  const boom = (async () => { throw new Error('down'); }) as unknown as typeof fetch;
  assert.equal(await verifyTurnstile('t', 's', undefined, boom), false);
  assert.equal(await verifyTurnstile('', 's', undefined, fakeFetch(200, { success: true })), false);
});

test('email escapes HTML and sets reply-to', () => {
  const e = buildEmail({ name: '<b>Ada</b>', email: 'ada@example.com', message: '<script>x</script>' }, 'me@x.ch', 'site@x.ch');
  assert.equal(e.reply_to, 'ada@example.com');
  assert.ok(!e.html.includes('<script>'));
  assert.ok(e.html.includes('&lt;script&gt;'));
});

test('resend: ok and failure', async () => {
  const seen: { body?: string; url?: string } = {};
  const e = buildEmail(good, 'me@x.ch', 'site@x.ch');
  assert.equal(await sendViaResend(e, 'k', fakeFetch(200, { id: '1' }, seen)), true);
  assert.equal(seen.url, 'https://api.resend.com/emails');
  assert.equal(JSON.parse(seen.body!).to[0], 'me@x.ch');
  assert.equal(await sendViaResend(e, 'k', fakeFetch(422, {})), false);
});
