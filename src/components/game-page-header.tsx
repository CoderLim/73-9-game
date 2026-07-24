import { useEffect, useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

export interface GameNavLink {
  href: string;
  label: string;
  /** Marks the active route / section (orange underline like 82-0.com). */
  active?: boolean;
}

export interface GamePageHeaderAuth {
  status: 'loading' | 'guest' | 'user';
  signInHref: string;
  signInLabel: string;
  signOutLabel: string;
  userName?: string;
  userImage?: string | null;
  onSignOut?: () => void;
}

/**
 * Top chrome aligned with 82-0.com:
 * fixed, transparent at rest; solid `#0c101c` once the page scrolls.
 * Hairline border `#1c283e`, Fira Sans links, ~73px desktop height.
 */
export function GamePageHeader({
  brand,
  navLinks,
  auth,
  className,
}: {
  brand: string;
  navLinks: GameNavLink[];
  auth?: GamePageHeaderAuth;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex h-[calc(52px+env(safe-area-inset-top))] items-center justify-between gap-4 border-b border-[#1c283e] px-4 text-white transition-[background-color,backdrop-filter,box-shadow] duration-200 md:h-[73px] md:px-6',
        'pt-[env(safe-area-inset-top)]',
        scrolled
          ? 'bg-[#0c101c]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md'
          : 'bg-transparent',
        className
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5 md:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/logo.png"
              alt={brand}
              width={36}
              height={36}
              className="size-8 object-contain md:size-9"
            />
            <span className="font-sans text-base font-semibold tracking-wide text-white uppercase">
              {brand}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex md:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-2.5 py-1.5 font-sans text-[15px] tracking-wide text-white/90 uppercase transition-colors hover:text-white md:text-base',
                  link.active && 'text-white'
                )}
              >
                {link.label}
                {link.active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-[#ff6b00]"
                  />
                ) : null}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {auth ? (
            <div className="flex items-center gap-2">
              {auth.status === 'loading' ? (
                <div aria-hidden className="h-9 w-16" />
              ) : auth.status === 'guest' ? (
                <Link
                  href={auth.signInHref}
                  className="rounded-md px-2.5 py-1.5 font-sans text-sm tracking-wide text-white/90 uppercase transition-colors hover:text-white md:text-[15px]"
                >
                  {auth.signInLabel}
                </Link>
              ) : (
                <>
                  <span className="max-w-[7rem] truncate font-sans text-sm text-white/90 md:max-w-[10rem] md:text-[15px]">
                    {auth.userName}
                  </span>
                  <button
                    type="button"
                    onClick={auth.onSignOut}
                    className="rounded-md border border-white/20 px-2.5 py-1 font-sans text-xs tracking-wide text-white/80 uppercase transition-colors hover:border-white/40 hover:text-white md:text-sm"
                  >
                    {auth.signOutLabel}
                  </button>
                </>
              )}
            </div>
          ) : null}

          {/* Mobile: compact nav */}
          <nav className="flex items-center gap-1 sm:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-2 py-1.5 font-sans text-xs tracking-wide text-white/80 uppercase',
                  link.active && 'text-[#ff6b00]'
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
