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
  const onHistory = pathname === '/history';
  const onHowToPlay = pathname === '/how-to-play';
  const onHowItWorks = pathname === '/how-it-works';
  const onBlog = pathname === '/blog' || pathname.startsWith('/blog/');

  async function handleSignOut() {
    await signOut();
  }

  return (
    <GamePageHeader
      brand={m['game.brand']()}
      navLinks={[
        { href: '/', label: m['game.nav.play'](), active: onHome },
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
