import { test } from 'node:test';
import assert from 'node:assert/strict';
import { majorsProgress } from '../src/lib/running.ts';

test('majors progress counts done and rounds percent', () => {
  assert.deepEqual(majorsProgress([{ status: 'done' }, { status: 'planned' }, { status: 'open' }]), { done: 1, total: 3, percent: 33 });
  assert.deepEqual(majorsProgress([]), { done: 0, total: 0, percent: 0 });
});
