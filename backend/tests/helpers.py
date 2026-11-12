import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.analyzer import parse_products          # noqa: E402
from services.conflict_checker import check_conflicts_detailed  # noqa: E402
from services.safety_engine import HybridSafetyEngine  # noqa: E402


def basic_llm(**overrides):
    routine = {
        "morning": ["Cleanser", "Moisturizer"],
        "night": ["Cleanser", "Moisturizer"],
        "conflicts": [],
        "tips": [],
    }
    routine.update(overrides)
    return routine


def run_engine(products, llm=None, concerns="dull skin"):
    """Parse -> conflicts -> safety engine, exactly like analyze_skin does."""
    parsed = parse_products(products)
    detail = check_conflicts_detailed(products, actives=parsed["actives"])
    context = {
        "concerns": concerns,
        "parsed_products": parsed["products"],
        "detected_actives": parsed["actives"],
        "spf_value": parsed["spf_value"],
        "conflicts": detail["warnings"],
        "beneficial_combinations": detail["beneficial"],
        "unverified_pairs": detail["unverified"],
        "cleanser": "Gentle Cleanser",
    }
    return HybridSafetyEngine().intercept_and_remedy(llm or basic_llm(), context)


def has(items, text):
    return any(text.lower() in i.lower() for i in items)
