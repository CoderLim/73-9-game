import { m } from '@/paraglide/messages.js';
import { GamePageHeader } from '@/components/game-page-header';

export function Header() {
  return (
    <GamePageHeader
      brand={m['game.brand']()}
      navLinks={[
        { href: '#play', label: m['game.nav.play'](), active: true },
        { href: '#about', label: m['game.nav.about']() },
        { href: '#highlights', label: m['game.nav.highlights']() },
      ]}
    />
  );
}
