import { createFileRoute } from '@tanstack/react-router';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { GameHistory } from '@/blocks/game-history';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/history')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['game.history.page_title']({}, { locale }),
      description: m['game.history.page_description']({}, { locale }),
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
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#05050a] font-sans text-[#c8c8e0]">
      <Header />
      <div className="h-[calc(52px+env(safe-area-inset-top))] shrink-0 md:h-[73px]" />
      <main className="flex flex-1 flex-col">
        <GameHistory />
      </main>
      <Footer />
    </div>
  );
}
