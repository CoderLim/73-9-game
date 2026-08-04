import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Database,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';

import { getNbaPlayerHeadshotUrl } from '@/data/nba-player-headshots';
import {
  NBA_TRADE_SNAPSHOT,
  NBA_TRADE_TEAMS,
  type NbaTradeTeam,
} from '@/data/nba-trade-machine-2026-08-04';
import {
  NBA_TRADE_ROSTERS,
  NBA_TRADE_ROSTER_SNAPSHOT,
  type NbaTradeRosterRow,
} from '@/data/nba-trade-rosters-2026-08-04';

type ContractRow = {
  id: string;
  player: string;
  salary: string;
  source: 'roster' | 'custom';
  rosterKey?: string;
};

type TeamEvaluation = {
  legal: boolean;
  method: string;
  outgoing: number;
  incoming: number;
  maxIncoming: number;
  postPayroll: number;
  aggregationBlocked: boolean;
  message: string;
};

function createCustomRow(): ContractRow {
  return {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    player: '',
    salary: '',
    source: 'custom',
  };
}

function salaryToInput(value: number): string {
  return String(Math.round((value / 1_000_000) * 1_000) / 1_000);
}

function rosterKey(teamCode: string, index: number): string {
  return `${teamCode}-${index}`;
}

function parseSalary(value: string): number {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0
    ? Math.round(parsed * 1_000_000)
    : 0;
}

function totalSalary(rows: ContractRow[]): number {
  return rows.reduce((sum, row) => sum + parseSalary(row.salary), 0);
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 0,
  }).format(value);
}

function payrollTier(payroll: number): string {
  if (payroll < NBA_TRADE_SNAPSHOT.salaryCap) return 'Under salary cap';
  if (payroll >= NBA_TRADE_SNAPSHOT.secondApron) return 'Above second apron';
  if (payroll >= NBA_TRADE_SNAPSHOT.firstApron) return 'Above first apron';
  if (payroll >= NBA_TRADE_SNAPSHOT.luxuryTax) return 'Luxury-tax team';
  return 'Over salary cap';
}

function playerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function PlayerAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md';
}) {
  const imageUrl = getNbaPlayerHeadshotUrl(name);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [imageUrl]);

  const sizeClass = size === 'sm' ? 'size-9' : 'size-10';
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      aria-hidden="true"
      className={`relative grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#202035] ${textClass} font-bold text-[#ffce54]`}
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover object-top"
        />
      ) : (
        playerInitials(name)
      )}
    </span>
  );
}

function evaluateTeam(
  team: NbaTradeTeam,
  outgoingRows: ContractRow[],
  incoming: number
): TeamEvaluation {
  const outgoing = totalSalary(outgoingRows);
  const positiveContracts = outgoingRows.filter(
    (row) => parseSalary(row.salary) > 0
  ).length;
  const isUnderCap = team.payroll < NBA_TRADE_SNAPSHOT.salaryCap;
  const isAboveFirstApron =
    team.payroll >= NBA_TRADE_SNAPSHOT.firstApron;
  const isAboveSecondApron =
    team.payroll >= NBA_TRADE_SNAPSHOT.secondApron;

  let maxIncoming = 0;
  let method = '';

  if (isUnderCap) {
    const capRoom = NBA_TRADE_SNAPSHOT.salaryCap - team.payroll;
    maxIncoming = outgoing + capRoom;
    method = 'Available cap room';
  } else if (isAboveFirstApron) {
    maxIncoming = outgoing;
    method = isAboveSecondApron
      ? 'Second-apron 100% matching'
      : 'First-apron 100% matching';
  } else {
    const expandedMaximum = Math.max(
      Math.min(
        outgoing * 2 + 250_000,
        outgoing + NBA_TRADE_SNAPSHOT.adjustedTradeAmount
      ),
      outgoing * 1.25 + 250_000
    );
    const firstApronCeiling =
      outgoing +
      Math.max(0, NBA_TRADE_SNAPSHOT.firstApron - team.payroll);
    maxIncoming = Math.min(expandedMaximum, firstApronCeiling);
    method = 'Expanded traded-player exception estimate';
  }

  const aggregationBlocked = isAboveSecondApron && positiveContracts > 1;
  const legal = incoming <= maxIncoming + 1 && !aggregationBlocked;
  const postPayroll = team.payroll - outgoing + incoming;

  let message = '';
  if (aggregationBlocked) {
    message =
      'This team is above the second apron, so this simplified checker flags aggregation of multiple outgoing salaries.';
  } else if (legal) {
    message =
      'The salaries fit the simplified two-team matching test for this payroll tier.';
  } else {
    const shortfall = Math.max(0, incoming - maxIncoming);
    message = `Incoming salary is about ${formatMoney(shortfall)} above the estimated limit.`;
  }

  return {
    legal,
    method,
    outgoing,
    incoming,
    maxIncoming,
    postPayroll,
    aggregationBlocked,
    message,
  };
}

