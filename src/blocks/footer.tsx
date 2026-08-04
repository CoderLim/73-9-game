import { m } from '@/paraglide/messages.js';
import { GamePageFooter } from '@/components/game-page-footer';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <GamePageFooter
      brand={m['game.brand']()}
      tagline={m['game.footer.tagline']()}
      supportEmail="support@73-9.org"
      copyright={m['game.footer.copyright']({ year: String(year) })}
      links={[
        { label: 'NBA Trade Machine', href: '/nba-trade-machine' },
        { label: m['game.footer.how_to_play'](), href: '/how-to-play' },
        { label: m['game.footer.how_it_works'](), href: '/how-it-works' },
        { label: m['game.footer.about'](), href: '/about' },
        { label: m['game.footer.contact'](), href: '/contact' },
        { label: m['game.footer.privacy'](), href: '/privacy-policy' },
        { label: m['game.footer.terms'](), href: '/terms-of-service' },
        { label: m['game.footer.cookies'](), href: '/cookies' },
      ]}
    />
  );
}
