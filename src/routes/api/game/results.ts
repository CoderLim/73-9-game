import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { listMyResults, submitResult } from '@/modules/game-results/service';
import { sanitizeSubmitInput } from '@/modules/game-results/validate';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr, respPage } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      parseInt(searchParams.get('page') || '1', 10) || 1
    );
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20)
    );

    const { items, total } = await listMyResults(session.user.id, {
      page,
      pageSize,
    });
    return respPage(items, total);
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 5_000,
      keyPrefix: 'game-result-submit',
      extraKey: session.user.id,
    });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = sanitizeSubmitInput(body);
    if (!parsed.ok) return respErr(parsed.error);

    const { id, board } = await submitResult({
      userId: session.user.id,
      ...parsed.value,
    });
    return respData({ id, board });
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/game/results')({
  server: { handlers: { GET, POST } },
});
