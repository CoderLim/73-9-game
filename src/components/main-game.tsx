import { useEffect, useState } from 'react';
import { GameApp } from '@/game/GameApp';

import { cn } from '@/lib/utils';

/**
 * 73-9 game host — chrome aligned with 82-0.com mode cards:
 * glass panel, white/soft border, orange accent ring, Fira/Barlow type inside.
 */
export function MainGame({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <section
      id="play"
      className={cn('relative w-full overflow-hidden', className)}
      aria-label="73-9 Game"
    >
      <div className="relative mx-auto max-w-[920px] px-3 sm:px-5">
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-white/25',
            'bg-[#0c101c]/50 shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
            'ring-1 ring-[#fd6a00]/20 backdrop-blur-md'
          )}
        >
          <div className="min-h-[420px] w-full sm:min-h-[460px]">
            {ready ? (
              <GameApp />
            ) : (
              <div className="game-73-root flex min-h-[420px] items-center justify-center sm:min-h-[460px]">
                <div className="wrap w-full text-center">
                  <img
                    className="logo-mark"
                    src="/logo.png"
                    alt=""
                    width={72}
                    height={72}
                  />
                  <h1 className="logo-main">73-9</h1>
                  <div className="subtitle">Challenge the 73–9 Warriors</div>
                  <div className="mt-8 text-sm text-[#90a1b9]">Loading…</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
