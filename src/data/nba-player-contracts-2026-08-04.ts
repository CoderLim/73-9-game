export const NBA_PLAYER_CONTRACT_SNAPSHOT = {
  season: '2026-27',
  compiledAt: '2026-08-04',
  sourceName: 'Fantasy Hoops Edge',
  sourcePage:
    'https://github.com/fantasyhoopsedge/hoopsedge-site/blob/b5406a4e1eac0bce584ee4ac973e36fc0aface66/data/nba-salaries/current.csv',
  csvUrl:
    'https://raw.githubusercontent.com/fantasyhoopsedge/hoopsedge-site/b5406a4e1eac0bce584ee4ac973e36fc0aface66/data/nba-salaries/current.csv',
} as const;

export type NbaPlayerContract = {
  player: string;
  team: string;
  salary: number;
  note: string;
};

const TEAM_CODE_ALIASES: Record<string, string> = {
  BRK: 'BKN',
  CHO: 'CHA',
  PHO: 'PHX',
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseNbaPlayerContractsCsv(
  csv: string
): NbaPlayerContract[] {
  const lines = csv
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const playerIndex = headers.indexOf('player');
  const teamIndex = headers.indexOf('team');
  const salaryIndex = headers.indexOf('salary_current');
  const noteIndex = headers.indexOf('contract_note');

  if (playerIndex < 0 || teamIndex < 0 || salaryIndex < 0) return [];

  return lines
    .slice(1)
    .map((line) => {
      const fields = parseCsvLine(line);
      const salary = Number(fields[salaryIndex]);
      const rawTeam = fields[teamIndex]?.toUpperCase() || '';

      return {
        player: fields[playerIndex] || '',
        team: TEAM_CODE_ALIASES[rawTeam] || rawTeam,
        salary,
        note: noteIndex >= 0 ? fields[noteIndex] || '' : '',
      };
    })
    .filter(
      (contract) =>
        contract.player.length > 0 &&
        contract.team.length > 0 &&
        Number.isFinite(contract.salary) &&
        contract.salary > 0
    );
}
