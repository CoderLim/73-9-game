import { m } from '@/paraglide/messages.js';
import { GameSeoSection } from '@/components/game-seo-section';

export function GameLeaderboardSeo() {
  return (
    <GameSeoSection
      id="leaderboard-about"
      eyebrow={m['game.leaderboard.seo.eyebrow']()}
      title={m['game.leaderboard.seo.title']()}
      intro={m['game.leaderboard.seo.intro']()}
      blocks={[
        {
          heading: m['game.leaderboard.seo.rank.heading'](),
          paragraphs: [
            m['game.leaderboard.seo.rank.p1'](),
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
