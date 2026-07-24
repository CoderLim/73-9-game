#!/usr/bin/env python3
"""Merge game.ui.* overlays into messages/{locale}.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "messages"
SCRIPTS = ROOT / "scripts"

LOCALE_OVERLAYS: dict[str, Path] = {
    "en": SCRIPTS / "_game_ui_en.json",
    "zh": SCRIPTS / "_game_ui_overlay_zh.json",
    "ja": SCRIPTS / "_game_ui_overlay_ja.json",
    "ko": SCRIPTS / "_game_ui_overlay_ko.json",
}

SHELL_OVERLAYS: dict[str, Path] = {
    "ja": SCRIPTS / "_i18n_overlay_ja.json",
    "ko": SCRIPTS / "_i18n_overlay_ko.json",
}


def load_json(path: Path) -> dict[str, str]:
    return json.loads(path.read_text(encoding="utf-8"))


def prefix_keys(overlay: dict[str, str]) -> dict[str, str]:
    return {f"game.ui.{k}": v for k, v in overlay.items()}


def merge_into_messages(messages: dict[str, str], game_ui: dict[str, str]) -> dict[str, str]:
    merged = dict(messages)
    merged.update(game_ui)

    last_game_idx = -1
    keys = list(messages.keys())
    for i, key in enumerate(keys):
        if key.startswith("game."):
            last_game_idx = i

    if last_game_idx < 0:
        raise SystemExit("No game.* keys found in messages file")

    before = keys[: last_game_idx + 1]
    after = [k for k in keys[last_game_idx + 1 :] if not k.startswith("game.ui.")]
    new_game_ui = sorted(k for k in game_ui if k not in before)

    ordered_keys = before + new_game_ui + after
    return {k: merged[k] for k in ordered_keys}


def main() -> None:
    en_overlay = load_json(SCRIPTS / "_game_ui_en.json")
    en_keys = set(en_overlay)

    for locale, overlay_path in LOCALE_OVERLAYS.items():
        overlay = load_json(overlay_path)
        if set(overlay) != en_keys:
            missing = en_keys - set(overlay)
            extra = set(overlay) - en_keys
            raise SystemExit(
                f"{locale}: key mismatch — missing {len(missing)}, extra {len(extra)}"
            )

        game_ui = prefix_keys(overlay)
        msg_path = MESSAGES / f"{locale}.json"
        messages = load_json(msg_path)
        merged = merge_into_messages(messages, game_ui)
        msg_path.write_text(
            json.dumps(merged, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        game_ui_count = sum(1 for k in merged if k.startswith("game.ui."))
        print(f"{locale}: wrote {msg_path} ({len(merged)} keys, {game_ui_count} game.ui.*)")

    for locale, shell_path in SHELL_OVERLAYS.items():
        shell = load_json(shell_path)
        shell.update(prefix_keys(load_json(LOCALE_OVERLAYS[locale])))
        shell_path.write_text(
            json.dumps(shell, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        game_ui_count = sum(1 for k in shell if k.startswith("game.ui."))
        print(f"{locale}: updated {shell_path} ({game_ui_count} game.ui.* keys)")

    counts = {
        locale: len(load_json(MESSAGES / f"{locale}.json"))
        for locale in LOCALE_OVERLAYS
    }
    if len(set(counts.values())) != 1:
        raise SystemExit(f"Key count mismatch across locales: {counts}")

    game_ui_added = len(en_overlay)
    print(f"game.ui.* keys added per locale: {game_ui_added}")
    print(f"All locales have {next(iter(counts.values()))} keys total")


if __name__ == "__main__":
    main()
