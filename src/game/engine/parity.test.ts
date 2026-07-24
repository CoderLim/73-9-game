/**
 * Lightweight parity smoke checks — no test runner required.
 * Invoke via: `node --import tsx src/game/engine/parity.test.ts` (or import runParitySmoke).
 */

import { fmtM } from './format';
import { b64urlDecode, b64urlEncode, parseShareQuery } from './share';
import { winPctFor } from './sim';
import type { SharedPayload } from './types';

export interface ParityCheck {
  name: string;
  ok: boolean;
  detail?: string;
}

export function runParitySmoke(): {
  ok: boolean;
  checks: ParityCheck[];
} {
  const checks: ParityCheck[] = [];

  // --- b64url roundtrip for a sample share payload ---
  const sample: SharedPayload = {
    v: 1,
    wp: '12.34%',
    p: [
      { pos: 'PG', nm: 'Stephen Curry', tm: 'GSW', sy: '2015-16', c: '$12.1M' },
      { pos: 'SG', nm: 'Klay Thompson', tm: 'GSW', sy: '2015-16', c: '$15.5M' },
      { pos: 'SF', nm: 'LeBron James', tm: 'CLE', sy: '2015-16', c: '$22.9M' },
      { pos: 'PF', nm: 'Kevin Durant', tm: 'OKC', sy: '2015-16', c: '$20.1M' },
      { pos: 'C', nm: 'Nikola Jokić', tm: 'DEN', sy: '2022-23', c: '$33.0M' },
    ],
  };
  try {
    const enc = b64urlEncode(sample);
    const dec = b64urlDecode(enc) as SharedPayload;
    const roundOk =
      dec.v === sample.v &&
      dec.wp === sample.wp &&
      Array.isArray(dec.p) &&
      dec.p.length === 5 &&
      dec.p[4].nm === 'Nikola Jokić';
    checks.push({
      name: 'b64url roundtrip (share payload + unicode)',
      ok: roundOk,
      detail: roundOk ? enc.slice(0, 24) + '…' : JSON.stringify(dec),
    });

    const parsed = parseShareQuery('?sq=' + enc);
    checks.push({
      name: 'parseShareQuery',
      ok: !!(parsed && parsed.p && parsed.p[0].nm === 'Stephen Curry'),
    });
  } catch (e) {
    checks.push({
      name: 'b64url roundtrip (share payload + unicode)',
      ok: false,
      detail: String(e),
    });
  }

  // --- winPctFor edge cases ---
  const records = {
    'GSW|2016': 0.89,
    'PHI|2016': 0.122,
  };
  const cases: Array<[string, number, number]> = [
    ['GSW', 2016, 0.89],
    ['PHI', 2016, 0.122],
    ['XXX', 1999, 0.5], // missing → neutral .500
    ['GSW', 2015, 0.5], // different season → missing
  ];
  let winOk = true;
  for (const [abbr, sy, expect] of cases) {
    const got = winPctFor(abbr, sy, records);
    if (got !== expect) {
      winOk = false;
      checks.push({
        name: `winPctFor(${abbr},${sy})`,
        ok: false,
        detail: `expected ${expect}, got ${got}`,
      });
    }
  }
  if (winOk) {
    checks.push({
      name: 'winPctFor edge cases (hit / miss / neutral)',
      ok: true,
    });
  }

  // --- fmtM formatting ---
  const fmtCases: Array<[number, string]> = [
    [100_000_000, '$100.0M'],
    [10_000_000, '$10.0M'],
    [12_345_678, '$12.3M'],
    [0, '$0.0M'],
  ];
  let fmtOk = true;
  for (const [n, expect] of fmtCases) {
    const got = fmtM(n);
    if (got !== expect) {
      fmtOk = false;
      checks.push({
        name: `fmtM(${n})`,
        ok: false,
        detail: `expected ${expect}, got ${got}`,
      });
    }
  }
  if (fmtOk) {
    checks.push({ name: 'fmtM formatting', ok: true });
  }

  const ok = checks.every((c) => c.ok);
  return { ok, checks };
}

// Allow `node --import tsx …/parity.test.ts` style direct run.
const isDirect =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  /parity\.test\.[jt]s$/.test(process.argv[1].replace(/\\/g, '/'));

if (isDirect) {
  const result = runParitySmoke();
  for (const c of result.checks) {
    console.log(
      (c.ok ? 'PASS' : 'FAIL') +
        '  ' +
        c.name +
        (c.detail ? ' — ' + c.detail : '')
    );
  }
  if (!result.ok) process.exit(1);
  console.log('All parity smoke checks passed.');
}
