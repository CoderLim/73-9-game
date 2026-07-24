# My Game History — Design

**Date:** 2026-07-24  
**Status:** Approved  
**Scope:** Logged-in users can view their past `game_result` rows on a dedicated game-site page.

## Goals

- Add a top-nav **History** page at `/history` (locale-free), next to Play / Leaderboard.
- Show each saved run: date, win %, record, perfect flag; expand a row to see the five-player lineup.
- Guests who open `/history` stay on the page and see a sign-in CTA (no hard redirect).
- Reuse existing `game_result` rows; no schema migration.

## Non-goals

- Share / `?sq=` replay from history.
- Delete, filter, or custom sort.
- Per-user dedupe on the public leaderboard.
- Claiming anonymous localStorage runs after login.
- Long SEO article blocks (basic page title + description only).

## Decisions

| Topic          | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Placement      | Dedicated `/history` + header nav (not Settings)               |
| Depth          | List + inline expand for lineup                                |
| Guests         | Stay on page; CTA → `/sign-in?callbackUrl=/history`            |
| Implementation | Extend `game-results` module + thin GET on `/api/game/results` |
| Pagination     | `page` / `pageSize` (default 20), newest first                 |

## Architecture

```
/history
  ├─ Guest: no API call → sign-in empty state
  └─ Signed in: GET /api/game/results?page=&pageSize=
       → listMyResults(userId) → PageResult<HistoryEntry>

Header / GamePageHeader ← add History link (visible to guests too)
```

```
src/modules/game-results/service.ts   # + listMyResults
src/modules/game-results/types.ts     # + HistoryEntry / lineup player type
src/routes/api/game/results.ts        # + GET (auth required)
src/routes/history.tsx                # page shell (like leaderboard)
src/blocks/game-history.tsx           # i18n + session + query
src/components/game-history-section.tsx  # pure props UI
src/blocks/header.tsx                 # nav entry
messages/en.json + zh.json            # game.history.* / game.nav.history
```

## Data & API

### Response shape

Each item:

| Field       | Notes                                                           |
| ----------- | --------------------------------------------------------------- |
| `id`        | Result id                                                       |
| `pct`       | Win % (decoded from `winPctX100`)                               |
| `record`    | e.g. `62–20`                                                    |
| `isPerfect` | Boolean                                                         |
| `createdAt` | ISO string from `createdAt`                                     |
| `lineup`    | Parsed array from `lineupJson`; never return raw `sharePayload` |

Lineup player fields (from existing snap): `pos`, `name`, `abbr`, `sy`, `cost`, `rating`. Missing fields are omitted in UI.

### `GET /api/game/results`

- Requires session; otherwise `Unauthorized` (`respErr`).
- Query: `page` (default 1), `pageSize` (default 20, cap e.g. 50).
- Scope: `WHERE userId = session.user.id`, `ORDER BY createdAt DESC`.
- Return `respData` / `respPage` as `{ items, total }` (`PageResult`).
- Existing `POST` unchanged.

### Service

```ts
listMyResults(userId: string, { page, pageSize }): Promise<PageResult<HistoryEntry>>
```

Parse `lineupJson` defensively: invalid JSON → `lineup: []` (UI shows “lineup unavailable” when empty on expand).

## UI

- Visual language matches `/leaderboard` (dark `#05050a`, orange accent, Barlow Condensed titles).
- Block/component split: block reads `m[...]` + `useSession` + Query; component is props-only.
- Row summary: datetime, win %, record, perfect badge when `isPerfect`.
- Click row → expand/collapse inline lineup table.
- States:
  1. **Guest** — copy + Sign in link (`callbackUrl=/history`).
  2. **Signed in, empty** — empty copy + Play CTA → `/`.
  3. **Signed in, data** — paginated list; loading / error one-liners like leaderboard.
- Session pending: treat as loading (avoid guest flash then content).

## Error handling

| Case                    | Behavior                                   |
| ----------------------- | ------------------------------------------ |
| Guest                   | No API; CTA only                           |
| 401                     | Same as guest (expired session)            |
| Network / 5xx           | Error label; list not a blank crash        |
| Bad / empty lineup JSON | Expand shows unavailable; summary still OK |
| Page past end           | Empty `items`, correct `total`             |

## Acceptance criteria

1. Header shows History → `/history`.
2. Guest sees sign-in prompt; never other users’ rows.
3. Signed-in user sees own runs newest-first; can expand five-player lineup.
4. Empty signed-in state links back to play (`/`).
5. Pagination works; response omits `sharePayload` and email.

## Out of scope follow-ups

- Share from a past run.
- Delete / favorite.
- Result detail route `/history/$id`.
- Perfect-run stats summary on the history page.
