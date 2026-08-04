import { useEffect, useState } from 'react';

import { signOut, useSession } from '@/core/auth/client';
import { usePathname } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { GamePageHeader } from '@/components/game-page-header';

export function Header() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [signInHref, setSignInHref] = useState('/sign-in?callbackUrl=/');

  useEffect(() => {
    setSignInHref(
      `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`
    );
  }, []);

  const authStatus = isPending ? 'loading' : session?.user ? 'user' : 'guest';
  const onHome = pathname === '/';
  const onLeaderboard = pathname === '/leaderboard';
  const onTradeMachine = pathname === '/nba-trade-machine';
  const onHistory = pathname === '/history';
  const onHowToPlay = pathname === '/how-to-play';
  const onHowItWorks = pathname === '/how-it-works';
  const onBlog = pathname === '/blog' || pathname.startsWith('/blog/');
  const onAbout = pathname === '/about';

  async function handleSignOut() {
    await signOut();
  }

  return (
    <GamePageHeader
      brand={m['game.brand']()}
      languageLabel={m['game.nav.language']()}
      navLinks={[
        { href: '/', label: m['game.nav.play'](), active: onHome },
        {
          href: '/nba-trade-machine',
          label: 'Trade Machine',
          active: onTradeMachine,
        },
        {
          href: '/leaderboard',
          label: m['game.nav.leaderboard'](),
          active: onLeaderboard,
        },
        {
          href: '/history',
          label: m['game.nav.history'](),
          active: onHistory,
        },
        {
          href: '/how-to-play',
          label: m['game.nav.how_to_play'](),
          active: onHowToPlay,
        },
        {
          href: '/how-it-works',
          label: m['game.nav.how_it_works'](),
          active: onHowItWorks,
        },
        {
          href: '/blog',
          label: m['game.nav.blog'](),
          active: onBlog,
        },
        {
          href: '/about',
          label: m['game.nav.about'](),
          active: onAbout,
        },
      ]}
      auth={{
        status: authStatus,
        signInHref,
        signInLabel: m['game.auth.sign_in'](),
        signOutLabel: m['game.auth.sign_out'](),
        userName: session?.user?.name,
        userImage: session?.user?.image,
        onSignOut: handleSignOut,
      }}
    />
  );
}
