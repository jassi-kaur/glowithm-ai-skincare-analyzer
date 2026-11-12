import os
import sys

import joblib
import pandas as pd

# Make `services` importable when this script is run directly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ingredient_metadata import get_category_function

# ----------------------------------------------------------------------
# NOTE ON WHAT THIS TEST ACTUALLY PROVES
# ----------------------------------------------------------------------
# Every pair below is copied verbatim from data/ingredient_pairs.csv —
# the same 42-row file the model was trained on. Because the model's
# features include the raw ingredient_a/ingredient_b names (not just
# their category/function), a "pass" here mostly shows the model
# memorized these exact rows, not that it generalizes to ingredient
# pairs it has never seen. Treat 100% here as "the model didn't forget
# its own training data," not as evidence it's ready for arbitrary
# user input. To actually test generalization, you'd need pairs of
# ingredients that are NOT in ingredient_pairs.csv at all — which the
# current 42-row dataset doesn't leave you enough of to do
# meaningfully. Growing that dataset is the real next step for
# Phase 1 (see the project review).
# ----------------------------------------------------------------------


def test_ml_predictions():
    """Test the ML model on known (training-set) ingredient pairs."""

    model_path = os.path.join(os.path.dirname(__file__), "conflict_model.joblib")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at {model_path}. "
            "Run train_conflict_model.py first."
        )

    model = joblib.load(model_path)
    print(f"✅ Loaded model from {model_path}\n")

    test_cases = [
        ("retinol", "salicylic_acid", "CAUTION",
         "Retinoid + BHA -> Should be CAUTION (irritation risk)"),
        ("hyaluronic_acid", "ceramide", "SAFE",
         "Hydrator + Barrier Support -> Should be SAFE (synergistic)"),
        ("retinol", "benzoyl_peroxide", "AVOID",
         "Retinoid + Acne Treatment -> Should be AVOID (chemical inactivation)"),
        ("niacinamide", "retinol", "SAFE",
         "Vitamin B3 + Retinoid -> Should be SAFE (barrier support)"),
        ("vitamin_c", "glycolic_acid", "CAUTION",
         "Antioxidant + AHA -> Should be CAUTION (pH conflict)"),
    ]

    print("🧪 Testing ML Predictions (training-set pairs — see note above)\n" + "=" * 50)

    all_passed = True

    for ing_a, ing_b, expected_label, description in test_cases:

        # FIX: previously this file hardcoded its own get_category()/
        # get_function() maps, duplicating (and risking drift from)
        # services/ingredient_metadata.py's CSV-driven lookup. Now it
        # imports the same function the real app uses, so there's one
        # source of truth for ingredient -> category/function.
        category_a, function_a = get_category_function(ing_a)
        category_b, function_b = get_category_function(ing_b)

        input_df = pd.DataFrame([{
            "ingredient_a": ing_a,
            "ingredient_b": ing_b,
            "category_a": category_a,
            "category_b": category_b,
            "function_a": function_a,
            "function_b": function_b
        }])

        prediction = model.predict(input_df)[0]
        probabilities = model.predict_proba(input_df)[0]
        confidence = max(probabilities)

        passed = (prediction == expected_label)

        status = "PASS" if passed else "FAIL"
        print(
            f"{status}: {ing_a} + {ing_b} | "
            f"Expected={expected_label}, Predicted={prediction}, "
            f"Confidence={confidence:.2f}"
        )

        if not passed:
            all_passed = False

    print("=" * 50)
    if all_passed:
        print("🎉 All training-set pairs predicted correctly (see the note above on what this does/doesn't prove).")
    else:
        print("⚠️  Some predictions didn't match — review before proceeding.")

    # Fail loudly under pytest (previously this only returned a bool, which
    # pytest ignores, so a failing model still showed up as "passed").
    assert all_passed, "ML model no longer reproduces its training-set labels"


if __name__ == "__main__":
    test_ml_predictions()
