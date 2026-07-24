# Auth + Game Results Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optional login; authenticated runs save to D1 and feed a first-party day/week/all-time leaderboard; guests keep playing with a results-screen tip that scores are not saved.

**Architecture:** New `game_result` table + `src/modules/game-results` service; thin `/api/game/results` (auth POST) and `/api/game/leaderboard` (public GET). React header gets session chrome; `GameApp` passes auth + fetch callbacks into `mountGame73`, which drops the external Worker and posts/renders against our APIs.

**Tech Stack:** TanStack Start, better-auth (`useSession` / `getAuth`), Drizzle (sqlite/postgres/mysql templates + local `schema.ts`), D1 in production, existing `respData`/`respErr` + `enforceMinIntervalRateLimit`.

**Spec:** `docs/superpowers/specs/2026-07-24-auth-game-results-design.md`

---

## File map

| File                                                | Responsibility                                                 |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `src/config/db/schema.sqlite.ts` (+ postgres/mysql) | Define `game_result`                                           |
| `src/config/db/schema.ts`                           | Working copy (gitignored) — refresh via `pnpm db:setup` / push |
| `src/modules/game-results/types.ts`                 | Shared DTOs (`LeaderboardBoard`, submit input)                 |
| `src/modules/game-results/validate.ts`              | Pure validation + winPct encoding                              |
| `src/modules/game-results/windows.ts`               | Day/week window start helpers (UTC)                            |
| `src/modules/game-results/service.ts`               | `submitResult`, `getLeaderboard`                               |
| `src/modules/game-results/validate.test.ts`         | Assert-based unit checks (no vitest)                           |
| `src/routes/api/game/results.ts`                    | Authenticated POST                                             |
| `src/routes/api/game/leaderboard.ts`                | Public GET                                                     |
| `src/components/game-page-header.tsx`               | Auth slot (props only)                                         |
| `src/blocks/header.tsx`                             | Wire `useSession` + i18n into header                           |
| `messages/en.json` + `messages/zh.json`             | Sign-in / guest tip strings                                    |
| `src/game/runtime/mount-game.d.ts`                  | Extended mount options                                         |
| `src/game/GameApp.tsx`                              | Session bridge + API callbacks                                 |
| `src/game/runtime/mount-game.js`                    | Replace Worker LB; guest tip; hide perfect/badges              |
| `src/game/game-73.css`                              | Guest tip styles                                               |

**XSS rule for this plan:** Never assign untrusted strings via HTML injection. Guest tip and save-failed copy must use `textContent` / `createElement('a')` with `href` set from a known app path. Existing `lbFmt` already uses `escapeHtmlS` for board names — keep that.

---

### Task 1: Schema — `game_result`

**Files:**

- Modify: `src/config/db/schema.sqlite.ts`
- Modify: `src/config/db/schema.postgres.ts`
- Modify: `src/config/db/schema.mysql.ts`

- [ ] **Step 1: Add table to SQLite template**

Append near Custom tables / after invite codes. Store win % as integer **hundredths** (`1234` = `12.34`):

```ts
export const gameResult = table(
  'game_result',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Win % × 100 (e.g. 1234 → 12.34%). */
    winPctX100: integer('win_pct_x100').notNull(),
    record: text('record').notNull(),
    isPerfect: integer('is_perfect', { mode: 'boolean' })
      .notNull()
      .default(false),
    lineupJson: text('lineup_json').notNull().default('[]'),
    sharePayload: text('share_payload'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('idx_game_result_user').on(t.userId),
    index('idx_game_result_created').on(t.createdAt),
    index('idx_game_result_pct_created').on(t.winPctX100, t.createdAt),
  ]
);

export type GameResult = typeof gameResult.$inferSelect;
export type NewGameResult = typeof gameResult.$inferInsert;
```

- [ ] **Step 2: Mirror in Postgres template**

Same fields; use `boolean('is_perfect')`, `timestamp('created_at').defaultNow()`, `integer('win_pct_x100')`.

- [ ] **Step 3: Mirror in MySQL template**

