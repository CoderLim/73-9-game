# Behaviors — hoopsmatic.com/73-9-game

## Scroll sweep

- Header (`#hm-nav`): stays as site chrome; **no** shrink/shadow transition observed on scroll.
- Page height is modest on intro (~778px at 1200×733); game pick grid can grow taller.
- No scroll-snap, no parallax, no IntersectionObserver-driven section tabs.
- No Lenis / smooth-scroll library (`.lenis` absent).

## Click sweep

| Control                             | Effect                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| **Start the wheel** (`#startBtn`)   | Hides `#intro`, shows `#game`, initializes roster slots / reel                        |
| **Spin** (`#spinBtn`)               | Animates `#reelTrack` horizontal reel; lands on random team-season; reveals pick grid |
| **Re-spin for $10M** (`#respinBtn`) | Costs $10M from bankroll; re-spins current slot                                       |
| **`.pick-card`**                    | Signs player into current slot; advances slot dots; returns to reel or finishes       |
| **Start over** (`.restart-btn`)     | `confirmRestart()` — reset run                                                        |
| **Share / Challenge / Play again**  | Results actions (share card canvas, friend challenge encoding, restart)               |
| Nav links                           | Navigate away to other HoopsMatic tools                                               |
| Burger                              | Toggles mobile secondary nav                                                          |

## Hover sweep

- `.btn`: `transform` + `box-shadow` transition `0.12s`
- `.btn.ghost`: orange border, transparent fill
- `.pick-card`: hover highlight (border/background lift — see game.css)
- Nav links: active page uses blue underline (`.hm-nav-link` active state for 73-9 Game)

## Time / load

- Load screen progress bar fills while streaming/inflating `data.bin`
- Logo `.logo-main` uses `shimmer` keyframe (3s ease-in-out infinite)
- Results may fire confetti animation on canvas

## Responsive

| Viewport     | Notes                                                           |
| ------------ | --------------------------------------------------------------- |
| Desktop 1440 | Full nav links; 5-column pick grid                              |
| Tablet 768   | Nav compresses; burger may appear for secondary links           |
| Mobile 390   | Burger menu; pick columns stack/scroll; reel remains horizontal |

Breakpoints live in `nav.css` + `game.css` media queries (extract: ~900px / ~640px family).

## Interaction model summary

- **Intro**: click-driven
- **Reel**: click + CSS/JS animation (time)
- **Picks**: click-driven
- **Results**: click-driven + optional network (leaderboard Workers)
- **Not** scroll-driven for core game loop
