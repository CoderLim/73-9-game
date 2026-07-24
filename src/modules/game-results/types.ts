export type LeaderboardEntry = {
  name: string;
  pct: number;
  record: string;
};

export type LeaderboardBoard = {
  day: LeaderboardEntry[];
  week: LeaderboardEntry[];
  alltime: LeaderboardEntry[];
};

export type SubmitResultInput = {
  userId: string;
  winPctX100: number;
  record: string;
  isPerfect: boolean;
  lineupJson: string;
  sharePayload: string | null;
};
