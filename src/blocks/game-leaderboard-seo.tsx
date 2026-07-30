import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { GameSeoSection } from '@/components/game-seo-section';

export function GameLeaderboardSeo() {
  const locale = getLocale();
  const isEnglish = locale === 'en';

  return (
    <GameSeoSection
      id="leaderboard-about"
      eyebrow={m['game.leaderboard.seo.eyebrow']()}
      title={
        isEnglish
          ? 'How the 73-9 Game Leaderboard Works'
          : m['game.leaderboard.seo.title']()
      }
      intro={
        isEnglish
          ? 'Every entry is a completed 73-9 game lineup that faced the 2015-16 Golden State Warriors in an 82-game simulation. The leaderboard ranks saved runs by win percentage, while the displayed record helps players compare how each drafted five performed inside the same model.'
          : m['game.leaderboard.seo.intro']()
      }
      blocks={[
        {
          heading: m['game.leaderboard.seo.rank.heading'](),
          paragraphs: [
            isEnglish
              ? 'After you lock five contracts under the $100M bankroll, the 73-9 game simulates a full season and reports how often your five beats the 2015-16 Warriors. That win percentage is the score used for the leaderboard. Higher is better; ties break toward newer results.'
              : m['game.leaderboard.seo.rank.p1'](),
            m['game.leaderboard.seo.rank.p2'](),
          ],
        },
        {
          heading: m['game.leaderboard.seo.windows.heading'](),
          paragraphs: [
            m['game.leaderboard.seo.windows.p1'](),
            m['game.leaderboard.seo.windows.p2'](),
          ],
        },
        {
          heading: m['game.leaderboard.seo.save.heading'](),
          paragraphs: [
            m['game.leaderboard.seo.save.p1'](),
            m['game.leaderboard.seo.save.p2'](),
          ],
        },
      ]}
      faqTitle={m['game.leaderboard.seo.faq.title']()}
      faqs={[
        {
          question: m['game.leaderboard.seo.faq.q1'](),
          answer: m['game.leaderboard.seo.faq.a1'](),
        },
        {
          question: m['game.leaderboard.seo.faq.q2'](),
          answer: m['game.leaderboard.seo.faq.a2'](),
        },
        {
          question: m['game.leaderboard.seo.faq.q3'](),
          answer: m['game.leaderboard.seo.faq.a3'](),
        },
        {
          question: m['game.leaderboard.seo.faq.q4'](),
          answer: m['game.leaderboard.seo.faq.a4'](),
        },
        {
          question: m['game.leaderboard.seo.faq.q5'](),
          answer: m['game.leaderboard.seo.faq.a5'](),
        },
      ]}
    />
  );
}