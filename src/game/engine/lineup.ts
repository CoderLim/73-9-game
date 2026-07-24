/**
 * Position slotting, depth-chart helpers, knapsack optimal lineup, best-squad search.
 * POS_PROFILE is module state set via setPosProfile() (loader / boot).
 * optimalLineup / findBestSquad need a SquadSession (rolledGroups, roster, …).
 */

import {
  BUDGET,
  CANDIDATES_RANDOM,
  CANDIDATES_WEIGHTED,
  EXTRA_GAUNTLETS,
  SELECTION_MISFIT_STEPS,
  SLOT_MISFIT,
} from './constants';
import { shuffle } from './format';
import { buildGauntlet, expectedRecord, lineupStrength } from './sim';
import type {
  BestSquadResult,
  GauntletDeps,
  GroupMeta,
  LineupSlot,
  PlayerSeason,
  PosProfileEntry,
  PosProfileMap,
  SimRecord,
  SquadSession,
  TeamSeasonGroup,
} from './types';

let POS_PROFILE: PosProfileMap = {};
let POS_TIGHT: Record<
  string,
  { c?: number[]; h?: number; s: Record<string, number[]> }
> | null = null;

export function setPosProfile(profile: PosProfileMap): void {
  POS_PROFILE = profile || {};
  POS_TIGHT = null;
}

export function getPosProfile(): PosProfileMap {
  return POS_PROFILE;
}

export function normName(s: string | null | undefined): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPosTight(): void {
  POS_TIGHT = Object.create(null) as typeof POS_TIGHT;
  for (const k in POS_PROFILE) {
    const tk = k.replace(/ /g, '');
    let m = POS_TIGHT![tk];
    if (!m) {
      m = { s: {} };
      POS_TIGHT![tk] = m;
    }
    const e = POS_PROFILE[k];
    if (!e) continue;
    if (e.c && !m.c) m.c = e.c;
    if (typeof e.h === 'number' && typeof m.h !== 'number') m.h = e.h;
    if (e.s) for (const y in e.s) if (!(y in m.s)) m.s[y] = e.s[y];
  }
}

export function posEntry(name: string): PosProfileEntry | null {
  const k = normName(name);
  const e = POS_PROFILE[k];
  const hasPos = e && (e.c || (e.s && Object.keys(e.s).length > 0));
  const hasH = e && typeof e.h === 'number';
  if (hasPos && hasH) return e;
  if (!POS_TIGHT) buildPosTight();
  return POS_TIGHT![k.replace(/ /g, '')] || e || null;
}

export function posFingerprint(p: {
  name: string;
  sy: number;
}): number[] | null {
  const e = posEntry(p.name);
  if (!e) return null;
  const fp = (e.s && e.s[p.sy]) || e.c || null;
  return fp && fp.length === 5 ? fp : null;
}

export function rebRate(p: { mpg?: number; rpg?: number }): number {
  return p.mpg && p.mpg > 0 ? (p.rpg || 0) / p.mpg : 0;
}

export function astRate(p: { mpg?: number; apg?: number }): number {
  return p.mpg && p.mpg > 0 ? (p.apg || 0) / p.mpg : 0;
}

export function heightOf(p: { name: string }): number | null {
  const e = posEntry(p.name);
  return e && typeof e.h === 'number' ? e.h : null;
}

export function sizeScore(p: {
  mpg?: number;
  rpg?: number;
  apg?: number;
}): number {
  return rebRate(p) - astRate(p);
}

export function primaryOfFp(fp: number[]): number {
  let mi = 0,
    mv = -1;
  for (let i = 0; i < 5; i++)
    if (fp[i] > mv) {
      mv = fp[i];
      mi = i;
    }
  return mi;
}

export function careerPos(p: {
  name: string;
  sy: number;
  pos?: number;
}): number {
  const e = posEntry(p.name);
  if (e && e.c) return primaryOfFp(e.c);
  if (e && e.s && e.s[p.sy]) return primaryOfFp(e.s[p.sy]);
  return p.pos != null && p.pos >= 0 && p.pos < 5 ? p.pos : 2;
}

