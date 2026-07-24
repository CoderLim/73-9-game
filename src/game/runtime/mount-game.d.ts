export type GameLeaderboardBoard = {
  day: Array<{ name: string; pct: number; record: string }>;
  week: Array<{ name: string; pct: number; record: string }>;
  alltime: Array<{ name: string; pct: number; record: string }>;
};

export type MountGame73Auth = {
  isAuthenticated: boolean;
  signInHref: string;
  guestTip: string;
  signInToSaveLabel: string;
  saveFailedText: string;
};

export type MountGame73Options = {
  search?: string;
  auth?: MountGame73Auth;
  fetchLeaderboard?: () => Promise<GameLeaderboardBoard | null>;
  submitResult?: (payload: {
    winPct: number;
    record: string;
    isPerfect: boolean;
    lineup: unknown;
    sharePayload: unknown;
  }) => Promise<{ board: GameLeaderboardBoard } | null>;
};

export function mountGame73(
  root: HTMLElement,
  opts?: MountGame73Options
): () => void;
