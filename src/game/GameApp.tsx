import { memo, useEffect, useRef } from 'react';
import { mountGame73 } from '@/game/runtime/mount-game';
import {
  GameBoard,
  IntroScreen,
  LoadScreen,
  ResultsPanel,
} from '@/game/screens';

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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return mountGame73(root, { search: window.location.search });
  }, []);

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
