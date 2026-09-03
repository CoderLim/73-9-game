import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

export function localePageUrl(
  path: string,
  locale: string = baseLocale
): string {
  const pathname = path.startsWith('/') ? path : `/${path}`;
  const base = (envConfigs.app_url || '').replace(/\/$/, '');
  return localizeUrl(`${base}${pathname}`, {
    locale: locale as (typeof locales)[number],
  }).href;
}

/** Canonical for the current locale + reciprocal hreflang for one locale-free path. */
export function localeHeadLinks(path: string, locale: string = baseLocale) {
  return [
    { rel: 'canonical' as const, href: localePageUrl(path, locale) },
    ...locales.map((loc) => ({
      rel: 'alternate' as const,
      hrefLang: loc,
      href: localePageUrl(path, loc),
    })),
    {
      rel: 'alternate' as const,
      hrefLang: 'x-default',
      href: localePageUrl(path, baseLocale),
    },
  ];
}
