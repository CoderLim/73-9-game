import { count, desc, eq, gte } from 'drizzle-orm';

import { db } from '@/core/db';
import { gameResult, user } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

import type {
  HistoryEntry,
  LeaderboardBoard,
  LeaderboardEntry,
  SubmitResultInput,
} from './types';
import { decodeWinPct, parseLineupJson } from './validate';
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

function toIso(value: Date | number | string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? new Date(0).toISOString()
    : d.toISOString();
}

export async function listMyResults(
  userId: string,
  opts: { page: number; pageSize: number }
): Promise<{ items: HistoryEntry[]; total: number }> {
  const page = Math.max(1, opts.page);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize));
  const offset = (page - 1) * pageSize;
  const where = eq(gameResult.userId, userId);

  const [totalRow] = await db()
    .select({ count: count() })
    .from(gameResult)
    .where(where);

  const rows = await db()
    .select({
      id: gameResult.id,
      winPctX100: gameResult.winPctX100,
      record: gameResult.record,
      isPerfect: gameResult.isPerfect,
      lineupJson: gameResult.lineupJson,
      createdAt: gameResult.createdAt,
    })
    .from(gameResult)
    .where(where)
    .orderBy(desc(gameResult.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    total: totalRow?.count ?? 0,
    items: rows.map((r) => ({
      id: r.id,
      pct: decodeWinPct(r.winPctX100),
      record: r.record,
      isPerfect: Boolean(r.isPerfect),
      createdAt: toIso(r.createdAt),
      lineup: parseLineupJson(r.lineupJson ?? '[]'),
    })),
  };
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
