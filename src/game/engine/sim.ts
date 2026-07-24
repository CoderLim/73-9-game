/**
 * Talent-anchored simulation + Warriors wall math.
 * Ported faithfully from the vanilla roulette (no box-score margin).
 */

import {
  DISPLAY_GAP_SCALE,
  GAME_SD,
  LEAGUE_PPG,
  REF_RTG,
  SEASON_GAMES,
  SLOT_MISFIT,
  TALENT_PTS,
  WALL_GAP_SCALE,
  WIN_STRENGTH,
} from './constants';
import type {
  GauntletDeps,
  LineupSlot,
  OppEntry,
  RecordsMap,
  SimGameResult,
  SimRecord,
  VsWarriorsResult,
} from './types';

let _records: RecordsMap = {};

export function setRecords(records: RecordsMap): void {
  _records = records || {};
}

export function getRecords(): RecordsMap {
  return _records;
}

export function winPctFor(
  abbr: string,
  sy: number,
  records: RecordsMap = _records
): number {
  const v = records[abbr + '|' + sy];
  return v == null ? 0.5 : v;
}

export function winFactorFromPct(pct: number): number {
  return Math.max(
    1 - WIN_STRENGTH,
    Math.min(1 + WIN_STRENGTH, 1 + WIN_STRENGTH * (pct - 0.5) * 2)
  );
}

export function winFactor(
  abbr: string,
  sy: number,
  records: RecordsMap = _records
): number {
  return winFactorFromPct(winPctFor(abbr, sy, records));
}

export function teamTalent(
  lineup: Array<LineupSlot | null | undefined>
): number {
  let s = 0;
  for (const p of lineup) {
    if (p) s += p.rating || 0;
  }
  return s;
}

export function teamTalentPts(rtgSum: number): number {
  return LEAGUE_PPG + TALENT_PTS * (rtgSum - REF_RTG);
}

/**
 * Slot-aware positional balance adjustment in POINTS.
 * lineup may be slot-indexed (length 5) OR a plain list.
 */
export function lineupBalance(
  lineup: Array<LineupSlot | null | undefined>
): number {
  let adj = 0,
    placed = 0,
    perfect = 0;
  const present: number[] = [];
  for (let i = 0; i < lineup.length; i++) {
    const p = lineup[i];
    if (!p) continue;
    placed++;
    const slot =
      typeof p.slot === 'number'
        ? p.slot
        : Array.isArray(lineup) && lineup.length <= 5
          ? i
          : p.pos;
    const nat = p.pos >= 0 && p.pos < 5 ? p.pos : slot;
    const dist = Math.min(4, Math.abs(slot - nat));
    if (dist === 0) perfect++;
    adj -= SLOT_MISFIT[dist];
    present.push(nat);
  }
  if (placed === 5 && perfect === 5) adj += 1.5;
  const ct = [0, 0, 0, 0, 0];
  present.forEach((k) => {
    if (k >= 0 && k < 5) ct[k]++;
  });
  if (ct[0] === 0) adj -= 0.7;
  if (ct[1] + ct[2] === 0) adj -= 0.7;
  if (ct[3] + ct[4] === 0) adj -= 1.0;
  return Math.max(-3.0, Math.min(1.5, adj));
}

export function lineupStrength(
  lineup: Array<LineupSlot | null | undefined>
): number {
  return teamTalentPts(teamTalent(lineup)) + lineupBalance(lineup);
}

/** Abramowitz–Stegun approximation of the standard normal CDF. */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

export function winProb(myStrength: number, oppStrength: number): number {
  return normCdf((myStrength - oppStrength) / GAME_SD);
}

export function simOneGame(
  myLineup: Array<LineupSlot | null | undefined>,
  oppLineup: Array<LineupSlot | null | undefined>
): SimGameResult | null {
  const my = myLineup.filter(Boolean) as LineupSlot[];
  const opp = oppLineup.filter(Boolean) as LineupSlot[];
  if (my.length < 3 || opp.length < 3) return null;
  const tMy = teamTalentPts(teamTalent(my)) + lineupBalance(myLineup);
  const tOp = teamTalentPts(teamTalent(opp)) + lineupBalance(oppLineup);
  const z =
    (Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() -
      3) /
    0.707;
  const noise = z * GAME_SD;
  let pA = Math.round(tMy + noise / 2),
    pB = Math.round(tOp - noise / 2);
  if (pA === pB) {
    Math.random() < 0.5 ? pA++ : pB++;
  }
  return { pA, pB, win: pA > pB };
}

export function simRecord(
  lineup: Array<LineupSlot | null | undefined>,
  gauntlet: Array<Array<LineupSlot | null | undefined>>
): SimRecord {
  let w = 0,
    l = 0,
    pf = 0,
    pa = 0,
    played = 0;
  for (const opp of gauntlet) {
    const r = simOneGame(lineup, opp);
    if (!r) continue;
    played++;
    pf += r.pA;
    pa += r.pB;
    if (r.win) w++;
    else l++;
  }
  return {
    w,
    l,
    played,
    ppg: played ? pf / played : 0,
    oppg: played ? pa / played : 0,
  };
}

