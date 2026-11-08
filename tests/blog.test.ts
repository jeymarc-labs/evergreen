import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visiblePosts, seriesPosts, neighbours, readingMinutes, formatDate, type PostMeta } from '../src/lib/blog.ts';

const p = (id: string, date: string, extra: Partial<PostMeta> = {}): PostMeta => ({
  id, title: id, date: new Date(date), draft: false, series: 'none', ...extra,
});

const all = [
  p('a', '2026-01-01'),
  p('b', '2026-03-01', { draft: true }),
  p('c', '2026-02-01', { series: 'learning-ai', part: 2 }),
  p('d', '2026-04-01', { series: 'learning-ai', part: 1 }),
];

test('drafts hidden unless asked, newest first', () => {
  assert.deepEqual(visiblePosts(all, false).map((x) => x.id), ['d', 'c', 'a']);
  assert.deepEqual(visiblePosts(all, true).map((x) => x.id), ['d', 'b', 'c', 'a']);
});

test('series in part order; none has no series', () => {
  assert.deepEqual(seriesPosts(all, 'learning-ai').map((x) => x.id), ['d', 'c']);
  assert.deepEqual(seriesPosts(all, 'none'), []);
});

test('series without part numbers fall back to date', () => {
  const s = [p('x', '2026-02-01', { series: 'learning-ai' }), p('y', '2026-01-01', { series: 'learning-ai' })];
  assert.deepEqual(seriesPosts(s, 'learning-ai').map((x) => x.id), ['y', 'x']);
});

test('neighbours at the ends and in the middle', () => {
  const sorted = visiblePosts(all, false); // d, c, a
  assert.deepEqual(neighbours(sorted, 'c'), { newer: sorted[0], older: sorted[2] });
  assert.equal(neighbours(sorted, 'd').newer, undefined);
  assert.equal(neighbours(sorted, 'a').older, undefined);
  assert.deepEqual(neighbours(sorted, 'zzz'), {});
});

test('reading time ignores markup and has a 1-minute floor', () => {
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(440)), 2);
  assert.equal(readingMinutes('{% callout %}x{% /callout %} ![alt](a.jpg) [link text](https://x.y)'), 1);
});

test('dates format in English, UTC', () => {
  assert.equal(formatDate(new Date('2026-11-08')), '8 November 2026');
});