Same fields; use `boolean('is_perfect')`, `timestamp('created_at').defaultNow()`, `int('win_pct_x100')`.

- [ ] **Step 4: Refresh local schema + push**

```bash
pnpm db:setup
pnpm db:push
```

Expected: table `game_result` exists locally.

- [ ] **Step 5: Commit**

```bash
git add src/config/db/schema.sqlite.ts src/config/db/schema.postgres.ts src/config/db/schema.mysql.ts
git commit -m "feat(db): add game_result table for saved runs"
```

---

### Task 2: Pure validation + window helpers (TDD)

**Files:**

- Create: `src/modules/game-results/types.ts`
- Create: `src/modules/game-results/validate.ts`
- Create: `src/modules/game-results/windows.ts`
- Create: `src/modules/game-results/validate.test.ts`

- [ ] **Step 1: Write failing tests**

`src/modules/game-results/validate.test.ts`:

```ts
import assert from 'node:assert/strict';

import { decodeWinPct, encodeWinPct, sanitizeSubmitInput } from './validate';
import { windowStartUtc } from './windows';

function run() {
  assert.equal(encodeWinPct(12.34), 1234);
  assert.equal(decodeWinPct(1234), 12.34);

  const ok = sanitizeSubmitInput({
    winPct: 12.345,
    record: '58–24',
    isPerfect: true,
    lineup: [{ name: 'A', pos: 'PG' }],
    sharePayload: { v: 1 },
  });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.value.winPctX100, 1235);
    assert.equal(ok.value.record, '58–24');
    assert.equal(ok.value.isPerfect, true);
  }

  const bad = sanitizeSubmitInput({
    winPct: -1,
    record: 'x',
    isPerfect: false,
  });
  assert.equal(bad.ok, false);

  const day = windowStartUtc('day', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(day!.toISOString(), '2026-07-24T00:00:00.000Z');

  const week = windowStartUtc('week', new Date('2026-07-24T15:00:00.000Z'));
  assert.equal(week!.toISOString(), '2026-07-20T00:00:00.000Z');

  assert.equal(windowStartUtc('alltime', new Date()), null);

  console.log('game-results validate tests: ok');
}

run();
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm exec tsx src/modules/game-results/validate.test.ts
```

Expected: cannot resolve module.

- [ ] **Step 3: Implement types + validate + windows**

`types.ts`:

```ts
export type LeaderboardEntry = {
  name: string;
  pct: number;
  record: string;
};

export type LeaderboardBoard = {
  day: LeaderboardEntry[];
  week: LeaderboardEntry[];
  alltime: LeaderboardEntry[];
};

export type SubmitResultInput = {
  userId: string;
  winPctX100: number;
  record: string;
  isPerfect: boolean;
  lineupJson: string;
  sharePayload: string | null;
};
```

`validate.ts`:

```ts
import type { SubmitResultInput } from './types';

const RECORD_MAX = 32;
const LINEUP_JSON_MAX = 8_000;
const SHARE_JSON_MAX = 4_000;

export function encodeWinPct(winPct: number): number {
  return Math.round(Number(winPct) * 100);
}

export function decodeWinPct(winPctX100: number): number {
  return winPctX100 / 100;
}

export function sanitizeSubmitInput(
  body: unknown
):
  | { ok: true; value: Omit<SubmitResultInput, 'userId'> }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid body' };
  }
  const b = body as Record<string, unknown>;
  const winPct = Number(b.winPct);
  if (!Number.isFinite(winPct) || winPct < 0 || winPct > 100) {
    return { ok: false, error: 'Invalid winPct' };
  }
  const record = typeof b.record === 'string' ? b.record.trim() : '';
  if (!record || record.length > RECORD_MAX) {
    return { ok: false, error: 'Invalid record' };
  }
  const isPerfect = Boolean(b.isPerfect);
  let lineupJson = '[]';
  const lineup = b.lineup ?? b.lineupJson;
  if (lineup !== undefined) {
    try {
      lineupJson = typeof lineup === 'string' ? lineup : JSON.stringify(lineup);
    } catch {
      return { ok: false, error: 'Invalid lineup' };
    }
    if (lineupJson.length > LINEUP_JSON_MAX) {
      return { ok: false, error: 'lineup too large' };
    }
  }
  let sharePayload: string | null = null;
  if (b.sharePayload !== undefined && b.sharePayload !== null) {
    try {
      sharePayload =
        typeof b.sharePayload === 'string'
          ? b.sharePayload
          : JSON.stringify(b.sharePayload);
    } catch {
      return { ok: false, error: 'Invalid sharePayload' };
    }
    if (sharePayload.length > SHARE_JSON_MAX) {
      return { ok: false, error: 'sharePayload too large' };
    }
  }
  return {
    ok: true,
    value: {
      winPctX100: encodeWinPct(winPct),
      record,
      isPerfect,
      lineupJson,
      sharePayload,
    },
  };
}
```

