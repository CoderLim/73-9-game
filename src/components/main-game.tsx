import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Standalone 73-9 game host. Loads the cloned game bundle from /73-9-game/
 * and forwards share query params (?sq= / ?ch=).
 *
 * Canvas sizing mirrors the original wrap (920px) so the intro / reel /
 * results screens are not cropped the way a short card iframe would.
 */
export function MainGame({ className }: { className?: string }) {
  const [src, setSrc] = useState('/73-9-game/index.html');

  useEffect(() => {
    setSrc(`/73-9-game/index.html${window.location.search}`);
  }, []);

  return (
    <section
      id="play"
      className={cn(
        'relative w-full overflow-hidden',
        'bg-[linear-gradient(160deg,#1a1a3e_0%,#0a0a1a_55%,#050510_100%)]',
        className
      )}
      aria-label="73-9 Game"
    >
      {/* Soft orange spotlight behind the board — same energy as the CTA */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[70%] max-w-3xl bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,107,53,0.14),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-[920px] px-3 sm:px-4">
        <div className="overflow-hidden rounded-2xl border border-[#2a2a52]/80 bg-[#0c0c1e]/40 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-[#ffd700]/10">
          <iframe
            src={src}
            title="73-9 Game: Can you beat the 2015-16 Warriors?"
            className="block h-[min(92vh,980px)] min-h-[760px] w-full border-0 bg-transparent sm:min-h-[820px]"
            allow="clipboard-write; fullscreen"
          />
        </div>
      </div>
    </section>
  );
}
