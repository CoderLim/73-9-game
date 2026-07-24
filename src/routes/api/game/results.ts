import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { submitResult } from '@/modules/game-results/service';
import { sanitizeSubmitInput } from '@/modules/game-results/validate';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

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
  server: { handlers: { POST } },
});
