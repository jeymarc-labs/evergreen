import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, MAX_STEP, languageRows } from '../src/lib/languages.ts';

test('levels: five steps, highest is native', () => {
  const steps = Object.values(LEVELS).map((l) => l.step).sort();
  assert.deepEqual(steps, [1, 2, 3, 4, 5]);
  assert.equal(LEVELS.native.step, MAX_STEP);
});

test('rows keep order, fill one after another, skip bad entries', () => {
  const rows = languageRows([
    { language: 'German', level: 'native' },
    { language: 'English', level: 'fluent' },
    { language: ' ', level: 'basic' },
    { language: 'Klingon', level: 'expert' },
    { language: 'French', level: 'conversational' },
  ]);
  assert.deepEqual(rows.map((r) => [r.language, r.name, r.delay]), [['German', 'Native', 0], ['English', 'Fluent', 5], ['French', 'Conversational', 9]]);
});
