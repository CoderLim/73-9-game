import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Calculator, ShieldCheck } from 'lucide-react';

import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

const PAGE_TITLE = 'NBA Trade Machine Logic – 2026-27 Salary Formula';
const PAGE_DESCRIPTION =
  'NBA Trade Machine Logic explains the 2026-27 salary matching formula, cap-room branch, apron limits, aggregation warning, and current coverage.';
const PAGE_URL = 'https://73-9.org/nba-trade-machine/how-it-works';

const FORMULAS = [
  {
    label: 'Cap-room team',
    formula: 'Max incoming = outgoing + max(0, salary cap − payroll)',
    note: 'Uses published payroll as a practical estimate of available room.',
  },
  {
    label: 'Below first apron',
    formula:
      'Expanded max = max(min(outgoing × 200% + $250K, outgoing + $9.096M), outgoing × 125% + $250K)',
    note: 'The result is then limited by the remaining space below the first apron.',
  },
  {
    label: 'First or second apron',
    formula: 'Max incoming = outgoing',
    note: 'The simplified model applies a 100% matching ceiling.',
  },
  {
    label: 'Second-apron aggregation',
    formula: 'More than one positive outgoing contract → warning and fail',
    note: 'The current two-team model does not search for separate routing structures.',
  },
] as const;

