import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { NbaTradeMachine } from '@/components/nba-trade-machine';

const PAGE_TITLE = 'NBA Trade Machine – 2026-27 Trade Checker';
const PAGE_DESCRIPTION =
  'NBA Trade Machine checks two-team salary matching with 2026-27 cap and apron limits. Team payroll snapshot compiled August 4, 2026.';
const PAGE_URL = 'https://73-9.org/nba-trade-machine';

const SEO_SECTIONS = [
  {
    heading: 'How this NBA Trade Machine works',
    paragraphs: [
      'The NBA Trade Machine starts with a two-team deal. Choose each franchise, enter the players being sent out, and type every 2026-27 salary in millions. The tool totals outgoing salary for both sides, treats the other team’s outgoing amount as incoming salary, and checks each franchise independently. A trade only passes when both teams satisfy the simplified salary-matching test.',
      'Unlike a fantasy trade grader, this NBA Trade Machine does not decide whether a deal is smart. It focuses on cap mechanics. The NBA Trade Machine shows outgoing salary, incoming salary, the estimated maximum incoming amount, and projected post-trade payroll. That makes it useful for testing the financial shape of a rumor before debating picks, fit, age, or on-court value.',
    ],
  },
  {
    heading: '2026-27 salary cap and apron limits',
    paragraphs: [
      'The NBA Trade Machine uses the official 2026-27 salary cap of $164.961 million, luxury-tax line of $200.428 million, first apron of $209.015 million, and second apron of $221.686 million. Those league thresholds became effective July 1, 2026. The NBA Trade Machine keeps the values in a versioned data file so a later season can be added without silently changing an older result.',
      'A team’s published payroll is not always identical to official Apron Team Salary. Cap holds, unlikely bonuses, dead money, two-way contracts, trade bonuses, and other adjustments can change the league calculation. For that reason, the NBA Trade Machine calls its answer an estimate and displays the data date next to the calculator.',
    ],
  },
  {
    heading: 'Salary matching below the first apron',
    paragraphs: [
      'For an over-the-cap team that remains below the first apron, the NBA Trade Machine applies an expanded traded-player exception estimate. The calculation compares the 200-percent band, the outgoing-salary-plus-adjusted-amount band, and the 125-percent band, then respects the first-apron ceiling. The NBA Trade Machine therefore may show a lower effective limit than a simple online formula when a team is already close to the first apron.',
      'A team below the salary cap is handled through available cap room. In that case, the NBA Trade Machine estimates how much salary can be absorbed after accounting for the contracts sent out. This first version does not reconstruct cap holds or a team’s decision to operate over the cap, so users should treat a borderline result as a reason to verify the transaction with a full contract ledger.',
    ],
  },
  {
    heading: 'First apron and second apron warnings',
    paragraphs: [
      'When a team is above the first apron, the NBA Trade Machine limits incoming salary to no more than outgoing salary in this simplified model. When a team is above the second apron, the NBA Trade Machine applies the same 100-percent ceiling and also warns when multiple outgoing salaries are aggregated. These restrictions are a major reason modern NBA trades often require a third team or a separate preliminary move.',
      'The second apron affects far more than one formula. It can restrict cash, previously created exceptions, aggregation, and future draft flexibility. The NBA Trade Machine surfaces the most important salary warning but does not claim to reproduce every sequencing option available to a front office.',
    ],
  },
  {
    heading: 'Why salaries are entered manually',
    paragraphs: [
      'This NBA Trade Machine uses a static team-payroll snapshot but asks you to enter player salaries manually. That choice is deliberate. Contract databases can change after a signing, waiver, option decision, renegotiation, or trade, and many public tables update on different schedules. Manual input lets the NBA Trade Machine remain useful without pretending that an incomplete roster feed is current to the minute.',
      'Use the current-season cap hit rather than total contract value. If a player signed a four-year $100 million contract, do not enter 100. Enter only the salary that counts in 2026-27. The NBA Trade Machine accepts decimal values such as 12.5 for $12.5 million.',
    ],
  },
  {
    heading: 'What the first version does not validate',
    paragraphs: [
      'The NBA Trade Machine does not yet validate existing traded-player exceptions, sign-and-trade hard caps, base-year compensation, poison-pill averaging, trade kickers, non-guaranteed salary rules, recently signed player restrictions, no-trade clauses, one-year Bird-rights consent, roster-size limits, cash, or minimum-salary exception routing. Each item can change whether an apparently balanced trade is legal.',
      'Draft picks are also outside the first release. A complete NBA Trade Machine with picks needs current ownership, protections, swaps, rollover conditions, frozen second-apron selections, and Stepien Rule validation. Those assets require a separate versioned dataset rather than a text field that labels any pick as tradable.',
    ],
  },
  {
    heading: 'How to check a rumored trade',
    paragraphs: [
      'Start by selecting the two teams named in the rumor. Add every outgoing contract, including small salary used only for matching. Check the exact season salary from a reliable contract page, then enter it in the NBA Trade Machine. If one team fails, look at the displayed shortfall instead of randomly adding players.',
      'Next, review each team’s payroll tier. A deal that works for a team below the first apron may fail after another signing moves that team above the line. Finally, read the coverage note. A green NBA Trade Machine result means the basic two-team salary structure passes this model; it does not mean the NBA has approved the transaction.',
    ],
  },
  {
    heading: 'How accurate is the NBA Trade Machine?',
    paragraphs: [
      'The NBA Trade Machine is most accurate for ordinary two-team trades involving guaranteed standard contracts and no special exception. It becomes less certain when a team is near an apron or when a player has unusual contract treatment. The result should be used as an educational screen, followed by a detailed review for any real transaction.',
      'Accuracy also depends on the numbers entered. A typo of 3.5 instead of 35 changes the outcome dramatically. The NBA Trade Machine shows all totals so users can catch that type of error before sharing a result.',
    ],
  },
  {
    heading: 'Data sources and update policy',
    paragraphs: [
      'The NBA Trade Machine salary-cap thresholds come from the NBA’s official 2026-27 release. Team payroll totals were compiled from Basketball-Reference contract pages for the snapshot dated August 4, 2026; Basketball-Reference states that its salary tables are updated monthly. The collective bargaining framework is based on the 2023 NBA-NBPA agreement and subsequent season values.',
      'Every future data refresh should create a new dated snapshot. The NBA Trade Machine will continue to display the compilation date instead of a vague “current” label. That makes old screenshots and shared calculations easier to interpret after rosters change.',
    ],
  },
  {
    heading: 'NBA Trade Machine versus a trade grader',
    paragraphs: [
      'An NBA Trade Machine and a trade grader answer different questions. The NBA Trade Machine asks whether the salary structure appears possible. A grader asks who wins, whether the teams should include picks, and how the players fit. A financially legal trade can still be terrible basketball business, while a fair basketball proposal can still fail the cap test.',
      'Use this NBA Trade Machine first, then evaluate talent and assets separately. That order prevents a long argument about a proposal that cannot be constructed under the basic salary rules.',
    ],
  },
] as const;

