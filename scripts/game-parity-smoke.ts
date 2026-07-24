#!/usr/bin/env npx tsx
/**
 * Smoke-test pure engine parity helpers.
 * Usage: pnpm exec tsx scripts/game-parity-smoke.ts
 */
import { runParitySmoke } from '../src/game/engine/parity.test';

const result = runParitySmoke();
for (const c of result.checks) {
  const mark = c.ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${c.name}${c.detail ? ' — ' + c.detail : ''}`);
}
if (!result.ok) {
  console.error('Parity smoke failed');
  process.exit(1);
}
console.log('All parity smoke checks passed.');
