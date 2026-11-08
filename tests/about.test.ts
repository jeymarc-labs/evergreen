import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quickFacts } from '../src/lib/about.ts';

test('quick facts: order, plurals, unset numbers left out', () => {
  assert.deepEqual(quickFacts({ yearsInFinance: 12, marathons: 1, cities: 30, languages: 4 }), [
    { value: 12, label: 'years in finance' },
    { value: 1, label: 'marathon run' },
    { value: 30, label: 'cities visited' },
    { value: 4, label: 'languages' },
  ]);
  assert.deepEqual(quickFacts({ yearsInFinance: null, marathons: 0, cities: 30, languages: 0 }).map((f) => f.label), ['cities visited']);
});
