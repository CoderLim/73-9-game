import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Game73Host } from '@/components/game-73-host';

function HomePage() {
  return <Game73Host />;
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
            'You have $100 million to put together a squad to try to beat the best regular-season team ever — the 2015-16 Warriors.',
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: '73-9 Game: Can you beat the 2015-16 Warriors?',
        },
        {
          property: 'og:description',
          content:
            'You have $100 million to put together a squad to try to beat the best regular-season team ever — the 2015-16 Warriors.',
        },
        { property: 'og:image', content: '/73-9-game/og-73-9.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/73-9-game/og-73-9.png' },
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
