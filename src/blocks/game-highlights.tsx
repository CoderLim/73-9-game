import { m } from '@/paraglide/messages.js';
import { GameHighlights } from '@/components/game-highlights';

export function GameHighlightsSection() {
  return (
    <GameHighlights
      eyebrow={m['game.highlights.eyebrow']()}
      title={m['game.highlights.title']()}
      items={[
        {
          title: m['game.highlights.wheel.title'](),
          description: m['game.highlights.wheel.description'](),
        },
        {
          title: m['game.highlights.cap.title'](),
          description: m['game.highlights.cap.description'](),
        },
        {
          title: m['game.highlights.sim.title'](),
          description: m['game.highlights.sim.description'](),
        },
      ]}
    />
  );
}
