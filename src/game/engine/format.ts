/**
 * Display / formatting helpers (DOM-free except returning HTML strings).
 */

import {
  ACC_DEFS,
  ACC_MAX,
  CAP_2026,
  ESPN,
  LOGO_OVERRIDE,
  SY_IS_START,
} from './constants';
import type { AccoladesMap } from './types';

export function fmtM(d: number): string {
  return '$' + (d / 1e6).toFixed(1) + 'M';
}

export function escapeHtml(s: unknown): string {
  return String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (c) =>
      (
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }) as Record<string, string>
      )[c]
  );
}

/** Alias kept for call-sites that mirrored the vanilla `escapeHtmlS` name. */
export const escapeHtmlS = escapeHtml;

export function cost2026(pct: number): number {
  return (pct / 100) * CAP_2026;
}

export function logoUrl(slug: string): string {
  return 'https://a.espncdn.com/i/teamlogos/nba/500/' + slug + '.png';
}

/** Resolve ESPN CDN (or override) logo URL for a franchise abbr. */
export function logoUrlForAbbr(abbr: string): string {
  if (LOGO_OVERRIDE[abbr]) return LOGO_OVERRIDE[abbr];
  const slug = ESPN[abbr];
  if (!slug) return '';
  return logoUrl(slug);
}

export function formatSeasonYear(sy: unknown): string {
  if (sy == null || sy === '') return '';
  const n = parseInt(String(sy), 10);
  if (!n) return '';
  const start = SY_IS_START ? n : n - 1;
  const end = SY_IS_START ? n + 1 : n;
  return start + '-' + String(end).slice(-2).padStart(2, '0');
}

/**
 * Per-season honor badges as an HTML string (vanilla parity).
 * Pass `accData` explicitly, or rely on a previously `setAccData()`'d map.
 */
let _accData: AccoladesMap = {};

export function setAccData(data: AccoladesMap): void {
  _accData = data || {};
}

export function getAccData(): AccoladesMap {
  return _accData;
}

export function accoladeBadges(
  name: string,
  sy: number,
  accData: AccoladesMap = _accData
): string {
  const yrs = accData[name];
  if (!yrs) return '';
  let codes = yrs[String(sy)];
  if (!codes || !codes.length) return '';
  codes = codes.slice().filter((c) => c !== 'champ');
  if (!codes.length) return '';
  if (
    codes.includes('anba1') ||
    codes.includes('anba2') ||
    codes.includes('anba3') ||
    codes.includes('asgmvp')
  ) {
    codes = codes.filter((c) => c !== 'allstar');
  }
  const defs = codes
    .map((c) => ACC_DEFS[c])
    .filter(Boolean)
    .sort((a, b) => a.p - b.p);
  if (!defs.length) return '';
  const shown = defs.slice(0, ACC_MAX);
  const extra = defs.length - shown.length;
  const allTxt = defs.map((d) => d.t).join(' · ');
  let html = shown
    .map((d) => '<span class="acc acc-' + d.c + '">' + d.t + '</span>')
    .join('');
  if (extra > 0)
    html +=
      '<span class="acc acc-more" title="' +
      escapeHtml(allTxt) +
      '">+' +
      extra +
      '</span>';
  return (
    '<span class="acc-row" title="' +
    escapeHtml(formatSeasonYear(sy) + ': ' + allTxt) +
    '">' +
    html +
    '</span>'
  );
}

export function statTriple(p: {
  ppg: number;
  rpg: number;
  apg: number;
  fgpct: number;
}): string {
  return (
    p.ppg.toFixed(1) +
    ' <span>PPG</span> · ' +
    p.rpg.toFixed(1) +
    ' <span>RPG</span> · ' +
    p.apg.toFixed(1) +
    ' <span>APG</span> · ' +
    p.fgpct.toFixed(1) +
    ' <span>FG%</span>'
  );
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
