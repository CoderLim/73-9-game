# My Game History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/history` so signed-in users can list and expand their saved `game_result` runs.

**Architecture:** Extend `game-results` with `listMyResults`; add authenticated `GET /api/game/results`; game-site page + block/component pair matching `/leaderboard`; header nav link.

**Tech Stack:** TanStack Start/Router/Query, Drizzle, Paraglide i18n, existing dark game UI tokens.

**Design:** `docs/plans/2026-07-24-my-game-history-design.md`

---

### Task 1: Types + lineup parse + listMyResults + unit tests

**Files:**

- Modify: `src/modules/game-results/types.ts`
- Modify: `src/modules/game-results/validate.ts` — add `parseLineupJson`
- Modify: `src/modules/game-results/service.ts` — add `listMyResults`
- Modify: `src/modules/game-results/validate.test.ts` — cover parse + keep existing

**Step 1:** Add types:

```ts
export type HistoryLineupPlayer = {
  pos?: string | number;
  name?: string;
  abbr?: string;
  sy?: string | number;
  cost?: number;
  rating?: number;
};

export type HistoryEntry = {
  id: string;
  pct: number;
  record: string;
  isPerfect: boolean;
  createdAt: string; // ISO
  lineup: HistoryLineupPlayer[];
};
```

**Step 2:** `parseLineupJson(raw: string): HistoryLineupPlayer[]` — try JSON.parse; if not array return `[]`; map objects keeping known keys only.

**Step 3:** `listMyResults(userId, { page, pageSize })` — count + select where userId, order createdAt desc, limit/offset; map with `decodeWinPct` + `parseLineupJson`; `createdAt` via `.toISOString()` (Date or number guard).

**Step 4:** Extend validate.test.ts; run `pnpm exec tsx src/modules/game-results/validate.test.ts`

**Step 5:** Commit `feat(game-results): list my history entries`

---

### Task 2: GET `/api/game/results`

**Files:**

- Modify: `src/routes/api/game/results.ts`

**Step 1:** Add GET handler: session required; parse page/pageSize (defaults 1/20, cap 50); call `listMyResults`; `respPage(items, total)`. Keep POST.

**Step 2:** Commit `feat(api): GET game results for current user`

---

### Task 3: History UI component + block

**Files:**

- Create: `src/components/game-history-section.tsx`
- Create: `src/blocks/game-history.tsx`

**Step 1:** Component (props only): eyebrow/title/labels; modes guest | loading | error | empty | ready; expandable rows; prev/next pagination props.

**Step 2:** Block: `useSession`; guest → no fetch; user → `useQuery` + `pageQuery('/api/game/results', { page, pageSize: 20 })`; wire i18n keys `game.history.*`.

**Step 3:** Commit `feat(ui): game history section`

---

### Task 4: Route, nav, i18n

**Files:**

- Create: `src/routes/history.tsx` (mirror `leaderboard.tsx`)
- Modify: `src/blocks/header.tsx` — History after Play (or before Leaderboard)
- Modify: `messages/en.json`, `messages/zh.json`

**Keys (both locales):**

- `game.nav.history`
- `game.history.page_title`, `page_description`, `eyebrow`, `title`
- `loading`, `error`, `empty`, `guest_title`, `guest_body`, `sign_in`, `play_cta`
- `pct`, `record`, `date`, `perfect`, `lineup`, `lineup_unavailable`
- `pos`, `player`, `team`, `cost`, `rating`
- `prev`, `next`, `page` (`{ page, pages }` or similar)

**Step 1:** Add messages EN + ZH  
**Step 2:** Route + header  
**Step 3:** `pnpm build`  
**Step 4:** Commit `feat: add /history page and nav`

---

### Task 5: Verify

- Manual: guest CTA; signed-in empty; signed-in with rows expand
- `pnpm build` passes
