import { cn } from '@/lib/utils';

export interface SeoBlock {
  heading: string;
  paragraphs: string[];
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoStep {
  title: string;
  body: string;
}

export function GameSeoSection({
  id = 'about',
  eyebrow,
  title,
  intro,
  howTitle,
  howSubtitle,
  steps,
  blocks,
  faqTitle,
  faqs,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  howTitle?: string;
  howSubtitle?: string;
  steps?: SeoStep[];
  blocks: SeoBlock[];
  faqTitle: string;
  faqs: SeoFaqItem[];
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        'w-full bg-[#05050a]/85 py-14 backdrop-blur-sm sm:py-16',
        className
      )}
    >
      <div className="mx-auto max-w-[720px] px-4 sm:px-6">
        <p className="font-[Barlow_Condensed,sans-serif] text-[11px] tracking-[0.28em] text-[#ff6b35] uppercase sm:text-xs">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-[Barlow_Condensed,sans-serif] text-[1.75rem] leading-tight font-bold tracking-wide text-[#eaeaff] uppercase sm:text-4xl">
          {title}
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-[13px] leading-[1.85] text-[#a0a0c0] sm:text-sm sm:leading-[1.9]">
          {intro}
        </p>

        {steps && steps.length > 0 ? (
          <div className="mt-11 sm:mt-14">
            {howTitle ? (
              <p className="font-[Barlow_Condensed,sans-serif] text-[11px] tracking-[0.28em] text-[#ff6b35] uppercase sm:text-xs">
                {howTitle}
              </p>
            ) : null}
            {howSubtitle ? (
              <h3 className="mt-2 font-[Barlow_Condensed,sans-serif] text-lg font-semibold tracking-wide text-[#eaeaff] uppercase sm:text-xl">
                {howSubtitle}
              </h3>
            ) : null}
            <ol className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fe8200] to-[#f25900] font-[Barlow_Condensed,sans-serif] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(242,89,0,0.35)]"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-[Barlow_Condensed,sans-serif] text-[15px] font-bold tracking-[0.06em] text-[#eaeaff] uppercase sm:text-base">
                      {step.title}
                    </p>
                    <p className="mt-1.5 font-sans text-[13px] leading-[1.85] text-[#9494b8] sm:text-sm sm:leading-[1.9]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="mt-11 space-y-10 sm:mt-14 sm:space-y-12">
          {blocks.map((block) => (
            <article key={block.heading}>
              <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-semibold tracking-wide text-[#ffd700] uppercase sm:text-xl">
                {block.heading}
              </h3>
              <div className="mt-3.5 space-y-3.5 font-sans text-[13px] leading-[1.85] text-[#9494b8] sm:mt-4 sm:space-y-4 sm:text-sm sm:leading-[1.9]">
                {block.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 sm:mt-16">
          <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-semibold tracking-wide text-[#ffd700] uppercase sm:text-xl">
            {faqTitle}
          </h3>
          <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-[#2a2a52] bg-[#0c0c1e]/80 px-4 py-3.5 open:border-[#ff6b35]/45"
              >
                <summary className="cursor-pointer list-none font-[Barlow_Condensed,sans-serif] text-[13px] tracking-wide text-[#d4d4f0] uppercase marker:content-none sm:text-sm [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {faq.question}
                    <span className="shrink-0 text-base text-[#ff6b35] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 font-sans text-[13px] leading-[1.85] text-[#9494b8] sm:text-sm">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
