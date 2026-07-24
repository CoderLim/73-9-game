import { useEffect, useState } from 'react';
import { GameApp } from '@/game/GameApp';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { ArenaCourtBackdrop } from '@/components/arena-court-backdrop';

/**
 * 73-9 game host — glass frame over the arena photo (image lives inside the card
 * so transparency is visible regardless of backdrop-filter stacking quirks).
 */
export function MainGame({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <section
      id="play"
      className={cn('relative w-full', className)}
      aria-label="73-9 Game"
    >
      <div className="relative mx-auto max-w-[920px] px-3 sm:px-5">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-white/35',
            'shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-[#fd6a00]/30'
          )}
        >
          <ArenaCourtBackdrop
            className="absolute inset-0"
            imageClassName="scale-110"
          >
            <div className="absolute inset-0 bg-[#05050a]/35 backdrop-blur-[2px]" />
          </ArenaCourtBackdrop>

          <div className="relative z-[1] min-h-[420px] w-full sm:min-h-[460px]">
            {ready ? (
              <GameApp />
            ) : (
              <div className="game-73-root flex min-h-[420px] items-center justify-center bg-transparent sm:min-h-[460px]">
                <div className="wrap w-full text-center">
                  <img
                    className="logo-mark"
                    src="/logo.png"
                    alt="73-9"
                    width={72}
                    height={72}
                  />
                  <p className="logo-main">73-9</p>
                  <div className="subtitle">{m['game.ui.load.subtitle']()}</div>
                  <div className="mt-8 text-sm text-[#90a1b9]">
                    {m['game.ui.load.initial']()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