export function naturalPos(p: {
  name: string;
  sy: number;
  pos?: number;
}): number {
  const e = posEntry(p.name);
  const season = e && e.s && e.s[p.sy] ? primaryOfFp(e.s[p.sy]) : null;
  const career = e && e.c ? primaryOfFp(e.c) : null;
  if (season == null && career == null)
    return p.pos != null && p.pos >= 0 && p.pos < 5 ? p.pos : 2;
  if (season == null) return career as number;
  if (career == null) return season;
  return Math.max(career - 1, Math.min(career + 1, season));
}

export function allowedCols(p: {
  name: string;
  sy: number;
  pos?: number;
}): number[] {
  const c = careerPos(p),
    lo = Math.max(0, c - 1),
    hi = Math.min(4, c + 1),
    a: number[] = [];
  for (let i = lo; i <= hi; i++) a.push(i);
  return a;
}

export function primaryPos(p: {
  name: string;
  sy: number;
  pos?: number;
}): number {
  const fp = posFingerprint(p);
  if (fp) {
    let mi = 0,
      mv = -1;
    for (let i = 0; i < 5; i++)
      if (fp[i] > mv) {
        mv = fp[i];
        mi = i;
      }
    return mi;
  }
  return p.pos != null && p.pos >= 0 && p.pos < 5 ? p.pos : 2;
}

export function positionBucket(
  posStr: string | null | undefined
): string | null {
  const s = (posStr || '').trim().toUpperCase();
  if (!s) return null;
  const first = s[0];
  if (s.startsWith('PG') || s.startsWith('SG') || s === 'G') return 'G';
  if (s.startsWith('SF') || s.startsWith('PF') || s === 'F') return 'F';
  if (s === 'C') return 'C';
  if (first === 'G') return 'G';
  if (first === 'F') return 'F';
  if (first === 'C') return 'C';
  return null;
}

/** Pick the slot a newly-signed player should occupy. */
export function chooseSlot(
  natural: number,
  occupied: Array<boolean | null | undefined>
): number {
  if (!occupied[natural]) return natural;
  for (let d = 1; d < 5; d++) {
    const lo = natural - d,
      hi = natural + d;
    if (lo >= 0 && !occupied[lo]) return lo;
    if (hi < 5 && !occupied[hi]) return hi;
  }
  return occupied.findIndex((o) => !o);
}

