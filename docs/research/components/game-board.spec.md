# GameBoard Specification

## Overview

- **Target:** `#game` in `public/73-9-game/index.html`
- **Screenshots:** `desktop-game-reel.png`, `desktop-pick-grid.png`, `desktop-after-sign.png`
- **Interaction model:** click-driven + time-driven reel animation

## DOM Structure

```
#game
  .hud
    .hud-left (.hud-title, .restart-btn, #slotDots)
    #capPill (remaining bankroll)
  #strip (signed player slots PG–C)
  .reel-stage
    #reelHint
    .reel-window > .reel-marker + #reelTrack
    .spin-row > #spinBtn + #respinBtn
  #landed (team header + pick columns after spin)
```

## Computed Styles (key)

### .hud-title

- Oswald gradient text similar to logo (smaller)

### #capPill

- Panel with green remaining amount (`var(--green)`)

### .reel-window

- Bordered stage; yellow vertical marker; horizontal `#reelTrack` of team tiles

### .pick-card

- background: linear-gradient(160deg,#16162f,#0e0e22)
- border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px
- hover: translateY(-3px); border-color: var(--gold); box-shadow: 0 8px 20px rgba(255,215,0,.12)

### Slot strip

- Empty: dashed border + position abbr
- Filled: solid accent border, name, team/year, salary, remove X

## States & Behaviors

### Spin

- **Trigger:** click `#spinBtn`
- **Behavior:** reel animates, lands on team-season, shows pick grid
- **Hint text:** "Spin the wheel to draw a team" → team name → "Slot N of 5 — sign any player"

### Re-spin

- **Trigger:** `#respinBtn` — costs $10M from bankroll

### Sign

- **Trigger:** click `.pick-card`
- Advances slot dots; fills strip; returns to reel for next slot or finishes → `showResults()`

### Start over

- `confirmRestart()`

## Assets

- Team logos: `https://a.espncdn.com/i/teamlogos/nba/500/{abbr}.png` (+ Sonics Wikimedia fallback)

## Responsive Behavior

- Pick grid collapses at max-width 560px
