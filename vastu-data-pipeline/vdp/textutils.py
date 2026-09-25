"""Text utilities: normalization, IDs, similarity — pure stdlib, no heavy deps."""

from __future__ import annotations

import hashlib
import re
import unicodedata
from collections import Counter

_WS = re.compile(r"\s+")
_STOP = frozenset({
    "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or", "is",
    "are", "be", "should", "must", "not", "it", "its", "as", "by", "with", "from",
    "ye", "hai", "mein", "ka", "ki", "ke", "aur", "ya", "bhi", "se",
})

_DEVANAGARI = re.compile(r"[\u0900-\u097F]")


def norm_ws(text: str) -> str:
    return _WS.sub(" ", (text or "")).strip()


def squash(text: str) -> str:
    """Aggressive normalization for comparison: NFKC, casefold, drop punctuation."""
    t = unicodedata.normalize("NFKC", text or "").casefold()
    t = re.sub(r"[^\w\s]", " ", t, flags=re.UNICODE)
    return _WS.sub(" ", t).strip()


def tokens(text: str) -> list[str]:
    return [t for t in squash(text).split() if t and t not in _STOP]


def detect_language(text: str) -> str:
    """Heuristic: Devanagari-heavy → 'hi', else 'en'. Never used to replace text."""
    if not text:
        return "en"
    dev = len(_DEVANAGARI.findall(text))
    return "hi" if dev > len(text) * 0.02 else "en"


def short_hash(text: str, n: int = 10) -> str:
    return hashlib.sha1((text or "").encode("utf-8")).hexdigest()[:n]


def jaccard(a: str, b: str) -> float:
    ta, tb = set(tokens(a)), set(tokens(b))
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def cosine_sim(a: str, b: str) -> float:
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    ca, cb = Counter(ta), Counter(tb)
    dot = sum(ca[t] * cb.get(t, 0) for t in ca)
    na = sum(c * c for c in ca.values()) ** 0.5
    nb = sum(c * c for c in cb.values()) ** 0.5
    return dot / (na * nb) if na and nb else 0.0


def combined_similarity(a: str, b: str) -> float:
    """Blend of jaccard + cosine; robust for both short claims and paragraphs."""
    return 0.5 * jaccard(a, b) + 0.5 * cosine_sim(a, b)


def contains_hindi(text: str) -> bool:
    return bool(_DEVANAGARI.search(text or ""))
