"""
Invariants: rules that must hold for EVERY generated routine.

The same rules are applied twice:
  * to the RAW routine the LLM produced      -> how often the model alone breaks a rule
  * to the FINAL routine after the safety engine -> how often a user would actually see a rule broken
The gap between the two is the measured value of the hybrid design.

Each check returns None when it passes, or a short description when it fails.
Checks that do not apply to a case are simply left out of the result.
"""
import itertools
from typing import Any, Dict, List, Optional

from services.conflict_checker import load_pair_table
from services.ingredients import (
    ACTIVE_PLACEMENT_BY_NAME, ACTIVE_PLACEMENT_BY_TYPE, GUARDED_ACTIVES, INGREDIENT_PROPERTIES,
    RISKY_TYPES, STRONG_ACTIVE_TYPES, display_name, mentioned_names, pair_name,
)
from services.safety_engine import (
    _CLEANSER_RE, _GENERIC_PLACEHOLDERS, _INVISIBLE_RE, _MOISTURIZER_RE, _is_sunscreen, HybridSafetyEngine,
)

_RETINOIDS = {n for n, p in INGREDIENT_PROPERTIES.items() if p["type"] == "retinoid"}
_STRONG = {n for n, p in INGREDIENT_PROPERTIES.items() if p["type"] in STRONG_ACTIVE_TYPES}
_PREGNANCY_WORDS = ("pregnan", "conceive", "breastfeeding")

RAW_CHECKS = (
    "structure", "sunscreen_am", "sunscreen_not_night", "active_placement", "vitc_am_only", "retinoid_pm_only",
    "one_strong_per_routine", "no_hallucinated_actives", "pregnancy_no_retinoid", "unknown_not_placed",
)
FINAL_ONLY_CHECKS = (
    "order", "cleanser_present", "moisturizer_present", "no_product_lost", "conflicts_reported",
    "unknown_warned", "pregnancy_warned", "schedule_ok", "no_generic_items", "no_invisible_chars",
    "summary_ok", "notes_ok",
)


def is_pregnant(case: Dict[str, Any]) -> bool:
    return bool(case.get("pregnant")) or any(w in case["concerns"].lower() for w in _PREGNANCY_WORDS)


def _items(routine: Dict[str, Any], key: str) -> List[str]:
    value = routine.get(key) if isinstance(routine, dict) else None
    return [x for x in value if isinstance(x, str)] if isinstance(value, list) else []


def check_raw(case, parsed, routine) -> Dict[str, Optional[str]]:
    am, pm = _items(routine, "morning"), _items(routine, "night")
    declared = {a["name"] for a in parsed["actives"]}
    out: Dict[str, Optional[str]] = {}

    problems = []
    for name, lst in (("morning", am), ("night", pm)):
        if not lst:
            problems.append(f"{name} empty")
        if len({x.lower() for x in lst}) != len(lst):
            problems.append(f"{name} has duplicates")
        if any("e.g." in x.lower() or "active treatment" in x.lower() for x in lst):
            problems.append(f"{name} has placeholder text")
        if any(len(x) <= 1 for x in lst):
            problems.append(f"{name} has 1-character items")
    out["structure"] = "; ".join(problems) or None

    out["sunscreen_am"] = None if any(_is_sunscreen(x) for x in am) else "no sunscreen in the morning"
    out["sunscreen_not_night"] = None if not any(_is_sunscreen(x) for x in pm) else "sunscreen in the night routine"

    placement_errors = []
    for active in parsed["actives"]:
        name = active.get("name")
        if not name:
            continue

        placement = (
            ACTIVE_PLACEMENT_BY_NAME.get(name)
            or ACTIVE_PLACEMENT_BY_TYPE.get(active.get("type"))
        )

        if placement == "morning" and any(name in mentioned_names(x) for x in pm):
            placement_errors.append(f"{name} in night")
        elif placement == "night" and any(name in mentioned_names(x) for x in am):
            placement_errors.append(f"{name} in morning")

    out["active_placement"] = "; ".join(placement_errors) or None
    if "vitamin c" in declared:
        out["vitc_am_only"] = None if not any("vitamin c" in mentioned_names(x) for x in pm) else "vitamin C at night"
    if declared & _RETINOIDS:
        out["retinoid_pm_only"] = None if not any(mentioned_names(x) & _RETINOIDS for x in am) else "retinoid in the morning"

    bad = []
    for name, lst in (("morning", am), ("night", pm)):
        found = set()
        for x in lst:
            found |= mentioned_names(x) & _STRONG
        if len(found) > 1:
            bad.append(f"{name}: {sorted(found)}")
    out["one_strong_per_routine"] = "; ".join(bad) or None

    invented = sorted({n for x in am + pm for n in (mentioned_names(x) & GUARDED_ACTIVES) - declared})
    out["no_hallucinated_actives"] = f"undeclared actives {invented}" if invented else None

    if is_pregnant(case):
        out["pregnancy_no_retinoid"] = (None if not any(mentioned_names(x) & _RETINOIDS for x in am + pm)
                                        else "retinoid present although pregnant/breastfeeding")

    unknown = [p for p in parsed["products"]
               if p["ingredient"] is None and p.get("needs_clarification") and (p["type"] in RISKY_TYPES or p["type"] is None)]
    if unknown:
        placed = [p["original_input"] for p in unknown
                  if any(x.strip().lower() in (p["original_input"].lower(), p["type"] or "") for x in am + pm)]
        out["unknown_not_placed"] = f"unknown product placed: {placed}" if placed else None
    return out


