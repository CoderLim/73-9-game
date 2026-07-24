import { createFileRoute } from '@tanstack/react-router';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { GameLeaderboard } from '@/blocks/game-leaderboard';
import { GameLeaderboardSeo } from '@/blocks/game-leaderboard-seo';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/leaderboard')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['game.leaderboard.page_title']({}, { locale }),
      description: m['game.leaderboard.page_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
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
