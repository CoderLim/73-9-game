/**
 * Browser-only game data loader: IndexedDB cache + pako inflate of data.bin,
 * parallel fetch of bio / salaries / records / accolades / positions.
 */

import * as pako from 'pako';

import { DATA_BASE, G, PLAYABLE_GAME_TYPES } from './constants';
import { setAccData } from './format';
import { setPosProfile } from './lineup';
import { setRecords } from './sim';
import type {
  AccoladesMap,
  BioRow,
  GameBundle,
  GameData,
  GameTuple,
  LoadProgress,
  PosProfileMap,
  RecordsMap,
  SalaryJson,
} from './types';

type FranchiseAlt =
  | string
  | { name: string; yearMin?: number; yearMax?: number };

const NBA_FRANCHISES: Array<{
  abbr: string;
  name: string;
  alts: FranchiseAlt[];
}> = [
  { abbr: 'ATL', name: 'Atlanta Hawks', alts: ['Hawks', 'Blackhawks'] },
  { abbr: 'BOS', name: 'Boston Celtics', alts: ['Celtics'] },
  { abbr: 'BKN', name: 'Brooklyn Nets', alts: ['Nets'] },
  {
    abbr: 'CHA',
    name: 'Charlotte Hornets',
    alts: ['Hornets', { name: 'Hornets (1988)', yearMax: 2001 }],
  },
  { abbr: 'CHI', name: 'Chicago Bulls', alts: ['Bulls'] },
  { abbr: 'CLE', name: 'Cleveland Cavaliers', alts: ['Cavaliers'] },
  { abbr: 'DAL', name: 'Dallas Mavericks', alts: ['Mavericks'] },
  { abbr: 'DEN', name: 'Denver Nuggets', alts: ['Nuggets'] },
  { abbr: 'DET', name: 'Detroit Pistons', alts: ['Pistons'] },
  { abbr: 'GSW', name: 'Golden State Warriors', alts: ['Warriors'] },
  { abbr: 'HOU', name: 'Houston Rockets', alts: ['Rockets'] },
  { abbr: 'IND', name: 'Indiana Pacers', alts: ['Pacers'] },
  { abbr: 'LAC', name: 'LA Clippers', alts: ['Clippers', 'Braves'] },
  { abbr: 'LAL', name: 'LA Lakers', alts: ['Lakers'] },
  { abbr: 'MEM', name: 'Memphis Grizzlies', alts: ['Grizzlies'] },
  { abbr: 'MIA', name: 'Miami Heat', alts: ['Heat'] },
  { abbr: 'MIL', name: 'Milwaukee Bucks', alts: ['Bucks'] },
  { abbr: 'MIN', name: 'Minnesota Timberwolves', alts: ['Timberwolves'] },
  {
    abbr: 'NOP',
    name: 'New Orleans Pelicans',
    alts: ['Pelicans', { name: 'Hornets (1988)', yearMin: 2002 }],
  },
  { abbr: 'NYK', name: 'New York Knicks', alts: ['Knicks'] },
  { abbr: 'OKC', name: 'Oklahoma City Thunder', alts: ['Thunder'] },
  {
    abbr: 'SEA',
    name: 'Seattle SuperSonics',
    alts: [{ name: 'SuperSonics', yearMax: 2008 }],
  },
  { abbr: 'ORL', name: 'Orlando Magic', alts: ['Magic'] },
  { abbr: 'PHI', name: 'Philadelphia 76ers', alts: ['Sixers', 'Nationals'] },
  { abbr: 'PHX', name: 'Phoenix Suns', alts: ['Suns'] },
  { abbr: 'POR', name: 'Portland Trail Blazers', alts: ['Trail Blazers'] },
  { abbr: 'SAC', name: 'Sacramento Kings', alts: ['Kings', 'Royals'] },
  { abbr: 'SAS', name: 'San Antonio Spurs', alts: ['Spurs'] },
  { abbr: 'TOR', name: 'Toronto Raptors', alts: ['Raptors'] },
  { abbr: 'UTA', name: 'Utah Jazz', alts: ['Jazz'] },
  {
    abbr: 'WAS',
    name: 'Washington Wizards',
    alts: ['Wizards', 'Bullets', 'Packers', 'Zephyrs'],
  },
];

export function isPlayableGame(g: GameTuple): boolean {
  return PLAYABLE_GAME_TYPES.has(g[G.TY]);
}

export function gameMatchesFranchise(
  g: GameTuple,
  abbr: string,
  teams: string[]
): boolean {
  const tn = String(teams[g[G.TM]] || '')
    .trim()
    .toUpperCase();
  if (!tn) return false;
  const yr = g[G.SY];
  const f = NBA_FRANCHISES.find((x) => x.abbr === abbr);
  if (!f) return false;
  for (const alt of f.alts || []) {
    const name = typeof alt === 'string' ? alt : alt.name;
    if (String(name).toUpperCase() !== tn) continue;
    if (typeof alt === 'object') {
      if (alt.yearMin != null && yr < alt.yearMin) continue;
      if (alt.yearMax != null && yr > alt.yearMax) continue;
    }
    return true;
  }
  return false;
}

