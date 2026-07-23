# Game73Host Specification

## Overview

- **Target file:** `src/components/game-73-host.tsx`
- **Screenshot:** `docs/design-references/hoopsmatic.com/desktop-intro.png`
- **Interaction model:** click-driven + time-driven (delegated to embedded game)

## DOM Structure

```
div.game-73-host (fixed inset-0)
  iframe[src="/73-9-game/index.html"] (100% × 100%, border 0)
```

The embedded document is the verbatim HoopsMatic 73-9 game (nav, load, intro, game, results) served from `public/73-9-game/`.

## Computed Styles (exact values from getComputedStyle on source)

### Body (source)

- background: linear-gradient(160deg, rgb(26,26,62) 0%, rgb(10,10,26) 55%, rgb(5,5,16) 100%)
- background-attachment: fixed
- color: rgb(200, 200, 224) /_ --ink _/
- font-family: "JetBrains Mono", monospace

### Design tokens (`:root`)

- --gold: #ffd700
- --orange: #ff6b35
- --green: #34d97a
- --amber: #ffd24a
- --red: #ff6666
- --ink: #c8c8e0
- --dim: #8888aa
- --panel: #12122a
- --panel2: #0c0c1e
- --line: #2a2a52

### Host shell

- position: fixed; inset: 0; width: 100%; height: 100%; z-index: 1
- iframe: width 100%; height 100%; border: none; display: block

## States & Behaviors

Delegated to embedded game — see `docs/research/BEHAVIORS.md`.

### Host

- N/A beyond full-viewport framing; no extra chrome

## Assets

- Game bundle: `public/73-9-game/index.html` (+ CSS/JS inline)
- Data: `data.bin`, `bio.json`, `salaries.json`, `positions.json`, `accolades.json`, `records.json`
- Vendor: `public/73-9-game/vendor/pako.min.js`
- OG: `public/73-9-game/og-73-9.png`

## Text Content (verbatim)

See intro screen in embedded HTML. Key copy:

- Title: 73-9
- Subtitle: BUILD A FIVE THAT BEATS THE 2015-16 WARRIORS
- Bankroll: YOUR BANKROLL / $100.0M
- CTA: START THE WHEEL

## Responsive Behavior

- **Desktop (1440px):** Full nav; 5-col pick grid
- **Tablet (768px):** Nav burger ≤760px
- **Mobile (390px):** Stacked picks ≤560px; burger ≤480px
- Handled inside embedded CSS, not the host
