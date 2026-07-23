# IntroScreen Specification

## Overview

- **Target:** `#intro` in `public/73-9-game/index.html`
- **Screenshot:** `docs/design-references/hoopsmatic.com/desktop-intro.png`
- **Interaction model:** click-driven

## DOM Structure

```
#intro
  .logo-main "73-9"
  .subtitle
  .budget-hero > .big#introBudget
  .rules > div×5 (.num + text)
  #introFine (optional fine print)
  button#startBtn.btn "Start the wheel"
```

## Computed Styles (exact from game.css)

### .logo-main

- font-family: Oswald, sans-serif
- font-size: 52px; font-weight: 700; letter-spacing: 6px; text-transform: uppercase
- background: linear-gradient(135deg, #ff6b35, #ffd700, #ff6b35); background-size 200%
- -webkit-background-clip: text; transparent fill; animation: shimmer 3s ease-in-out infinite

### .subtitle

- font-size: 12px; color: var(--dim); letter-spacing: 3px; text-transform: uppercase
- font-family: Oswald; margin: 10px 0 40px

### .btn (#startBtn)

- font-family: Oswald; font-weight: 700; letter-spacing: 2px; text-transform: uppercase
- padding: 14px 30px; font-size: 15px; border-radius: 8px
- background: linear-gradient(135deg, var(--orange), var(--gold)); color: #1a1006
- box-shadow: 0 6px 18px rgba(255,107,53,.25)
- transition: transform .12s, box-shadow .12s

### .rules .num

- Orange circular badge numbering 1–5
- Rule `<b>` accents use gold/amber emphasis

## States & Behaviors

### Start

- **Trigger:** click `#startBtn` → `startGame()`
- **State A:** `#intro` visible
- **State B:** `#intro.hidden`, `#game` shown

### Hover .btn

- transform / box-shadow lift (0.12s)

## Text Content (verbatim)

1. The wheel spins to a random **team-season** (1990 to today).
2. Sign **one player** from it. Each costs what their deal would be worth at the **2026 cap**.
3. Five spins, five signings. You can only sign players you can **still afford**.
4. Blow it early and you'll be scraping minimum-salary scrubs by the fifth slot.
5. We simulate an **82-game season**, then show how often your five would **beat the 2015-16 Warriors** (plus the best squad you could've signed).

CTA: START THE WHEEL

## Responsive Behavior

- Logo scales down on narrow viewports (see `@media(max-width:560px)` in game.css)
