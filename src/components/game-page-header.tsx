import { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';

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
 * Mobile (below md): brand + Sign in + hamburger; links in a slide-down panel.
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (mq.matches) setMobileOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener('change', closeOnDesktop);
    return () => mq.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b border-[#1c283e] text-white transition-[background-color,backdrop-filter,box-shadow] duration-200',
        scrolled || mobileOpen
          ? 'bg-[#0c101c]/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md'
          : 'bg-transparent',
        className
      )}
    >
      <div className="mx-auto flex h-[calc(52px+env(safe-area-inset-top))] w-full max-w-6xl items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] md:h-[73px] md:gap-4 md:px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5"
          onClick={closeMobile}
        >
          <img
            src="/logo.png"
            alt={brand}
            width={36}
            height={36}
            className="size-8 object-contain md:size-9"
          />
          <span className="truncate font-sans text-base font-semibold tracking-wide text-white uppercase">
            {brand}
          </span>
        </Link>

        {/* Desktop nav — only from md up so five links never fight the brand */}
        <nav className="hidden flex-1 items-center gap-1 md:flex md:gap-2">
          {navLinks.map((link) => {
            const itemClass = cn(
              'relative px-2.5 py-1.5 font-sans text-[15px] tracking-wide text-white/90 uppercase transition-colors hover:text-white md:text-base',
              link.active && 'text-white'
            );
            const children = (
              <>
                {link.label}
                {link.active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-[#ff6b00]"
                  />
                ) : null}
              </>
            );
            if (link.href.includes('#')) {
              return (
                <a key={link.href} href={link.href} className={itemClass}>
                  {children}
                </a>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={itemClass}>
                {children}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {auth ? (
            <div className="flex items-center gap-2">
              {auth.status === 'loading' ? (
                <div aria-hidden className="h-9 w-14" />
              ) : auth.status === 'guest' ? (
                <Link
                  href={auth.signInHref}
                  className="rounded-md px-2 py-1.5 font-sans text-sm tracking-wide text-white/90 uppercase transition-colors hover:text-white md:px-2.5 md:text-[15px]"
                  onClick={closeMobile}
                >
                  {auth.signInLabel}
                </Link>
              ) : (
                <>
                  <span className="hidden max-w-[10rem] truncate font-sans text-[15px] text-white/90 md:inline">
                    {auth.userName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      auth.onSignOut?.();
                    }}
                    className="hidden rounded-md border border-white/20 px-2.5 py-1 font-sans text-sm tracking-wide text-white/80 uppercase transition-colors hover:border-white/40 hover:text-white md:inline-flex"
                  >
                    {auth.signOutLabel}
                  </button>
                </>
              )}
            </div>
          ) : null}

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={2} />
            ) : (
              <Menu className="size-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id={menuId}
          className="border-t border-[#1c283e] bg-[#0c101c]/98 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const itemClass = cn(
                'rounded-md px-3 py-3 font-sans text-sm tracking-wide text-white/85 uppercase transition-colors hover:bg-white/5 hover:text-white',
                link.active && 'bg-white/5 text-[#ff6b00]'
              );
              if (link.href.includes('#')) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={itemClass}
                    onClick={closeMobile}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={itemClass}
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {auth && auth.status === 'user' ? (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="min-w-0 truncate font-sans text-sm text-white/80">
                {auth.userName}
              </span>
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  auth.onSignOut?.();
                }}
                className="shrink-0 rounded-md border border-white/20 px-3 py-1.5 font-sans text-xs tracking-wide text-white/80 uppercase transition-colors hover:border-white/40 hover:text-white"
              >
                {auth.signOutLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
