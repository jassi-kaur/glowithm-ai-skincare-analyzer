"""
Single source of truth for ingredient knowledge.

Before this module existed, analyzer.py, conflict_checker.py and
safety_engine.py each kept their OWN ingredient lists/aliases, and they had
drifted apart (e.g. tretinoin/adapalene were referenced by the safety engine
but could never be detected by the parser).  Everything now goes through the
helpers below, so a name is recognised the same way everywhere.
"""

import re
from functools import lru_cache
from typing import Dict, List, Optional, Set, Tuple

# ----------------------------------------------------------------------
# Product types, in PRIORITY ORDER (first match wins).
# This was a `set` before, so `types[0]` depended on PYTHONHASHSEED and the
# same input could be classified differently from one server start to the
# next.  An ordered list makes the result deterministic.
# ----------------------------------------------------------------------
PRODUCT_TYPE_PATTERNS: List[Tuple[str, str]] = [
    ("sunscreen", r"sun\s?screen|sunblock"),
    ("cleanser", r"cleanser|cleansing|face\s?wash|\bwash\b"),
    ("moisturizer", r"moisturi[sz]er|moisturi[sz]ing|\blotion\b"),
    ("toner", r"\btoner\b"),
    ("essence", r"\bessence\b"),
    ("exfoliant", r"exfoliant|exfoliator|\bpeel\b"),
    ("serum", r"\bserum\b|\bampoule\b"),
    ("treatment", r"\btreatment\b"),
    ("cream", r"\bcream\b"),
    ("gel", r"\bgel\b"),
    ("oil", r"\boil\b"),
]
PRODUCT_TYPES = tuple(name for name, _ in PRODUCT_TYPE_PATTERNS)

# Types that are harmless without knowing the active inside them.
BASIC_TYPES = {"cleanser", "moisturizer", "sunscreen", "toner", "cream"}
# Types that COULD hide a strong active; never place them blindly.
RISKY_TYPES = {"serum", "treatment", "exfoliant", "essence", "gel", "oil"}

# ----------------------------------------------------------------------
# Ingredient properties
# ----------------------------------------------------------------------
_RETINOID = {"type": "retinoid", "pregnancy_safe": False, "needs_spf": True,
             "max_freq": "2x/week", "note": "Start 1-2x/week"}

INGREDIENT_PROPERTIES: Dict[str, Dict] = {
    # Hydrating
    "hyaluronic acid": {"type": "humectant", "pregnancy_safe": True, "needs_spf": False},
    "glycerin": {"type": "humectant", "pregnancy_safe": True, "needs_spf": False},
    "ceramides": {"type": "barrier_repair", "pregnancy_safe": True, "needs_spf": False},
    "squalane": {"type": "emollient", "pregnancy_safe": True, "needs_spf": False},
    "peptide": {"type": "peptide", "pregnancy_safe": True, "needs_spf": False},
    "copper peptide": {"type": "peptide", "pregnancy_safe": True, "needs_spf": False},
    # Antioxidants
    "vitamin c": {"type": "antioxidant", "pregnancy_safe": True, "needs_spf": True, "note": "Use AM only"},
    "niacinamide": {"type": "barrier_support", "pregnancy_safe": True, "needs_spf": False},
    "vitamin e": {"type": "antioxidant", "pregnancy_safe": True, "needs_spf": False},
    # Exfoliants
    "glycolic acid": {"type": "aha", "pregnancy_safe": False, "needs_spf": True, "max_freq": "2x/week"},
    "lactic acid": {"type": "aha", "pregnancy_safe": False, "needs_spf": True, "max_freq": "2x/week"},
    "aha": {"type": "aha", "pregnancy_safe": False, "needs_spf": True, "max_freq": "2x/week"},
    "salicylic acid": {"type": "bha", "pregnancy_safe": False, "needs_spf": True, "max_freq": "2x/week"},
    # Acne / pigment
    "benzoyl peroxide": {"type": "acne_treatment", "pregnancy_safe": True, "needs_spf": False},
    "azelaic acid": {"type": "azelaic", "pregnancy_safe": True, "needs_spf": False},
    "hydroquinone": {"type": "depigmenting", "pregnancy_safe": False, "needs_spf": True},
    # Retinoids
    "retinol": dict(_RETINOID),
    "retinaldehyde": dict(_RETINOID),
    "tretinoin": dict(_RETINOID),
    "adapalene": dict(_RETINOID),
    "retinoid": dict(_RETINOID),
    # Sun protection
    "zinc oxide": {"type": "mineral_spf", "pregnancy_safe": True, "needs_spf": False},
    "titanium dioxide": {"type": "mineral_spf", "pregnancy_safe": True, "needs_spf": False},
    "avobenzone": {"type": "chemical_spf", "pregnancy_safe": True, "needs_spf": False},
}

# Every way a user might write an ingredient -> canonical name.
SYNONYMS: Dict[str, List[str]] = {
    "hyaluronic acid": ["hyaluronic acid", "sodium hyaluronate", "hyaluronate"],
    "glycerin": ["glycerin", "glycerine"],
    "ceramides": ["ceramides", "ceramide", "ceramide np"],
    "squalane": ["squalane"],
    "copper peptide": ["copper peptide", "copper peptides", "ghk-cu"],
    "peptide": ["peptide", "peptides"],
    "vitamin c": ["vitamin c", "vit c", "l-ascorbic acid", "ascorbic acid", "ascorbic"],
    "niacinamide": ["niacinamide", "nicotinamide", "vitamin b3"],
    "vitamin e": ["vitamin e", "tocopherol"],
    "glycolic acid": ["glycolic acid", "glycolic"],
    "lactic acid": ["lactic acid", "lactic"],
    "aha": ["aha", "alpha hydroxy acid"],
    "salicylic acid": ["salicylic acid", "salicylic", "bha", "beta hydroxy acid"],
    "benzoyl peroxide": ["benzoyl peroxide", "bpo"],
    "azelaic acid": ["azelaic acid", "azelaic"],
    "hydroquinone": ["hydroquinone"],
    "retinol": ["retinol"],
    "retinaldehyde": ["retinaldehyde", "retinal"],
    "tretinoin": ["tretinoin", "retin-a", "retin a"],
    "adapalene": ["adapalene", "differin"],
    "retinoid": ["retinoid"],
    "zinc oxide": ["zinc oxide"],
    "titanium dioxide": ["titanium dioxide"],
    "avobenzone": ["avobenzone"],
}