def check_final(case, parsed, result) -> Dict[str, Optional[str]]:
    routine, meta = result["routine"], result["safety_notes"]
    out = check_raw(case, parsed, routine)
    am, pm = _items(routine, "morning"), _items(routine, "night")
    declared = {a["name"] for a in parsed["actives"]}

    for name, lst in (("morning", am), ("night", pm)):
        ranks = [HybridSafetyEngine._rank(x) for x in lst]
        if ranks != sorted(ranks):
            out.setdefault("order", f"{name} out of order: {lst}")
        if not any(_CLEANSER_RE.search(x) for x in lst):
            out.setdefault("cleanser_present", f"{name} has no cleanser")
        if not any(_MOISTURIZER_RE.search(x) and not _CLEANSER_RE.search(x) and not _is_sunscreen(x) for x in lst):
            out.setdefault("moisturizer_present", f"{name} has no moisturizer")
    for key in ("order", "cleanser_present", "moisturizer_present"):
        out.setdefault(key, None)

    scheduled = {x for v in (routine.get("weekly_schedule") or {}).values() for x in v}
    alternate = " ".join(routine.get("alternate_nights") or []).lower()
    lost = []
    for p in parsed["products"]:
        ing, original = p["ingredient"], p["original_input"].strip().lower()
        if ing:
            props = INGREDIENT_PROPERTIES[ing]
            if not (ACTIVE_PLACEMENT_BY_NAME.get(ing) or ACTIVE_PLACEMENT_BY_TYPE.get(props["type"])):
                continue
            if is_pregnant(case) and ing in _RETINOIDS:
                continue
            if any(ing in mentioned_names(x) or x.lower() == original for x in am + pm):
                continue
            if display_name(ing) in scheduled or display_name(ing).lower() in alternate:
                continue
            lost.append(ing)
        elif p["type"] in ("cleanser", "moisturizer") and not p.get("needs_clarification"):
            if not any(x.lower() == original for x in am + pm) and not any(
                    w.startswith("You listed more than one") for w in meta.get("warnings", [])):
                lost.append(original)
        elif p["type"] == "sunscreen" and not any(_is_sunscreen(x) for x in am):
            lost.append(original)
    out["no_product_lost"] = f"lost {sorted(set(lost))}" if lost else None

    table, text, missing = load_pair_table(), " ".join(routine.get("conflicts") or []), []
    for a, b in itertools.combinations(sorted(declared), 2):
        label = table.get(frozenset((pair_name(a), pair_name(b))))
        if label in ("AVOID", "CAUTION") and not (display_name(a) in text and display_name(b) in text):
            missing.append((a, b, label))
    out["conflicts_reported"] = f"not reported: {missing}" if missing else None

    warnings = " ".join(meta.get("warnings") or []).lower()
    if any(p["ingredient"] is None and p.get("needs_clarification") for p in parsed["products"]):
        out["unknown_warned"] = None if ("unknown" in warnings or "could not identify" in warnings) else "no warning for an unidentified product"
    if is_pregnant(case) and declared & _RETINOIDS:
        out["pregnancy_warned"] = None if "pregnan" in warnings else "no pregnancy warning"

    schedule = routine.get("weekly_schedule") or {}
    out["schedule_ok"] = "two actives on one night" if any(len(v) > 1 for v in schedule.values()) else None

    generic = [x for x in am + pm if x.strip().lower() in _GENERIC_PLACEHOLDERS]
    out["no_generic_items"] = f"generic items {generic}" if generic else None
    out["no_invisible_chars"] = "invisible characters present" if any(_INVISIBLE_RE.search(x) for x in am + pm) else None

    summary = routine.get("summary")
    out["summary_ok"] = None if (isinstance(summary, str) and 30 <= len(summary) <= 450
                                 and routine.get("summary_source") in ("ai", "template")) else f"bad summary: {summary!r}"

    notes = result.get("ingredient_notes")
    names_ok = isinstance(notes, list) and {n["name"] for n in notes} <= declared and all(
        n["sources"] and all(s["url"].startswith("https://") for s in n["sources"]) for n in notes)
    out["notes_ok"] = None if names_ok else "ingredient_notes inconsistent with the user's products"
    return out
