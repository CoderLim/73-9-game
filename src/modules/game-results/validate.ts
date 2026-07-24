import type { HistoryLineupPlayer, SubmitResultInput } from './types';

const RECORD_MAX = 32;
const LINEUP_JSON_MAX = 8_000;
const SHARE_JSON_MAX = 4_000;

export function parseLineupJson(raw: string): HistoryLineupPlayer[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (!item || typeof item !== 'object') return {};
      const o = item as Record<string, unknown>;
      const player: HistoryLineupPlayer = {};
      if (typeof o.pos === 'string' || typeof o.pos === 'number') {
        player.pos = o.pos;
      }
      if (typeof o.name === 'string') player.name = o.name;
      if (typeof o.abbr === 'string') player.abbr = o.abbr;
      if (typeof o.sy === 'string' || typeof o.sy === 'number') {
        player.sy = o.sy;
      }
      if (typeof o.cost === 'number' && Number.isFinite(o.cost)) {
        player.cost = o.cost;
      }
      if (typeof o.rating === 'number' && Number.isFinite(o.rating)) {
        player.rating = o.rating;
      }
      return player;
    });
  } catch {
    return [];
  }
}

export function encodeWinPct(winPct: number): number {
  return Math.round(Number(winPct) * 100);
}

export function decodeWinPct(winPctX100: number): number {
  return winPctX100 / 100;
}

export function sanitizeSubmitInput(
  body: unknown
):
  | { ok: true; value: Omit<SubmitResultInput, 'userId'> }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid body' };
  }
  const b = body as Record<string, unknown>;
  const winPct = Number(b.winPct);
  if (!Number.isFinite(winPct) || winPct < 0 || winPct > 100) {
    return { ok: false, error: 'Invalid winPct' };
  }
  const record = typeof b.record === 'string' ? b.record.trim() : '';
  if (!record || record.length > RECORD_MAX) {
    return { ok: false, error: 'Invalid record' };
  }
  const isPerfect = b.isPerfect === true;
  let lineupJson = '[]';
  const lineup = b.lineup ?? b.lineupJson;
  if (lineup !== undefined) {
    try {
      lineupJson = typeof lineup === 'string' ? lineup : JSON.stringify(lineup);
    } catch {
      return { ok: false, error: 'Invalid lineup' };
    }
    if (lineupJson.length > LINEUP_JSON_MAX) {
      return { ok: false, error: 'lineup too large' };
    }
  }
  let sharePayload: string | null = null;
  if (b.sharePayload !== undefined && b.sharePayload !== null) {
    try {
      sharePayload =
        typeof b.sharePayload === 'string'
          ? b.sharePayload
          : JSON.stringify(b.sharePayload);
    } catch {
      return { ok: false, error: 'Invalid sharePayload' };
    }
    if (sharePayload.length > SHARE_JSON_MAX) {
      return { ok: false, error: 'sharePayload too large' };
    }
  }
  return {
    ok: true,
    value: {
      winPctX100: encodeWinPct(winPct),
      record,
      isPerfect,
      lineupJson,
      sharePayload,
    },
  };
}