const FAQS = [
  {
    question: 'Is this NBA Trade Machine official?',
    answer:
      'No. The NBA Trade Machine is an independent educational tool from 73-9.org and is not affiliated with the NBA, the NBPA, any team, or any player.',
  },
  {
    question: 'What date is the NBA Trade Machine data from?',
    answer:
      'The team-payroll snapshot was compiled August 4, 2026. The 2026-27 cap and apron thresholds became effective July 1, 2026.',
  },
  {
    question: 'Can the NBA Trade Machine check three-team trades?',
    answer:
      'Not in this release. The NBA Trade Machine currently checks a direct two-team salary exchange. Multi-team routing requires assigning every incoming contract and exception to a specific team.',
  },
  {
    question: 'Does the NBA Trade Machine include draft picks?',
    answer:
      'Not yet. The NBA Trade Machine focuses on salary matching. Pick ownership, protections, swaps, rollover rules, and the Stepien Rule need a dedicated asset dataset.',
  },
  {
    question: 'Why can another trade checker show a different answer?',
    answer:
      'Different tools may use different payroll dates, apron salary definitions, contract guarantees, exceptions, or transaction sequencing. Compare the data date and coverage notes before assuming one NBA Trade Machine is wrong.',
  },
] as const;

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NBA Trade Machine',
    url: PAGE_URL,
    description: PAGE_DESCRIPTION,
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Any operating system with a modern web browser',
    browserRequirements: 'Requires JavaScript and a modern web browser',
    isAccessibleForFree: true,
    dateModified: '2026-08-04',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Two-team NBA salary matching estimate',
      '2026-27 salary cap and apron thresholds',
      'Thirty-team payroll snapshot',
      'First-apron and second-apron warnings',
      'Contract-by-contract manual salary entry',
    ],
    creator: {
      '@type': 'Organization',
      name: '73-9.org',
      url: 'https://73-9.org/',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  },
];

