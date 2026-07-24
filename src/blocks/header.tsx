import { signOut, useSession } from '@/core/auth/client';
import { m } from '@/paraglide/messages.js';
import { GamePageHeader } from '@/components/game-page-header';

export function Header() {
  const { data: session, isPending } = useSession();

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
        signInHref: '/sign-in',
        signInLabel: m['game.auth.sign_in'](),
        signOutLabel: m['game.auth.sign_out'](),
        userName: session?.user?.name ?? session?.user?.email,
        userImage: session?.user?.image,
        onSignOut: handleSignOut,
      }}
    />
  );
}
