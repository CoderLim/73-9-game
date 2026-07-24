import { createFileRoute } from '@tanstack/react-router';

import { getLeaderboard } from '@/modules/game-results/service';
import { respData, respErr } from '@/lib/resp';

async function GET() {
  try {
    return respData(await getLeaderboard());
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/game/leaderboard')({
  server: { handlers: { GET } },
});
