import { useEffect, useState } from 'react';

import { signOut, useSession } from '@/core/auth/client';
import { m } from '@/paraglide/messages.js';
import { GamePageHeader } from '@/components/game-page-header';

export function Header() {
  const { data: session, isPending } = useSession();
  const [signInHref, setSignInHref] = useState('/sign-in?callbackUrl=/');

  useEffect(() => {
    setSignInHref(
      `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`
    );
  }, []);

  const authStatus = isPending ? 'loading' : session?.user ? 'user' : 'guest';

  async function handleSignOut() {
    await signOut();
  }

  return (
    <GamePageHeader
      brand={m['game.brand']()}
      navLinks={[
        { href: '#play', label: m['game.nav.play'](), active: true },
        { href: '#about', label: m['game.nav.about']() },
        { href: '#highlights', label: m['game.nav.highlights']() },
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
