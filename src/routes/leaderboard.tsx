import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { GameLeaderboard } from '@/blocks/game-leaderboard';
import { GameLeaderboardSeo } from '@/blocks/game-leaderboard-seo';
import { Header } from '@/blocks/header';

const ENGLISH_TITLE = '73-9 Game Leaderboard | Best Lineups vs the Warriors';
const ENGLISH_DESCRIPTION =
  '73-9 game leaderboard showing the best saved NBA draft simulator lineups, win percentages, and 82-game records against the 2015-16 Warriors.';

export const Route = createFileRoute('/leaderboard')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title:
        locale === 'en'
          ? ENGLISH_TITLE
          : m['game.leaderboard.page_title']({}, { locale }),
      description:
        locale === 'en'
          ? ENGLISH_DESCRIPTION
          : m['game.leaderboard.page_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, title, description } = loaderData;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/leaderboard`, {
        locale: loc as (typeof locales)[number],
      }).href;
    const ogImage = `${envConfigs.app_url}/73-9-game/og-73-9.jpg`;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '73-9 Game' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: urlFor(locale) },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
      ],
    };
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#05050a] font-sans text-[#c8c8e0]">
      <Header />
      <div className="h-[calc(52px+env(safe-area-inset-top))] shrink-0 md:h-[73px]" />
      <main className="flex flex-1 flex-col">
        <GameLeaderboard />
        <GameLeaderboardSeo />
      </main>
      <Footer />
    </div>
  );
}
