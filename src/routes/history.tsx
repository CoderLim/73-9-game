import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { GameHistory } from '@/blocks/game-history';
import { Header } from '@/blocks/header';

const ENGLISH_TITLE = '73-9 Game History | Review Your Saved NBA Drafts';
const ENGLISH_DESCRIPTION =
  '73-9 game history for signed-in players: review saved NBA draft simulator lineups, win percentages, 82-game records, costs, ratings, and dates.';

export const Route = createFileRoute('/history')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title:
        locale === 'en'
          ? ENGLISH_TITLE
          : m['game.history.page_title']({}, { locale }),
      description:
        locale === 'en'
          ? ENGLISH_DESCRIPTION
          : m['game.history.page_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, title, description } = loaderData;
    const canonical = localizeUrl(`${envConfigs.app_url}/history`, {
      locale: locale as ReturnType<typeof getLocale>,
    }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        // Personal signed-in history — keep out of the index.
        { name: 'robots', content: 'noindex,nofollow' },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
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
