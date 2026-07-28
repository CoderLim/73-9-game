import { Link } from '@/core/i18n/navigation';
import { localeNames } from '@/config/locale';
import { cn } from '@/lib/utils';
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';

export type GamePageFooterLink = {
  label: string;
  href: string;
};

export function GamePageFooter({
  brand,
  tagline,
  supportEmail,
  copyright,
  links,
  className,
}: {
  brand: string;
  tagline: string;
  supportEmail: string;
  copyright: string;
  links?: GamePageFooterLink[];
  className?: string;
}) {
  return (
    <footer
      className={cn(
        'w-full border-t border-[#1c283e] bg-[#05050a] py-12',
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt={brand}
              width={48}
              height={48}
              className="size-12 shrink-0 object-contain"
            />
            <p
              className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-[0.18em] text-transparent uppercase"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #fd6a00 0%, #ffce54 50%, #fd6a00 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
              }}
            >
              {brand}
            </p>
          </div>
          <p className="mt-3 max-w-md font-sans text-sm text-[#8888aa]">
            {tagline}
          </p>
          <p className="mt-4 font-sans text-sm text-[#5c5c82]">
            Support:{' '}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#8f8fc0] underline transition-colors hover:text-[#c2c2e8]"
            >
              {supportEmail}
            </a>
          </p>
          {links && links.length > 0 ? (
            <nav
              aria-label="Footer"
              className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-sans text-sm"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#8f8fc0] underline-offset-4 transition-colors hover:text-[#c2c2e8] hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={cn(
                  'font-sans text-sm transition-colors',
                  loc === getLocale()
                    ? 'font-semibold text-[#c2c2e8]'
                    : 'text-[#5c5c82] hover:text-[#8f8fc0]'
                )}
              >
                {localeNames[loc] || loc}
              </button>
            ))}
          </div>
          <p className="font-sans text-xs text-[#5c5c82]">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