`windows.ts`:

```ts
/** UTC window start. `alltime` → null (no lower bound). */
export function windowStartUtc(
  window: 'day' | 'week' | 'alltime',
  now: Date = new Date()
): Date | null {
  if (window === 'alltime') return null;
  const d = new Date(now);
  if (window === 'day') {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
  }
  const day = d.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate() - daysFromMonday
    )
  );
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm exec tsx src/modules/game-results/validate.test.ts
```

Expected: `game-results validate tests: ok`

- [ ] **Step 5: Commit**

```bash
git add src/modules/game-results/
git commit -m "feat(game-results): add validation and leaderboard window helpers"
```

---

### Task 3: Service — submit + leaderboard

**Files:**

- Create: `src/modules/game-results/service.ts`

- [ ] **Step 1: Implement service**

```ts
import { desc, eq, gte } from 'drizzle-orm';

import { db } from '@/core/db';
import { gameResult, user } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

import type {
  LeaderboardBoard,
  LeaderboardEntry,
  SubmitResultInput,
} from './types';
import { decodeWinPct } from './validate';
import { windowStartUtc } from './windows';

const TOP_N = 10;

async function topEntries(since: Date | null): Promise<LeaderboardEntry[]> {
  const base = db()
    .select({
      name: user.name,
      winPctX100: gameResult.winPctX100,
      record: gameResult.record,
    })
    .from(gameResult)
    .innerJoin(user, eq(gameResult.userId, user.id));

  const rows = since
    ? await base
        .where(gte(gameResult.createdAt, since))
        .orderBy(desc(gameResult.winPctX100), desc(gameResult.createdAt))
        .limit(TOP_N)
    : await base
        .orderBy(desc(gameResult.winPctX100), desc(gameResult.createdAt))
        .limit(TOP_N);

  return rows.map((r) => ({
    name: r.name,
    pct: decodeWinPct(r.winPctX100),
    record: r.record,
  }));
}

export async function getLeaderboard(
  now: Date = new Date()
): Promise<LeaderboardBoard> {
  const [day, week, alltime] = await Promise.all([
    topEntries(windowStartUtc('day', now)),
    topEntries(windowStartUtc('week', now)),
    topEntries(windowStartUtc('alltime', now)),
  ]);
  return { day, week, alltime };
}

export async function submitResult(input: SubmitResultInput): Promise<{
  id: string;
  board: LeaderboardBoard;
}> {
  const id = getUuid();
  await db().insert(gameResult).values({
    id,
    userId: input.userId,
    winPctX100: input.winPctX100,
    record: input.record,
    isPerfect: input.isPerfect,
    lineupJson: input.lineupJson,
    sharePayload: input.sharePayload,
  });
  return { id, board: await getLeaderboard() };
}
```

- [ ] **Step 2: Ensure `schema.ts` exports `gameResult`**

```bash
pnpm db:setup
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/game-results/service.ts
git commit -m "feat(game-results): submitResult and getLeaderboard services"
```

---

### Task 4: API routes

**Files:**

- Create: `src/routes/api/game/results.ts`
- Create: `src/routes/api/game/leaderboard.ts`

- [ ] **Step 1: POST `/api/game/results`**