const LOGIC_SECTIONS = [
  {
    heading: 'What the calculation is designed to answer',
    paragraphs: [
      'NBA Trade Machine Logic explains exactly how the calculator on 73-9.org turns two teams, their payroll tiers, and the salaries entered by the user into a pass or fail result. The page does not try to reproduce every clause in the collective bargaining agreement. Instead, it documents the simplified rule engine that powers the current two-team checker, including the assumptions that make the result useful and the limitations that prevent it from being treated as an official league approval.',
      'The calculator answers a narrow question: does the basic salary structure of this two-team proposal fit the current simplified model? It does not decide whether a deal is smart, fair, realistic, or likely to happen. A financially valid transaction can still be poor basketball business, while an attractive basketball proposal can still fail the salary test.',
    ],
  },
  {
    heading: 'Season constants and dated payroll data',
    paragraphs: [
      'The current model starts with four official league thresholds for the 2026-27 season: the $164.961 million salary cap, the $200.428 million luxury-tax line, the $209.015 million first apron, and the $221.686 million second apron. Those figures became effective July 1, 2026. The season-adjusted fixed amount used by the expanded trade formula is approximately $9.096 million.',
      'Team payroll values come from the dated August 4, 2026 snapshot stored with the application. Published payroll and official Apron Team Salary are not always identical because cap holds, bonuses, dead money, two-way contracts, trade bonuses, and other adjustments may change the league calculation. NBA Trade Machine Logic therefore labels every result as an estimate and keeps the snapshot date visible.',
    ],
  },
  {
    heading: 'How user input becomes trade salary',
    paragraphs: [
      'For each team, the calculator receives a published payroll, a list of outgoing contracts, and the total salary coming back from the other side. Each salary field is entered in millions, so 12.5 is converted to $12.5 million. Empty, negative, and invalid values count as zero. The outgoing total is the sum of all valid contracts entered for that team.',
      'In a direct two-team trade, one team’s outgoing total becomes the other team’s incoming total. Player names are labels only in the current release. A name does not change the calculation, and the application does not automatically look up the contract. Users must enter the current 2026-27 cap hit rather than the total value of a multi-year contract.',
    ],
  },
  {
    heading: 'Why both teams are evaluated separately',
    paragraphs: [
      'The checker evaluates each franchise independently. A proposal only passes when both sides pass. This matters because one team can have estimated cap room while the other is above an apron. The same incoming salary may therefore be acceptable for one side and unacceptable for the other.',
      'NBA Trade Machine Logic never assumes that equal total dollars across the complete transaction automatically make a trade legal. Each team receives its own method label, outgoing amount, incoming amount, estimated maximum, projected post-trade payroll, and failure reason.',
    ],
  },
  {
    heading: 'Branch one: team below the salary cap',
    paragraphs: [
      'The first branch asks whether published payroll is below the salary cap. When it is, the checker estimates available room as salary cap minus published payroll. Maximum incoming salary equals outgoing salary plus that estimated room. In formula form: max incoming = outgoing + max(0, salary cap − payroll).',
      'This is a practical cap-room estimate, not a complete cap sheet. It does not rebuild cap holds, incomplete-roster charges, dead money, exceptions, or a team’s decision to operate over the cap. A borderline result should be verified against a full current ledger before it is described as legal.',
    ],
  },
  {
    heading: 'Branch two: team at or above the first apron',
    paragraphs: [
      'When published payroll is at or above the first apron, the simplified model limits maximum incoming salary to outgoing salary. The extra $250,000 allowance is not included. This produces a conservative 100-percent matching ceiling for the current checker.',
      'NBA Trade Machine Logic uses this branch to reflect the tighter treatment of apron teams without pretending to simulate every sequence a front office might use. The model does not test whether a separate preliminary transaction, an existing exception, or a third team could create a different legal path.',
    ],
  },
  {
    heading: 'Branch three: second-apron aggregation warning',
    paragraphs: [
      'If published payroll is at or above the second apron, the same 100-percent ceiling applies. The checker also counts the number of outgoing contracts with a salary greater than zero. When more than one positive outgoing salary is entered, it raises an aggregation warning and fails that side of the proposal.',
      'The warning reflects the general restriction on a second-apron team aggregating multiple player salaries to acquire a larger contract. The current tool does not decide whether the contracts could be assigned separately, moved in distinct transactions, or routed through a multi-team construction. It simply warns that the entered structure is outside the safe scope of this model.',
    ],
  },
  {
    heading: 'Branch four: expanded salary matching',
    paragraphs: [
      'Teams that are over the salary cap but below the first apron use the expanded salary-matching estimate. The checker calculates three values. Value A is outgoing salary multiplied by 200 percent plus $250,000. Value B is outgoing salary plus the season-adjusted fixed amount of approximately $9.096 million. Value C is outgoing salary multiplied by 125 percent plus $250,000.',
      'The expanded maximum is max(min(Value A, Value B), Value C). This reproduces the banded shape of the expanded traded-player exception without hard-coding several salary ranges. The low-salary result is controlled by the smaller of the 200-percent calculation and the fixed-addition calculation. At higher outgoing salary, the 125-percent calculation can become the larger result.',
    ],
  },
  {
    heading: 'How the first-apron ceiling is applied',
    paragraphs: [
      'The expanded formula is not the final answer. The checker also calculates the remaining space between published payroll and the first apron, adds that space to outgoing salary, and chooses the smaller of this ceiling and the expanded maximum. In formula form: first-apron ceiling = outgoing + max(0, first apron − payroll). Final maximum incoming = min(expanded maximum, first-apron ceiling).',
      'NBA Trade Machine Logic includes this extra step so the calculator does not appear to let a team use the expanded formula while finishing above the first apron in the same simplified path. Because published payroll is only a proxy for Apron Team Salary, deals close to the line still require manual verification.',
    ],
  },
  {
    heading: 'Pass, fail, shortfall, and post-trade payroll',
    paragraphs: [
      'After maximum incoming salary is calculated, the checker compares it with the incoming total. A one-dollar tolerance avoids false failures caused by decimal input being converted to whole dollars. A team passes when incoming salary is less than or equal to the estimated maximum and no second-apron aggregation warning applies.',
      'The displayed shortfall is max(0, incoming − maximum incoming). Estimated post-trade payroll is published payroll − outgoing salary + incoming salary. These outputs make the result explainable. A message such as “$1.4 million above the estimated limit” gives the user a concrete adjustment instead of a generic red error.',
    ],
  },
  {
    heading: 'Contract rules the current engine does not solve',
    paragraphs: [
      'Several contract rules can change the trade value of a player. Non-guaranteed salary may count differently from the headline number. A trade bonus may increase incoming salary. Base-year compensation and poison-pill treatment can assign different values to the same player for the sending and receiving teams. Sign-and-trade transactions can trigger a hard cap.',
      'Recently signed players may not yet be trade eligible, and some one-year contracts require player consent. The current NBA salary matching formula does not automatically validate these restrictions. NBA Trade Machine Logic lists them so a green result is understood as a basic salary pass rather than a complete transaction approval.',
    ],
  },
  {
    heading: 'Why exceptions require a future solver',
    paragraphs: [
      'Existing traded-player exceptions require a different type of engine. A real transaction can assign one incoming player to an existing exception, another to a minimum-salary route, and a third to salary generated by outgoing contracts. The current checker combines the other team’s outgoing contracts into one incoming total and does not search every possible assignment.',
      'NBA Trade Machine Logic states this limitation directly because a red result does not prove that no legal structure exists. A future multi-team and exception-aware version would need a constraint solver that tests multiple assignments for each incoming contract instead of applying one aggregate comparison.',
    ],
  },
  {
    heading: 'Why draft picks are not part of the formula',
    paragraphs: [
      'Draft assets do not change the basic player-salary totals, but a complete trade checker still needs to validate whether each pick can legally be moved. That requires current ownership, protections, rollover conditions, swap rights, frozen second-apron selections, and the Stepien Rule.',
      'The present release deliberately separates salary matching from pick legality. Adding a free-text pick label would create the appearance of validation without the required asset data. A future picks module should use its own dated and versioned dataset.',
    ],
  },
  {
    heading: 'How to verify a result before sharing it',
    paragraphs: [
      'First confirm that every number is the player’s 2026-27 cap hit rather than the total contract value. Then confirm that the August 4, 2026 team payroll snapshot is still appropriate for the date of the proposal. Review whether any player has a trade kicker, partial guarantee, poison-pill extension, sign-and-trade status, recent-signing restriction, or consent right.',
      'Finally, check for existing exceptions and apron transactions that are not represented by the two-team form. The best use case is an ordinary trade involving standard guaranteed contracts, no special exception, and teams not sitting within a tiny distance of an apron. In that situation, NBA Trade Machine Logic provides a fast and transparent first screen.',
    ],
  },
  {
    heading: 'Versioning and auditability',
    paragraphs: [
      'The rules page and calculator share the same season assumptions. When cap or apron values change, a new dated snapshot should be created instead of silently changing an older result. That preserves the meaning of screenshots and calculations shared before a roster update.',
      'NBA Trade Machine Logic is designed to be auditable. Every major branch in this explanation maps to a branch in the TypeScript calculation. The tool exposes the selected method, outgoing total, incoming total, estimated maximum, post-trade payroll, and reason for failure. Transparency is more useful than pretending a first release can replace a front-office cap system.',
    ],
  },
] as const;

