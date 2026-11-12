import logging
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from .ingredients import (
    ACTIVE_PLACEMENT_BY_NAME,
    ACTIVE_PLACEMENT_BY_TYPE,
    GUARDED_ACTIVES,
    HIGH_STRENGTH,
    INGREDIENT_PROPERTIES,
    RISKY_TYPES,
    STRONG_ACTIVE_TYPES,
    display_name,
    mentioned_names,
)

logger = logging.getLogger(__name__)

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
_EMOJI_PREFIXES = ("🚫 ", "🛑 ", "⚠️ ", "✅ ")
_SUNSCREEN_WORD_RE = re.compile(r"sun\s?screen|sunblock", re.I)
_SPF_RE = re.compile(r"\bspf\b", re.I)
_CLEANSER_RE = re.compile(r"cleanser|cleansing|face\s?wash|\bwash\b", re.I)
_MOISTURIZER_RE = re.compile(r"moisturi[sz]er|moisturi[sz]ing|\blotion\b|\bcream\b|emulsion", re.I)
_PREGNANCY_TERMS = ("pregnan", "conceive", "breastfeeding", "breast-feeding", "nursing")
_SAFE_RETINOID_TYPE = "retinoid"
# Items with no identifiable contents. Whenever the LLM invents one of these
# (the user never entered it), it is removed: the engine cannot vouch for what
# is inside an unnamed "serum" or "exfoliant".
_GENERIC_PLACEHOLDERS = {
    "active treatment (e.g., acid/retinoid)", "active treatment", "active", "actives",
    "treatment", "spot treatment", "serum", "exfoliant", "essence", "peel", "mask",
    "booster", "ampoule", "gel", "oil", "face oil", "acid", "retinoid",
}

# ---- LLM-written summary validation ------------------------------------------------------
_SUMMARY_URL_RE = re.compile(r"https?:|www\.", re.I)
_SUMMARY_CLAIM_RE = re.compile(
    r"\b(cure[sd]?|heal(?:s|ed|ing)?|diagnos\w*|guarantee\w*|prescri\w+|"
    r"clinically proven|permanent(?:ly)?|miracle|treat(?:s|ed|ing)?)\b", re.I
)
_SUMMARY_BAD_CHARS_RE = re.compile(r"[<>{}\[\]`]")


def _is_sunscreen(product: str) -> bool:
    """A dedicated sunscreen. "Moisturizer with SPF 15" is NOT one (and is
    not removed from the night routine)."""
    if _SUNSCREEN_WORD_RE.search(product):
        return True
    return bool(_SPF_RE.search(product)) and not _MOISTURIZER_RE.search(product)


def _strip_prefix(text: str) -> str:
    for prefix in _EMOJI_PREFIXES:
        text = text.replace(prefix, "")
    return text.strip()



_INVISIBLE_RE = re.compile(
    "[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff\x00-\x08\x0b\x0c\x0e-\x1f\x7f]"
)
MAX_ITEM_LENGTH = 120


def _clean_list(items) -> List[str]:
    """
    Clean routine item labels: strings only, invisible/control characters removed
    (zero-width spaces and right-to-left overrides can hide or reorder text),
    whitespace normalised, length capped, case-insensitive de-duplication.
    Anything that is not a list (e.g. a bare string) yields an empty list instead
    of being split into single characters.
    """
    if not isinstance(items, (list, tuple)):
        return []

    out, seen = [], set()

    for item in items:
        if not isinstance(item, str):
            continue

        # Remove internal prompt-boundary tags accidentally echoed by the LLM.
        item = re.sub(r"</?user_input>", "", item, flags=re.IGNORECASE)
        item = _INVISIBLE_RE.sub("", item)

        # Normalize whitespace after removing the tags.
        item = " ".join(item.split()).strip()
	        # Ignore user metadata accidentally echoed as routine items.
        if re.match(
            r"^\s*[-â€¢]?\s*(skin type|concerns)\s*:",
            item,
            flags=re.IGNORECASE,
        ):
            continue

        if len(item) > MAX_ITEM_LENGTH:
            item = item[:MAX_ITEM_LENGTH].rstrip() + "..."

        if item and item.lower() not in seen:
            seen.add(item.lower())
            out.append(item)

    return out


