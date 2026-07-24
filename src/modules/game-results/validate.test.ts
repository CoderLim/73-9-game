import assert from 'node:assert/strict';

import { decodeWinPct, encodeWinPct, sanitizeSubmitInput } from './validate';
import { windowStartUtc } from './windows';

function run() {
  assert.equal(encodeWinPct(12.34), 1234);
  assert.equal(decodeWinPct(1234), 12.34);

  const ok = sanitizeSubmitInput({
    winPct: 12.345,
    record: '58–24',
    isPerfect: true,
    lineup: [{ name: 'A', pos: 'PG' }],
    sharePayload: { v: 1 },
  });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.value.winPctX100, 1235);
    assert.equal(ok.value.record, '58–24');
    assert.equal(ok.value.isPerfect, true);
  }

  const bad = sanitizeSubmitInput({
    winPct: -1,
    record: 'x',
    isPerfect: false,
  });
  assert.equal(bad.ok, false);

  const day = windowStartUtc('day', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(day!.toISOString(), '2026-07-24T00:00:00.000Z');

  const week = windowStartUtc('week', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(week!.toISOString(), '2026-07-20T00:00:00.000Z');

  assert.equal(windowStartUtc('alltime', new Date()), null);

  console.log('game-results validate tests: ok');
}

run();
