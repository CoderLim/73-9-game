/** Shared engine types — dense game tuples stay loosely typed for parity with vanilla. */

/** Column indices into a raw game-log tuple (see constants.G). */
export type GameTuple = any[];

export type PosName = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

/** One signed / simulated player-season sitting in a lineup slot. */
export interface LineupSlot {
  name: string;
  sy: number;
  pos: number;
  rating: number;
  cost?: number;
  ppg?: number;
  rpg?: number;
  apg?: number;
  fgpct?: number;
  mpg?: number;
  winFactor?: number;
  abbr?: string;
  key?: string;
  slot?: number;
  /** Depth-chart column the user drafted from (0–4). */
  pickedSlot?: number | null;
  meta?: GroupMeta | null;
  [key: string]: unknown;
}

export interface PlayerSeason {
  name: string;
  sy: number;
  pct?: number;
  salary?: number;
  cost: number;
  costUnit?: number;
  rating: number;
  ppg: number;
  rpg: number;
  apg: number;
  fgpct: number;
  pos: number;
  winFactor: number;
  minutes?: number;
  mpg: number;
  abbr?: string;
  key?: string;
  pickedSlot?: number | null;
  meta?: GroupMeta | null;
  [key: string]: unknown;
}

export interface GroupMeta {
  abbr: string;
  name: string;
  short: string;
  espn?: string;
  slug?: string;
  [key: string]: unknown;
}

export interface TeamSeasonGroup {
  key: string;
  abbr: string;
  sy: number;
  players: PlayerSeason[];
  _draftable?: PlayerSeason[];
  _meta?: GroupMeta | null;
  [key: string]: unknown;
}

/** ?sq= share payload (v1). */
export interface SharedPayload {
  v: number;
  wp: string;
  p: Array<{
    pos: string | number;
    nm: string;
    tm: string;
    sy: string | number;
    c: string | number;
  }>;
}

/** Snapshot used to build a share card / URL. */
export interface ShareCardData {
  warPct: string;
  w?: number;
  l?: number;
  players: Array<{
    pos: string;
    name: string;
    team: string;
    season: string;
    cost: string;
  }>;
}

/** ?ch= challenge payload (v3). */
export interface ChallengePayload {
  v: number;
  nm: string;
  wp: string;
  rec: string;
  st: number | null;
  p: Array<{ nm: string; ab: string; sy: number }>;
  f?: FeudState | null;
}

export interface FeudState {
  id: string;
  n: number;
  s: Record<string, number>;
  done: boolean;
  winner: string | null;
}

export interface SimGameResult {
  pA: number;
  pB: number;
  win: boolean;
}

export interface SimRecord {
  w: number;
  l: number;
  played: number;
  ppg: number;
  oppg: number;
  strength?: number;
  winPct?: number;
}

export interface BestSquadResult {
  best: Array<LineupSlot | null>;
  bestRec: SimRecord;
  yoursRec: SimRecord;
  sameAsYours: boolean;
  sameFive: boolean;
}

export interface VsWarriorsResult {
  winPct: number;
  margin: number;
}

/**
 * Season-aggregate row (data.bin v2):
 * [gp, minTotal, pos, tms[], mn,pts,fgm,fga,p3m,p3a,ftm,fta,orb,drb,reb,ast,stl,blk,tov,pf]
 */
export type SeasonAggRow = [
  number,
  number,
  number,
  number[],
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface PlayerSeasonIndex {
  c: number;
  cp: number;
  s: Record<string, SeasonAggRow>;
}

/** Raw data.bin JSON shape (post-inflate). v2 = season aggregates. */
export interface GameData {
  v?: number;
  t: string[];
  p: string[];
  d: Record<string, GameTuple[] | PlayerSeasonIndex>;
}

export type RecordsMap = Record<string, number>;

export type AccoladesMap = Record<string, Record<string, string[]>>;

/** positions.json players map: normalized name → career/season fingerprints + height. */
export interface PosProfileEntry {
  c?: number[];
  h?: number;
  s?: Record<string, number[]>;
}

export type PosProfileMap = Record<string, PosProfileEntry>;

export interface BioRow {
  0: string;
  [index: number]: unknown;
}

export interface SalaryJson {
  cap_by_sy?: Record<string, number>;
  entries?: Array<[string, number, number, number, string]>;
}

export interface GameBundle {
  teams: string[];
  pos: string[];
  playerIndex: Record<string, GameTuple[] | PlayerSeasonIndex>;
  playerNames: string[];
  bioData: BioRow[];
  bioByName: Record<string, number>;
  records: RecordsMap;
  accData: AccoladesMap;
  posProfile: PosProfileMap;
  salaryByPlayer: Record<
    string,
    Array<{ sy: number; salary: number; pct: number; team: string }>
  >;
  salaryEntries: Array<[string, number, number, number, string]>;
  capBySy: Record<string, number>;
  war2016: Set<string>;
  dataVer: string | null;
}

export interface LoadProgress {
  label: string;
  loaded: number;
  total: number;
}

/** Session inputs needed by optimalLineup / findBestSquad (mutable game UI state). */
export interface SquadSession {
  rolledGroups: TeamSeasonGroup[];
  roster: Array<LineupSlot | null>;
  /** Dollars already spent on re-spins; effectiveBudget = BUDGET - respinSpent. */
  respinSpent: number;
  war2016: Set<string>;
  resolveGroupMeta: (g: TeamSeasonGroup) => GroupMeta | null | undefined;
  /** Optional: custom gauntlet builder (defaults to requiring drawOpp deps). */
  buildGauntlet?: () => LineupSlot[][];
}

export interface GauntletDeps {
  drawOpp: (pos: number) => OppEntry | null;
  salaryEntries: Array<[string, number, number, number, string]>;
}

export interface OppEntry {
  name: string;
  sy: number;
  pos: number;
  winFactor?: number;
  rating?: number;
}

export interface WarriorsDeps {
  /** Cached or freshly built Warriors five (slotted). */
  warriorsFive: () => Array<LineupSlot | null>;
  /** Strength wall used by vsWarriors. */
  warriorsBar: () => number;
}