def _capitalize(text: str) -> str:
    text = (text or "").strip()
    return text[:1].upper() + text[1:]


def _parse_freq(max_freq: Optional[str], default: int = 3) -> int:
    m = re.search(r"(\d+)\s*x", max_freq or "")
    return int(m.group(1)) if m else default


class HybridSafetyEngine:
    def __init__(self):
        # Tips tailored to specific active ingredients.
        self.active_tips = {
            "vitamin c": "Use in AM only; pairs well with vitamin E & ferulic acid for stability.",
            "retinol": "Start 1-2x/week; buffer with moisturizer; ALWAYS use SPF AM.",
            "glycolic acid": "Limit to 2x/week; avoid layering with other AHAs/BHAs same day.",
            "lactic acid": "Begin with 5% concentration; use PM only initially.",
            "salicylic acid": "Use a maximum of 2x/week; avoid if pregnant or allergic to aspirin.",
            "niacinamide": "Safe AM/PM; enhances ceramide production.",
            "hyaluronic acid": "Apply to damp skin; seals in moisture.",
        }

        # Ordered (a list, not a set) so tips come out in a stable order.
        self.default_tips = [
            "Apply moisturizer immediately after cleansing to lock in hydration.",
            "Use a humidifier in dry environments to prevent transepidermal water loss.",
            "Avoid hot water when cleansingâ€”it strips natural oils.",
            "Patch-test new products on jawline for 48 hours before full-face use.",
        ]

    # ------------------------------------------------------------------
    # helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _contains_active(product: str, name: str, own_inputs: Set[str]) -> bool:
        """True if a routine item represents this canonical active."""
        return name in mentioned_names(product) or product.strip().lower() in own_inputs

    @staticmethod
    def _validate_summary(text, declared: Set[str], pregnant: bool) -> Optional[str]:
        """
        Accept an LLM-written summary ONLY if it is plain, short, claim-free and
        mentions no ingredient the user did not list. Otherwise None, and the
        deterministic template is used instead.
        """
        if not isinstance(text, str):
            return None
        text = " ".join(_INVISIBLE_RE.sub("", text).split())
        if not 30 <= len(text) <= 450:
            return None
        if (_SUMMARY_URL_RE.search(text) or _SUMMARY_CLAIM_RE.search(text)
                or _SUMMARY_BAD_CHARS_RE.search(text)):
            return None
        mentioned = mentioned_names(text)
        if mentioned - declared:
            return None
        if pregnant and any(
            INGREDIENT_PROPERTIES.get(n, {}).get("type") == _SAFE_RETINOID_TYPE
            for n in mentioned
        ):
            return None
        return text

    @staticmethod
    def _template_summary(skin_type: str, concerns: str, am_names: List[str],
                          pm_names: List[str], pregnant: bool, has_schedule: bool) -> str:
        """Deterministic summary built only from facts in the final routine."""
        clean = lambda s: re.sub(r"[^A-Za-z0-9 &,/\-]", "", s or "")[:80].strip()
        skin = clean(skin_type).lower()
        focus = [c.strip().lower().replace("&", "and") for c in clean(concerns).split(",") if c.strip()]
        focus = [c for c in focus if "pregnan" not in c][:3]

        first = f"A simple {skin} skin routine" if skin else "A simple skincare routine"
        if focus:
            first += " focused on " + ", ".join(focus)
        parts = [first + "."]

        am = "Mornings: cleanse"
        if am_names:
            am += ", apply " + ", ".join(am_names[:4])
        parts.append(am + ", moisturize, then finish with sunscreen.")

        pm = "Evenings: cleanse"
        if pm_names:
            pm += ", apply " + ", ".join(pm_names[:4])
        parts.append(pm + " and moisturize.")

        if has_schedule:
            parts.append("Strong actives follow the weekly schedule shown below.")
        if pregnant:
            parts.append("Retinoids are left out because you indicated pregnancy or breastfeeding.")
        return " ".join(parts)

    @staticmethod
    def _rank(product: str) -> int:
        """Sort key giving cleanser -> toner -> actives -> moisturizer -> SPF."""
        if _is_sunscreen(product):
            return 6
        if _CLEANSER_RE.search(product):
            return 0
        if _MOISTURIZER_RE.search(product):
            return 4
        low = product.lower()
        if "toner" in low or "essence" in low:
            return 1
        return 2

    def _order(self, products: List[str]) -> List[str]:
        return sorted(products, key=self._rank)   # sorted() is stable

    @staticmethod
    def _strong_priority(concerns: str):
        acne = any(t in concerns.lower() for t in ("acne", "breakout", "comedone", "blemish"))
        order = (["retinoid", "bha", "acne_treatment", "aha"] if acne
                 else ["retinoid", "bha", "aha", "acne_treatment"])
        return {t: i for i, t in enumerate(order)}

    @staticmethod
    def _build_weekly_schedule(ordered: List[Tuple[str, int]]) -> Dict[str, List[str]]:
        """
        Spread strong actives over the week: at most one per night and never
        the same active on consecutive nights.
        """
        sched: Dict[str, List[str]] = {d: [] for d in DAYS}
        for idx, (label, freq) in enumerate(ordered):
            freq = max(1, min(freq, 4))
            picks: List[int] = []
            for k in range(freq):
                ideal = (idx + round(k * 7 / freq)) % 7
                for step in range(7):
                    d = (ideal + step) % 7
                    if sched[DAYS[d]]:
                        continue
                    if any(min((d - p) % 7, (p - d) % 7) <= 1 for p in picks):
                        continue
                    picks.append(d)
                    sched[DAYS[d]].append(label)
                    break
        return {d: v for d, v in sched.items() if v}

    # ------------------------------------------------------------------
    # main entry point
    # ------------------------------------------------------------------
    def intercept_and_remedy(
        self,
        llm_routine: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Deterministic safety pass over ANY routine (LLM output or fallback).
        The input dict is not mutated; a new routine dict is returned.
        """
        parsed_products = context.get("parsed_products", []) or []
        detected_actives = [a for a in (context.get("detected_actives") or []) if a.get("name")]
        concerns = str(context.get("concerns") or "")
        user_spf = context.get("spf_value")
        conflicts = context.get("conflicts", []) or []
        beneficial = context.get("beneficial_combinations", []) or []
        unverified = context.get("unverified_pairs", []) or []
        baseline_cleanser = context.get("cleanser") or "Gentle Cleanser"
        skin_type = str(context.get("skin_type") or "")

        meta: Dict[str, Any] = {
            "spf_added": False, "tips_refined": [], "warnings": [], "applied_edits": [],
        }

        def warn(msg: str):
            if msg not in meta["warnings"]:
                meta["warnings"].append(msg)

        def edit(msg: str):
            meta["applied_edits"].append(msg)

        morning = _clean_list(llm_routine.get("morning"))
        night = _clean_list(llm_routine.get("night"))
        routine: Dict[str, Any] = dict(llm_routine)

        names = [a["name"].strip().lower() for a in detected_actives]
        type_of = {a["name"].strip().lower(): a.get("type") for a in detected_actives}
        strength_of = {a["name"].strip().lower(): a.get("strength") for a in detected_actives}
        declared: Set[str] = set(names)
        removed_for_safety: Set[str] = set()      # never re-added below

        def own_inputs(name: str) -> Set[str]:
            return {
                p.get("original_input", "").strip().lower()
                for p in parsed_products
                if (p.get("ingredient") or "").lower() == name and p.get("original_input")
            }

        def contains(product: str, name: str) -> bool:
            return self._contains_active(product, name, own_inputs(name))

        def product_label(name: str) -> str:
            for p in parsed_products:
                if (p.get("ingredient") or "").lower() == name and p.get("original_input"):
                    return _capitalize(p["original_input"])
            return display_name(name)

        # ----------------------------------------------------------
        # STEP 1: SUNSCREEN (morning only, always present in the morning)
        # ----------------------------------------------------------
        before = list(night)
        night = [p for p in night if not _is_sunscreen(p)]
        if night != before:
            edit("Removed sunscreen from the night routine (sunscreen is a morning step).")

        user_sunscreen = next((p for p in parsed_products if p.get("type") == "sunscreen"), None)
        has_spf_am = any(_is_sunscreen(p) for p in morning)
        needs_spf_for_active = any(a.get("needs_spf") is True for a in detected_actives)

        if user_sunscreen and not has_spf_am:
            label = f"Sunscreen SPF {user_spf}" if user_spf else "Sunscreen"
            morning.append(label)
            meta["spf_added"] = True
            edit(f"Added user's sunscreen to morning routine: {label}")
            if not user_spf:
                warn("Sunscreen detected, but SPF strength was not specified. "
                     "Glowithm recommends using a broad-spectrum SPF 30+ sunscreen.")
        elif not user_sunscreen and not has_spf_am:
            morning.append("Sunscreen SPF 30+ (Glowithm recommendation)")
            meta["spf_added"] = True
            edit("Added broad-spectrum SPF 30+ because an identified active requires "
                 "daytime sun protection." if needs_spf_for_active else
                 "Added broad-spectrum SPF 30+ as a daily morning step.")

        if user_spf and user_spf < 30:
            warn(f"Your sunscreen is SPF {user_spf}. SPF 30 or higher is generally "
                 "recommended for daily use.")

        # ----------------------------------------------------------
        # STEP 2: AMBIGUOUS / UNIDENTIFIED PRODUCTS are actively removed
        # (previously only a warning was added, even if the LLM had
        # already placed the product, making the warning false)
        # ----------------------------------------------------------
        drop: Set[str] = set(_GENERIC_PLACEHOLDERS)
        seen_unknown: Set[str] = set()
        for p in parsed_products:
            if p.get("ingredient") is not None:
                continue
            original = (p.get("original_input") or "").strip()
            ptype = p.get("type")
            if ptype in RISKY_TYPES and p.get("needs_clarification"):
                drop.add(ptype)
                drop.add(original.lower())
                msg = (f"{ptype.title()} detected, but its active ingredient is unknown. "
                       f"Glowithm did not place it into the routine to avoid "
                       f"assuming its contents.")
                if ptype != "serum":
                    msg = (f"{original or ptype.title()} detected, but its active ingredient "
                           f"is unknown. Glowithm did not place it into the routine to "
                           f"avoid assuming its contents.")
                warn(msg)
            elif ptype is None and original and original.lower() not in seen_unknown:
                seen_unknown.add(original.lower())
                drop.add(original.lower())
                warn(f"Could not identify \"{original}\", so it was not added to your "
                     f"routine. Add the product type (e.g. serum) or its key ingredient.")
        morning = [p for p in morning if p.strip().lower() not in drop]
        night = [p for p in night if p.strip().lower() not in drop]

        # ----------------------------------------------------------
        # STEP 3: CONFLICT WARNINGS
        # ----------------------------------------------------------
        clean_conflicts = [_strip_prefix(c) for c in conflicts]
        for c in clean_conflicts:
            warn(f"Conflict detected: {c}")
        for u in unverified:
            warn(_strip_prefix(u))

        retinoid_names = {n for n in names if type_of.get(n) == _SAFE_RETINOID_TYPE}
        if retinoid_names and "benzoyl peroxide" in declared:
            warn("Retinoid and benzoyl peroxide were both detected. Compatibility depends "
                 "on the specific retinoid and formulation; verify product directions and "
                 "seek professional advice if unsure.")

        routine["conflicts"] = clean_conflicts
        routine["beneficial_combinations"] = [_strip_prefix(b) for b in beneficial]

        # ----------------------------------------------------------
        # STEP 4: PREGNANCY / BREASTFEEDING
        # Retinoids are removed (not just warned about); other
        # flagged actives get a "check with your doctor" note.
        # ----------------------------------------------------------
        # The explicit flag comes from the UI checkbox; the keyword check is kept
        # for API callers that put it in the free-text concerns.
        is_pregnant = bool(context.get("pregnant")) or any(
            t in concerns.lower() for t in _PREGNANCY_TERMS
        )
        if retinoid_names:
            warn("Retinoid detected - avoid use during pregnancy or when trying "
                "to conceive. Consult your healthcare professional.")
        if is_pregnant:
            for name in sorted(retinoid_names):
                before_m, before_n = len(morning), len(night)
                morning = [p for p in morning if not contains(p, name)]
                night = [p for p in night if not contains(p, name)]
                removed_for_safety.add(name)
                if len(morning) != before_m or len(night) != before_n:
                    edit(f"Removed {display_name(name)} because pregnancy/breastfeeding "
                         f"was mentioned.")
            if retinoid_names:
                warn("Retinoids were left out of your routine because you mentioned "
                     "pregnancy or breastfeeding. Please check with your doctor.")
            for name in names:
                if (type_of.get(name) != _SAFE_RETINOID_TYPE
                        and INGREDIENT_PROPERTIES.get(name, {}).get("pregnancy_safe") is False):
                    warn(f"{display_name(name)} may not be recommended during pregnancy or "
                         f"breastfeeding. Please check with your doctor before using it.")

        # ----------------------------------------------------------
        # STEP 5: HALLUCINATION GUARD
        # A routine item may only mention guarded actives the user declared
        # (previously ONE declared name anywhere in the item was enough).
        # ----------------------------------------------------------
        def allowed(product: str) -> bool:
            return not ((mentioned_names(product) & GUARDED_ACTIVES) - declared)

        morning = [p for p in morning if allowed(p)]
        night = [p for p in night if allowed(p)]

        # ----------------------------------------------------------
        # STEP 6: AM/PM PLACEMENT of every declared active
        # ----------------------------------------------------------
        for name in names:
            if name in removed_for_safety:
                continue
            placement = (ACTIVE_PLACEMENT_BY_NAME.get(name)
                         or ACTIVE_PLACEMENT_BY_TYPE.get(type_of.get(name)))
            if placement is None:
                continue

            if placement == "morning":
                old = list(night)
                night = [p for p in night if not contains(p, name)]
                if old != night:
                    edit(f"Moved {display_name(name)} from the night routine to its "
                         f"required morning placement.")
            elif placement == "night":
                old = list(morning)
                morning = [p for p in morning if not contains(p, name)]
                if old != morning:
                    edit(f"Moved {display_name(name)} from the morning routine to its "
                         f"required night placement.")

            in_m = any(contains(p, name) for p in morning)
            in_n = any(contains(p, name) for p in night)
            label = product_label(name)
            own_type = next((p.get("type") for p in parsed_products
                             if (p.get("ingredient") or "").lower() == name), None)

            if placement == "morning" and not in_m:
                morning.append(label)
                edit(f"Added {label} to the morning routine because its active "
                     f"placement is morning-only.")
            elif placement == "night" and not in_n:
                night.append(label)
                edit(f"Added {label} to the night routine because its active "
                     f"placement is night-only.")
            elif placement == "both" and not in_m and not in_n:
                morning.append(label)
                edit(f"Added {label} to the morning routine because it was missing "
                     f"from the generated routine.")
                if own_type in ("moisturizer", "cleanser", "cream"):
                    night.append(label)
                    edit(f"Added {label} to the night routine as well.")

        # ----------------------------------------------------------
        # STEP 6b: the user's own plain cleanser / moisturizer are used
        # instead of generic placeholders
        # ----------------------------------------------------------
        done_types: Dict[str, str] = {}
        skipped_basics: List[Tuple[str, str]] = []
        protected = {q.get("original_input", "").strip().lower() for q in parsed_products}

        for p in parsed_products:
            if p.get("ingredient") is not None or p.get("type") not in ("cleanser", "moisturizer"):
                continue
            original = (p.get("original_input") or "").strip()
            if not original or p.get("needs_clarification"):
                continue
            if p["type"] in done_types:
                skipped_basics.append((p["type"], original))
                continue
            done_types[p["type"]] = original
            regex = _CLEANSER_RE if p["type"] == "cleanser" else _MOISTURIZER_RE

            # Only a GENERIC placeholder may be replaced. An item that names a
            # recognised ingredient or is another of the user's own products
            # ("Retinal cream", "Salicylic Acid Cleanser") is never overwritten.
            def replaceable(item, regex=regex):
                return bool(regex.search(item) and not _is_sunscreen(item)
                            and not mentioned_names(item)
                            and item.strip().lower() not in protected)

            for lst in (morning, night):
                if any(i.lower() == original.lower() for i in lst):
                    continue
                idx = next((k for k, i in enumerate(lst) if replaceable(i)), None)
                if idx is not None:
                    lst[idx] = original
                elif p["type"] == "cleanser":
                    lst.insert(0, original)
                else:
                    lst.append(original)

        for kind, extra in skipped_basics:
            warn(f"You listed more than one {kind}. Glowithm used \"{done_types[kind]}\" "
                 f"in your routine; \"{extra}\" was not added, so use it as you prefer.")

        # ----------------------------------------------------------
        # STEP 7: ONE STRONG ACTIVE PER ROUTINE (deterministic priority)
        # ----------------------------------------------------------
        priority = self._strong_priority(concerns)
        strong = sorted(
            [n for n in dict.fromkeys(names) if type_of.get(n) in STRONG_ACTIVE_TYPES
             and n not in removed_for_safety],
            key=lambda n: (priority.get(type_of[n], 99), names.index(n)),
        )
        rotated: Dict[str, List[str]] = {}       # routine name -> removed actives
        # Scheduling instructions must be generated by the safety engine,
        # not trusted from the LLM response.
        alternate: List[str] = []
        tips_extra: List[str] = []

        if len(strong) > 1:
            warn(
                "Multiple strong active ingredients detected. Combining them in "
                "the same routine may increase irritation. Follow product directions "
                "and consider using them on separate days."
            )

            for routine_name, lst in (("morning", morning), ("night", night)):
                present = [n for n in strong if any(contains(p, n) for p in lst)]
                if len(present) <= 1:
                    continue
                keep, removed = present[0], present[1:]
                new_lst = []
                for p in lst:
                    gone = [r for r in removed if contains(p, r)]
                    if not gone:
                        new_lst.append(p)
                    elif contains(p, keep):
                        new_lst.append(p)       # one product holds both: keep it
                        warn(f"\"{p}\" contains more than one strong active; consider "
                             f"separating them.")
                if routine_name == "morning":
                    morning = new_lst
                else:
                    night = new_lst

                keep_d = display_name(keep)

                # An active that stays in the MORNING routine (e.g. a benzoyl peroxide
                # wash) only leaves the night routine; it is not scheduled for nights.
                kept_in_am = ([r for r in removed if any(contains(p, r) for p in morning)]
                              if routine_name == "night" else [])
                alt_removed = [r for r in removed if r not in kept_in_am]
                rotated[routine_name] = alt_removed

                meta["applied_edits"] = [
                    e for e in meta["applied_edits"]
                    if not (any(display_name(r).lower() in e.lower() for r in removed)
                            and (e.startswith("Moved ") or e.startswith("Added ")))
                ]

                for r in kept_in_am:
                    edit(f"Kept {display_name(r)} in the morning routine only; it was "
                         f"removed from the night routine to avoid layering it with {keep_d}.")

                if alt_removed:
                    removed_d = ", ".join(display_name(r) for r in alt_removed)
                    edit(f"Limited {routine_name.upper()} to one strong active ({keep_d}); "
                         f"moved {removed_d} to alternate use instead of layering.")
                    warn(f"{routine_name.upper()} contained multiple strong actives. Only "
                         f"{keep_d} remains in that routine; {removed_d} should be used on "
                         f"alternate days instead.")

                    rotation = (f"Use {keep_d} on its scheduled nights. Use {removed_d} on "
                                f"separate, non-consecutive nights instead. Do not layer them "
                                f"in the same routine.")
                    if rotation not in alternate:
                        alternate.append(rotation)
                    if rotation not in tips_extra:
                        tips_extra.append(rotation)

        routine["alternate_nights"] = alternate

        # ----------------------------------------------------------
        # STEP 8: FREQUENCY LIMITS + WEEKLY SCHEDULE
        # ----------------------------------------------------------
        frequency = []
        for a in detected_actives:
            if a.get("max_freq") and a["name"].lower() not in removed_for_safety:
                frequency.append(
                    f"{display_name(a['name'])}: limit to {a['max_freq']} "
                    f"(conservative starting guideline)."
                )
        routine["frequency"] = list(dict.fromkeys(frequency))
        if routine["frequency"]:
            edit("Applied frequency limits for detected active ingredients.")

        night_strong = [n for n in strong if any(contains(p, n) for p in night)]
        rotated_night = rotated.get("night", [])
        sched_names = night_strong + [n for n in rotated_night if n not in night_strong]
        sched_names = [n for n in sched_names
                       if INGREDIENT_PROPERTIES.get(n, {}).get("max_freq") or n in rotated_night]
        # Discard any incoming schedule; only retain a schedule generated below.
        routine.pop("weekly_schedule", None)
        weekly: Dict[str, List[str]] = {}
        if sched_names:
            weekly = self._build_weekly_schedule([
                (display_name(n),
                 _parse_freq(next((a.get("max_freq") for a in detected_actives
                                   if a["name"].lower() == n), None), default=3))
                for n in sched_names
            ])

            if weekly:
                routine["weekly_schedule"] = weekly
                tips_extra.append(
                    "Follow the suggested weekly schedule to rotate active ingredients safely."
                )


        # ----------------------------------------------------------
        # STEP 9: STRENGTH CAUTIONS
        # ----------------------------------------------------------
        for name in names:
            limit, strength = HIGH_STRENGTH.get(name), strength_of.get(name)
            if limit and strength and strength > limit and name not in removed_for_safety:
                warn(f"{display_name(name)} at {strength:g}% is a high strength. Patch-test "
                     f"and start with less frequent use.")

        # ----------------------------------------------------------
        # STEP 10: COMPLETENESS (cleanser + moisturizer in both routines)
        # ----------------------------------------------------------
        for routine_name, lst in (("morning", morning), ("night", night)):
            if not any(_CLEANSER_RE.search(p) for p in lst):
                lst.insert(0, baseline_cleanser)
                edit(f"Added {baseline_cleanser} to the {routine_name} routine to ensure "
                     f"basic routine completeness.")
            if not any(_MOISTURIZER_RE.search(p) and not _CLEANSER_RE.search(p)
                       and not _is_sunscreen(p) for p in lst):
                lst.append("Hydrating Moisturizer")
                edit(f"Added Hydrating Moisturizer to the {routine_name} routine to "
                     f"ensure basic routine completeness.")

        morning = self._order(_clean_list(morning))
        night = self._order(_clean_list(night))

        # ----------------------------------------------------------
        # STEP 11: TIPS (built LAST, from the final routine)
        # ----------------------------------------------------------
        rotated_all = {n for lst in rotated.values() for n in lst}
        tips = list(self.default_tips)

        def present(n: str) -> bool:
            return n in rotated_all or any(contains(p, n) for p in morning + night)

        for name in names:
            if name in removed_for_safety or not present(name):
                continue
            tip = self.active_tips.get(name)
            if tip is None:
                note = INGREDIENT_PROPERTIES.get(name, {}).get("note")
                if note:
                    tip = f"{display_name(name)}: {note}."
            if tip and tip not in tips:
                tips.append(tip)
                meta["tips_refined"].append(f"Added tip for {name}: {tip}")
        tips.extend(routine["frequency"])
        tips.extend(tips_extra)
        routine["tips"] = list(dict.fromkeys(tips))

        routine["morning"] = morning
        routine["night"] = night

        # ----------------------------------------------------------
        # STEP 12: SUMMARY (AI text only when it passes validation)
        # ----------------------------------------------------------
        shown = [n for n in dict.fromkeys(names)
                 if n not in removed_for_safety
                 and INGREDIENT_PROPERTIES.get(n, {}).get("type") not in ("mineral_spf", "chemical_spf")]
        am_names = [display_name(n) for n in shown if any(contains(p, n) for p in morning)]
        pm_names = [display_name(n) for n in shown if any(contains(p, n) for p in night)]

        ai_summary = self._validate_summary(llm_routine.get("summary"), declared, is_pregnant)
        if ai_summary:
            routine["summary"], routine["summary_source"] = ai_summary, "ai"
        else:
            routine["summary"] = self._template_summary(
                skin_type, concerns, am_names, pm_names, is_pregnant, bool(weekly))
            routine["summary_source"] = "template"

        logger.info(
            "Safety engine applied: SPF added=%s, tips refined=%d, warnings=%d, edits=%d",
            meta["spf_added"], len(meta["tips_refined"]),
            len(meta["warnings"]), len(meta["applied_edits"]),
        )
        return routine, meta
