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
    <div className="flex min-h-dvh flex-col font-sans text-[#c8c8e0]">
      {/* First viewport: arena backdrop + game card (fills 100dvh) */}
      <div className="relative flex min-h-dvh flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <picture>
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet="/images/arena-court-mobile.webp"
            />
            <source
              media="(max-width: 767px)"
              srcSet="/images/arena-court-mobile.jpg"
            />
            <source type="image/webp" srcSet="/images/arena-court.webp" />
            <img
              src="/images/arena-court.jpg"
              alt=""
              decoding="async"
              fetchPriority="high"
              className="h-full w-full scale-105 object-cover object-[center_40%]"
            />
          </picture>
          <div className="absolute inset-0 bg-[#05050a]/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-transparent to-[#05050a]/92" />
        </div>

        <Header />
        {/* Spacer for fixed header (73px desktop / ~52px mobile) */}
        <div className="relative z-10 h-[calc(52px+env(safe-area-inset-top))] shrink-0 md:h-[73px]" />

        <div className="relative z-10 flex flex-1 flex-col justify-center py-4 sm:py-6">
          <MainGame />
        </div>
      </div>

      <main className="relative">
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
      ],
    };
  },
  component: HomePage,
});