```ts
import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { submitResult } from '@/modules/game-results/service';
import { sanitizeSubmitInput } from '@/modules/game-results/validate';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 5_000,
      keyPrefix: 'game-result-submit',
      extraKey: session.user.id,
    });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = sanitizeSubmitInput(body);
    if (!parsed.ok) return respErr(parsed.error);

    const { id, board } = await submitResult({
      userId: session.user.id,
      ...parsed.value,
    });
    return respData({ id, board });
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/game/results')({
  server: { handlers: { POST } },
});
```

- [ ] **Step 2: GET `/api/game/leaderboard`**

```ts
import { createFileRoute } from '@tanstack/react-router';

import { getLeaderboard } from '@/modules/game-results/service';
import { respData, respErr } from '@/lib/resp';

async function GET() {
  try {
    return respData(await getLeaderboard());
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/game/leaderboard')({
  server: { handlers: { GET } },
});
```

- [ ] **Step 3: Smoke (dev server up)**

```bash
curl -s http://localhost:3000/api/game/leaderboard | head -c 400
curl -s -X POST http://localhost:3000/api/game/results \
  -H 'content-type: application/json' \
  -d '{"winPct":10,"record":"40-42","isPerfect":false}'
```

Expected: GET `code: 0`; POST without cookie → Unauthorized.

- [ ] **Step 4: Commit**

```bash
git add src/routes/api/game/
git commit -m "feat(api): game results submit and leaderboard endpoints"
```

---

### Task 5: Header auth chrome + i18n

**Files:**

- Modify: `src/components/game-page-header.tsx`
- Modify: `src/blocks/header.tsx`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Add message keys**

`en.json`:

```json
"game.auth.sign_in": "Sign in",
"game.auth.sign_out": "Sign out",
"game.auth.guest_tip": "Not signed in — this run will not be saved.",
"game.auth.sign_in_to_save": "Sign in to save",
"game.auth.save_failed": "Could not save this run. Try again later."
```

`zh.json`:

```json
"game.auth.sign_in": "登录",
"game.auth.sign_out": "退出登录",
"game.auth.guest_tip": "未登录，本局战绩不会保存。",
"game.auth.sign_in_to_save": "登录后保存",
"game.auth.save_failed": "战绩暂未保存，请稍后重试。"
```

- [ ] **Step 2: Extend `GamePageHeader` with auth props**

```tsx
auth?: {
  status: 'loading' | 'guest' | 'user';
  signInHref: string;
  signInLabel: string;
  signOutLabel: string;
  userName?: string;
  userImage?: string | null;
  onSignOut?: () => void;
};
```

Right-side UI:

- `guest`: `Link` to `signInHref` with `signInLabel`
- `user`: show `userName` + button that calls `onSignOut`
- No `useSession` inside the component (props only)

- [ ] **Step 3: Wire in `Header` block**

```tsx
import { signOut, useSession } from '@/core/auth/client';
import { m } from '@/paraglide/messages.js';
import { GamePageHeader } from '@/components/game-page-header';

export function Header() {
  const { data: session, isPending } = useSession();
  const status = isPending ? 'loading' : session?.user ? 'user' : 'guest';

  return (
    <GamePageHeader
      brand={m['game.brand']()}
      navLinks={[
        { href: '#play', label: m['game.nav.play'](), active: true },
        { href: '#about', label: m['game.nav.about']() },
        { href: '#highlights', label: m['game.nav.highlights']() },
      ]}
      auth={{
        status,
        signInHref: '/sign-in?callbackUrl=/',
        signInLabel: m['game.auth.sign_in'](),
        signOutLabel: m['game.auth.sign_out'](),
        userName: session?.user?.name,
        userImage: session?.user?.image,
        onSignOut: () => {
          void signOut();
        },
      }}
    />
  );
}
```

- [ ] **Step 4: Manual check** — guest sees Sign in; after login, name + sign out.

- [ ] **Step 5: Commit**

```bash
git add src/components/game-page-header.tsx src/blocks/header.tsx messages/en.json messages/zh.json
git commit -m "feat(ui): add sign-in chrome to game header"
```

---

### Task 6: Mount options + React bridge

**Files:**

