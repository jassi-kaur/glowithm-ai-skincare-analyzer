import logging
import os

import joblib
import pandas as pd

from .ingredient_metadata import get_category_function

logger = logging.getLogger(__name__)


class MLConflictChecker:
    """
    Loads the trained ingredient-conflict model once (singleton) and
    exposes predict_conflict().

    FIX: previously, if the model file was missing or failed to load,
    __init__ raised FileNotFoundError. That happens *before* any
    try/except in the request flow (check_conflicts() is called ahead
    of the LLM's try/except in analyzer.py), so a missing model file
    used to take down the ENTIRE /analyze request instead of just
    disabling ML-based conflict checking. Now a load failure is logged
    and predict_conflict() simply returns None (falls back to
    deterministic rules only) instead of raising.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLConflictChecker, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        model_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "ml", "conflict_model.joblib"
        )

        self.model = None

        if not os.path.exists(model_path):
            logger.error(
                "ML conflict model not found at %s. "
                "Run backend/ml/train_conflict_model.py first. "
                "Falling back to deterministic-rules-only conflict checking.",
                model_path
            )
            self._initialized = True
            return

        try:
            self.model = joblib.load(model_path)
            logger.info("[ML Service] Model loaded from %s", model_path)
        except Exception as e:
            logger.error(
                "Failed to load ML conflict model from %s: %s. "
                "Falling back to deterministic-rules-only conflict checking.",
                model_path, e
            )
            self.model = None

        self._initialized = True

    def predict_conflict(self, ingredient_a, ingredient_b):
        """
        Predict conflict between two ingredients by name.

        Args:
            ingredient_a, ingredient_b (str): Ingredient names
                (e.g., 'retinol', 'salicylic_acid')

        Returns:
            dict: {'label': str, 'confidence': float}, or None if the
            model isn't loaded or either ingredient is unknown.
        """


        if self.model is None:
            return None

        try:
            cat_a, func_a = get_category_function(ingredient_a)
            cat_b, func_b = get_category_function(ingredient_b)

            if cat_a is None or cat_b is None or func_a is None or func_b is None:
                return None

            input_df = pd.DataFrame([{
                "ingredient_a": ingredient_a,
                "ingredient_b": ingredient_b,
                "category_a": cat_a,
                "category_b": cat_b,
                "function_a": func_a,
                "function_b": func_b
            }])

            prediction = self.model.predict(input_df)[0]
            probabilities = self.model.predict_proba(input_df)[0]
            confidence = float(max(probabilities))

            return {
                "label": str(prediction),
                "confidence": confidence
            }

        except Exception:
            logger.exception(
                "ML conflict prediction failed for %s + %s. "
                "Falling back to non-ML conflict checking.",
                ingredient_a,
                ingredient_b
            )
            return None



def is_available():
    """True when the ML model loaded successfully (used by /health)."""
    return MLConflictChecker().model is not None


def predict_conflict(ingredient_a, ingredient_b):
    """Convenience function for external use."""
    checker = MLConflictChecker()
    return checker.predict_conflict(ingredient_a, ingredient_b)