/** Assign players to PG–C minimizing total positional misfit (≤120 perms). */
export function assignBestSlots(
  players: Array<LineupSlot | null | undefined>
): Array<LineupSlot | null> {
  const ps = players.filter(Boolean) as LineupSlot[];
  const n = ps.length;
  const idx = [...Array(n).keys()];
  let bestPerm = idx,
    bestCost = Infinity;
  const permute = (arr: number[], k: number) => {
    if (k === arr.length) {
      let c = 0;
      for (let slot = 0; slot < arr.length; slot++) {
        const nat = ps[arr[slot]].pos;
        c += SLOT_MISFIT[Math.min(4, Math.abs(slot - nat))];
      }
      if (c < bestCost) {
        bestCost = c;
        bestPerm = arr.slice();
      }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  if (n <= 5) permute(idx, 0);
  const out: Array<LineupSlot | null> = new Array(5).fill(null);
  for (let slot = 0; slot < bestPerm.length; slot++) {
    const p = ps[bestPerm[slot]];
    out[slot] = { ...p, slot };
  }
  return out;
}

export function depthChartColumns(players: PlayerSeason[]): PlayerSeason[][] {
  const N = players.length;
  if (!N) return [[], [], [], [], []];
  const cols: PlayerSeason[][] = [[], [], [], [], []];
  const allowed = new Map<PlayerSeason, number[]>();
  for (const p of players) {
    allowed.set(p, allowedCols(p));
    cols[naturalPos(p)].push(p);
  }
  for (const c of cols) c.sort((a, b) => b.mpg - a.mpg);
  const anchor: Array<PlayerSeason | null> = [null, null, null, null, null];
  for (let pos = 0; pos < 5; pos++)
    if (cols[pos].length) anchor[pos] = cols[pos][0];
  const cap = Math.max(2, Math.floor(0.35 * N));
  const canGo = (p: PlayerSeason, pos: number) =>
    pos >= 0 && pos <= 4 && allowed.get(p)!.indexOf(pos) >= 0;

  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let pos = 0; pos < 5; pos++) {
      while (cols[pos].length > cap) {
        let mi = -1;
        for (let i = cols[pos].length - 1; i >= 0; i--) {
          const q = cols[pos][i];
          if (q !== anchor[pos] && (canGo(q, pos - 1) || canGo(q, pos + 1))) {
            mi = i;
            break;
          }
        }
        if (mi < 0) break;
        const mover = cols[pos][mi];
        const lean = rebRate(mover) >= astRate(mover) ? 1 : -1;
        const opts: number[] = [];
        if (canGo(mover, pos + 1)) opts.push(pos + 1);
        if (canGo(mover, pos - 1)) opts.push(pos - 1);
        if (!opts.length) break;
        opts.sort((a, b) => {
          const ra = cols[a].length < cap ? 0 : 1,
            rb = cols[b].length < cap ? 0 : 1;
          if (ra !== rb) return ra - rb;
          const la = a - pos === lean ? 0 : 1,
            lb = b - pos === lean ? 0 : 1;
          if (la !== lb) return la - lb;
          return cols[a].length - cols[b].length;
        });
        const t = opts[0];
        cols[pos].splice(mi, 1);
        cols[t].push(mover);
        cols[t].sort((a, b) => b.mpg - a.mpg);
        moved = true;
      }
    }
    if (!moved) break;
  }

  const augment = (target: number): boolean => {
    const prev: Array<{ from: number; pl: PlayerSeason } | null> = new Array(
      5
    ).fill(null);
    const seen = new Array(5).fill(false);
    const q: number[] = [];
    for (let c = 0; c < 5; c++)
      if (cols[c].length > 2) {
        seen[c] = true;
        q.push(c);
      }
    let hit = false;
    while (q.length && !hit) {
      const u = q.shift()!;
      for (const pl of cols[u]) {
        if (pl === anchor[u]) continue;
        for (const v of allowed.get(pl)!) {
          if (v === u || seen[v]) continue;
          seen[v] = true;
          prev[v] = { from: u, pl };
          if (v === target) {
            hit = true;
            break;
          }
          q.push(v);
        }
        if (hit) break;
      }
    }
    if (!prev[target]) return false;
    let cur: number | null = target;
    while (cur != null && prev[cur]) {
      const step = prev[cur]!;
      const fromCol: number = step.from;
      const pl = step.pl;
      cols[fromCol].splice(cols[fromCol].indexOf(pl), 1);
      cols[cur].push(pl);
      cols[cur].sort((a, b) => b.mpg - a.mpg);
      cur = fromCol;
    }
    return true;
  };
  for (let pos = 0; pos < 5; pos++) {
    let g = 0;
    while (cols[pos].length < 2 && g++ < 6) {
      if (!augment(pos)) break;
    }
  }
  return cols;
}

