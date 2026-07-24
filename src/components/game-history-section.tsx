import { useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

export type HistoryLineupPlayer = {
  pos?: string | number;
  name?: string;
  abbr?: string;
  sy?: string | number;
  cost?: number;
  rating?: number;
};

export type HistoryRow = {
  id: string;
  pct: number;
  record: string;
  isPerfect: boolean;
  createdAt: string;
  lineup: HistoryLineupPlayer[];
};

export type GameHistorySectionProps = {
  eyebrow: string;
  title: string;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  guestTitle: string;
  guestBody: string;
  signInLabel: string;
  signInHref: string;
  playCtaLabel: string;
  playHref: string;
  pctLabel: string;
  recordLabel: string;
  dateLabel: string;
  perfectLabel: string;
  lineupLabel: string;
  lineupUnavailableLabel: string;
  posLabel: string;
  playerLabel: string;
  teamLabel: string;
  costLabel: string;
  ratingLabel: string;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
  mode: 'guest' | 'loading' | 'error' | 'empty' | 'ready';
  items: HistoryRow[];
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

const POS_NAMES = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Match in-game fmtM: $12.4M */
function formatCost(cost: number | undefined): string {
  if (cost == null || !Number.isFinite(cost)) return '—';
  return `$${(cost / 1e6).toFixed(1)}M`;
}

function formatRating(rating: number | undefined): string {
  if (rating == null || !Number.isFinite(rating)) return '—';
  return rating.toFixed(1);
}

function formatPos(pos: string | number | undefined): string {
  if (typeof pos === 'number' && Number.isFinite(pos)) {
    return POS_NAMES[pos] ?? String(pos);
  }
  if (typeof pos === 'string' && pos.trim()) {
    const asNum = Number(pos);
    if (Number.isInteger(asNum) && asNum >= 0 && asNum < POS_NAMES.length) {
      return POS_NAMES[asNum]!;
    }
    return pos;
  }
  return '—';
}

function teamSeason(p: HistoryLineupPlayer): string {
  const parts = [p.abbr, p.sy].filter((v) => v != null && String(v) !== '');
  return parts.join(' ') || '—';
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center border border-white/12 text-[#90a1b9] transition',
        open && 'border-[#fd6a00]/40 text-[#fd6a00]'
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 16 16"
        className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </span>
  );
}

export function GameHistorySection({
  eyebrow,
  title,
  loadingLabel,
  errorLabel,
  emptyLabel,
  guestTitle,
  guestBody,
  signInLabel,
  signInHref,
  playCtaLabel,
  playHref,
  pctLabel: _pctLabel,
  recordLabel,
  dateLabel: _dateLabel,
  perfectLabel,
  lineupLabel,
  lineupUnavailableLabel,
  posLabel,
  playerLabel,
  teamLabel,
  costLabel,
  ratingLabel,
  prevLabel,
  nextLabel,
  pageLabel,
  mode,
  items,
  page,
  pageCount,
  onPrev,
  onNext,
  className,
}: GameHistorySectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={cn('w-full py-14 sm:py-16', className)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-[Barlow_Condensed,sans-serif] text-xs tracking-[0.25em] text-[#fd6a00] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-[Barlow_Condensed,sans-serif] text-3xl font-bold tracking-wide text-[#c8c8e0] uppercase sm:text-4xl">
          {title}
        </h1>

        {mode === 'loading' ? (
          <p className="mt-10 font-sans text-sm text-[#8888aa]">
            {loadingLabel}
          </p>
        ) : null}

        {mode === 'error' ? (
          <p className="mt-10 font-sans text-sm text-[#f0a060]">{errorLabel}</p>
        ) : null}

        {mode === 'guest' ? (
          <div className="mt-10 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-8 sm:px-8">
            <p className="font-[Barlow_Condensed,sans-serif] text-xl font-semibold tracking-wide text-white uppercase">
              {guestTitle}
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[#8888aa]">
              {guestBody}
            </p>
            <Link
              href={signInHref}
              className="mt-6 inline-flex items-center justify-center bg-[#fd6a00] px-5 py-2.5 font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-black uppercase transition hover:bg-[#ff7a1a]"
            >
              {signInLabel}
            </Link>
          </div>
        ) : null}

        {mode === 'empty' ? (
          <div className="mt-10 border border-dashed border-white/15 px-5 py-8 sm:px-8">
            <p className="font-sans text-sm text-[#8888aa]">{emptyLabel}</p>
            <Link
              href={playHref}
              className="mt-5 inline-flex items-center justify-center border border-white/20 px-4 py-2 font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-[#c8c8e0] uppercase transition hover:border-white/40 hover:text-white"
            >
              {playCtaLabel}
            </Link>
          </div>
        ) : null}

        {mode === 'ready' ? (
          <div className="mt-10 space-y-3">
            {items.map((row) => {
              const open = openId === row.id;
              const totalCost = row.lineup.reduce(
                (s, p) => s + (typeof p.cost === 'number' ? p.cost : 0),
                0
              );
              const totalRtg = row.lineup.reduce(
                (s, p) => s + (typeof p.rating === 'number' ? p.rating : 0),
                0
              );

              return (
                <article
                  key={row.id}
                  className={cn(
                    'border border-white/10 bg-[#0a0a12] transition',
                    open && 'border-[#fd6a00]/35'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5"
                    aria-expanded={open}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <time className="font-[Fira_Sans,sans-serif] text-xs tracking-wide text-[#6b7289] uppercase">
                          {formatWhen(row.createdAt)}
                        </time>
                        {row.isPerfect ? (
                          <span className="font-[Barlow_Condensed,sans-serif] text-[11px] tracking-wide text-[#fd6a00] uppercase">
                            ★ {perfectLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-[Barlow_Condensed,sans-serif] text-2xl font-bold tracking-wide text-white tabular-nums">
                          {row.pct.toFixed(2)}
                          <span className="text-base text-[#fd6a00]">%</span>
                        </span>
                        <span className="font-sans text-sm text-[#90a1b9] tabular-nums">
                          <span className="text-[#6b7289]">{recordLabel} </span>
                          {row.record}
                        </span>
                      </div>
                    </div>
                    <Chevron open={open} />
                  </button>

                  {open ? (
                    <div className="border-t border-white/10 bg-black/30 px-4 py-4 sm:px-5">
                      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                        <p className="font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-[#c8c8e0] uppercase">
                          {lineupLabel}
                        </p>
                        {row.lineup.length > 0 ? (
                          <p className="font-[Fira_Sans,sans-serif] text-[11px] tracking-wide text-[#6b7289] uppercase">
                            {costLabel}{' '}
                            <span className="text-[#c8c8e0]">
                              {formatCost(totalCost)}
                            </span>
                            <span className="mx-2 text-white/20">·</span>
                            {ratingLabel}{' '}
                            <span className="text-[#c8c8e0]">
                              {formatRating(totalRtg)}
                            </span>
                          </p>
                        ) : null}
                      </div>

                      {row.lineup.length === 0 ? (
                        <p className="font-sans text-sm text-[#8888aa]">
                          {lineupUnavailableLabel}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[30rem] border-collapse text-left">
                            <thead>
                              <tr className="font-[Fira_Sans,sans-serif] text-[10px] tracking-[0.14em] text-[#6b7289] uppercase">
                                <th className="pr-3 pb-2 font-normal">
                                  {posLabel}
                                </th>
                                <th className="pr-3 pb-2 font-normal">
                                  {playerLabel}
                                </th>
                                <th className="pr-3 pb-2 font-normal">
                                  {teamLabel}
                                </th>
                                <th className="pr-3 pb-2 text-right font-normal">
                                  {costLabel}
                                </th>
                                <th className="pb-2 text-right font-normal">
                                  {ratingLabel}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.lineup.map((p, i) => (
                                <tr
                                  key={`${row.id}-${i}-${p.name ?? i}`}
                                  className="border-t border-white/[0.06]"
                                >
                                  <td className="py-2.5 pr-3 font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-[#fd6a00]">
                                    {formatPos(p.pos ?? i)}
                                  </td>
                                  <td className="py-2.5 pr-3 font-sans text-sm text-[#eaeaff]">
                                    {p.name ?? '—'}
                                  </td>
                                  <td className="py-2.5 pr-3 font-sans text-sm text-[#90a1b9]">
                                    {teamSeason(p)}
                                  </td>
                                  <td className="py-2.5 pr-3 text-right font-sans text-sm text-[#c8c8e0] tabular-nums">
                                    {formatCost(p.cost)}
                                  </td>
                                  <td className="py-2.5 text-right font-sans text-sm text-[#c8c8e0] tabular-nums">
                                    {formatRating(p.rating)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}

            {pageCount > 1 ? (
              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={page <= 1}
                  className="border border-white/15 px-3 py-1.5 font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-[#c8c8e0] uppercase transition enabled:hover:border-white/30 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {prevLabel}
                </button>
                <p className="font-sans text-xs text-[#6b7289]">{pageLabel}</p>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={page >= pageCount}
                  className="border border-white/15 px-3 py-1.5 font-[Barlow_Condensed,sans-serif] text-sm tracking-wide text-[#c8c8e0] uppercase transition enabled:hover:border-white/30 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {nextLabel}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
