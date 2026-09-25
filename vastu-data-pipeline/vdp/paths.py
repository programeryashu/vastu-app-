"""Paths & settings loader. All paths resolve relative to the pipeline root."""

from __future__ import annotations

import json
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_SETTINGS_PATH = PIPELINE_ROOT / "config" / "settings.json"

_settings_cache: dict | None = None


def load_settings(force: bool = False) -> dict:
    global _settings_cache
    if _settings_cache is None or force:
        with open(DEFAULT_SETTINGS_PATH, "r", encoding="utf-8") as f:
            _settings_cache = json.load(f)
    return _settings_cache


def ensure_dirs(settings: dict | None = None) -> dict[str, Path]:
    """Create all working directories and return them keyed by name."""
    s = settings or load_settings()
    dirs: dict[str, Path] = {}
    for name in ("sources", "raw", "extracted", "cleaned", "datasets", "logs"):
        p = PIPELINE_ROOT / s["paths"][name]
        p.mkdir(parents=True, exist_ok=True)
        dirs[name] = p
    return dirs


def db_path(settings: dict | None = None) -> Path:
    s = settings or load_settings()
    return PIPELINE_ROOT / s["paths"]["db"]


def logs_dir(settings: dict | None = None) -> Path:
    s = settings or load_settings()
    d = PIPELINE_ROOT / s["paths"]["logs"]
    d.mkdir(parents=True, exist_ok=True)
    return d
