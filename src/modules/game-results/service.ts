import { desc, eq, gte } from 'drizzle-orm';

import { db } from '@/core/db';
import { gameResult, user } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

import type {
  LeaderboardBoard,
  LeaderboardEntry,
  SubmitResultInput,
} from './types';
import { decodeWinPct } from './validate';
import { windowStartUtc } from './windows';

const TOP_N = 10;

async function topEntries(since: Date | null): Promise<LeaderboardEntry[]> {
  const base = db()
    .select({
      name: user.name,
      winPctX100: gameResult.winPctX100,
      record: gameResult.record,
    })
    .from(gameResult)
    .innerJoin(user, eq(gameResult.userId, user.id));

  const rows = since
    ? await base
        .where(gte(gameResult.createdAt, since))
        .orderBy(desc(gameResult.winPctX100), desc(gameResult.createdAt))
        .limit(TOP_N)
    : await base
        .orderBy(desc(gameResult.winPctX100), desc(gameResult.createdAt))
        .limit(TOP_N);

  return rows.map((r) => ({
    name: r.name,
    pct: decodeWinPct(r.winPctX100),
    record: r.record,
  }));
}

export async function getLeaderboard(
  now: Date = new Date()
): Promise<LeaderboardBoard> {
  const [day, week, alltime] = await Promise.all([
    topEntries(windowStartUtc('day', now)),
    topEntries(windowStartUtc('week', now)),
    topEntries(windowStartUtc('alltime', now)),
  ]);
  return { day, week, alltime };
}

export async function submitResult(input: SubmitResultInput): Promise<{
  id: string;
  board: LeaderboardBoard;
}> {
  const id = getUuid();
  await db().insert(gameResult).values({
    id,
    userId: input.userId,
    winPctX100: input.winPctX100,
    record: input.record,
    isPerfect: input.isPerfect,
    lineupJson: input.lineupJson,
    sharePayload: input.sharePayload,
  });
  return { id, board: await getLeaderboard() };
}
