import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

import {
  NBA_PLAYER_CONTRACT_SNAPSHOT,
  parseNbaPlayerContractsCsv,
  type NbaPlayerContract,
} from '@/data/nba-player-contracts-2026-08-04';
import {
  NBA_TRADE_SNAPSHOT,
  NBA_TRADE_TEAMS,
  type NbaTradeTeam,
} from '@/data/nba-trade-machine-2026-08-04';

type ContractRow = {
  id: string;
  player: string;
  salary: string;
  contractNote?: string;
  source?: 'snapshot' | 'custom';
};

type ContractsStatus = 'loading' | 'ready' | 'error';

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

const createRow = (): ContractRow => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  player: '',
  salary: '',
  source: 'custom',
});

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

function formatSalaryInput(value: number): string {
  return (value / 1_000_000)
    .toFixed(6)
    .replace(/0+$/, '')
    .replace(/\.$/, '');
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function payrollTier(payroll: number): string {
  if (payroll < NBA_TRADE_SNAPSHOT.salaryCap) return 'Under salary cap';
  if (payroll >= NBA_TRADE_SNAPSHOT.secondApron) return 'Above second apron';
  if (payroll >= NBA_TRADE_SNAPSHOT.firstApron) return 'Above first apron';
  if (payroll >= NBA_TRADE_SNAPSHOT.luxuryTax) return 'Luxury-tax team';
  return 'Over salary cap';
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

function PlayerCombobox({
  team,
  row,
  contracts,
  contractsStatus,
  selectedPlayers,
  onChange,
}: {
  team: NbaTradeTeam;
  row: ContractRow;
  contracts: NbaPlayerContract[];
  contractsStatus: ContractsStatus;
  selectedPlayers: string[];
  onChange: (patch: Partial<ContractRow>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedElsewhere = useMemo(
    () =>
      new Set(
        selectedPlayers
          .filter((player) => player !== row.player)
          .map((player) => normalizeSearch(player))
      ),
    [row.player, selectedPlayers]
  );

  const teamContracts = useMemo(
    () =>
      contracts
        .filter((contract) => contract.team === team.code)
        .filter(
          (contract) =>
            !selectedElsewhere.has(normalizeSearch(contract.player))
        )
        .sort((a, b) => b.salary - a.salary),
    [contracts, selectedElsewhere, team.code]
  );

  const options = useMemo(() => {
    const query = normalizeSearch(row.player.trim());
    const matches = query
      ? teamContracts.filter((contract) =>
          normalizeSearch(contract.player).includes(query)
        )
      : teamContracts;

    return matches.slice(0, 12);
  }, [row.player, teamContracts]);

  useEffect(() => {
    setActiveIndex(0);
  }, [row.player, team.code]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  const selectContract = (contract: NbaPlayerContract) => {
    onChange({
      player: contract.player,
      salary: formatSalaryInput(contract.salary),
      contractNote: contract.note,
      source: 'snapshot',
    });
    setOpen(false);
  };

  const handleTextChange = (value: string) => {
    const clearAutofill = row.source === 'snapshot' && value !== row.player;
    onChange({
      player: value,
      ...(clearAutofill
        ? {
            salary: '',
            contractNote: '',
            source: 'custom' as const,
          }
        : {}),
    });
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <Search className="pointer-events-none absolute top-3 left-3 z-10 size-4 text-[#676783]" />
      <input
        value={row.player}
        onChange={(event) => handleTextChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) =>
              Math.min(current + 1, Math.max(0, options.length - 1))
            );
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
          } else if (event.key === 'Enter' && open && options[activeIndex]) {
            event.preventDefault();
            selectContract(options[activeIndex]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={`Search ${team.code} player`}
        aria-label={`Search ${team.name} player`}
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
        className="w-full rounded-xl border border-white/10 bg-[#151526] py-2.5 pr-9 pl-9 text-sm text-white outline-none placeholder:text-[#62627d] focus:border-[#ffce54]/60"
      />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Show ${team.name} contracts`}
        className="absolute top-0 right-0 grid h-full w-9 place-items-center text-[#777795] transition hover:text-white"
      >
        <ChevronDown
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+0.4rem)] right-0 left-0 z-50 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-[#111120] p-1.5 shadow-2xl shadow-black/70"
        >
          {contractsStatus === 'loading' ? (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-[#9a9ab8]">
              <LoaderCircle className="size-4 animate-spin" />
              Loading {team.code} contracts…
            </div>
          ) : contractsStatus === 'error' ? (
            <div className="px-3 py-3 text-xs leading-5 text-amber-200">
              Player search is unavailable. Type a custom player and salary.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-3 text-xs leading-5 text-[#9a9ab8]">
              No matching contract. Keep typing to use a custom player.
            </div>
          ) : (
            <>
              <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#73738f] uppercase">
                {row.player.trim()
                  ? `${team.code} matches`
                  : `${team.code} 2026-27 contracts`}
              </div>
              {options.map((contract, index) => (
                <button
                  key={`${contract.team}-${contract.player}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectContract(contract)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                    index === activeIndex
                      ? 'bg-[#ffce54]/12'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      {contract.player}
                      {row.player === contract.player ? (
                        <Check className="size-3.5 text-emerald-300" />
                      ) : null}
                    </span>
                    {contract.note ? (
                      <span className="mt-0.5 block truncate text-[10px] text-[#8585a3]">
                        {contract.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-[Geist_Mono,monospace] text-xs font-bold text-[#ffce54]">
                    {formatMoney(contract.salary)}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ContractEditor({
  team,
  otherTeamCode,
  rows,
  contracts,
  contractsStatus,
  onTeamChange,
  onRowsChange,
}: {
  team: NbaTradeTeam;
  otherTeamCode: string;
  rows: ContractRow[];
  contracts: NbaPlayerContract[];
  contractsStatus: ContractsStatus;
  onTeamChange: (code: string) => void;
  onRowsChange: (rows: ContractRow[]) => void;
}) {
  const updateRow = (id: string, patch: Partial<ContractRow>) => {
    onRowsChange(
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const removeRow = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    onRowsChange(next.length ? next : [createRow()]);
  };

  const selectedPlayers = rows
    .map((row) => row.player.trim())
    .filter(Boolean);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b0b16]/95 p-4 shadow-2xl shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="text-xs font-semibold tracking-[0.18em] text-[#8f8fb2] uppercase">
            Team
          </label>
          <select
            value={team.code}
            onChange={(event) => onTeamChange(event.target.value)}
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-[Barlow_Condensed,sans-serif] text-lg font-bold tracking-wide text-white uppercase">
              Contracts sent out
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#8f8fb2]">
              Search the selected team to auto-fill salary, or type a custom
              contract. Salary stays editable.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              rows.length < 8 && onRowsChange([...rows, createRow()])
            }
            disabled={rows.length >= 8}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#ffce54]/40 hover:bg-[#ffce54]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div key={row.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_6.75rem_2.25rem] gap-2">
                <PlayerCombobox
                  team={team}
                  row={row}
                  contracts={contracts}
                  contractsStatus={contractsStatus}
                  selectedPlayers={selectedPlayers}
                  onChange={(patch) => updateRow(row.id, patch)}
                />
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-[#777795]">
                    $
                  </span>
                  <input
                    value={row.salary}
                    onChange={(event) =>
                      updateRow(row.id, { salary: event.target.value })
                    }
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="M"
                    aria-label={`${team.name} salary ${index + 1} in millions`}
                    className="w-full rounded-xl border border-white/10 bg-[#151526] py-2.5 pr-7 pl-6 font-[Geist_Mono,monospace] text-sm text-white outline-none placeholder:text-[#62627d] focus:border-[#ffce54]/60"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-[#777795]">
                    M
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.player || `player ${index + 1}`}`}
                  className="grid place-items-center rounded-xl border border-white/10 bg-white/5 text-[#8f8fb2] transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {row.source === 'snapshot' ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[10px] leading-4 text-[#8585a3]">
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="size-3" />
                    Salary auto-filled
                  </span>
                  {row.contractNote ? <span>{row.contractNote}</span> : null}
                </div>
              ) : null}
            </div>
          ))}
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
  const [rowsA, setRowsA] = useState<ContractRow[]>([createRow()]);
  const [rowsB, setRowsB] = useState<ContractRow[]>([createRow()]);
  const [contracts, setContracts] = useState<NbaPlayerContract[]>([]);
  const [contractsStatus, setContractsStatus] =
    useState<ContractsStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function loadContracts() {
      try {
        const response = await fetch(NBA_PLAYER_CONTRACT_SNAPSHOT.csvUrl, {
          signal: controller.signal,
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(`Contract snapshot returned ${response.status}`);
        }

        const parsed = parseNbaPlayerContractsCsv(await response.text());
        if (!parsed.length) throw new Error('Contract snapshot is empty');

        setContracts(parsed);
        setContractsStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setContractsStatus('error');
      }
    }

    loadContracts();
    return () => controller.abort();
  }, []);

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
    setRowsA([createRow()]);
    setRowsB([createRow()]);
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
                2026-27 static snapshot
              </div>
              <h2
                id="trade-checker-heading"
                className="mt-2 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold tracking-wide text-white uppercase sm:text-3xl"
              >
                Build a two-team salary trade
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#9999b8]">
                Search a player to auto-fill the 2026-27 salary, then edit it if
                needed. Payroll and player-contract snapshots are dated August
                4, 2026.
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
            contracts={contracts}
            contractsStatus={contractsStatus}
            onTeamChange={(code) => {
              setTeamACode(code);
              setRowsA([createRow()]);
            }}
            onRowsChange={setRowsA}
          />
          <ContractEditor
            team={teamB}
            otherTeamCode={teamA.code}
            rows={rowsB}
            contracts={contracts}
            contractsStatus={contractsStatus}
            onTeamChange={(code) => {
              setTeamBCode(code);
              setRowsB([createRow()]);
            }}
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
                ? 'Select or enter at least one outgoing contract'
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

          <p className="mt-3 text-center text-[10px] leading-5 text-[#72728e]">
            Player selector snapshot: August 4, 2026.{' '}
            <a
              href={NBA_PLAYER_CONTRACT_SNAPSHOT.sourcePage}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition hover:text-white"
            >
              View contract data source
            </a>
            . Auto-filled salaries remain editable and should be verified for
            real transactions.
          </p>
        </div>
      </div>
    </section>
  );
}
