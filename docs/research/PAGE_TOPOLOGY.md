# Page Topology — hoopsmatic.com/73-9-game

## Overview

Single-page interactive NBA roster-building game. Vanilla HTML/CSS/JS (no React framework on source). Fonts: **Oswald** (display) + **JetBrains Mono** (UI/body). Data: `data.bin` (~16MB gzip JSON via pako) + auxiliary JSON files.

## Visual order (top → bottom)

| #   | Section         | Element ID    | Positioning                  | Interaction model                                        |
| --- | --------------- | ------------- | ---------------------------- | -------------------------------------------------------- |
| 0   | Site nav        | `#hm-nav`     | Sticky/fixed top (white bar) | Click links; burger on mobile                            |
| 1   | Load screen     | `#loadScreen` | Full viewport (initial)      | Time-driven progress while fetching `data.bin`           |
| 2   | Intro           | `#intro`      | Flow (replaces load)         | Click **Start the wheel**                                |
| 3   | Game HUD + reel | `#game`       | Flow                         | Click **Spin** / **Re-spin**; click `.pick-card` to sign |
| 4   | Results         | `#results`    | Flow (replaces game)         | Click Share / Challenge / Play again                     |
| 5   | App footer      | `.app-footer` | Flow bottom                  | mailto links                                             |

## Overlays / modals (z-index layers)

- Share modal (`.share-modal`, z-index 10000) — click-driven
- Burger menu (`#hm-burger-menu`) — click-driven
- Confetti canvas (`#confettiCanvas`) — time-driven on results
- Leaderboard / challenge panels — rendered into `#results` HTML

## Screen state machine

```
loadScreen → intro → game (×5 spin/sign cycles) → results
                ↑__________________________________|
                         (Play again / Start over)
```

## Layout

- `.wrap` max-width **920px**, centered, padding `18px 14px 60px`
- Body background: fixed linear gradient `160deg, #1a1a3e → #0a0a1a → #050510`
- No Lenis / Locomotive — native scroll
- No images in intro; team logos from ESPN CDN during game; confetti via canvas

## Clone strategy

Source is a ~200KB monolithic game + binary dataset. Pixel-perfect clone ships the original HTML/CSS/JS under `public/73-9-game/` (assets relative), with the TanStack Start homepage embedding that experience full-viewport. Leaderboard Workers API remains optional (graceful offline).
