import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestRace, majorsProgress, marathonCount, personalBests, timeToSeconds, type Race } from '../src/lib/running.ts';

test('majors progress counts done and rounds percent', () => {
  assert.deepEqual(majorsProgress([{ status: 'done' }, { status: 'planned' }, { status: 'open' }]), { done: 1, total: 3, percent: 33 });
  assert.deepEqual(majorsProgress([]), { done: 0, total: 0, percent: 0 });
});

const races: Race[] = [
  { name: 'Chicago Marathon', place: 'Chicago', date: '2026-10-11', distance: 'marathon', time: '3:30:20', note: 'New marathon personal best.' },
  { name: 'Berlin Marathon', place: 'Berlin', date: '2025-09-21', distance: 'marathon', time: '3:39:15', note: '' },
  { name: 'Zürich Half Marathon', place: 'Zürich', date: '2025-04-13', distance: 'half', time: '1:45:55', note: '' },
  { name: 'Berlin Marathon', place: 'Berlin', date: '2014-09-28', distance: 'marathon', time: '4:18:56', note: '' },
];

test('times parse; junk is rejected', () => {
  assert.equal(timeToSeconds('3:30:20'), 12620);
  assert.equal(timeToSeconds('45:12'), 2712);
  for (const bad of ['', '3:70:00', 'fast', '1:2:3']) assert.equal(timeToSeconds(bad), null, bad);
});

test('personal bests per distance, placeholders when none', () => {
  const pbs = personalBests(races);
  assert.deepEqual(pbs.map((p) => p.value), [null, null, '1:45:55', '3:30:20']);
  assert.deepEqual(pbs.map((p) => p.label), ['5K PB', '10K PB', 'Half marathon PB · Zürich 2025', 'Marathon PB · Chicago 2026']);
});

test('latest race, PB flags and marathon count', () => {
  assert.equal(latestRace(races)?.name, 'Chicago Marathon');
  assert.equal(latestRace([]), null);
  assert.equal(marathonCount(races), 3);
});