function NbaTradeMachinePage() {
  return (
    <>
      {STRUCTURED_DATA.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, '\\u003c'),
          }}
        />
      ))}

      <div className="min-h-dvh bg-[#05050a] font-sans text-[#c8c8e0]">
        <Header />
        <div className="h-[calc(52px+env(safe-area-inset-top))] md:h-[73px]" />

        <main>
          <section className="relative flex min-h-[calc(100dvh-52px)] items-start overflow-hidden border-b border-white/5 py-4 sm:py-6 md:min-h-[calc(100dvh-73px)] lg:items-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(105,59,170,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,206,84,0.1),transparent_28%),linear-gradient(to_bottom,#0b0913,#05050a)]" />
            <div className="relative w-full">
              <div className="mx-auto mb-3 flex max-w-7xl flex-col gap-1 px-4 sm:mb-4 sm:px-6 lg:px-8">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-[#ffce54] uppercase">
                  2026-27 salary checker
                </div>
                <h1 className="font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold tracking-wide text-white uppercase sm:text-3xl">
                  NBA Trade Machine
                </h1>
              </div>
              <NbaTradeMachine />
            </div>
          </section>

          <section className="bg-[#080811]">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
              <header>
                <div className="inline-flex items-center rounded-full border border-[#ffce54]/25 bg-[#ffce54]/8 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-[#ffce54] uppercase">
                  2026-27 salary checker
                </div>
                <h2 className="mt-5 font-[Barlow_Condensed,sans-serif] text-3xl font-extrabold leading-tight tracking-tight text-white uppercase sm:text-5xl">
                  NBA Trade Machine – Build and Check NBA Trades
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#a4a4c0] sm:text-lg">
                  Use the NBA Trade Machine to test a two-team salary exchange
                  against the 2026-27 salary cap, first apron, and second apron.
                  Enter each current-season salary and see where either side
                  needs more outgoing money.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs tracking-[0.14em] text-[#777795] uppercase">
                      Team payroll snapshot
                    </div>
                    <div className="mt-1 font-[Geist_Mono,monospace] text-sm font-bold text-white">
                      August 4, 2026
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs tracking-[0.14em] text-[#777795] uppercase">
                      Cap values effective
                    </div>
                    <div className="mt-1 font-[Geist_Mono,monospace] text-sm font-bold text-white">
                      July 1, 2026
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs tracking-[0.14em] text-[#777795] uppercase">
                      Coverage
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">
                      Simplified two-team matching
                    </div>
                  </div>
                </div>
              </header>

              <div className="mt-10 rounded-2xl border border-[#ffce54]/20 bg-[#ffce54]/5 p-5 text-sm leading-7 text-[#b7b7cf]">
                <strong className="text-[#ffce54]">Data disclosure:</strong>{' '}
                team payroll totals were compiled on August 4, 2026 from
                Basketball-Reference contract pages. The official 2026-27 cap
                thresholds took effect July 1, 2026. Player salaries in the
                calculator are entered by the user and should be verified
                against a current contract source.
              </div>

              <div className="mt-14 space-y-14">
                {SEO_SECTIONS.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-[#ffce54] uppercase sm:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#a4a4c0]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 64)}>{paragraph}</p>
                      ))}
                      {section.heading === 'How this NBA Trade Machine works' ? (
                        <p>
                          For the exact branch order, formulas, apron ceiling,
                          and unsupported edge cases, read the{' '}
                          <a
                            href="/nba-trade-machine/how-it-works"
                            className="font-semibold text-[#ffce54] underline underline-offset-4 transition hover:text-white"
                          >
                            complete NBA Trade Machine calculation logic
                          </a>
                          .
                        </p>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>

              <section className="mt-16">
                <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-[#ffce54] uppercase sm:text-3xl">
                  NBA Trade Machine FAQ
                </h2>
                <div className="mt-5 space-y-3">
                  {FAQS.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                    >
                      <summary className="cursor-pointer list-none font-semibold text-white">
                        {faq.question}
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-[#a4a4c0]">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="font-[Barlow_Condensed,sans-serif] text-xl font-bold tracking-wide text-white uppercase">
                  Sources
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#9696b3]">
                  Review the{' '}
                  <a
                    className="text-[#ffce54] underline underline-offset-4"
                    href="https://www.nba.com/news/nba-salary-cap-2026-27-season"
                    rel="noreferrer"
                  >
                    NBA 2026-27 salary cap release
                  </a>
                  , the{' '}
                  <a
                    className="text-[#ffce54] underline underline-offset-4"
                    href="https://www.basketball-reference.com/contracts/"
                    rel="noreferrer"
                  >
                    Basketball-Reference contract summary
                  </a>
                  , and the{' '}
                  <a
                    className="text-[#ffce54] underline underline-offset-4"
                    href="https://nbpa.com/cba"
                    rel="noreferrer"
                  >
                    NBA-NBPA collective bargaining agreement
                  </a>
                  . Public data can change after the snapshot date.
                </p>
              </section>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const Route = createFileRoute('/nba-trade-machine')({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: 'description', content: PAGE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: '73-9 Game' },
      { property: 'og:title', content: PAGE_TITLE },
      { property: 'og:description', content: PAGE_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      {
        property: 'og:image',
        content: 'https://73-9.org/73-9-game/og-73-9.jpg',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: PAGE_TITLE },
      { name: 'twitter:description', content: PAGE_DESCRIPTION },
      {
        name: 'twitter:image',
        content: 'https://73-9.org/73-9-game/og-73-9.jpg',
      },
    ],
    links: [
      { rel: 'canonical', href: PAGE_URL },
      ...locales.map((locale) => ({
        rel: 'alternate',
        hrefLang: locale,
        href: localizeUrl(`${envConfigs.app_url}/nba-trade-machine`, {
          locale,
        }).href,
      })),
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: PAGE_URL,
      },
    ],
  }),
  component: NbaTradeMachinePage,
});