export { NBA_FRANCHISES };

function asset(path: string): string {
  return `${DATA_BASE}/${path.replace(/^\//, '')}`;
}

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('no indexedDB'));
      return;
    }
    const req = indexedDB.open('h99cache', 1);
    req.onupgradeneeded = () => {
      try {
        req.result.createObjectStore('files');
      } catch {
        /* ignore */
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(
  key: string
): Promise<{ ver: string; raw: GameData } | null> {
  try {
    const db = await idbOpen();
    return await new Promise((resolve, reject) => {
      const rq = db
        .transaction('files', 'readonly')
        .objectStore('files')
        .get(key);
      rq.onsuccess = () =>
        resolve((rq.result as { ver: string; raw: GameData }) || null);
      rq.onerror = () => reject(rq.error);
    });
  } catch {
    return null;
  }
}

async function idbSet(
  key: string,
  val: { ver: string; raw: GameData }
): Promise<void> {
  try {
    const db = await idbOpen();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* best-effort */
  }
}

async function fileVersion(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!r.ok) return null;
    return r.headers.get('etag') || r.headers.get('last-modified') || null;
  } catch {
    return null;
  }
}

function bytesToUtf8(out: unknown): string {
  if (typeof out === 'string') return out;
  if (out instanceof Uint8Array) return new TextDecoder('utf-8').decode(out);
  if (ArrayBuffer.isView(out)) {
    const v = out as ArrayBufferView;
    return new TextDecoder('utf-8').decode(
      new Uint8Array(v.buffer, v.byteOffset, v.byteLength)
    );
  }
  throw new Error('Unexpected inflate output');
}

async function fetchAndInflateDataBin(
  onProgress: (p: LoadProgress) => void
): Promise<GameData> {
  const resp = await fetch(asset('data.bin'), { cache: 'no-store' });
  if (!resp.ok)
    throw new Error(
      'HTTP ' + resp.status + ' — make sure data.bin is under /73-9-game/'
    );
  if (!resp.body) throw new Error('Response body missing');
  const reader = resp.body.getReader();
  const total =
    parseInt(resp.headers.get('content-length') || '', 10) || 11000000;

  let received = 0;
  const chunks: Uint8Array[] = [];
  let streaming = true;
  // Prefer binary streaming — Vite's ESM pako may ignore { to: 'string' }.
  let inflator: InstanceType<typeof pako.Inflate> | null = null;
  try {
    inflator = new pako.Inflate();
  } catch {
    streaming = false;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (streaming && inflator) {
      try {
        inflator.push(value, false);
        if (inflator.err) streaming = false;
      } catch {
        streaming = false;
      }
    }
    onProgress({
      label: 'Downloading…',
      loaded: Math.min(80, Math.round((received / total) * 80)),
      total: 100,
    });
  }

  onProgress({ label: 'Decompressing...', loaded: 85, total: 100 });
  let decompressed: string | undefined;
  if (streaming && inflator) {
    try {
      inflator.push(new Uint8Array(0), true);
      if (inflator.err) streaming = false;
      else decompressed = bytesToUtf8(inflator.result);
    } catch {
      streaming = false;
    }
  }
  if (!streaming) {
    const compressed = new Uint8Array(received);
    let off = 0;
    for (const c of chunks) {
      compressed.set(c, off);
      off += c.length;
    }
    decompressed = bytesToUtf8(pako.inflate(compressed));
  }

  onProgress({ label: 'Parsing...', loaded: 92, total: 100 });
  return JSON.parse(decompressed!) as GameData;
}

function parseRecords(recJson: Record<string, unknown>): RecordsMap {
  const RECORDS: RecordsMap = {};
  for (const k in recJson) {
    const v = recJson[k];
    let pct: number;
    if (Array.isArray(v)) {
      const w = +v[0] || 0,
        l = +v[1] || 0;
      pct = w + l > 0 ? w / (w + l) : 0.5;
    } else if (typeof v === 'number') {
      pct = v > 1 ? v / 100 : v;
    } else if (v && typeof v === 'object') {
      const o = v as { w?: number; l?: number };
      const w = +o.w! || 0,
        l = +o.l! || 0;
      pct = w + l > 0 ? w / (w + l) : 0.5;
    } else continue;
    RECORDS[k] = Math.max(0, Math.min(1, pct));
  }
  return RECORDS;
}

/**
 * Load all game assets. Browser-only (fetch + indexedDB + ReadableStream).
 * Also seeds module state used by winPctFor / accoladeBadges / naturalPos.
 */
