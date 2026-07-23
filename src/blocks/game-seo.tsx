import { m } from '@/paraglide/messages.js';
import { GameSeoSection } from '@/components/game-seo-section';

export function GameSeo() {
  return (
    <GameSeoSection
      eyebrow={m['game.seo.eyebrow']()}
      title={m['game.seo.title']()}
      intro={m['game.seo.intro']()}
      blocks={[
        {
          heading: m['game.seo.what.heading'](),
          paragraphs: [m['game.seo.what.p1'](), m['game.seo.what.p2']()],
        },
        {
          heading: m['game.seo.budget.heading'](),
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
          question: m['game.seo.faq.q1'](),
          answer: m['game.seo.faq.a1'](),
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
