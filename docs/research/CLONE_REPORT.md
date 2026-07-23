# Clone Report — hoopsmatic.com/73-9-game

## Summary

Pixel-faithful clone of the HoopsMatic **73-9 Game** interactive experience, shipped as the original vanilla HTML/CSS/JS bundle under `public/73-9-game/` and framed by TanStack Start at `/`.

## Deliverables

| Item                  | Count / status                                               |
| --------------------- | ------------------------------------------------------------ |
| Spec files            | 4 (`game-73-host`, `site-nav`, `intro-screen`, `game-board`) |
| React host components | 1 (`Game73Host`)                                             |
| Research docs         | `PAGE_TOPOLOGY.md`, `BEHAVIORS.md`, `DESIGN_TOKENS.md`       |
| Design references     | 10+ screenshots (original + local clone)                     |
| Game assets           | 9 files (~19.5 MB) including `data.bin`                      |
| Build                 | `pnpm build` ✅                                              |

## How to run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000/ (iframe host) or http://localhost:3000/73-9-game/ (direct game).

## Visual QA

- Intro screen: matches original (logo shimmer, bankroll, rules, CTA)
- Game reel + slot strip: matches after Start
- Pick grid after Spin: matches (position columns, MPG badges, salaries)
- Local data load from `/73-9-game/data.bin` works

## Known gaps / limitations

1. **`records.json`** — upstream returned 502/404; shipped as `{}`. Win-% quality factor stays neutral (same as original when file missing).
2. **Leaderboard / friend-challenge Workers API** — still points at HoopsMatic Cloudflare Worker; offline/local runs degrade gracefully (no live boards).
3. **Team logos** — still loaded from ESPN CDN at runtime (same as original).
4. **Architecture** — game engine kept as verbatim static bundle (not rewritten into React) for pixel + simulation fidelity; React shell hosts it full-viewport.
5. **Git remotes** — none configured yet. Provide your repo URL to set `origin`; template upstream can be added as `shipany-ai/shipany-tanstack`.

## Phase 6

Skipped (no content brief provided).
