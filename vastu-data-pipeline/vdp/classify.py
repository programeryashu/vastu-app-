"""Feature 4 — rule-based Vastu knowledge classification.

Classifies what the text SAYS; it never rewrites or invents content.
Every keyword match stays anchored to the original block (verbatim quote kept).
"""

from __future__ import annotations

import re

from .models import CATEGORIES, normalize_category
from .textutils import detect_language, norm_ws

DIRECTION_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("NE", re.compile(r"\b(north[- ]?east|नॉर्थ[- ]?ईस्ट|ईशान|ishan|īśāna)\b", re.I)),
    ("SE", re.compile(r"\b(south[- ]?east|साउथ[- ]?ईस्ट|आग्नेय|agneya|agneya)\b", re.I)),
    ("SW", re.compile(r"\b(south[- ]?west|साउथ[- ]?वेस्ट|नैऋत्य|nairitya|nairritya)\b", re.I)),
    ("NW", re.compile(r"\b(north[- ]?west|नॉर्थ[- ]?वेस्ट|वायव्य|vayavya|vāyavya)\b", re.I)),
    ("N", re.compile(r"\b(north|उत्तर|uttar)\b", re.I)),
    ("E", re.compile(r"\b(east|पूर्व|purva|poorva)\b", re.I)),
    ("S", re.compile(r"\b(south|दक्षिण|dakshin|dakkhin)\b", re.I)),
    ("W", re.compile(r"\b(west|पश्चिम|pashchim|paschim)\b", re.I)),
    ("center", re.compile(r"\b(cent(er|re)|ब्रह्मस्थान|brahmasthan|middle of the (house|plot))\b", re.I)),
]

ROOM_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("kitchen", re.compile(r"\b(kitchen|रसोई|rasoi)\b", re.I)),
    ("bedroom", re.compile(r"\b(bed\s?room|शयन कक्ष|शयनकक्ष|sayan kaksh|sleeping room)\b", re.I)),
    ("bathroom", re.compile(r"\b(bath\s?room|toilet|washroom|स्नानघर|शौचालय|snanghar)\b", re.I)),
    ("puja_room", re.compile(r"\b(puja|pooja|पूजा)(\s+room)?\b| mandir\b", re.I)),
    ("staircase", re.compile(r"\b(stair(s|case)?|सीढ़ियाँ|seedhi)\b", re.I)),
    ("entrance", re.compile(r"\b(entr(ance|y)|main door|प्रवेश द्वार|मुख्य द्वार)\b", re.I)),
    ("door", re.compile(r"\b(door|द्वार|dwar)\b", re.I)),
    ("window", re.compile(r"\b(win(dow)?s?|खिड़की|khidki)\b", re.I)),
]

TOPIC_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("plot", re.compile(r"\b(plot|प्लॉट|भूखंड|land shape|plot shape)\b", re.I)),
    ("land", re.compile(r"\b(land|भूमि|soil|मिट्टी)\b", re.I)),
    ("colors", re.compile(r"\b(colou?rs?|रंग)\b", re.I)),
    ("elements", re.compile(r"\b(five elements|पंच तत्व|panch tatva|elements?)\b", re.I)),
    ("planets", re.compile(r"\b(planets?|ग्रह|graha)\b", re.I)),
    ("zones", re.compile(r"\b(zones?|क्षेत्र)\b", re.I)),
    ("measurements", re.compile(r"\b(dimensions?|measurements?|feet|फीट|माप)\b", re.I)),
    ("remedies", re.compile(r"\b(remed(y|ies)|उपाय|upay|correction|निवारण)\b", re.I)),
    ("principles", re.compile(r"\b(principle|सिद्धांत|rule|नियम)\b", re.I)),
    ("terminology", re.compile(r"\b(term|शब्द|means|अर्थात)\b", re.I)),
    ("exceptions", re.compile(r"\b(exception|अपवाद|however|लेकिन)\b", re.I)),
]

ELEMENT_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("fire", re.compile(r"\b(fire|अग्नि|agni)\b", re.I)),
    ("water", re.compile(r"\b(water|जल|jal|paani)\b", re.I)),
    ("earth", re.compile(r"\b(earth|पृथ्वी|prithvi)\b", re.I)),
    ("air", re.compile(r"\b(air|वायु|vayu)\b", re.I)),
    ("space", re.compile(r"\b(space|ether|आकाश|akash|sky)\b", re.I)),
]

PLANET_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("sun", re.compile(r"\b(sun|सूर्य|surya)\b", re.I)),
    ("moon", re.compile(r"\b(moon|चंद्र|चन्द्र|chandra)\b", re.I)),
    ("mars", re.compile(r"\b(mars|मंगल|mangal)\b", re.I)),
    ("mercury", re.compile(r"\b(mercury|बुध|budh)\b", re.I)),
    ("jupiter", re.compile(r"\b(jupiter|गुरु|बृहस्पति|guru|brihaspati)\b", re.I)),
    ("venus", re.compile(r"\b(venus|शुक्र|shukra)\b", re.I)),
    ("saturn", re.compile(r"\b(saturn|शनि|shani)\b", re.I)),
    ("rahu", re.compile(r"\b(rahu|राहु)\b", re.I)),
    ("ketu", re.compile(r"\b(ketu|केतु)\b", re.I)),
]


def _first_match(text: str, patterns: list[tuple[str, re.Pattern]]) -> str:
    for name, pat in patterns:
        if pat.search(text):
            return name
    return ""


def classify_block(block: dict) -> dict:
    """Produce a partial fact skeleton from a block — claim uses verbatim text.

    Returns dict with keys matching StagedFact fields (minus id/source identity,
    which the stager fills from the block/source registry).
    """
    text = block.get("text", "")
    haystack = text
    if block.get("heading"):
        haystack = f"{block['heading']}. {text}"
    if block.get("list_items"):
        haystack = haystack + " " + " ".join(block["list_items"])
    if block.get("table_rows"):
        haystack = haystack + " " + " ".join(" ".join(r) for r in block["table_rows"])

    room = _first_match(haystack, ROOM_PATTERNS)
    topic = _first_match(haystack, TOPIC_PATTERNS)

    if room:
        topic = room
        subcategory = "room_rule"
    elif topic:
        subcategory = "concept"
    else:
        subcategory = ""

    category = normalize_category(topic) if topic else "principles"
    if category not in CATEGORIES:
        category = "principles"

    direction = _first_match(haystack, DIRECTION_PATTERNS)
    element = _first_match(haystack, ELEMENT_PATTERNS)
    planet = _first_match(haystack, PLANET_PATTERNS)

    is_remedy = bool(re.search(r"\b(remed(y|ies)|उपाय|upay)\b", haystack, re.I))

    return {
        "topic": topic or category,
        "subcategory": subcategory,
        "category": category,
        "claim": text,           # verbatim; cleaning happens in clean stage, not here
        "description": "",
        "direction": direction,
        "room": room,
        "element": element,
        "planet": planet,
        "remedy": text if is_remedy else "",
        "conditions": [],
        "language": detect_language(haystack),
    }


def classify_blocks(blocks: list[dict]) -> list[dict]:
    return [classify_block(b) for b in blocks]
