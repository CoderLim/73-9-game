# Game data build

- `data.full.bin` — legacy full box-score dump (~16MB gzip). **Gitignored.** Source of truth for rebuilds; do not serve to clients.
- `build-season-bin.mjs` — compresses to season aggregates (`v:2`) written to `public/73-9-game/data.bin`.

Restore the full dump from the pre-logic tag, then rebuild:

```bash
git show pre-season-aggregate:public/73-9-game/data.bin > scripts/game-data/data.full.bin
pnpm game:build-data
```
