import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brandFor, isInstagramPost, isSafeHref } from '../src/lib/links.ts';

test('safe links pass', () => {
  for (const h of ['https://example.com', 'http://x.y/z?q=1', 'mailto:a@b.c', '/blog/x', '#top', '../a', ' https://x.y ']) {
    assert.equal(isSafeHref(h), true, h);
  }
});

test('dangerous or odd links are refused', () => {
  for (const h of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil.example', '', '   ', 'file:///etc/passwd', 42, null]) {
    assert.equal(isSafeHref(h), false, String(h));
  }
});

test('brand logos match by host only', () => {
  assert.equal(brandFor('https://www.linkedin.com/in/x'), 'linkedin');
  assert.equal(brandFor('https://ch.linkedin.com/in/x'), 'linkedin');
  assert.equal(brandFor('https://www.instagram.com/jeymarc.logs/'), 'instagram');
  assert.equal(brandFor('https://github.com/jeymarc-labs'), 'github');
  assert.equal(brandFor('https://www.strava.com/athletes/1'), 'strava');
  assert.equal(brandFor('https://evil.example/github.com'), null);
  assert.equal(brandFor('https://notgithub.com/'), null);
  assert.equal(brandFor('not a url'), null);
});

test('Instagram picks must link to one post or reel', () => {
  for (const ok of ['https://www.instagram.com/p/DAbc_12-x/', 'https://instagram.com/reel/C9x/', 'https://www.instagram.com/p/DAbc/?igsh=MW1x.y'])
    assert.ok(isInstagramPost(ok), ok);
  for (const bad of ['https://www.instagram.com/jeymarc.logs/', 'http://www.instagram.com/p/x/', 'https://evil.com/p/x/', 'javascript:alert(1)', 'https://www.instagram.com/p/x/"><script>', null])
    assert.ok(!isInstagramPost(bad), String(bad));
});