/** Allocate up to 5 players to PG–C (career-stretch / hint / natural / height). */
export function allocateSlots(
  players: Array<LineupSlot | PlayerSeason | null | undefined>
): Array<LineupSlot | null> {
  const ps = players.filter(Boolean) as LineupSlot[];
  const n = ps.length;
  if (!n) return new Array(5).fill(null);
  const car = ps.map(careerPos);
  const nat = ps.map(naturalPos);
  const ht = ps.map(heightOf);
  const rma = ps.map((p) => rebRate(p) - astRate(p));
  const hint = ps.map((p) =>
    typeof p.pickedSlot === 'number' ? p.pickedSlot : null
  );
  const big = (a: number, b: number) => {
    const ha = ht[a],
      hb = ht[b];
    if (ha != null && hb != null && Math.abs(ha - hb) > 2) return ha > hb;
    return rma[a] > rma[b];
  };
  let bestCost = Infinity,
    best: number[] | null = null;
  const cur = new Array(n).fill(-1),
    used = [false, false, false, false, false];
  const rec = (i: number) => {
    if (i === n) {
      let stretch = 0,
        natB = 0,
        hintB = 0;
      for (let k = 0; k < n; k++) {
        const d = Math.abs(cur[k] - car[k]) - 1;
        if (d > 0) stretch += d;
        if (cur[k] === nat[k]) natB++;
        if (hint[k] != null && cur[k] === hint[k]) hintB++;
      }
      let ord = 0;
      for (let a = 0; a < n; a++)
        for (let b = a + 1; b < n; b++) {
          if (cur[a] > cur[b] === big(a, b)) ord++;
        }
      const cost = 1000 * stretch - 200 * hintB - 50 * natB - ord;
      if (cost < bestCost) {
        bestCost = cost;
        best = cur.slice();
      }
      return;
    }
    for (let s = 0; s < 5; s++) {
      if (used[s]) continue;
      used[s] = true;
      cur[i] = s;
      rec(i + 1);
      used[s] = false;
    }
  };
  rec(0);
  const out: Array<LineupSlot | null> = new Array(5).fill(null);
  if (best)
    for (let k = 0; k < n; k++) out[best[k]] = { ...ps[k], slot: best[k] };
  return out;
}

export function selectionMisfitPenalty(
  lineup: Array<LineupSlot | null | undefined>
): number {
  let total = 0;
  for (let i = 0; i < lineup.length; i++) {
    const p = lineup[i];
    if (!p) continue;
    const slot = typeof p.slot === 'number' ? p.slot : i;
    const nat = p.pos >= 0 && p.pos < 5 ? p.pos : slot;
    total += SELECTION_MISFIT_STEPS[Math.min(4, Math.abs(slot - nat))];
  }
  return total;
}

export function draftable(
  g: TeamSeasonGroup,
  war2016: Set<string>
): PlayerSeason[] {
  return (
    g._draftable ||
    (g._draftable = g.players.filter((p) => !war2016.has(p.name)))
  );
}

function effectiveBudget(respinSpent: number): number {
  return BUDGET - respinSpent;
}

/**
 * Multiple-choice knapsack over the drawn team-seasons.
 * Needs session: rolledGroups, respinSpent, war2016, resolveGroupMeta.
 */
export function optimalLineup(
  session: SquadSession
): Array<LineupSlot | null> | null {
  const groups = session.rolledGroups;
  if (!groups.length) return null;
  const optsByGi = groups.map((g) => draftable(g, session.war2016));
  const BU = Math.floor(effectiveBudget(session.respinSpent) / 1e5);
  let dp = new Float64Array(BU + 1).fill(-Infinity);
  dp[0] = 0;
  const choiceLayers: Int32Array[] = [],
    prevLayers: Int32Array[] = [];
  for (let gi = 0; gi < groups.length; gi++) {
    const opts = optsByGi[gi];
    const ndp = new Float64Array(BU + 1).fill(-Infinity);
    const choice = new Int32Array(BU + 1).fill(-1);
    const prev = new Int32Array(BU + 1).fill(-1);
    for (let b = 0; b <= BU; b++) {
      if (dp[b] === -Infinity) continue;
      for (let pi = 0; pi < opts.length; pi++) {
        const cu = opts[pi].costUnit ?? Math.round(opts[pi].cost / 1e5);
        const nb = b + cu;
        if (nb > BU) continue;
        const val = dp[b] + opts[pi].rating;
        if (val > ndp[nb]) {
          ndp[nb] = val;
          choice[nb] = pi;
          prev[nb] = b;
        }
      }
    }
    dp = ndp;
    choiceLayers.push(choice);
    prevLayers.push(prev);
  }
  let bestB = -1,
    bestV = -Infinity;
  for (let b = 0; b <= BU; b++) {
    if (dp[b] > bestV) {
      bestV = dp[b];
      bestB = b;
    }
  }
  if (bestB < 0) return null;
  const chosen: PlayerSeason[] = new Array(groups.length);
  let b = bestB;
  for (let gi = groups.length - 1; gi >= 0; gi--) {
    const pi = choiceLayers[gi][b];
    chosen[gi] = optsByGi[gi][pi];
    b = prevLayers[gi][b];
  }
  return allocateSlots(
    chosen.map((p, gi) => ({
      ...p,
      abbr: groups[gi].abbr,
      meta: session.resolveGroupMeta(groups[gi]) as GroupMeta | undefined,
    }))
  );
}

