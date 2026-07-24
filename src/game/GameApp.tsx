import { memo, useEffect, useRef } from 'react';
import { buildGameCopy } from '@/game/runtime/game-copy';
import { mountGame73 } from '@/game/runtime/mount-game';
import {
  GameBoard,
  IntroScreen,
  LoadScreen,
  ResultsPanel,
} from '@/game/screens';

import { useSession } from '@/core/auth/client';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

import '@/game/game-73.css';

/**
 * React host for the 73-9 game.
 *
 * Screen shells (Load / Intro / Game / Results) are React components with the
 * same element ids as the standalone build. The runtime (`mountGame73`) binds
 * to those nodes and owns subsequent DOM updates (reel, picks, results HTML).
 *
 * Memoized with a constant arePropsEqual so parent re-renders cannot reset
 * classList / innerHTML mutations made by the runtime.
 */
function GameAppImpl() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    const root = rootRef.current;
    if (!root) return;

    const callback = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    const signInHref = `/sign-in?callbackUrl=${callback}`;

    return mountGame73(root, {
      search: window.location.search,
      copy: buildGameCopy(),
      auth: {
        isAuthenticated: Boolean(session?.user),
        signInHref,
        guestTip: m['game.auth.guest_tip'](),
        signInToSaveLabel: m['game.auth.sign_in_to_save'](),
        saveFailedText: m['game.auth.save_failed'](),
      },
      fetchLeaderboard: async () => {
        try {
          return await apiGet('/api/game/leaderboard');
        } catch {
          return null;
        }
      },
      submitResult: async (payload) => {
        try {
          const data = await apiPost<{
            board: import('./runtime/mount-game').GameLeaderboardBoard;
          }>('/api/game/results', payload);
          return { board: data.board };
        } catch {
          return null;
        }
      },
    });
  }, [isPending, session?.user?.id]);

  return (
    <div className="game-73-root" ref={rootRef}>
      <div className="wrap">
        <LoadScreen />
        <IntroScreen />
        <GameBoard />
        <ResultsPanel />
      </div>
    </div>
  );
}

export const GameApp = memo(GameAppImpl, () => true);
