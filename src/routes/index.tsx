import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { GameHighlightsSection } from '@/blocks/game-highlights';
import { GameSeo } from '@/blocks/game-seo';
import { Header } from '@/blocks/header';
import { MainGame } from '@/components/main-game';

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a1a] text-[#c8c8e0]">
      <Header />
      <main className="flex-1">
        <div className="pt-5 pb-8 sm:pt-7 sm:pb-12">
          <MainGame />
        </div>
        <GameSeo />
        <GameHighlightsSection />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: loc as any }).href;
    return {
      meta: [
        {
          title: '73-9 Game: Can you beat the 2015-16 Warriors?',
        },
        {
          name: 'description',
          content:
            'You have $100 million to put together a squad to try to beat the best regular-season team ever — the 2015-16 Warriors. Play free at 73-9.org.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '73-9 Game' },
        {
          property: 'og:title',
          content: '73-9 Game: Can you beat the 2015-16 Warriors?',
        },
        {
          property: 'og:description',
          content:
            'You have $100 million to put together a squad to try to beat the best regular-season team ever — the 2015-16 Warriors.',
        },
        { property: 'og:url', content: 'https://73-9.org' },
        {
          property: 'og:image',
          content: 'https://73-9.org/73-9-game/og-73-9.png',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:image',
          content: 'https://73-9.org/73-9-game/og-73-9.png',
        },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    };
  },
  component: HomePage,
});