function materializePick(
  group: TeamSeasonGroup,
  p: PlayerSeason,
  resolveGroupMeta: SquadSession['resolveGroupMeta']
): LineupSlot {
  return {
    name: p.name,
    sy: p.sy,
    pos: p.pos,
    rating: p.rating,
    cost: p.cost,
    ppg: p.ppg,
    rpg: p.rpg,
    apg: p.apg,
    fgpct: p.fgpct,
    mpg: p.mpg,
    winFactor: p.winFactor,
    abbr: group.abbr,
    key: group.key,
    meta: resolveGroupMeta(group) as GroupMeta | undefined,
  };
}

function weightedPick(opts: PlayerSeason[]): PlayerSeason {
  let tot = 0;
  const w = opts.map((p) => {
    const x = Math.max(0.25, p.rating);
    return x * x;
  });
  w.forEach((x) => (tot += x));
  let r = Math.random() * tot;
  for (let i = 0; i < opts.length; i++) {
    r -= w[i];
    if (r <= 0) return opts[i];
  }
  return opts[opts.length - 1];
}

function topRating(g: TeamSeasonGroup, war2016: Set<string>): number {
  let m = -Infinity;
  for (const p of draftable(g, war2016)) if (p.rating > m) m = p.rating;
  return m;
}

function genLineup(
  mode: 'weighted' | 'random' | 'greedy',
  session: SquadSession
): Array<LineupSlot | null> {
  const { rolledGroups, war2016, respinSpent, resolveGroupMeta } = session;
  const order =
    mode === 'greedy'
      ? rolledGroups
          .slice()
          .sort((a, b) => topRating(b, war2016) - topRating(a, war2016))
      : shuffle(rolledGroups.slice());
  const mins = order.map((g) =>
    Math.min.apply(
      null,
      draftable(g, war2016).map((p) => p.cost)
    )
  );
  const suffix = new Array(order.length + 1).fill(0);
  for (let i = order.length - 1; i >= 0; i--)
    suffix[i] = suffix[i + 1] + mins[i];
  let rem = effectiveBudget(respinSpent);
  const chosen: Record<string, PlayerSeason> = {};
  const used = new Set<string>();
  for (let i = 0; i < order.length; i++) {
    const g = order[i];
    const cap = rem - suffix[i + 1];
    let list = draftable(g, war2016).filter((p) => !used.has(normName(p.name)));
    if (!list.length) list = draftable(g, war2016);
    const aff = list.filter((p) => p.cost <= cap + 1);
    const pool = aff.length
      ? aff
      : [list.reduce((a, b) => (a.cost < b.cost ? a : b))];
    const p =
      mode === 'weighted'
        ? weightedPick(pool)
        : mode === 'greedy'
          ? pool.reduce((a, b) => (b.rating > a.rating ? b : a))
          : pool[Math.floor(Math.random() * pool.length)];
    chosen[g.key] = p;
    used.add(normName(p.name));
    rem -= p.cost;
  }
  return allocateSlots(
    rolledGroups.map((g) => materializePick(g, chosen[g.key], resolveGroupMeta))
  );
}

