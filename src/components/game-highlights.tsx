import { cn } from '@/lib/utils';

export interface HighlightItem {
  title: string;
  description: string;
}

export function GameHighlights({
  eyebrow,
  title,
  items,
  className,
}: {
  eyebrow: string;
  title: string;
  items: HighlightItem[];
  className?: string;
}) {
  return (
    <section
      id="highlights"
      className={cn(
        'w-full border-y border-[#1c283e]/80 bg-[#05050a]/90 py-16 backdrop-blur-sm sm:py-20',
        className
      )}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-[Barlow_Condensed,sans-serif] text-xs tracking-[0.25em] text-[#ff6b35] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-[Barlow_Condensed,sans-serif] text-3xl font-bold tracking-wide text-[#c8c8e0] uppercase sm:text-4xl">
          {title}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-[#2a2a52] bg-gradient-to-b from-[#16162f] to-[#0e0e22] p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[#ffd700]/70"
            >
              <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-semibold tracking-wide text-[#ffd700] uppercase">
                {item.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-[#8888aa]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
