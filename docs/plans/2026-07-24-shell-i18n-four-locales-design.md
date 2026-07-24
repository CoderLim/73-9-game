# Shell i18n: en / ja / ko / zh

**Scope (v1):** Paraglide shell strings + URL prefixes. MDX/blog bodies and in-game canvas UI stay English (fallback).

**Locales:** `baseLocale=en`; prefixed `ja`, `ko`, `zh`; English unprefixed.

**Changes:** `project.inlang/settings.json`, `vite.config.ts` urlPatterns, `localeNames`, `messages/ja.json` + `messages/ko.json`, `LocaleSelector` on `GamePageHeader`. Sitemap/hreflang already iterate `locales`.
