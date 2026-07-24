/**
 * DOM-free share / challenge URL helpers.
 * Ported from vanilla `_b64urlEncode` / `buildShareURL` / `buildChallengeURL`.
 */

import { getShareBaseUrl } from './constants';
import type {
  ChallengePayload,
  FeudState,
  ShareCardData,
  SharedPayload,
} from './types';

function encodeUtf8ToBinary(str: string): string {
  // Match vanilla: unescape(encodeURIComponent(...)) → latin1 binary for btoa.
  return unescape(encodeURIComponent(str));
}

function decodeBinaryToUtf8(binary: string): string {
  return decodeURIComponent(escape(binary));
}

function btoaCompat(binary: string): string {
  if (typeof btoa !== 'undefined') return btoa(binary);
  // Node (parity tests)
  return Buffer.from(binary, 'binary').toString('base64');
}

function atobCompat(b64: string): string {
  if (typeof atob !== 'undefined') return atob(b64);
  return Buffer.from(b64, 'base64').toString('binary');
}

/** URL-safe base64 of a small JSON payload (unicode-safe for accented names). */
export function b64urlEncode(o: unknown): string {
  return btoaCompat(encodeUtf8ToBinary(JSON.stringify(o)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function b64urlDecode(s: string): unknown {
  let padded = s.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  return JSON.parse(decodeBinaryToUtf8(atobCompat(padded)));
}

/** Build the shareable link encoding the exact five + the Warriors win%. */
export function buildShareURL(
  shareCardData: ShareCardData | null | undefined,
  baseUrl: string = getShareBaseUrl()
): string {
  if (!shareCardData) return baseUrl;
  const payload: SharedPayload = {
    v: 1,
    wp: shareCardData.warPct,
    p: shareCardData.players.map((p) => ({
      pos: p.pos,
      nm: p.name,
      tm: p.team,
      sy: p.season,
      c: p.cost,
    })),
  };
  // Vanilla: SHARE_BASE_URL + '?sq=' + encode
  return String(baseUrl).replace(/\?.*$/, '') + '?sq=' + b64urlEncode(payload);
}

export function shareText(
  warPct: string,
  _platform?: 'x' | 'bsky' | string
): string {
  let t =
    'My team beat the 2015-16 Warriors ' +
    warPct +
    ' of the time. Think you can build a squad that does better?';
  // Vanilla appended nothing for x/bsky — keep the branches for parity.
  if (_platform === 'x') t += '';
  else if (_platform === 'bsky') t += '';
  return t;
}

export function genId(): string {
  try {
    const u =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);
    return u.replace(/-/g, '').slice(0, 16);
  } catch {
    return String(Date.now()) + Math.random().toString(16).slice(2);
  }
}

export interface ChallengeURLInput {
  name?: string;
  /** Slotted roster (null holes ok). */
  roster: Array<{ name: string; abbr?: string; sy: number } | null>;
  warPct?: string;
  record?: string;
  /** lineupStrength(roster) fallback. */
  strength?: number | null;
  feud?: FeudState | null;
  baseUrl?: string;
}

/** Build a friend-challenge link (?ch=). DOM-free — pass roster/snapshot explicitly. */
export function buildChallengeURL(input: ChallengeURLInput): string {
  const baseUrl = input.baseUrl ?? getShareBaseUrl();
  const five = input.roster.filter(Boolean) as Array<{
    name: string;
    abbr?: string;
    sy: number;
  }>;
  if (!five.length) return baseUrl;
  const payload: ChallengePayload = {
    v: 3,
    nm: input.name || '',
    wp: input.warPct || '',
    rec: input.record || '',
    st: input.strength ?? null,
    p: five.map((p) => ({ nm: p.name, ab: p.abbr || '', sy: p.sy })),
    f: input.feud || {
      id: genId(),
      n: 0,
      s: {},
      done: false,
      winner: null,
    },
  };
  const root = baseUrl.replace(/\?.*$/, '');
  return root + '?ch=' + b64urlEncode(payload);
}

/** Parse `?sq=` from a search string or full URL. */
export function parseShareQuery(searchOrUrl: string): SharedPayload | null {
  try {
    const q = extractSearch(searchOrUrl);
    const s = new URLSearchParams(q).get('sq');
    if (!s) return null;
    const d = b64urlDecode(s) as SharedPayload;
    if (!d || !Array.isArray(d.p)) return null;
    return d;
  } catch {
    return null;
  }
}

/** Parse `?ch=` from a search string or full URL. */
export function parseChallengeQuery(
  searchOrUrl: string
): ChallengePayload | null {
  try {
    const q = extractSearch(searchOrUrl);
    const s = new URLSearchParams(q).get('ch');
    if (!s) return null;
    const d = b64urlDecode(s) as ChallengePayload;
    if (!d || !Array.isArray(d.p)) return null;
    return d;
  } catch {
    return null;
  }
}

function extractSearch(searchOrUrl: string): string {
  if (searchOrUrl.startsWith('?')) return searchOrUrl.slice(1);
  try {
    if (/^https?:\/\//i.test(searchOrUrl)) {
      return new URL(searchOrUrl).searchParams.toString();
    }
  } catch {
    /* fall through */
  }
  // bare "sq=..." or "ch=..."
  return searchOrUrl.replace(/^\?/, '');
}