function ContractEditor({
  team,
  otherTeamCode,
  rows,
  onTeamChange,
  onRowsChange,
}: {
  team: NbaTradeTeam;
  otherTeamCode: string;
  rows: ContractRow[];
  onTeamChange: (code: string) => void;
  onRowsChange: (rows: ContractRow[]) => void;
}) {
  const [search, setSearch] = useState('');
  const roster = NBA_TRADE_ROSTERS[team.code] ?? [];
  const selectedKeys = useMemo(
    () =>
      new Set(
        rows
          .filter((row) => row.source === 'roster' && row.rosterKey)
          .map((row) => row.rosterKey as string)
      ),
    [rows]
  );
  const filteredRoster = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return roster;
    return roster.filter(([name]) =>
      name.toLocaleLowerCase().includes(query)
    );
  }, [roster, search]);

  const updateCustomRow = (
    id: string,
    field: 'player' | 'salary',
    value: string
  ) => {
    onRowsChange(
      rows.map((row) =>
        row.id === id && row.source === 'custom'
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  const removeRow = (id: string) => {
    onRowsChange(rows.filter((row) => row.id !== id));
  };

  const toggleRosterPlayer = (
    player: NbaTradeRosterRow,
    index: number
  ) => {
    const key = rosterKey(team.code, index);
    const existing = rows.find((row) => row.rosterKey === key);
    if (existing) {
      removeRow(existing.id);
      return;
    }
    if (rows.length >= 8) return;

    onRowsChange([
      ...rows,
      {
        id: key,
        player: player[0],
        salary: salaryToInput(player[1]),
        source: 'roster',
        rosterKey: key,
      },
    ]);
  };

  const addCustomPlayer = () => {
    if (rows.length >= 8) return;
    onRowsChange([...rows, createCustomRow()]);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b0b16]/95 p-4 shadow-2xl shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="text-xs font-semibold tracking-[0.18em] text-[#8f8fb2] uppercase">
            Team
          </label>
          <select
            value={team.code}
            onChange={(event) => {
              setSearch('');
              onTeamChange(event.target.value);
            }}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#151526] px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#ffce54]/70 sm:min-w-64"
          >
            {NBA_TRADE_TEAMS.map((option) => (
              <option
                key={option.code}
                value={option.code}
                disabled={option.code === otherTeamCode}
              >
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border border-[#ffce54]/20 bg-[#ffce54]/5 px-3 py-2 text-left sm:text-right">
          <div className="text-xs text-[#8f8fb2]">Published payroll</div>
          <div className="font-[Geist_Mono,monospace] text-base font-bold text-[#ffce54]">
            {formatMoney(team.payroll)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#a9a9c7]">
            {payrollTier(team.payroll)}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-bold tracking-wide text-white uppercase">
              Players sent out
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#8f8fb2]">
              Select players from the dated roster. Salaries fill automatically.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-[#b6b6cf]">
            {rows.length}/8 selected
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold tracking-[0.12em] text-[#8f8fb2] uppercase">
              Trade package
            </span>
            <span className="font-[Geist_Mono,monospace] text-xs font-bold text-[#ffce54]">
              {formatMoney(totalSalary(rows))}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="py-5 text-center text-xs leading-5 text-[#686884]">
              No players selected. Choose from the roster below.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {rows.map((row, index) =>
                row.source === 'roster' ? (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-[#ffce54]/15 bg-[#ffce54]/5 px-3 py-2.5"
                  >
                    <PlayerAvatar name={row.player} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">
                        {row.player}
                      </div>
                      <div className="mt-0.5 font-[Geist_Mono,monospace] text-xs text-[#a6a6c0]">
                        {formatMoney(parseSalary(row.salary))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Remove ${row.player}`}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-[#8f8fb2] transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_7rem_2.25rem] gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-2"
                  >
                    <input
                      value={row.player}
                      onChange={(event) =>
                        updateCustomRow(row.id, 'player', event.target.value)
                      }
                      placeholder={`Custom player ${index + 1}`}
                      aria-label={`${team.name} custom player ${index + 1}`}
                      className="min-w-0 rounded-lg border border-white/10 bg-[#151526] px-3 py-2 text-sm text-white outline-none placeholder:text-[#62627d] focus:border-[#ffce54]/60"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-[#777795]">
                        $
                      </span>
                      <input
                        value={row.salary}
                        onChange={(event) =>
                          updateCustomRow(row.id, 'salary', event.target.value)
                        }
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="M"
                        aria-label={`${team.name} custom salary ${index + 1} in millions`}
                        className="w-full rounded-lg border border-white/10 bg-[#151526] py-2 pr-6 pl-5 font-[Geist_Mono,monospace] text-sm text-white outline-none placeholder:text-[#62627d] focus:border-[#ffce54]/60"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[10px] text-[#777795]">
                        M
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove custom player"
                      className="grid place-items-center rounded-lg text-[#8f8fb2] transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#777795]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${team.name} roster`}
              aria-label={`Search ${team.name} roster`}
              className="w-full rounded-xl border border-white/10 bg-[#151526] py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-[#62627d] focus:border-[#ffce54]/60"
            />
          </div>

          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#10101d] p-2">
            {filteredRoster.length ? (
              filteredRoster.map((player) => {
                const index = roster.indexOf(player);
                const key = rosterKey(team.code, index);
                const selected = selectedKeys.has(key);
                const disabled = !selected && rows.length >= 8;

                return (
                  <button
                    key={key}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => toggleRosterPlayer(player, index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                      selected
                        ? 'bg-[#ffce54]/10 text-white'
                        : 'text-[#c3c3d8] hover:bg-white/5'
                    } disabled:cursor-not-allowed disabled:opacity-35`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded border ${
                        selected
                          ? 'border-[#ffce54] bg-[#ffce54] text-[#17120a]'
                          : 'border-white/20'
                      }`}
                    >
                      {selected ? <Check className="size-3.5" /> : null}
                    </span>
                    <PlayerAvatar name={player[0]} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {player[0]}
                    </span>
                    <span className="shrink-0 font-[Geist_Mono,monospace] text-xs text-[#9b9bb7]">
                      {formatMoney(player[1])}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="py-8 text-center text-xs text-[#777795]">
                No roster player matches “{search}”.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={addCustomPlayer}
            disabled={rows.length >= 8}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-3 py-2.5 text-xs font-semibold text-[#b6b6cf] transition hover:border-[#ffce54]/40 hover:bg-[#ffce54]/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserPlus className="size-4" />
            Add custom player
          </button>
        </div>
      </div>
    </section>
  );
}

function EvaluationCard({
  team,
  evaluation,
}: {
  team: NbaTradeTeam;
  evaluation: TeamEvaluation;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        evaluation.legal
          ? 'border-emerald-400/25 bg-emerald-400/5'
          : 'border-amber-400/25 bg-amber-400/5'
      }`}
    >
      <div className="flex items-start gap-3">
        {evaluation.legal ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
        ) : (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-bold tracking-wide text-white uppercase">
            {team.name}: {evaluation.legal ? 'passes' : 'needs adjustment'}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#b6b6cf]">
            {evaluation.message}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-[#777795]">Outgoing</dt>
          <dd className="mt-1 font-[Geist_Mono,monospace] font-semibold text-white">
            {formatMoney(evaluation.outgoing)}
          </dd>
        </div>
        <div>
          <dt className="text-[#777795]">Incoming</dt>
          <dd className="mt-1 font-[Geist_Mono,monospace] font-semibold text-white">
            {formatMoney(evaluation.incoming)}
          </dd>
        </div>
        <div>
          <dt className="text-[#777795]">Estimated limit</dt>
          <dd className="mt-1 font-[Geist_Mono,monospace] font-semibold text-white">
            {formatMoney(evaluation.maxIncoming)}
          </dd>
        </div>
        <div>
          <dt className="text-[#777795]">Post-trade payroll</dt>
          <dd className="mt-1 font-[Geist_Mono,monospace] font-semibold text-white">
            {formatMoney(evaluation.postPayroll)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-5 text-[#8585a3]">
        Method: {evaluation.method}
      </p>
    </article>
  );
}

export function NbaTradeMachine() {
  const [teamACode, setTeamACode] = useState('LAL');
  const [teamBCode, setTeamBCode] = useState('GSW');
  const [rowsA, setRowsA] = useState<ContractRow[]>([]);
  const [rowsB, setRowsB] = useState<ContractRow[]>([]);

  const teamA =
    NBA_TRADE_TEAMS.find((team) => team.code === teamACode) ??
    NBA_TRADE_TEAMS[0];
  const teamB =
    NBA_TRADE_TEAMS.find((team) => team.code === teamBCode) ??
    NBA_TRADE_TEAMS[1];

  const outgoingA = useMemo(() => totalSalary(rowsA), [rowsA]);
  const outgoingB = useMemo(() => totalSalary(rowsB), [rowsB]);
  const evaluationA = useMemo(
    () => evaluateTeam(teamA, rowsA, outgoingB),
    [teamA, rowsA, outgoingB]
  );
  const evaluationB = useMemo(
    () => evaluateTeam(teamB, rowsB, outgoingA),
    [teamB, rowsB, outgoingA]
  );
  const hasTrade = outgoingA > 0 || outgoingB > 0;
  const tradePasses = hasTrade && evaluationA.legal && evaluationB.legal;

  const swapSides = () => {
    setTeamACode(teamBCode);
    setTeamBCode(teamACode);
    setRowsA(rowsB);
    setRowsB(rowsA);
  };

  const reset = () => {
    setTeamACode('LAL');
    setTeamBCode('GSW');
    setRowsA([]);
    setRowsB([]);
  };

  const changeTeamA = (code: string) => {
    setTeamACode(code);
    setRowsA([]);
  };

  const changeTeamB = (code: string) => {
    setTeamBCode(code);
    setRowsB([]);
  };

  return (
    <section
      id="trade-checker"
      aria-labelledby="trade-checker-heading"
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#07070f]/95 shadow-2xl shadow-black/50">
        <div className="border-b border-white/10 bg-gradient-to-r from-[#171229] via-[#0d0d18] to-[#171229] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#ffce54] uppercase">
                <Database className="size-4" />
                {NBA_TRADE_ROSTER_SNAPSHOT.season} roster snapshot
              </div>
              <h2
                id="trade-checker-heading"
                className="mt-2 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold tracking-wide text-white uppercase sm:text-3xl"
              >
                Select players and test the trade
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#9999b8]">
                Pick from {NBA_TRADE_ROSTER_SNAPSHOT.playerCount} published
                contracts. Salaries and team payrolls were compiled August 4,
                2026; custom entries remain available for edge cases.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={swapSides}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-[#ffce54]/40 hover:bg-[#ffce54]/10"
              >
                <ArrowRightLeft className="size-4" />
                Swap sides
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-6">
          <ContractEditor
            team={teamA}
            otherTeamCode={teamB.code}
            rows={rowsA}
            onTeamChange={changeTeamA}
            onRowsChange={setRowsA}
          />
          <ContractEditor
            team={teamB}
            otherTeamCode={teamA.code}
            rows={rowsB}
            onTeamChange={changeTeamB}
            onRowsChange={setRowsB}
          />
        </div>

        <div className="border-t border-white/10 px-4 py-5 lg:px-6">
          <div
            className={`rounded-2xl border px-4 py-4 text-center ${
              !hasTrade
                ? 'border-white/10 bg-white/[0.03]'
                : tradePasses
                  ? 'border-emerald-400/25 bg-emerald-400/5'
                  : 'border-amber-400/25 bg-amber-400/5'
            }`}
          >
            <div className="font-[Barlow_Condensed,sans-serif] text-xl font-extrabold tracking-wide text-white uppercase">
              {!hasTrade
                ? 'Select at least one outgoing player'
                : tradePasses
                  ? 'Simplified salary match passes'
                  : 'Simplified salary match fails'}
            </div>
            <p className="mt-1 text-xs leading-5 text-[#9999b8]">
              Both teams must independently pass. This is an educational
              estimate, not an official league transaction approval.
            </p>
          </div>

          {hasTrade ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <EvaluationCard team={teamA} evaluation={evaluationA} />
              <EvaluationCard team={teamB} evaluation={evaluationB} />
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/5 p-4 text-xs leading-6 text-[#9faac2]">
            <strong className="text-sky-200">Coverage note:</strong> the
            checker covers basic cap-room, expanded salary matching, first
            apron, second apron, and second-apron aggregation warnings. It does
            not yet validate traded-player exceptions, sign-and-trades,
            base-year compensation, poison-pill calculations, trade kickers,
            non-guaranteed salary treatment, player consent, roster limits,
            draft-pick ownership, or the Stepien rule. Published payroll is
            also not identical to official Apron Team Salary.
          </div>
        </div>
      </div>
    </section>
  );
}
