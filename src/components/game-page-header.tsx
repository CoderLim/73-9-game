import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

export interface GameNavLink {
  href: string;
  label: string;
}

export function GamePageHeader({
  brand,
  navLinks,
  className,
}: {
  brand: string;
  navLinks: GameNavLink[];
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-[#2a2a52]/40 bg-[#0a0a1a]/90 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt={brand}
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
          />
          <span
            className="font-[Oswald,sans-serif] text-lg font-bold tracking-[0.2em] text-transparent uppercase"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #ff6b35 0%, #ffd700 50%, #ff6b35 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            {brand}
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1.5 font-[Oswald,sans-serif] text-[11px] tracking-wider text-[#8888aa] uppercase transition-colors hover:text-[#ffd700] sm:text-xs"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