# Ingredients the LLM is NOT allowed to invent (hallucination guard).
GUARDED_ACTIVES: Set[str] = {
    "vitamin c", "retinol", "retinaldehyde", "retinoid", "tretinoin",
    "adapalene", "glycolic acid", "lactic acid", "salicylic acid", "aha",
    "benzoyl peroxide", "azelaic acid", "hydroquinone",
}

# Ordered by priority when only one strong active may stay in a routine.
STRONG_ACTIVE_TYPES = ("retinoid", "bha", "aha", "acne_treatment")

# Time-of-day placement.  By NAME first (vitamin C and vitamin E share the
# "antioxidant" type but only vitamin C is AM-only), then by type.
ACTIVE_PLACEMENT_BY_NAME = {"vitamin c": "morning"}
ACTIVE_PLACEMENT_BY_TYPE = {
    "retinoid": "night", "aha": "night", "bha": "night",
    "acne_treatment": "both", "humectant": "both", "barrier_repair": "both",
    "barrier_support": "both", "azelaic": "both", "peptide": "both",
    "emollient": "both",
}

# Strength (%) above which we add a "high strength" caution.
HIGH_STRENGTH = {
    "salicylic acid": 2.0, "retinol": 0.5, "glycolic acid": 10.0,
    "lactic acid": 10.0, "vitamin c": 20.0, "benzoyl peroxide": 5.0,
}

# Names used by the pair table (data/ingredient_pairs.csv).
_PAIR_NAME_OVERRIDES = {
    "ceramides": "ceramide",
    "retinaldehyde": "retinal",
    "retinoid": "retinol",        # unspecified retinoid -> assume retinol
    "aha": "glycolic_acid",       # unspecified AHA -> most common/conservative
}

_DISPLAY_OVERRIDES = {"aha": "AHA", "bha": "BHA"}


def display_name(name: str) -> str:
    name = (name or "").strip()
    return _DISPLAY_OVERRIDES.get(name.lower(), name.title())


def pair_name(name: str) -> str:
    """Canonical analyzer name -> name used in the pair table / ML model."""
    key = (name or "").strip().lower()
    key = _PAIR_NAME_OVERRIDES.get(key, key)
    return key.replace(" ", "_")


# ----------------------------------------------------------------------
# Detection
# ----------------------------------------------------------------------
_FREE_OF = re.compile(
    r"\b(?:oil|fragrance|alcohol|paraben|sulfate|silicone|perfume)[- ]free\b"
)


def normalize_text(text: str) -> str:
    s = (text or "").lower()
    s = _FREE_OF.sub(" ", s)          # "oil-free" must not become the type "oil"
    s = re.sub(r"\bvitamin\s+c\s*(?:and|&|\+)\s*e\b", "vitamin c vitamin e", s)
    return re.sub(r"\s+", " ", s).strip()


@lru_cache(maxsize=1)
def _forms_longest_first() -> List[Tuple[str, str, "re.Pattern"]]:
    forms = []
    for canon, surface in SYNONYMS.items():
        for form in surface:
            forms.append((form, canon, re.compile(r"\b" + re.escape(form) + r"s?\b")))
    forms.sort(key=lambda item: -len(item[0]))
    return forms


def _strength_for(canon: str, text: str, only_one: bool) -> Optional[float]:
    alt = "|".join(re.escape(f) for f in SYNONYMS[canon])
    m = re.search(r"(\d+(?:\.\d+)?)\s*%\s*(?:of\s+)?(?:" + alt + r")", text)
    if not m:
        m = re.search(r"(?:" + alt + r")\s*(\d+(?:\.\d+)?)\s*%", text)
    if m:
        return float(m.group(1))
    if only_one:
        pcts = re.findall(r"(\d+(?:\.\d+)?)\s*%", text)
        if len(pcts) == 1:
            return float(pcts[0])
    return None


def find_ingredients(text: str) -> List[Tuple[str, Optional[float]]]:
    """
    Return [(canonical_name, strength_percent_or_None), ...] in the order the
    ingredients appear.  Longer phrases are matched first and blanked out, so
    "copper peptide" is not also reported as "peptide" and "l-ascorbic acid
    vitamin c" is reported once.
    """
    s = normalize_text(text)
    work = s
    hits: Dict[str, int] = {}
    for form, canon, pattern in _forms_longest_first():
        for m in pattern.finditer(work):
            hits.setdefault(canon, m.start())
            work = work[:m.start()] + " " * (m.end() - m.start()) + work[m.end():]
    ordered = sorted(hits, key=lambda c: hits[c])
    only_one = len(ordered) == 1
    return [(c, _strength_for(c, s, only_one)) for c in ordered]


def mentioned_names(text: str) -> Set[str]:
    return {name for name, _ in find_ingredients(text)}


def detect_product_type(text: str) -> Optional[str]:
    s = normalize_text(text)
    for ptype, pattern in PRODUCT_TYPE_PATTERNS:
        if re.search(pattern, s):
            return ptype
    return None
