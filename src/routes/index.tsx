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
    <div className="relative flex min-h-screen flex-col font-sans text-[#c8c8e0]">
      {/* Arena backdrop — absolute inside relative root (not fixed -z-10 under opaque bg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/arena-court-mobile.jpg"
          />
          <img
            src="/images/arena-court.jpg"
            alt=""
            className="h-full min-h-screen w-full scale-105 object-cover object-[center_30%]"
          />
        </picture>
        <div className="absolute inset-0 bg-[#05050a]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-transparent to-[#05050a]/92" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        {/* Spacer for fixed header (73px desktop / ~52px mobile) */}
        <div className="h-[calc(52px+env(safe-area-inset-top))] md:h-[73px]" />

        <main className="relative flex-1">
          <div className="pt-4 pb-10 sm:pt-6 sm:pb-14">
            <MainGame />
          </div>
          <GameSeo />
          <GameHighlightsSection />
        </main>
        <Footer />
      </div>
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
      ],
    };
  },
  component: HomePage,
});
