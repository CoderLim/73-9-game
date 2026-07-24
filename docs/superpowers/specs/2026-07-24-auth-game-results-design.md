# Auth + Game Results Persistence — Design

**Date:** 2026-07-24  
**Status:** Approved for planning  
**Scope:** Login-optional play; logged-in users save results and appear on a first-party leaderboard.

## Goals

- Guests can play the full game without signing in.
- Logged-in users automatically save each completed run to the site database.
- Public day / week / all-time leaderboards are served by this app (D1 + API), replacing the external Cloudflare Worker.
- Guests see a one-line note on the results screen that scores are not saved, with a link to sign in.

## Non-goals (this version)

- Personal “my history” list / detail page (schema may store lineup for later).
- Syncing anonymous localStorage games after login.
- Keeping or bridging the external `hoopsmatic-73-9-leaderboard` Worker.
- Forcing login before play.

## Decisions

| Topic             | Choice                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Persistence model | Account-backed `game_result` rows only when authenticated                         |
| Leaderboard       | First-party D1 queries; remove external Worker URL                                |
| History UI        | Persist only; no history page this version                                        |
| Guest reminder    | Results screen top, small text + sign-in link                                     |
| Architecture      | Module `game-results` + thin API routes + header/session bridge into game runtime |

## Architecture

```
Complete run → results UI
  ├─ Authenticated: POST /api/game/results → D1 insert → return refreshed boards
  └─ Guest: no save request; show save-warning + sign-in link
GET /api/game/leaderboard → render day / week / all-time boards
```

```
src/modules/game-results/service.ts   # submitResult, getLeaderboard
src/routes/api/game/results.ts        # POST (auth required)
src/routes/api/game/leaderboard.ts    # GET (public)
schema: game_result                   # all three dialect templates
GamePageHeader                        # sign-in / user menu
mount-game.js + GameApp bridge        # session-aware submit + guest tip
```

## Data model

Table `game_result` (add under Custom tables in `schema.sqlite.ts` / `schema.postgres.ts` / `schema.mysql.ts`, then `pnpm db:push` for local / D1 migrate for prod):

| Column         | Type / notes                                             |
| -------------- | -------------------------------------------------------- |
| `id`           | Primary key (text snow/uuid)                             |
| `userId`       | FK → `user.id`, required                                 |
| `winPct`       | Numeric win % vs 2015–16 Warriors (e.g. 12.34)           |
| `record`       | Display string (e.g. `58–24`), length-capped             |
| `isPerfect`    | Boolean — matched best-possible five                     |
| `lineupJson`   | JSON string snapshot of the five (for future history UI) |
| `sharePayload` | Optional JSON for `?sq=`-compatible share                |
| `createdAt`    | Timestamp                                                |

Indexes: `userId`, `createdAt`, `(winPct DESC, createdAt)` (or equivalent) to support personal queries later and leaderboard sorts.

Leaderboards are computed on read (no separate summary table in v1):

- **Day / week / all-time:** top N rows by `winPct` (tie-break `createdAt`), filtered by `createdAt` window.
- Display name comes from joined `user.name` (never email on the public board).

## API

### `POST /api/game/results`

- Requires session; otherwise `401` / `respErr`.
- Body (zod-validated): `winPct`, `record`, `isPerfect`, `lineup` (or `lineupJson`), optional `sharePayload`.
- Server validates ranges and string lengths; ignores any client-supplied rank/name.
- Inserts `game_result`, returns `{ result, board }` where `board` matches the shape the results UI needs for day/week/alltime (and optional perfect summary if kept).
- Optional: min-interval rate limit per user to reduce spam.

### `GET /api/game/leaderboard`

- Public.
- Returns day / week / all-time top entries: `{ name, winPct, record, createdAt }` (and perfect aggregates only if UI still needs them).
- On failure, client shows “leaderboard unavailable” without blocking results.

## UI & game integration

### Header

- Extend `GamePageHeader` with auth chrome on the right:
  - Guest: “Sign in” → `/sign-in?callbackUrl=/` (or current localized home).
  - Signed in: compact avatar / name menu (sign out via existing `authClient`).
- Play remains ungated.

### Results guest tip

- When session is absent, inject a small line at the **top of the results panel**, e.g. “Not signed in — this run will not be saved.” with “Sign in to save” linking to sign-in with callback that returns to the current page (preserve `?sq=` / share query when present).

### Runtime / leaderboard swap

- Remove hardcoded `LB_API` pointing at `hoopsmatic-73-9-leaderboard...`.
- Bridge auth from React (`useSession`) into `mountGame73` via options / callbacks / `data-*` so the runtime knows:
  - whether to POST after a run;
  - whether to show the guest tip;
  - display name for the board (server still authoritative on save).
- Authenticated path: after season result, `POST /api/game/results`, render returned board.
- Guest path: no POST; may still `GET /api/game/leaderboard` for public scores.
- Drop localStorage name-claim flow (`h99_name` / claim-to-name) for the first-party board; board entries are account names only.
- Perfect-squad / badge panels that depended on the Worker: **hide in v1** (keep `isPerfect` on the row for later). Do not call any external Worker.

## Error handling

| Case                 | Behavior                                                 |
| -------------------- | -------------------------------------------------------- |
| Save network / 5xx   | Results stay visible; non-blocking note that save failed |
| Unauthenticated POST | API 401; UI keeps guest tip only                         |
| Leaderboard GET fail | “Leaderboard unavailable”; results unaffected            |
| Rate limited         | Soft fail same as save error                             |

## Security

- Never trust client rank or display name for persistence.
- Cap payload sizes (`record`, lineup JSON, share payload).
- Public leaderboard omits email and internal ids beyond what the UI needs (prefer opaque result id only if required).

## Acceptance criteria

1. Guest can finish a full run; results show the unsaved-score tip.
2. Signed-in user finishing a run creates a `game_result` row and appears on the public board.
3. Header supports sign-in / sign-out; return to home continues play.
4. No requests to the external leaderboard Worker.
5. No “my history” page in this version.

## Out of scope follow-ups

- Dedicated “My results” route listing past `game_result` rows.
- Claiming/migrating pre-account anonymous plays.
- Richer perfect-run / badge leaderboards parity with the old Worker.
