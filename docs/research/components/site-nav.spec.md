# SiteNav (hm-nav) Specification

## Overview

- **Target:** Embedded in `public/73-9-game/index.html` (`#hm-nav`)
- **Screenshot:** `docs/design-references/hoopsmatic.com/desktop-intro.png`
- **Interaction model:** click-driven

## DOM Structure

```
nav#hm-nav
  a.hm-nav-brand (basketball SVG + "HoopsMatic")
  a.hm-nav-link × N (priority + secondary)
  button#hm-nav-burger
  div#hm-burger-menu (mobile links)
```

## Computed Styles (from nav.css / source)

### Nav bar

- White / light chrome bar across top
- Brand: inline SVG basketball `#E8531A` + "HoopsMatic" text
- Active link ("73-9 Game"): blue underline accent
- Breakpoints: burger at max-width 760px; tighter at 480px

## States & Behaviors

### Burger open/close

- **Trigger:** click `#hm-nav-burger`
- **State A:** menu hidden
- **State B:** `#hm-burger-menu` visible with secondary links
- **Implementation:** original page JS / CSS classes

### Hover

- Nav links: color/underline affordance

## Assets

- Inline basketball SVG in brand link

## Text Content (verbatim)

HoopsMatic · Trade Machine · 73-9 Game · Roster Manager · Content Stream · NBA Polymarket · Salary Finder · Contracts · Compare Players · Matchup Database · (+ burger secondary tools)

## Responsive Behavior

- **Desktop:** horizontal link row
- **≤760px:** burger for overflow/secondary
- **≤480px:** compact burger layout