export async function loadGameData(
  onProgress: (p: LoadProgress) => void = () => {}
): Promise<GameBundle> {
  if (typeof window === 'undefined') {
    throw new Error('loadGameData requires a browser environment');
  }

  const bioPromise = fetch(asset('bio.json'));
  const salPromise = fetch(asset('salaries.json'));
  const recPromise = fetch(asset('records.json'));
  const accPromise = fetch(asset('accolades.json'));
  const posPromise = fetch(asset('positions.json'));
  const dataVerPromise = fileVersion(asset('data.bin'));

  let raw: GameData | null = null;
  const dataVer = await dataVerPromise;
  if (dataVer) {
    const cached = await idbGet('data.bin');
    if (cached && cached.ver === dataVer && cached.raw) {
      onProgress({ label: 'Loading cached data...', loaded: 90, total: 100 });
      raw = cached.raw;
    }
  }

  if (!raw) {
    raw = await fetchAndInflateDataBin(onProgress);
    if (dataVer) idbSet('data.bin', { ver: dataVer, raw });
  }

  const teams = raw.t;
  const pos = raw.p;
  const playerIndex = raw.d;
  const playerNames = Object.keys(playerIndex).sort();

  onProgress({ label: 'Loading bio data...', loaded: 95, total: 100 });
  let bioData: BioRow[] = [];
  const bioByName: Record<string, number> = {};
  try {
    const bioResp = await bioPromise;
    if (bioResp.ok) {
      const bioRaw = (await bioResp.json()) as BioRow[];
      bioData = bioRaw.filter(
        (r) =>
          playerIndex[r[0] as string] &&
          playerIndex[r[0] as string].length >= 20
      );
      bioData.forEach((r, i) => {
        bioByName[r[0] as string] = i;
      });
    }
  } catch (e) {
    console.warn('bio.json load failed', e);
  }

  onProgress({ label: 'Loading salary data...', loaded: 98, total: 100 });
  const salResp = await salPromise;
  if (!salResp.ok) throw new Error('salaries.json HTTP ' + salResp.status);
  const salJson = (await salResp.json()) as SalaryJson;
  const capBySy = salJson.cap_by_sy || {};
  const salaryByPlayer: GameBundle['salaryByPlayer'] = {};
  const salaryEntries: GameBundle['salaryEntries'] = [];
  for (const e0 of salJson.entries || []) {
    const name = e0[0];
    const sy = (e0[1] | 0) + 1;
    const e: [string, number, number, number, string] = [
      name,
      sy,
      e0[2],
      e0[3],
      e0[4],
    ];
    if (!Object.prototype.hasOwnProperty.call(bioByName, name)) continue;
    const games = playerIndex[name] || [];
    let gp = 0;
    for (const g of games) {
      if (g[G.SY] === sy && isPlayableGame(g)) {
        gp++;
        if (gp >= 1) break;
      }
    }
    if (gp < 1) continue;
    if (!salaryByPlayer[name]) salaryByPlayer[name] = [];
    salaryByPlayer[name].push({
      sy: e[1],
      salary: e[2],
      pct: e[3],
      team: e[4],
    });
    salaryEntries.push(e);
  }

  onProgress({ label: 'Loading team records...', loaded: 98, total: 100 });
  let records: RecordsMap = {};
  try {
    const recResp = await recPromise;
    if (recResp.ok) {
      records = parseRecords((await recResp.json()) as Record<string, unknown>);
    }
  } catch (e) {
    console.warn('records.json not loaded (winning% stays neutral)', e);
  }
  setRecords(records);

  onProgress({ label: 'Loading accolades...', loaded: 99, total: 100 });
  let accData: AccoladesMap = {};
  try {
    const accResp = await accPromise;
    if (accResp.ok) {
      accData = ((await accResp.json()) as AccoladesMap) || {};
    }
  } catch (e) {
    console.warn('accolades.json not loaded (badges off)', e);
  }
  setAccData(accData);

  onProgress({ label: 'Loading positions...', loaded: 99, total: 100 });
  let posProfile: PosProfileMap = {};
  try {
    const posResp = await posPromise;
    if (posResp.ok) {
      const pj = (await posResp.json()) as { players?: PosProfileMap };
      posProfile = (pj && pj.players) || {};
    }
  } catch (e) {
    console.warn('positions.json not loaded (slotting falls back)', e);
  }
  setPosProfile(posProfile);

  onProgress({ label: 'Sealing the 73-9 wall...', loaded: 99, total: 100 });
  const war2016 = new Set<string>();
  for (const name of playerNames) {
    const games = playerIndex[name] || [];
    for (const gm of games) {
      if (
        gm[G.SY] === 2016 &&
        isPlayableGame(gm) &&
        gameMatchesFranchise(gm, 'GSW', teams)
      ) {
        war2016.add(name);
        break;
      }
    }
  }

  onProgress({ label: 'Done!', loaded: 100, total: 100 });

  return {
    teams,
    pos,
    playerIndex,
    playerNames,
    bioData,
    bioByName,
    records,
    accData,
    posProfile,
    salaryByPlayer,
    salaryEntries,
    capBySy,
    war2016,
    dataVer,
  };
}