- Modify: `src/game/runtime/mount-game.d.ts`
- Modify: `src/game/GameApp.tsx`

- [ ] **Step 1: Extend mount types**

```ts
export type GameLeaderboardBoard = {
  day: Array<{ name: string; pct: number; record: string }>;
  week: Array<{ name: string; pct: number; record: string }>;
  alltime: Array<{ name: string; pct: number; record: string }>;
};

export type MountGame73Auth = {
  isAuthenticated: boolean;
  signInHref: string;
  guestTip: string;
  signInToSaveLabel: string;
  saveFailedText: string;
};

export type MountGame73Options = {
  search?: string;
  auth?: MountGame73Auth;
  fetchLeaderboard?: () => Promise<GameLeaderboardBoard | null>;
  submitResult?: (payload: {
    winPct: number;
    record: string;
    isPerfect: boolean;
    lineup: unknown;
    sharePayload: unknown;
  }) => Promise<{ board: GameLeaderboardBoard } | null>;
};

export function mountGame73(
  root: HTMLElement,
  opts?: MountGame73Options
): () => void;
```

- [ ] **Step 2: Wire `GameApp`**

Pass plain strings (not HTML). Runtime builds the tip DOM with `textContent` + safe `a.href`.

```tsx
import { memo, useEffect, useRef } from 'react';
import { mountGame73 } from '@/game/runtime/mount-game';
import {
  GameBoard,
  IntroScreen,
  LoadScreen,
  ResultsPanel,
} from '@/game/screens';

import { useSession } from '@/core/auth/client';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

import '@/game/game-73.css';

function GameAppImpl() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    const root = rootRef.current;
    if (!root) return;

    const callback = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    const signInHref = `/sign-in?callbackUrl=${callback}`;

    return mountGame73(root, {
      search: window.location.search,
      auth: {
        isAuthenticated: Boolean(session?.user),
        signInHref,
        guestTip: m['game.auth.guest_tip'](),
        signInToSaveLabel: m['game.auth.sign_in_to_save'](),
        saveFailedText: m['game.auth.save_failed'](),
      },
      fetchLeaderboard: async () => {
        try {
          return await apiGet('/api/game/leaderboard');
        } catch {
          return null;
        }
      },
      submitResult: async (payload) => {
        try {
          const data = await apiPost<{
            board: import('./runtime/mount-game').GameLeaderboardBoard;
          }>('/api/game/results', payload);
          return { board: data.board };
        } catch {
          return null;
        }
      },
    });
  }, [isPending, session?.user?.id]);

  return (
    <div className="game-73-root" ref={rootRef}>
      <div className="wrap">
        <LoadScreen />
        <IntroScreen />
        <GameBoard />
        <ResultsPanel />
      </div>
    </div>
  );
}

export const GameApp = memo(GameAppImpl, () => true);
```

- [ ] **Step 3: Commit**

```bash
git add src/game/runtime/mount-game.d.ts src/game/GameApp.tsx
git commit -m "feat(game): bridge session and result APIs into GameApp"
```

---

### Task 7: Replace external leaderboard in `mount-game.js`

**Files:**

- Modify: `src/game/runtime/mount-game.js`
- Modify: `src/game/game-73.css`

- [ ] **Step 1: Read options at mount**

```js
const auth = (opts && opts.auth) || {
  isAuthenticated: false,
  signInHref: '/sign-in?callbackUrl=/',
  guestTip: '',
  signInToSaveLabel: '',
  saveFailedText: 'Could not save this run.',
};
const fetchLeaderboard =
  opts && typeof opts.fetchLeaderboard === 'function'
    ? opts.fetchLeaderboard
    : null;
const submitResultFn =
  opts && typeof opts.submitResult === 'function' ? opts.submitResult : null;
```

- [ ] **Step 2: Remove Worker constant**

Delete `LB_API = 'https://hoopsmatic-73-9-leaderboard...'`. Grep and remove live uses of `LB_API` / `_lbBase()`.

- [ ] **Step 3: Safe guest tip helper**

