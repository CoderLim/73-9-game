import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import {
  GameLeaderboardSection,
  type LeaderboardColumns,
} from '@/components/game-leaderboard-section';

export function GameLeaderboard() {
  const query = useQuery({
    queryKey: ['game-leaderboard'],
    queryFn: () => apiGet<LeaderboardColumns>('/api/game/leaderboard'),
  });

  const status = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : 'ready';

  return (
    <GameLeaderboardSection
      eyebrow={m['game.leaderboard.eyebrow']()}
      title={m['game.leaderboard.title']()}
      dayLabel={m['game.leaderboard.day']()}
      weekLabel={m['game.leaderboard.week']()}
      alltimeLabel={m['game.leaderboard.alltime']()}
      emptyLabel={m['game.leaderboard.empty']()}
      loadingLabel={m['game.leaderboard.loading']()}
      errorLabel={m['game.leaderboard.error']()}
      pctLabel={m['game.leaderboard.pct']()}
      recordLabel={m['game.leaderboard.record']()}
      playerLabel={m['game.leaderboard.player']()}
      board={query.data ?? null}
      status={status}
    />
  );
}
