#!/usr/bin/env python3
"""Merge shell overlays into messages/{locale}.json from en base."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "messages"
SCRIPTS = ROOT / "scripts"

OVERLAYS: dict[str, Path] = {
    "ja": SCRIPTS / "_i18n_overlay_ja.json",
    "ko": SCRIPTS / "_i18n_overlay_ko.json",
}


def load_json(path: Path) -> dict[str, str]:
    return json.loads(path.read_text(encoding="utf-8"))


def merge_locale(en: dict[str, str], overlay: dict[str, str], locale: str) -> dict[str, str]:
    missing = set(overlay) - set(en)
    if missing:
        raise SystemExit(f"{locale}: overlay keys not in en.json: {sorted(missing)[:5]}… ({len(missing)} total)")

    merged = dict(en)
    merged.update(overlay)
    # same key order as en
    return {k: merged[k] for k in en}


def main() -> None:
    en_path = MESSAGES / "en.json"
    en = load_json(en_path)

    for locale, overlay_path in OVERLAYS.items():
        overlay = load_json(overlay_path)
        print(f"{locale}: overlay {len(overlay)} keys")
        merged = merge_locale(en, overlay, locale)
        out = MESSAGES / f"{locale}.json"
        out.write_text(
            json.dumps(merged, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"{locale}: wrote {out} ({len(merged)} keys)")


if __name__ == "__main__":
    main()