```js
function mountGuestTip(parent) {
  if (auth.isAuthenticated || !auth.guestTip) return;
  const tip = document.createElement('div');
  tip.className = 'auth-guest-tip';
  const text = document.createElement('span');
  text.textContent = auth.guestTip + ' ';
  tip.appendChild(text);
  const link = document.createElement('a');
  link.className = 'auth-save-link';
  link.textContent = auth.signInToSaveLabel || 'Sign in';
  // Only allow relative same-origin auth paths
  const href = auth.signInHref || '/sign-in';
  link.href = href.startsWith('/sign-in') ? href : '/sign-in';
  tip.appendChild(link);
  parent.insertBefore(tip, parent.firstChild);
}
```

Call `mountGuestTip($('results'))` right after results content is set (or prepend to the results element before showing).

- [ ] **Step 4: Rewrite `lbInit`**

Always emit only `#lbPanel` in results HTML (no perfect/badges/set-name rows).

```js
async function lbInit(pct, record, isPerfect, lineup, sharePayload) {
  const panel = document.getElementById('lbPanel');
  if (!panel) return;
  // Use textContent for loading/unavailable states
  panel.replaceChildren();
  const hdr = document.createElement('div');
  hdr.className = 'lb-hdr';
  hdr.textContent = 'Best win % vs the 2015-16 Warriors';
  const loading = document.createElement('div');
  loading.className = 'lb-rows lb-loading';
  loading.textContent = 'loading…';
  panel.append(hdr, loading);

  let board = null;
  if (auth.isAuthenticated && submitResultFn) {
    const res = await submitResultFn({
      winPct: Number(Number(pct).toFixed(2)),
      record,
      isPerfect: !!isPerfect,
      lineup: lineup || [],
      sharePayload: sharePayload || null,
    });
    if (res && res.board) board = res.board;
    else {
      const fail = document.createElement('div');
      fail.className = 'auth-save-failed';
      fail.textContent = auth.saveFailedText;
      panel.parentNode && panel.parentNode.insertBefore(fail, panel);
    }
  }
  if (!board && fetchLeaderboard) {
    try {
      board = await fetchLeaderboard();
    } catch (e) {
      board = null;
    }
  }
  if (!board) {
    loading.textContent = 'leaderboard unavailable right now';
    return;
  }
  lbRenderBoard(panel, board);
}
```

Keep `lbRenderBoard` / `lbFmt` (they already escape names). Update call site after `shareCardData` is set to pass lineup + share snapshot.

- [ ] **Step 5: CSS**

```css
.auth-guest-tip {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.4;
  color: #90a1b9;
  text-align: center;
}
.auth-guest-tip .auth-save-link {
  color: #fd6a00;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.auth-save-failed {
  margin: 0 0 8px;
  font-size: 12px;
  color: #f0a060;
  text-align: center;
}
```

- [ ] **Step 6: Manual acceptance**

1. Guest finish → tip via text nodes; GET leaderboard only; no Worker host.
2. Signed-in finish → POST `/api/game/results`; name on board.
3. `pnpm build` passes.

- [ ] **Step 7: Commit**

```bash
git add src/game/runtime/mount-game.js src/game/game-73.css
git commit -m "feat(game): first-party leaderboard and guest save tip"
```

---

### Task 8: Final verification

- [ ] **Step 1:** `pnpm exec tsx src/modules/game-results/validate.test.ts` → ok
- [ ] **Step 2:** `pnpm build` → success
- [ ] **Step 3:** `rg -n "hoopsmatic-73-9-leaderboard|LB_API" src/` → no live matches
- [ ] **Step 4:** Commit any leftover related fixes if needed

---

## Spec coverage

| Spec item                    | Task               |
| ---------------------------- | ------------------ |
| `game_result` table          | 1                  |
| submit + leaderboard service | 2–3                |
| POST/GET APIs + rate limit   | 4                  |
| Header sign-in / out         | 5                  |
| Guest tip on results         | 5–7                |
| Replace external Worker      | 7                  |
| Hide perfect/badges v1       | 7                  |
| Soft-fail save / LB errors   | 7                  |
| No history page              | omitted on purpose |
| Acceptance 1–5               | 8                  |
