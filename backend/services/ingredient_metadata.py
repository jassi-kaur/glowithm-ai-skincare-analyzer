import logging
import os
import threading

import pandas as pd

logger = logging.getLogger(__name__)

_cache = None
_lock = threading.Lock()


def load_ingredient_metadata():
    """
    Load ingredient -> (category, function) mapping from the training data.

    FIX: this used to be wrapped in @lru_cache, which also cached the
    *failure* result ({}, {}) -- so after one bad read (CSV briefly missing,
    mid-edit, bad encoding) every later call kept returning "nothing known"
    until the server restarted.  Now only a SUCCESSFUL load is cached; a
    failure is logged and retried on the next call.
    """
    global _cache
    if _cache is not None:
        return _cache

    with _lock:
        if _cache is not None:
            return _cache

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        csv_path = os.path.join(base_dir, "data", "ingredient_pairs.csv")

        try:
            df = pd.read_csv(csv_path)
        except Exception as e:
            logger.error(
                "Could not load ingredient metadata from %s: %s. "
                "Lookups return unknown until this is fixed (will retry).",
                csv_path, e,
            )
            return {}, {}

        ingredient_to_category = {}
        ingredient_to_function = {}

        for _, row in df.iterrows():
            for side in ("a", "b"):
                ing = row[f"ingredient_{side}"]
                if ing not in ingredient_to_category:  # first occurrence wins
                    ingredient_to_category[ing] = row[f"category_{side}"]
                    ingredient_to_function[ing] = row[f"function_{side}"]

        _cache = (ingredient_to_category, ingredient_to_function)
        return _cache



def get_category_function(ingredient):
    """Return (category, function), or (None, None) if unknown."""
    if not ingredient:
        return None, None

    normalized = str(ingredient).strip().casefold().replace(" ", "_")
    cat_map, func_map = load_ingredient_metadata()

    return cat_map.get(normalized), func_map.get(normalized)
