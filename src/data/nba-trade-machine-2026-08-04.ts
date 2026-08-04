export const NBA_TRADE_SNAPSHOT = {
  season: '2026-27',
  compiledAt: '2026-08-04',
  capEffectiveAt: '2026-07-01',
  salaryCap: 164_961_000,
  luxuryTax: 200_428_000,
  firstApron: 209_015_000,
  secondApron: 221_686_000,
  adjustedTradeAmount: 9_095_709,
  sourceNotes: [
    'League thresholds: NBA official 2026-27 salary cap release.',
    'Team payroll totals: Basketball-Reference contract summary retrieved for the August 4, 2026 snapshot.',
    'Basketball-Reference notes that salary tables are updated monthly.',
  ],
} as const;

export type NbaTradeTeam = {
  code: string;
  name: string;
  payroll: number;
};

export const NBA_TRADE_TEAMS: NbaTradeTeam[] = [
  { code: 'ATL', name: 'Atlanta Hawks', payroll: 221_278_253 },
  { code: 'BOS', name: 'Boston Celtics', payroll: 201_437_932 },
  { code: 'BKN', name: 'Brooklyn Nets', payroll: 150_836_846 },
  { code: 'CHA', name: 'Charlotte Hornets', payroll: 170_472_537 },
  { code: 'CHI', name: 'Chicago Bulls', payroll: 161_545_080 },
  { code: 'CLE', name: 'Cleveland Cavaliers', payroll: 226_017_942 },
  { code: 'DAL', name: 'Dallas Mavericks', payroll: 197_866_094 },
  { code: 'DEN', name: 'Denver Nuggets', payroll: 211_739_533 },
  { code: 'DET', name: 'Detroit Pistons', payroll: 153_163_826 },
  { code: 'GSW', name: 'Golden State Warriors', payroll: 210_390_143 },
  { code: 'HOU', name: 'Houston Rockets', payroll: 200_547_409 },
  { code: 'IND', name: 'Indiana Pacers', payroll: 203_715_395 },
  { code: 'LAC', name: 'Los Angeles Clippers', payroll: 174_798_140 },
  { code: 'LAL', name: 'Los Angeles Lakers', payroll: 198_883_338 },
  { code: 'MEM', name: 'Memphis Grizzlies', payroll: 167_772_446 },
  { code: 'MIA', name: 'Miami Heat', payroll: 198_886_535 },
  { code: 'MIL', name: 'Milwaukee Bucks', payroll: 193_765_071 },
  { code: 'MIN', name: 'Minnesota Timberwolves', payroll: 218_278_034 },
  { code: 'NOP', name: 'New Orleans Pelicans', payroll: 192_090_918 },
  { code: 'NYK', name: 'New York Knicks', payroll: 217_948_756 },
  { code: 'OKC', name: 'Oklahoma City Thunder', payroll: 214_798_992 },
  { code: 'ORL', name: 'Orlando Magic', payroll: 218_125_071 },
  { code: 'PHI', name: 'Philadelphia 76ers', payroll: 207_853_950 },
  { code: 'PHX', name: 'Phoenix Suns', payroll: 215_794_243 },
  { code: 'POR', name: 'Portland Trail Blazers', payroll: 192_061_727 },
  { code: 'SAC', name: 'Sacramento Kings', payroll: 189_346_486 },
  { code: 'SAS', name: 'San Antonio Spurs', payroll: 196_130_556 },
  { code: 'TOR', name: 'Toronto Raptors', payroll: 198_020_399 },
  { code: 'UTA', name: 'Utah Jazz', payroll: 176_915_598 },
  { code: 'WAS', name: 'Washington Wizards', payroll: 186_471_414 },
];
