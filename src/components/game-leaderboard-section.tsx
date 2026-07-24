import { cn } from '@/lib/utils';

export type LeaderboardRow = {
  name: string;
  pct: number;
  record: string;
};

export type LeaderboardColumns = {
  day: LeaderboardRow[];
  week: LeaderboardRow[];
  alltime: LeaderboardRow[];
};

export function GameLeaderboardSection({
  eyebrow,
  title,
  dayLabel,
  weekLabel,
  alltimeLabel,
  emptyLabel,
  loadingLabel,
  errorLabel,
  pctLabel,
  recordLabel,
  playerLabel,
  board,
  status,
  className,
}: {
  eyebrow: string;
  title: string;
  dayLabel: string;
  weekLabel: string;
  alltimeLabel: string;
  emptyLabel: string;
  loadingLabel: string;
  errorLabel: string;
  pctLabel: string;
  recordLabel: string;
  playerLabel: string;
  board: LeaderboardColumns | null;
  status: 'loading' | 'error' | 'ready';
  className?: string;
}) {
  const columns: Array<{
    key: keyof LeaderboardColumns;
    label: string;
    rows: LeaderboardRow[];
  }> = [
    { key: 'day', label: dayLabel, rows: board?.day ?? [] },
    { key: 'week', label: weekLabel, rows: board?.week ?? [] },
    { key: 'alltime', label: alltimeLabel, rows: board?.alltime ?? [] },
  ];

  return (
    <section className={cn('w-full py-14 sm:py-16', className)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-[Barlow_Condensed,sans-serif] text-xs tracking-[0.25em] text-[#ff6b35] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-[Barlow_Condensed,sans-serif] text-3xl font-bold tracking-wide text-[#c8c8e0] uppercase sm:text-4xl">
          {title}
        </h2>

        {status === 'loading' ? (
          <p className="mt-10 font-sans text-sm text-[#8888aa]">
            {loadingLabel}
          </p>
        ) : null}

        {status === 'error' ? (
          <p className="mt-10 font-sans text-sm text-[#f0a060]">{errorLabel}</p>
        ) : null}

        {status === 'ready' ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-6">
            {columns.map((col) => (
              <div key={col.key}>
                <h3 className="border-b border-white/10 pb-2 font-[Barlow_Condensed,sans-serif] text-lg font-semibold tracking-wide text-white uppercase">
                  {col.label}
                </h3>
                {col.rows.length === 0 ? (
                  <p className="mt-4 font-sans text-sm text-[#6b7289]">
                    {emptyLabel}
                  </p>
                ) : (
                  <ol className="mt-3 space-y-0">
                    <li className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.25rem_3.5rem] gap-2 px-1 pb-1 font-[Fira_Sans,sans-serif] text-[10px] tracking-wide text-[#6b7289] uppercase">
                      <span>#</span>
                      <span>{playerLabel}</span>
                      <span className="text-right">{pctLabel}</span>
                      <span className="text-right">{recordLabel}</span>
                    </li>
                    {col.rows.map((row, i) => (
                      <li
                        key={`${col.key}-${i}-${row.name}-${row.pct}`}
                        className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.25rem_3.5rem] items-baseline gap-2 border-t border-white/5 px-1 py-2.5 font-sans text-sm"
                      >
                        <span className="font-[Barlow_Condensed,sans-serif] text-[#ff6b35]">
                          {i + 1}
                        </span>
                        <span className="truncate text-[#eaeaff]">
                          {row.name}
                        </span>
                        <span className="text-right font-semibold text-white tabular-nums">
                          {row.pct.toFixed(2)}%
                        </span>
                        <span className="text-right text-[#90a1b9] tabular-nums">
                          {row.record}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
