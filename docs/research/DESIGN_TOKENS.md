# Design Tokens — 73-9 Game

Extracted from `getComputedStyle` / source `:root` on https://hoopsmatic.com/73-9-game

## Colors

| Token      | Value     | Usage                                         |
| ---------- | --------- | --------------------------------------------- |
| `--gold`   | `#ffd700` | Accents, salary, hover borders, gradient text |
| `--orange` | `#ff6b35` | Buttons, numbers, position labels             |
| `--green`  | `#34d97a` | Bankroll / remaining money                    |
| `--amber`  | `#ffd24a` | Secondary highlight                           |
| `--red`    | `#ff6666` | Errors / warnings                             |
| `--ink`    | `#c8c8e0` | Body text                                     |
| `--dim`    | `#8888aa` | Muted labels                                  |
| `--panel`  | `#12122a` | Cards / panels                                |
| `--panel2` | `#0c0c1e` | Deeper panels                                 |
| `--line`   | `#2a2a52` | Borders                                       |

## Background

```css
body {
  background: linear-gradient(160deg, #1a1a3e 0%, #0a0a1a 55%, #050510 100%);
  background-attachment: fixed;
}
```

## Typography

| Role              | Family                 | Notes        |
| ----------------- | ---------------------- | ------------ |
| Display / buttons | Oswald 400–700         | Google Fonts |
| Body / data       | JetBrains Mono 400–700 | Google Fonts |

## Motion

- `shimmer` — logo gradient slide, 3s ease-in-out infinite
- `fadeIn` — opacity + translateY(8px)
- `pop` — scale pop-in
- Button transition: `transform .12s, box-shadow .12s`

## Layout

- Content wrap: `max-width: 920px`
- Nav burger: `max-width: 760px`
- Game stack: `max-width: 560px`

Mirrored in shell as `--game-*` custom properties in `src/styles/globals.css`.
