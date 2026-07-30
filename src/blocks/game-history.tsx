import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useSession } from '@/core/auth/client';
import { ApiError, apiGet, pageQuery, type PageResult } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import {
  GameHistorySection,
  type HistoryRow,
} from '@/components/game-history-section';

const PAGE_SIZE = 20;

export function GameHistory() {
  const locale = getLocale();
  const { data: session, isPending: sessionPending } = useSession();
  const [page, setPage] = useState(1);
  const signedIn = Boolean(session?.user);

  const query = useQuery({
    queryKey: ['game-history', page],
    queryFn: () =>
      apiGet<PageResult<HistoryRow>>(
        pageQuery('/api/game/results', { page, pageSize: PAGE_SIZE })
      ),
    enabled: signedIn,
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = query.data?.items ?? [];

  let mode: 'guest' | 'loading' | 'error' | 'empty' | 'ready';
  if (sessionPending) {
    mode = 'loading';
  } else if (!signedIn) {
    mode = 'guest';
  } else if (query.isPending && !query.data) {
    mode = 'loading';
  } else if (query.isError) {
    mode =
      query.error instanceof ApiError && query.error.message === 'Unauthorized'
        ? 'guest'
        : 'error';
  } else if (items.length === 0) {
    mode = 'empty';
  } else {
    mode = 'ready';
  }

  return (
    <GameHistorySection
      eyebrow={m['game.history.eyebrow']()}
      title={
        locale === 'en' ? 'My 73-9 Game History' : m['game.history.title']()
      }
      loadingLabel={m['game.history.loading']()}
      errorLabel={m['game.history.error']()}
      emptyLabel={m['game.history.empty']()}
      guestTitle={m['game.history.guest_title']()}
      guestBody={m['game.history.guest_body']()}
      signInLabel={m['game.history.sign_in']()}
      signInHref="/sign-in?callbackUrl=/history"
      playCtaLabel={
        locale === 'en' ? 'Play the 73-9 game' : m['game.history.play_cta']()
      }
      playHref="/"
      pctLabel={m['game.history.pct']()}
      recordLabel={m['game.history.record']()}
      dateLabel={m['game.history.date']()}
      perfectLabel={m['game.history.perfect']()}
      lineupLabel={m['game.history.lineup']()}
      lineupUnavailableLabel={m['game.history.lineup_unavailable']()}
      posLabel={m['game.history.pos']()}
      playerLabel={m['game.history.player']()}
      teamLabel={m['game.history.team']()}
      costLabel={m['game.history.cost']()}
      ratingLabel={m['game.history.rating']()}
      prevLabel={m['game.history.prev']()}
      nextLabel={m['game.history.next']()}
      pageLabel={m['game.history.page']({ page, pages: pageCount })}
      mode={mode}
      items={items}
      page={page}
      pageCount={pageCount}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
    />
  );
}