/**
 * Best squad by simulated (expected) record.
 * Needs session + a gauntlet (or gauntletDeps to build extras).
 *
 * STUB NOTE: Vanilla closed over `roster`, `rolledGroups`, `buildGauntlet`.
 * Pass them via `session` / `gauntlet` / `gauntletDeps`.
 */
export function findBestSquad(
  gauntlet: LineupSlot[][],
  session: SquadSession,
  gauntletDeps?: GauntletDeps
): BestSquadResult {
  const { roster, rolledGroups } = session;
  const seen = new Set<string>(),
    cands: Array<Array<LineupSlot | null>> = [];
  const keyOf = (l: Array<LineupSlot | null | undefined>) =>
    l
      .filter(Boolean)
      .map((p) => (p as LineupSlot).name)
      .slice()
      .sort()
      .join('|');
  const noDup = (l: Array<LineupSlot | null | undefined>) => {
    const s = new Set<string>();
    for (const p of l) {
      if (!p) continue;
      const n = normName(p.name);
      if (s.has(n)) return false;
      s.add(n);
    }
    return true;
  };
  const add = (l: Array<LineupSlot | null> | null | undefined) => {
    if (!l || l.filter(Boolean).length < rolledGroups.length) return;
    if (!noDup(l)) return;
    const k = keyOf(l);
    if (seen.has(k)) return;
    seen.add(k);
    cands.push(l);
  };
  add(roster);
  add(optimalLineup(session));
  add(genLineup('greedy', session));
  for (let i = 0; i < CANDIDATES_WEIGHTED; i++)
    add(genLineup('weighted', session));
  for (let i = 0; i < CANDIDATES_RANDOM; i++) add(genLineup('random', session));

  const rosterKey = keyOf(roster);
  const pool: LineupSlot[][][] = [gauntlet];
  // Prefer explicit session.buildGauntlet; fall back to gauntletDeps.
  if (session.buildGauntlet) {
    for (let i = 0; i < EXTRA_GAUNTLETS; i++)
      pool.push(session.buildGauntlet());
  } else if (gauntletDeps) {
    for (let i = 0; i < EXTRA_GAUNTLETS; i++)
      pool.push(buildGauntlet(gauntletDeps));
  }

  const userRawStr = lineupStrength(roster);
  let best: Array<LineupSlot | null> | null = null,
    bestStr = -Infinity,
    bestRec: SimRecord | null = null,
    yoursRec: SimRecord | null = null;
  for (const c0 of cands) {
    const c = allocateSlots(c0.filter(Boolean));
    const rawStr = lineupStrength(c);
    const str = rawStr - selectionMisfitPenalty(c);
    const rec = expectedRecord(c, pool);
    if (keyOf(c) === rosterKey) yoursRec = rec;
    if (rawStr >= userRawStr - 1e-9 && str > bestStr) {
      bestStr = str;
      best = c;
      bestRec = rec;
    }
  }
  if (!yoursRec) yoursRec = expectedRecord(roster, pool);
  if (!best) {
    best = roster;
    bestRec = yoursRec;
  }
  const sameAsYours = !!(
    best &&
    (keyOf(best) === rosterKey ||
      (bestRec && yoursRec && bestRec.w === yoursRec.w))
  );
  const sameFive = !!(best && keyOf(best) === rosterKey);
  return {
    best,
    bestRec: bestRec!,
    yoursRec,
    sameAsYours,
    sameFive,
  };
}

/**
 * STUB: vanilla `warriorsFive` / `warriorsBar` / `_sampleTeamStrength` need
 * live GROUPS, WAR2016, seasonProfile, positionForSeason, winFactor, BUDGET.
 * Port those at the React boot / game-state layer; use `vsWarriors(lineup, bar)`
 * from sim.ts once the wall strength is known.
 */
export function warriorsFiveStub(): never {
  throw new Error(
    'warriorsFive requires live playerIndex/WAR2016/GROUPS — build at game-state layer'
  );
}

export function warriorsBarStub(): never {
  throw new Error(
    'warriorsBar requires live GROUPS sampling — build at game-state layer'
  );
}
