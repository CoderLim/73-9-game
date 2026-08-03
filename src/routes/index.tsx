import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Blog } from '@/blocks/blog';
import { Footer } from '@/blocks/footer';
import { GameHighlightsSection } from '@/blocks/game-highlights';
import { GameSeo } from '@/blocks/game-seo';
import { Header } from '@/blocks/header';
import { ArenaCourtBackdrop } from '@/components/arena-court-backdrop';
import { MainGame } from '@/components/main-game';
import { getBlogPostsFn } from '@/content/posts/server';

const HOME_TITLE = '73-9 Game: Beat the Warriors | Free NBA Draft Simulator';
const HOME_DESCRIPTION =
  '73-9 game lets you draft five NBA player-seasons under a $100M cap, simulate 82 games, and see whether your lineup can beat the 2015-16 Warriors.';

const WEB_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '73-9 Game',
  alternateName: '73-9 Game NBA Draft Simulator',
  url: 'https://73-9.org/',
  description: HOME_DESCRIPTION,
  image: 'https://73-9.org/73-9-game/og-73-9.jpg',
  applicationCategory: 'GameApplication',
  applicationSubCategory: 'NBA draft simulator and basketball lineup game',
  operatingSystem: 'Any operating system with a modern web browser',
  browserRequirements: 'Requires JavaScript and a modern web browser',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/OnlineOnly',
  },
  featureList: [
    'Play the 73-9 game in a web browser',
    'Draft five historical NBA player-seasons',
    'Manage a $100 million virtual salary cap',
    'Simulate an 82-game season',
    'Compare the lineup with the 2015-16 Warriors',
    'Review the strongest legal lineup from the same team-seasons',
  ],
  inLanguage: ['en', 'ja', 'ko', 'zh'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Basketball fans and NBA draft simulator players',
  },
  creator: {
    '@type': 'Organization',
    name: '73-9.org',
    url: 'https://73-9.org/',
  },
};

function HomePage() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WEB_APPLICATION_JSON_LD).replace(
            /</g,
            '\\u003c'
          ),
        }}
      />
      <div className="flex min-h-dvh flex-col font-sans text-[#c8c8e0]">
        {/* First viewport: arena backdrop + game card (fills 100dvh) */}
        <div className="relative flex min-h-dvh flex-col">
          <ArenaCourtBackdrop
            className="absolute inset-0"
            imageClassName="scale-105"
            fetchPriority="high"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-transparent to-[#05050a]/92" />
          </ArenaCourtBackdrop>

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
          <Blog posts={posts} />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale, limit: 4 } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: loc as any }).href;
    return {
      meta: [
        {
          title: HOME_TITLE,
        },
        {
          name: 'description',
          content: HOME_DESCRIPTION,
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '73-9 Game' },
        {
          property: 'og:title',
          content: HOME_TITLE,
        },
        {
          property: 'og:description',
          content: HOME_DESCRIPTION,
        },
        { property: 'og:url', content: 'https://73-9.org' },
        {
          property: 'og:image',
          content: 'https://73-9.org/73-9-game/og-73-9.jpg',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: HOME_TITLE,
        },
        {
          name: 'twitter:description',
          content: HOME_DESCRIPTION,
        },
        {
          name: 'twitter:image',
          content: 'https://73-9.org/73-9-game/og-73-9.jpg',
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
