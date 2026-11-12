import csv
import itertools
import logging
import os
import threading
from typing import Any, Dict, FrozenSet, List, Optional, Tuple

from .ingredients import (
    HIGH_STRENGTH,
    INGREDIENT_PROPERTIES,
    display_name,
    find_ingredients,
    pair_name,
)
from .ml_conflict_checker import predict_conflict

logger = logging.getLogger(__name__)

SEVERITY = {"SAFE": 0, "CAUTION": 1, "AVOID": 2}
ML_CONFIDENCE_THRESHOLD = 0.7

# ----------------------------------------------------------------------
# Pair table (primary source of truth)
#
# WHY: the ML model is trained on only ~41 rows and uses the raw ingredient
# names as features, so it is effectively a lookup table that is also
# order-sensitive (retinol->vitamin_c and vitamin_c->retinol gave different
# answers).  Known pairs are therefore answered directly from the same CSV,
# order-independently.  The model is only a *labelled estimate* for pairs the
# CSV does not cover.
# ----------------------------------------------------------------------
_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "ingredient_pairs.csv",
)
_pair_table: Optional[Dict[FrozenSet[str], str]] = None
_pair_lock = threading.Lock()


def load_pair_table() -> Dict[FrozenSet[str], str]:
    global _pair_table
    if _pair_table is not None:
        return _pair_table
    with _pair_lock:
        if _pair_table is not None:
            return _pair_table
        table: Dict[FrozenSet[str], str] = {}
        try:
            with open(_CSV_PATH, newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    key = frozenset((row["ingredient_a"].strip(), row["ingredient_b"].strip()))
                    label = row["label"].strip().upper()
                    # keep the most severe label if a pair appears twice
                    if key not in table or SEVERITY.get(label, 0) > SEVERITY.get(table[key], 0):
                        table[key] = label
        except Exception as e:
            logger.error("Could not load pair table %s: %s (will retry)", _CSV_PATH, e)
            return {}          # do not cache a failure
        _pair_table = table
        return table


# Names/types whose pairings are worth flagging if we cannot verify them.
_REACTIVE_NAMES = {"vitamin c", "azelaic acid", "hydroquinone"}
_REACTIVE_TYPES = {"retinoid", "aha", "bha", "acne_treatment"}
# Gentle ingredient types. A pairing that is NOT in the table and involves one
# of these (adapalene + ceramides, squalane + salicylic acid...) gets neither a
# "could not be verified" notice nor a model-estimated warning: both only added
# noise (the model also produces nonsensical warnings for emollients).
_BENIGN_TYPES = {"humectant", "barrier_repair", "barrier_support", "emollient", "peptide"}

# High-strength variants that exist in the CSV (only used when a strength
# was actually stated by the user, e.g. "20% vitamin c").
_HIGH_STRENGTH_ALIAS = {
    "vitamin_c": "high_concentration_vitamin_c",
    "glycolic_acid": "high_concentration_aha",
    "lactic_acid": "high_concentration_aha",
}

# Curated, ingredient-level "good news" messages.
PAIR_BENEFITS = {
    frozenset(("hyaluronic_acid", "ceramide")): "hydration plus barrier repair",
    frozenset(("hyaluronic_acid", "niacinamide")): "hydration plus barrier support",
    frozenset(("ceramide", "niacinamide")): "barrier repair and barrier support work well together",
    frozenset(("vitamin_c", "hyaluronic_acid")): "hydration alongside antioxidant protection",
    frozenset(("peptide", "hyaluronic_acid")): "peptides plus hydration",
    frozenset(("peptide", "ceramide")): "peptides plus barrier repair",
    frozenset(("retinol", "hyaluronic_acid")): "hydration can help buffer retinol dryness",
    frozenset(("retinol", "ceramide")): "ceramides can help buffer retinol irritation",
    frozenset(("ceramide", "squalane")): "barrier repair plus emollient comfort",
    frozenset(("hyaluronic_acid", "squalane")): "hydration plus emollient comfort",
}


def _active_entries(actives: List[Dict[str, Any]]):
    """Unique [(name, type, strength)] from parser output, order preserved."""
    seen, out = set(), []
    for a in actives:
        name = (a.get("name") or "").strip().lower()
        if not name or name in seen:
            continue
        seen.add(name)
        out.append((name, a.get("type"), a.get("strength")))
    return out


def _legacy_actives_from_text(products_text: str) -> List[Dict[str, Any]]:
    """Fallback for callers that only have raw text (no parsed actives)."""
    out = []
    for name, strength in find_ingredients(products_text):
        props = INGREDIENT_PROPERTIES.get(name, {})
        out.append({"name": name, "strength": strength, **props})
    return out


def _ml_estimate(a: str, b: str) -> Optional[Dict[str, Any]]:
    """Model estimate, queried in BOTH orders; the more severe answer wins."""
    results = [r for r in (predict_conflict(a, b), predict_conflict(b, a)) if r]
    if not results:
        return None
    return max(results, key=lambda r: (SEVERITY.get(r["label"], 0), r["confidence"]))


def check_conflicts_detailed(
    products: str, actives: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, List[str]]:
    """
    Returns {"warnings": [...], "beneficial": [...], "unverified": [...]}.

    warnings   - conflicts, most severe first
    beneficial - ingredient-level good combinations
    unverified - reactive pairs we have no data for AND the model could not
                 estimate (previously these were silently treated as safe)
    """
    result = {"warnings": [], "beneficial": [], "unverified": []}

    if actives is None:
        if not products or not products.strip():
            return result
        actives = _legacy_actives_from_text(products)

    entries = _active_entries(actives)
    if len(entries) < 2:
        return result

    table = load_pair_table()
    found: List[Tuple[int, str]] = []

    for (name_a, type_a, str_a), (name_b, type_b, str_b) in itertools.combinations(entries, 2):
        key_a, key_b = pair_name(name_a), pair_name(name_b)
        if key_a == key_b:
            continue

        label = table.get(frozenset((key_a, key_b)))

        # Stated high strengths can make a pair worse (e.g. >=20% vitamin C).
        for key, strength, own_name, other_key in (
            (key_a, str_a, name_a, key_b), (key_b, str_b, name_b, key_a)
        ):
            hi_alias = _HIGH_STRENGTH_ALIAS.get(key)
            limit = HIGH_STRENGTH.get(own_name)
            if hi_alias and limit and strength and strength >= limit:
                hi_label = table.get(frozenset((hi_alias, other_key)))
                if hi_label and SEVERITY.get(hi_label, 0) > SEVERITY.get(label or "SAFE", 0):
                    label = hi_label

        estimated = False


        if label is None:
            if type_a in _BENIGN_TYPES or type_b in _BENIGN_TYPES:
                continue
            est = _ml_estimate(key_a, key_b)
            is_reactive = (
                type_a in _REACTIVE_TYPES or type_b in _REACTIVE_TYPES
                or name_a in _REACTIVE_NAMES or name_b in _REACTIVE_NAMES
            )

            if est and est["label"] != "SAFE" and est["confidence"] >= ML_CONFIDENCE_THRESHOLD:
                label, estimated = est["label"], True
            elif is_reactive:
                result["unverified"].append(
                    f"{display_name(name_a)} + {display_name(name_b)}: "
                    "compatibility could not be verified. Introduce one at a "
                    "time and patch-test."
                )
                continue
            else:
                continue


        pair_text = f"{display_name(name_a)} + {display_name(name_b)}"
        suffix = " (estimated from limited data)" if estimated else ""
        if label == "AVOID":
            found.append((2, f"🛑 {pair_text}: avoid using these together{suffix}. "
                             "Use them on separate days or ask a dermatologist."))
        elif label == "CAUTION":
            found.append((1, f"⚠️ {pair_text}: use with caution{suffix} due to "
                             "potential irritation. Introduce products gradually, "
                             "follow product instructions, and monitor your skin's response. "
                             "If irritation occurs, use them at different times of day "
                             "or on alternate nights."))

    found.sort(key=lambda item: -item[0])
    result["warnings"] = [msg for _, msg in found]

    # Beneficial combinations (ingredient level, human-readable)
    for (name_a, _, _), (name_b, _, _) in itertools.combinations(entries, 2):
        benefit = PAIR_BENEFITS.get(frozenset((pair_name(name_a), pair_name(name_b))))
        if benefit:
            result["beneficial"].append(
                f"✅ {display_name(name_a)} + {display_name(name_b)}: {benefit}."
            )

    return result


def check_conflicts(
    products: str, actives: Optional[List[Dict[str, Any]]] = None
) -> Tuple[List[str], List[str]]:
    """Backwards-compatible (warnings, beneficial) tuple."""
    r = check_conflicts_detailed(products, actives=actives)
    return r["warnings"], r["beneficial"]


def get_conflict_summary(products: str, actives: List[Dict[str, Any]] = None) -> str:
    """Human-readable summary (uses the same path as the real request flow)."""
    r = check_conflicts_detailed(products, actives=actives)

    if not (r["warnings"] or r["beneficial"] or r["unverified"]):
        return "No conflicts detected. Your routine looks safe!"

    parts = []
    if r["warnings"]:
        parts.append("Warnings:\n" + "\n".join(f"  {w}" for w in r["warnings"]))
    if r["unverified"]:
        parts.append("Could not verify:\n" + "\n".join(f"  {w}" for w in r["unverified"]))
    if r["beneficial"]:
        parts.append("Info:\n" + "\n".join(f"  {i}" for i in r["beneficial"]))
    return "\n\n".join(parts)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    for sample in [
        "Retinol serum with Salicylic acid",
        "Hyaluronic acid and Ceramides",
        "Retinol + Benzoyl Peroxide",
        "Vitamin C and Glycolic acid toner",
        "Niacinamide and Retinol",
    ]:
        print(sample, "->", get_conflict_summary(sample))
        print("-" * 50)
