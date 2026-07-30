import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { GameSeoSection } from '@/components/game-seo-section';

const ENGLISH_HOME_H1 =
  '73-9 Game — Draft Your Five, Beat the 2015-16 Warriors';
const ENGLISH_HOME_INTRO =
  'The 73-9 game is a free NBA draft simulator built around one question: can your five beat the 2015-16 Warriors? In the 73-9 game, you start with $100 million, spin for five random team-seasons, and sign one player from each roster. Every choice changes the budget left for the next position. Finish the 73-9 game to simulate an 82-game season, compare your lineup with the Warriors, and review the strongest legal five you could have drafted from the same markets.';

export function GameSeo() {
  const locale = getLocale();
  const isEnglish = locale === 'en';

  return (
    <GameSeoSection
      eyebrow={m['game.seo.eyebrow']()}
      title={isEnglish ? ENGLISH_HOME_H1 : m['game.seo.title']()}
      intro={isEnglish ? ENGLISH_HOME_INTRO : m['game.seo.intro']()}
      howTitle={m['game.seo.how.kicker']()}
      howSubtitle={m['game.seo.how.title']()}
      steps={[
        {
          title: m['game.seo.how.step1.title'](),
          body: m['game.seo.how.step1.body'](),
        },
        {
          title: m['game.seo.how.step2.title'](),
          body: m['game.seo.how.step2.body'](),
        },
        {
          title: m['game.seo.how.step3.title'](),
          body: m['game.seo.how.step3.body'](),
        },
        {
          title: m['game.seo.how.step4.title'](),
          body: m['game.seo.how.step4.body'](),
        },
      ]}
      blocks={[
        {
          heading: isEnglish
            ? 'Where the 73-9 game comes from'
            : m['game.seo.what.heading'](),
          paragraphs: [m['game.seo.what.p1'](), m['game.seo.what.p2']()],
        },
        {
          heading: isEnglish
            ? 'The $100M budget defines the 73-9 game'
            : m['game.seo.budget.heading'](),
          paragraphs: [m['game.seo.budget.p1'](), m['game.seo.budget.p2']()],
        },
        {
          heading: m['game.seo.sim.heading'](),
          paragraphs: [m['game.seo.sim.p1'](), m['game.seo.sim.p2']()],
        },
        {
          heading: m['game.seo.best.heading'](),
          paragraphs: [m['game.seo.best.p1']()],
        },
        {
          heading: m['game.seo.why.heading'](),
          paragraphs: [m['game.seo.why.p1'](), m['game.seo.why.p2']()],
        },
      ]}
      faqTitle={m['game.seo.faq.title']()}
      faqs={[
        {
          question: isEnglish
            ? 'What is the 73-9 game?'
            : m['game.seo.faq.q1'](),
          answer: isEnglish
            ? 'The 73-9 game is a free browser-based NBA draft simulator. You draft five historical player-seasons under a $100 million cap, simulate an 82-game season, and test the lineup against the 2015-16 Golden State Warriors.'
            : m['game.seo.faq.a1'](),
        },
        {
          question: m['game.seo.faq.q2'](),
          answer: m['game.seo.faq.a2'](),
        },
        {
          question: m['game.seo.faq.q3'](),
          answer: m['game.seo.faq.a3'](),
        },
        {
          question: m['game.seo.faq.q4'](),
          answer: m['game.seo.faq.a4'](),
        },
        {
          question: m['game.seo.faq.q5'](),
          answer: m['game.seo.faq.a5'](),
        },
        {
          question: m['game.seo.faq.q6'](),
          answer: m['game.seo.faq.a6'](),
        },
      ]}
    />
  );
}