import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

const GAME_READY_EVENT = '73-9:game-ready';
const ADSENSE_SCRIPT_ID = 'adsbygoogle-loader';
const CONTENT_PATHS = new Set([
  '/',
  '/about',
  '/how-to-play',
  '/how-it-works',
  '/blog',
]);

function normalizePathname(pathname: string) {
  const localeMatch = pathname.match(/^\/(ja|ko|zh)(?=\/|$)/);
  const locale = localeMatch?.[1] ?? 'en';
  const normalized = localeMatch
    ? pathname.slice(localeMatch[0].length) || '/'
    : pathname || '/';

  return { locale, pathname: normalized };
}

function isEligibleContentPath(pathname: string) {
  const normalized = normalizePathname(pathname);

  // English is the only locale whose long-form content has completed the
  // current AdSense depth review. Keep ads off translated/fallback routes until
  // their content reaches the same standard.
  if (normalized.locale !== 'en') return false;

  return (
    CONTENT_PATHS.has(normalized.pathname) ||
    normalized.pathname.startsWith('/blog/')
  );
}

function hasSubstantiveContent(pathname: string) {
  const normalized = normalizePathname(pathname);

  if (normalized.pathname === '/') {
    return document.documentElement.dataset.gameReady === 'true';
  }

  const contentRoot =
    document.querySelector('main article') ??
    document.querySelector('article') ??
    document.querySelector('main');
  const text = contentRoot?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  // This is a final safety net, not a word-count target. Editorial pages in the
  // approved set are substantially longer; the threshold prevents accidental
  // loading on empty/error shells during hydration.
  return text.length >= 1600;
}

function injectAdSenseLoader(code: string) {
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    code
  )}`;
  document.head.appendChild(script);
}

/**
 * AdSense ownership verification is always rendered through the account meta
 * tag. The ad-serving loader is separately controlled by `enabled`.
 *
 * Keep `enabled` false while the site is under review. Before enabling it,
 * publish a Google-certified CMP in AdSense Privacy & messaging and configure
 * page exclusions for auth, account, leaderboard, error, and legal screens.
 */
export function Ads({
  code,
  enabled = false,
}: {
  code: string;
  enabled?: boolean;
}) {
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    if (!code || !enabled || !isEligibleContentPath(pathname)) return;

    let cancelled = false;
    let timer: ReturnType<typeof window.setTimeout> | undefined;

    const tryLoad = () => {
      if (cancelled || !hasSubstantiveContent(pathname)) return;
      injectAdSenseLoader(code);
    };

    const normalized = normalizePathname(pathname);
    if (normalized.pathname === '/') {
      window.addEventListener(GAME_READY_EVENT, tryLoad);
      if (document.documentElement.dataset.gameReady === 'true') {
        tryLoad();
      }
    } else {
      timer = window.setTimeout(tryLoad, 800);
    }

    return () => {
      cancelled = true;
      window.removeEventListener(GAME_READY_EVENT, tryLoad);
      if (timer) window.clearTimeout(timer);
    };
  }, [code, enabled, pathname]);

  if (!code) return null;
  return <meta name="google-adsense-account" content={code} />;
}
