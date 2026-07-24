#!/usr/bin/env node
/**
 * Build compact season-aggregate data.bin (v2) from the full box-score dump.
 *
 * Source:  scripts/game-data/data.full.bin  (gzip JSON, legacy shape {t,p,d})
 * Salary:  public/73-9-game/salaries.json  (defines which player-seasons to keep)
 * Output:  public/73-9-game/data.bin       (gzip JSON, v2 aggregates)
 *
 * Season row layout in d[name].s[sy]:
 *   [gp, minTotal, pos, tms[], mn,pts,fgm,fga,p3m,p3a,ftm,fta,orb,drb,reb,ast,stl,blk,tov,pf]
 * Averages use the same Hollinger inputs as seasonProfile() over playable games.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const FULL_BIN = path.join(__dirname, 'data.full.bin');
const SALARIES = path.join(root, 'public/73-9-game/salaries.json');
const OUT_BIN = path.join(root, 'public/73-9-game/data.bin');

const G = {
  TM: 0,
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
};

const PLAYABLE = new Set([0, 1, 2]);
const AVG_IDX = [
  G.MN,
  G.PT,
  G.FM,
  G.FA,
  G.PM,
  G.PA,
  G.FT,
  G.TA,
  G.OR,
  G.DR,
  G.RB,
  G.AS,
  G.ST,
  G.BK,
  G.TO,
  G.PF,
];

const POS_NAMES = ['PG', 'SG', 'SF', 'PF', 'C'];

function getPlayerPos(game, posTable) {
  const p = posTable[game[G.PS]];
  const idx = POS_NAMES.indexOf(p);
  return idx >= 0 ? idx : 2;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function aggregateSeason(games, posTable) {
  const playable = games.filter((g) => PLAYABLE.has(g[G.TY]));
  if (!playable.length) return null;
  const gp = playable.length;
  let minTotal = 0;
  const sums = AVG_IDX.map(() => 0);
  const posCt = [0, 0, 0, 0, 0];
  const tmSet = new Set();
  for (const g of playable) {
    minTotal += g[G.MN] || 0;
    AVG_IDX.forEach((idx, i) => {
      sums[i] += g[idx] || 0;
    });
    posCt[getPlayerPos(g, posTable)]++;
    tmSet.add(g[G.TM] | 0);
  }
  const pos = posCt.indexOf(Math.max(...posCt));
  const avgs = sums.map((s) => round3(s / gp));
  const tms = [...tmSet].sort((a, b) => a - b);
  return [gp, Math.round(minTotal), pos, tms, ...avgs];
}

function teamMatchesGSW(teamName) {
  const tn = String(teamName || '')
    .trim()
    .toUpperCase();
  return tn === 'WARRIORS';
}

function main() {
  if (!fs.existsSync(FULL_BIN)) {
    console.error('Missing', FULL_BIN);
    console.error('Copy the legacy full dump there first.');
    process.exit(1);
  }
  const full = JSON.parse(
    zlib.gunzipSync(fs.readFileSync(FULL_BIN)).toString('utf8')
  );
  const teams = full.t;
  const posTable = full.p;
  const d = full.d;
  const sal = JSON.parse(fs.readFileSync(SALARIES, 'utf8'));
  const entries = sal.entries || [];

  /** @type {Map<string, Set<number>>} */
  const needed = new Map();
  for (const e of entries) {
    const name = e[0];
    const sy = (e[1] | 0) + 1;
    if (!needed.has(name)) needed.set(name, new Set());
    needed.get(name).add(sy);
  }

  // Ensure 2015-16 Warriors wall players keep their 2016 season even if salary gaps.
  for (const [name, games] of Object.entries(d)) {
    for (const g of games) {
      if (g[G.SY] !== 2016 || !PLAYABLE.has(g[G.TY])) continue;
      if (!teamMatchesGSW(teams[g[G.TM]])) continue;
      if (!needed.has(name)) needed.set(name, new Set());
      needed.get(name).add(2016);
      break;
    }
  }

  const outD = {};
  let seasonRows = 0;
  let playersOut = 0;

  for (const [name, sySet] of needed) {
    const games = d[name];
    if (!games || !games.length) continue;

    // Career playable gp + modal pos (all eras) for bio filter / getMostCommonPos.
    let careerGp = 0;
    const careerPos = [0, 0, 0, 0, 0];
    for (const g of games) {
      if (!PLAYABLE.has(g[G.TY])) continue;
      careerGp++;
      careerPos[getPlayerPos(g, posTable)]++;
    }
    const cp = careerPos.indexOf(Math.max(...careerPos));

    /** @type {Record<string, unknown>} */
    const seasons = {};
    for (const sy of sySet) {
      const gs = games.filter((g) => g[G.SY] === sy);
      const row = aggregateSeason(gs, posTable);
      if (!row) continue;
      seasons[String(sy)] = row;
      seasonRows++;
    }
    if (!Object.keys(seasons).length) continue;
    outD[name] = { c: careerGp, cp, s: seasons };
    playersOut++;
  }

  const payload = { v: 2, t: teams, p: posTable, d: outD };
  const json = Buffer.from(JSON.stringify(payload), 'utf8');
  const gz = zlib.gzipSync(json, { level: 9 });
  fs.writeFileSync(OUT_BIN, gz);

  console.log(
    JSON.stringify(
      {
        players: playersOut,
        seasonRows,
        jsonBytes: json.length,
        gzipBytes: gz.length,
        out: path.relative(root, OUT_BIN),
      },
      null,
      2
    )
  );
}

main();
