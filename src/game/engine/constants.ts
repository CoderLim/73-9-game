/** Game constants — ported from the vanilla 73-9 roulette. */

/** Column indices into a raw game-log tuple. */
export const G = {
  TM: 0,
  OP: 1,
  PS: 2,
  MN: 3,
  PT: 4,
  FM: 5,
  FA: 6,
  PM: 7,
  PA: 8,
  FT: 9,
  TA: 10,
  OR: 11,
  DR: 12,
  RB: 13,
  AS: 14,
  ST: 15,
  BK: 16,
  TO: 17,
  PF: 18,
  TY: 19,
  SY: 20,
  GY: 21,
  DT: 22,
} as const;

export const STAT_KEYS = [
  'MIN',
  'PTS',
  'FGM',
  'FGA',
  'FG%',
  '3PM',
  '3PA',
  'FTM',
  'FTA',
  'FT%',
  'ORB',
  'DRB',
  'REB',
  'AST',
  'STL',
  'BLK',
  'TOV',
  'PF',
] as const;

export const COUNT_STATS = [
  'PTS',
  'FGM',
  'FGA',
  '3PM',
  '3PA',
  'FTM',
  'FTA',
  'ORB',
  'DRB',
  'REB',
  'AST',
  'STL',
  'BLK',
  'TOV',
  'PF',
] as const;

export const TYPE_LABELS = ['RS', 'Playoffs', 'Finals'] as const;
export const COLORS = ['#e63946', '#4a90e2'] as const;
export const TARGET_MIN = 240;
export const POS_NAMES = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

export const PLAYABLE_GAME_TYPES = new Set([0, 1, 2]);
export const SY_IS_START = false;
export const SY_MIN = 1990;
export const SY_MAX = 2026;

export const BUILD =
  'v96 · removed 14-15 Warriors from the wheel, fixed perfect-board name re-sync · 2026-07-16';

export const CAP_2026 = 165_000_000;
export const BUDGET = 100_000_000;
export const RESPIN_COST = 10_000_000;
export const SLOTS = 5;
export const SEASON_GAMES = 82;

export const WIN_STRENGTH = 0.1;
export const LEAGUE_PPG = 108;
export const REF_RTG = 55;
export const TALENT_PTS = 0.34;
export const TALENT_ALPHA = 0.88;
export const GAME_SD = 13;

export const SLOT_MISFIT = [0, 0.4, 0.9, 1.5, 1.5];
export const SELECTION_MISFIT_STEPS = [0, 0, 1.5, 5, 10];
export const CANDIDATES_WEIGHTED = 140;
export const CANDIDATES_RANDOM = 40;
export const FINALISTS = 6;
export const EXTRA_GAUNTLETS = 2;
export const WARRIORS_Z = 4.4;
export const WALL_GAP_SCALE = 1.5;
export const DISPLAY_GAP_SCALE = 1.1;
export const OPP_WEIGHT_POW = 1.5;
export const HEAD2HEAD_SCALE = 1.7;

export const ACC_DEFS: Record<string, { t: string; c: string; p: number }> = {
  mvp: { t: 'MVP', c: 'mvp', p: 1 },
  fmvp: { t: 'Finals MVP', c: 'fmvp', p: 2 },
  champ: { t: 'Champion', c: 'champ', p: 3 },
  dpoy: { t: 'DPOY', c: 'dpoy', p: 4 },
  roy: { t: 'ROY', c: 'roy', p: 5 },
  smoy: { t: '6th Man', c: 'smoy', p: 6 },
  mip: { t: 'MIP', c: 'mip', p: 7 },
  anba1: { t: 'All-NBA 1st', c: 'anba', p: 8 },
  anba2: { t: 'All-NBA 2nd', c: 'anba', p: 9 },
  anba3: { t: 'All-NBA 3rd', c: 'anba', p: 10 },
  adef1: { t: 'All-Def 1st', c: 'adef', p: 11 },
  adef2: { t: 'All-Def 2nd', c: 'adef', p: 12 },
  scoring: { t: 'Scoring Champ', c: 'scoring', p: 13 },
  asgmvp: { t: 'ASG MVP', c: 'asgmvp', p: 14 },
  allstar: { t: 'All-Star', c: 'astar', p: 15 },
  aroo1: { t: 'All-Rookie 1st', c: 'aroo', p: 16 },
  aroo2: { t: 'All-Rookie 2nd', c: 'aroo', p: 17 },
};
export const ACC_MAX = 4;

export const ESPN: Record<string, string> = {
  ATL: 'atl',
  BOS: 'bos',
  BKN: 'bkn',
  CHA: 'cha',
  CHI: 'chi',
  CLE: 'cle',
  DAL: 'dal',
  DEN: 'den',
  DET: 'det',
  GSW: 'gs',
  HOU: 'hou',
  IND: 'ind',
  LAC: 'lac',
  LAL: 'lal',
  MEM: 'mem',
  MIA: 'mia',
  MIL: 'mil',
  MIN: 'min',
  NOP: 'no',
  NYK: 'ny',
  OKC: 'okc',
  ORL: 'orl',
  PHI: 'phi',
  PHX: 'phx',
  POR: 'por',
  SAC: 'sac',
  SAS: 'sa',
  TOR: 'tor',
  UTA: 'utah',
  WAS: 'wsh',
};

export const LOGO_OVERRIDE: Record<string, string> = {
  SEA: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Seattle_SuperSonics_logo.svg/1280px-Seattle_SuperSonics_logo.svg.png',
};

/** Public static assets for the cloned game live under /73-9-game/. */
export const DATA_BASE = '/73-9-game';

/**
 * Where shared/challenge links point.
 * Production → https://73-9.org
 * Dev / React host → origin + `/` (no /73-9-game suffix — React owns the route).
 */
export function getShareBaseUrl(): string {
  if (typeof window === 'undefined' || typeof location === 'undefined') {
    return 'https://73-9.org';
  }
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') {
    return location.origin + '/';
  }
  if (h === '73-9.org' || h.endsWith('.73-9.org')) {
    return 'https://73-9.org';
  }
  // Preview / staging hosts: drop a trailing /73-9-game path if present.
  const path = location.pathname.replace(/\/73-9-game\/?$/, '/') || '/';
  return location.origin + (path.endsWith('/') ? path : path + '/');
}

/** @deprecated Prefer getShareBaseUrl() — kept as a lazy getter for vanilla parity. */
export const SHARE_BASE_URL = {
  toString() {
    return getShareBaseUrl();
  },
  valueOf() {
    return getShareBaseUrl();
  },
};