export function expectedRecord(
  lineup: Array<LineupSlot | null | undefined>,
  gauntlets: Array<Array<Array<LineupSlot | null | undefined>>>
): SimRecord {
  const my = lineupStrength(lineup);
  let pSum = 0,
    marginSum = 0,
    played = 0;
  for (const G of gauntlets) {
    for (const opp of G) {
      if (opp.filter(Boolean).length < 3) continue;
      const os = lineupStrength(opp);
      const p = winProb(my, os);
      pSum += p;
      marginSum += my - os;
      played++;
    }
  }
  if (!played)
    return {
      w: 0,
      l: SEASON_GAMES,
      played: 0,
      ppg: 0,
      oppg: 0,
      strength: my,
    };
  const winPct = pSum / played;
  const w82 = Math.round(winPct * SEASON_GAMES);
  const avgMargin = marginSum / played;
  const ppg = LEAGUE_PPG + avgMargin / 2,
    oppg = LEAGUE_PPG - avgMargin / 2;
  return {
    w: w82,
    l: SEASON_GAMES - w82,
    played,
    ppg,
    oppg,
    strength: my,
    winPct,
  };
}

export function avgRecord(
  lineup: Array<LineupSlot | null | undefined>,
  gauntlets: Array<Array<Array<LineupSlot | null | undefined>>>
): SimRecord {
  let w = 0,
    pf = 0,
    pa = 0,
    played = 0;
  for (const G of gauntlets) {
    for (const opp of G) {
      const r = simOneGame(lineup, opp);
      if (!r) continue;
      played++;
      pf += r.pA;
      pa += r.pB;
      if (r.win) w++;
    }
  }
  if (!played) return { w: 0, l: SEASON_GAMES, played: 0, ppg: 0, oppg: 0 };
  const w82 = Math.round((w / played) * SEASON_GAMES);
  return {
    w: w82,
    l: SEASON_GAMES - w82,
    played,
    ppg: pf / played,
    oppg: pa / played,
  };
}

/**
 * 82 opponent fives. Requires live opponent pool (`drawOpp` + salaryEntries).
 * Vanilla closed over module globals; here they are injected.
 */
export function buildGauntlet(deps: GauntletDeps): LineupSlot[][] {
  const g: LineupSlot[][] = [];
  for (let i = 0; i < SEASON_GAMES; i++) {
    const picks: LineupSlot[] = [];
    for (let pos = 0; pos < 5; pos++) {
      const e: OppEntry | null = deps.drawOpp(pos);
      if (e) {
        picks.push({
          name: e.name,
          sy: e.sy,
          pos,
          winFactor: e.winFactor != null ? e.winFactor : 1,
          rating: e.rating != null ? e.rating : REF_RTG / 5,
        });
      } else {
        const f =
          deps.salaryEntries[
            Math.floor(Math.random() * deps.salaryEntries.length)
          ];
        picks.push({
          name: f[0],
          sy: f[1],
          pos,
          winFactor: 1,
          rating: REF_RTG / 5,
        });
      }
    }
    g.push(picks);
  }
  return g;
}

/**
 * Weighted draw from a precomputed position bucket (vanilla `drawOpp`).
 */
export function drawOppFromPool(
  pos: number,
  entriesByPos: OppEntry[][],
  posCum: Array<Float64Array | null>,
  posTot: number[]
): OppEntry | null {
  const arr = entriesByPos[pos];
  if (!arr || !arr.length) return null;
  const cum = posCum[pos];
  const tot = posTot[pos];
  if (!cum || !tot) return null;
  let r = Math.random() * tot,
    lo = 0,
    hi = arr.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return arr[lo];
}

/**
 * vs the 2015-16 Warriors wall.
 * Pure once `wallBar` (warriorsBar()) is known — bar itself needs live GROUPS/WAR2016.
 */
export function vsWarriors(
  lineup: Array<LineupSlot | null | undefined>,
  wallBar: number
): VsWarriorsResult {
  const gap = lineupStrength(lineup) - wallBar;
  return {
    winPct: normCdf((gap * WALL_GAP_SCALE) / GAME_SD),
    margin: gap * DISPLAY_GAP_SCALE,
  };
}

/**
 * STUB / thin wrapper: vanilla `vsWarriors(lineup)` closed over `warriorsBar()`.
 * Callers that have a bar cache should use `vsWarriors(lineup, bar)` directly.
 * This form exists so the name matches vanilla when a bar provider is injected.
 */
export function vsWarriorsWithBar(
  lineup: Array<LineupSlot | null | undefined>,
  warriorsBarFn: () => number
): VsWarriorsResult {
  return vsWarriors(lineup, warriorsBarFn());
}
