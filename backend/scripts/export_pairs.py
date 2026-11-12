"""
Export the ingredient pair table for the frontend.

WHY: the ingredients page used to ship its own hand-written compatibility table
that disagreed with the backend (e.g. Salicylic Acid + Vitamin C was "generally
compatible" on the site but CAUTION in the backend).  data/ingredient_pairs.csv
is now the single source of truth; the website reads the JSON generated here.

Run after editing the CSV:
    python scripts/export_pairs.py            # writes ../frontend/data/ingredient_pairs.json
    python scripts/export_pairs.py out.json   # custom path
"""
import json
import os
import sys

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)

from services.conflict_checker import SEVERITY, load_pair_table  # noqa: E402


def build_pairs_json():
    table = load_pair_table()
    pairs = {}
    for key, label in table.items():
        a, b = sorted(key)
        pairs[f"{a}+{b}"] = label
    return {"version": 1, "source": "backend/data/ingredient_pairs.csv",
            "labels": sorted(SEVERITY, key=SEVERITY.get),
            "pairs": dict(sorted(pairs.items()))}


def default_output_path():
    return os.path.join(os.path.dirname(BACKEND), "frontend", "data", "ingredient_pairs.json")


def main(argv):
    path = argv[1] if len(argv) > 1 else default_output_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = build_pairs_json()
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(f"Wrote {len(data['pairs'])} pairs to {path}")


if __name__ == "__main__":
    main(sys.argv)
