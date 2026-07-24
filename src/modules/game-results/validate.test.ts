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

  const badWinPct = sanitizeSubmitInput({
    winPct: -1,
    record: '58–24',
    isPerfect: false,
  });
  assert.equal(badWinPct.ok, false);
  if (!badWinPct.ok) {
    assert.equal(badWinPct.error, 'Invalid winPct');
  }

  const badRecord = sanitizeSubmitInput({
    winPct: 50,
    record: '   ',
    isPerfect: false,
  });
  assert.equal(badRecord.ok, false);
  if (!badRecord.ok) {
    assert.equal(badRecord.error, 'Invalid record');
  }

  const badBody = sanitizeSubmitInput(null);
  assert.equal(badBody.ok, false);
  if (!badBody.ok) {
    assert.equal(badBody.error, 'Invalid body');
  }

  const stringFalsePerfect = sanitizeSubmitInput({
    winPct: 50,
    record: '58–24',
    isPerfect: 'false',
  });
  assert.ok(stringFalsePerfect.ok);
  if (stringFalsePerfect.ok) {
    assert.equal(stringFalsePerfect.value.isPerfect, false);
  }

  const day = windowStartUtc('day', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(day!.toISOString(), '2026-07-24T00:00:00.000Z');

  const week = windowStartUtc('week', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(week!.toISOString(), '2026-07-20T00:00:00.000Z');

  assert.equal(windowStartUtc('alltime', new Date()), null);

  console.log('game-results validate tests: ok');
}

run();