const FAQS = [
  {
    question: 'Does this logic reproduce the full NBA CBA?',
    answer:
      'No. NBA Trade Machine Logic documents the simplified two-team salary engine. It does not solve every exception, special contract value, eligibility restriction, or transaction sequence.',
  },
  {
    question: 'Why is published payroll used instead of Apron Team Salary?',
    answer:
      'A complete official apron calculation requires data that is not consistently available in one public feed. Published payroll is used as a transparent dated proxy, and the result is labeled as an estimate.',
  },
  {
    question: 'Why can a different trade checker return another result?',
    answer:
      'The other tool may use a different data date, official-style apron salary, guarantees, trade bonuses, exceptions, or transaction routing. Compare assumptions before comparing the final color.',
  },
  {
    question: 'Where can I run the calculator?',
    answer:
      'Open the NBA Trade Machine on 73-9.org, select two teams, and enter each player’s current-season salary in millions.',
  },
] as const;

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    datePublished: '2026-08-04',
    dateModified: '2026-08-04',
    author: {
      '@type': 'Organization',
      name: '73-9.org',
      url: 'https://73-9.org/',
    },
    isPartOf: {
      '@type': 'WebApplication',
      name: 'NBA Trade Machine',
      url: 'https://73-9.org/nba-trade-machine',
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

function NbaTradeMachineLogicPage() {
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
          <section className="relative overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(105,59,170,0.3),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,206,84,0.11),transparent_32%),linear-gradient(to_bottom,#0b0913,#05050a)]" />
            <div className="relative mx-auto max-w-5xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
              <a
                href="/nba-trade-machine"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffce54] transition hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to NBA Trade Machine
              </a>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#ffce54]/25 bg-[#ffce54]/8 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-[#ffce54] uppercase">
                <Calculator className="size-4" />
                Formula and assumptions
              </div>

              <h1 className="mt-5 font-[Barlow_Condensed,sans-serif] text-4xl font-extrabold leading-[0.98] tracking-tight text-white uppercase sm:text-6xl lg:text-7xl">
                NBA Trade Machine Logic – How the Salary Check Works
              </h1>
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#a4a4c0] sm:text-lg">
                NBA Trade Machine Logic documents every major branch used by
                the current 2026-27 two-team checker: cap room, expanded salary
                matching, the first-apron ceiling, the second-apron aggregation
                warning, and the limits of the simplified result.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-xs text-[#9a9ab7]">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  Logic updated August 4, 2026
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                  2026-27 thresholds effective July 1, 2026
                </span>
              </div>
            </div>
          </section>

          <section className="border-b border-white/5 bg-[#080811]">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-[#ffce54]" />
                <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-white uppercase">
                  Formula summary
                </h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {FORMULAS.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <h3 className="text-sm font-semibold text-[#ffce54]">
                      {item.label}
                    </h3>
                    <code className="mt-3 block overflow-x-auto rounded-xl bg-black/30 p-3 font-[Geist_Mono,monospace] text-xs leading-6 text-white">
                      {item.formula}
                    </code>
                    <p className="mt-3 text-xs leading-6 text-[#9292ad]">
                      {item.note}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#05050a]">
            <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
              <div className="space-y-14">
                {LOGIC_SECTIONS.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-[#ffce54] uppercase sm:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#a4a4c0]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 72)}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <section className="mt-16 rounded-3xl border border-[#ffce54]/20 bg-[#ffce54]/5 p-6 sm:p-8">
                <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-white uppercase">
                  Test the formula with a trade
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#b7b7cf]">
                  Return to the calculator, choose two teams, enter each
                  current-season salary, and compare the displayed method and
                  limit with the branches documented above.
                </p>
                <a
                  href="/nba-trade-machine"
                  className="mt-5 inline-flex rounded-xl bg-[#ffce54] px-5 py-3 text-sm font-bold text-[#111118] transition hover:bg-white"
                >
                  Open NBA Trade Machine
                </a>
              </section>

              <section className="mt-16">
                <h2 className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-[#ffce54] uppercase sm:text-3xl">
                  NBA Trade Machine Logic FAQ
                </h2>
                <div className="mt-5 space-y-3">
                  {FAQS.map((faq) => (
                    <details
                      key={faq.question}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
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
                  Primary sources
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#9696b3]">
                  The season thresholds come from the{' '}
                  <a
                    href="https://www.nba.com/news/nba-salary-cap-2026-27-season"
                    rel="noreferrer"
                    className="text-[#ffce54] underline underline-offset-4"
                  >
                    NBA 2026-27 salary cap release
                  </a>
                  . The governing framework comes from the{' '}
                  <a
                    href="https://nbpa.com/cba"
                    rel="noreferrer"
                    className="text-[#ffce54] underline underline-offset-4"
                  >
                    2023 NBA-NBPA Collective Bargaining Agreement
                  </a>
                  . The implementation intentionally documents where its
                  simplified public-data model stops.
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

export const Route = createFileRoute('/nba-trade-machine/how-it-works')({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: 'description', content: PAGE_DESCRIPTION },
      { property: 'og:type', content: 'article' },
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
        href: localizeUrl(
          `${envConfigs.app_url}/nba-trade-machine/how-it-works`,
          { locale }
        ).href,
      })),
      { rel: 'alternate', hrefLang: 'x-default', href: PAGE_URL },
    ],
  }),
  component: NbaTradeMachineLogicPage,
});
