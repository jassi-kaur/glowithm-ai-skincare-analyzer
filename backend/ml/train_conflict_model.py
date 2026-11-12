
"""Train and evaluate a candidate skincare ingredient conflict classifier.

This script never overwrites the currently deployed conflict_model.joblib.
The dataset is small, so evaluation results should be treated as exploratory.
"""

from pathlib import Path
import sys

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold,cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# Resolve paths relative to this script, not the current terminal directory.
ML_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ML_DIR.parent
DATA_PATH = BACKEND_DIR / "data" / "ingredient_pairs.csv"

# Deliberately separate from the current production model.
CANDIDATE_PATH = ML_DIR / "conflict_model_candidate.joblib"

FEATURES = [
    "ingredient_a",
    "ingredient_b",
    "category_a",
    "category_b",
    "function_a",
    "function_b",
]
TARGET = "label"
EXPECTED_LABELS = {"SAFE", "CAUTION", "AVOID"}
RANDOM_STATE = 42


def main():
    if not DATA_PATH.is_file():
        sys.exit(f"ERROR: Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [TARGET]
    missing_columns = [
        column for column in required_columns if column not in df.columns
    ]
    if missing_columns:
        sys.exit(f"ERROR: Missing CSV columns: {missing_columns}")

    if df[required_columns].isnull().any().any():
        sys.exit("ERROR: Required columns contain missing values.")

    df[TARGET] = df[TARGET].astype(str).str.strip().str.upper()

    unexpected_labels = set(df[TARGET].unique()) - EXPECTED_LABELS
    if unexpected_labels:
        sys.exit(f"ERROR: Unexpected labels: {sorted(unexpected_labels)}")

    class_counts = df[TARGET].value_counts()
    print(f"Dataset: {DATA_PATH}")
    print(f"Rows: {len(df)}")
    print("\nClass counts:")
    print(class_counts.to_string())

    if len(class_counts) < 2:
        sys.exit("ERROR: At least two classes are required for training.")


    # Five-fold stratified cross-validation lets each AVOID example
    # appear in a held-out fold once. Results remain exploratory.
    if class_counts.min() < 5:
        sys.exit(
            "ERROR: Five-fold stratified evaluation requires at least "
            "five rows in every class."
        )

    X = df[FEATURES]
    y = df[TARGET]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                FEATURES,
            )
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=100,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                    max_features="sqrt",
                ),
            ),
        ]
    )

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=RANDOM_STATE,
    )

    try:
        predictions = cross_val_predict(
            pipeline,
            X,
            y,
            cv=cv,
            method="predict",
        )
    except ValueError as exc:
        sys.exit(f"ERROR: Cross-validation failed: {exc}")

    print("\n5-fold cross-validation results (exploratory only):")
    print(
        classification_report(
            y,
            predictions,
            labels=["AVOID", "CAUTION", "SAFE"],
            zero_division=0,
        )
    )

    print("Confusion matrix (rows=true, columns=predicted)")
    print("Label order: AVOID, CAUTION, SAFE")
    print(
        confusion_matrix(
            y,
            predictions,
            labels=["AVOID", "CAUTION", "SAFE"],
        )
    )

    # Ingredient-held-out validation (exploratory only).
    # Each ingredient is excluded from training in its own evaluation run.
    # Every dataset row is tested for both of its ingredients. We average
    # those two probability predictions so each unique row counts once
    # in the pooled report.
    print("\nIngredient-held-out validation (exploratory only):")

    label_order = ["AVOID", "CAUTION", "SAFE"]
    ingredients = sorted(set(df["ingredient_a"]) | set(df["ingredient_b"]))

    probability_sums = {
        row_index: {label: 0.0 for label in label_order}
        for row_index in df.index
    }
    prediction_counts = {row_index: 0 for row_index in df.index}

    print(f"Ingredients evaluated: {len(ingredients)}")
    print("\nPer-ingredient holdout coverage:")
    print(f"{'Ingredient':32} {'Rows':>5} {'AVOID':>7} {'AVOID correct':>14}")
    print("-" * 62)

    for ingredient in ingredients:
        test_mask = (
            df["ingredient_a"].eq(ingredient)
            | df["ingredient_b"].eq(ingredient)
        )

        train_x = df.loc[~test_mask, FEATURES]
        train_y = df.loc[~test_mask, TARGET]
        test_x = df.loc[test_mask, FEATURES]
        test_y = df.loc[test_mask, TARGET]
        test_indices = df.index[test_mask]

        if set(train_y.unique()) != set(label_order):
            sys.exit(
                f"ERROR: Holding out {ingredient!r} leaves a training "
                "set without all three classes."
            )

        # Refit the pipeline from scratch without the held-out ingredient.
        pipeline.fit(train_x, train_y)
        probabilities = pipeline.predict_proba(test_x)
        model_classes = list(pipeline.classes_)

        fold_predictions = []

        for row_index, row_probabilities in zip(test_indices, probabilities):
            for class_index, label in enumerate(model_classes):
                probability_sums[row_index][label] += row_probabilities[class_index]
            prediction_counts[row_index] += 1
            fold_predictions.append(model_classes[row_probabilities.argmax()])

        avoid_mask = test_y.eq("AVOID").to_numpy()
        avoid_count = int(avoid_mask.sum())
        avoid_correct = sum(
            actual == "AVOID" and predicted == "AVOID"
            for actual, predicted in zip(test_y.tolist(), fold_predictions)
        )

        print(
            f"{ingredient:32} {len(test_y):5d} "
            f"{avoid_count:7d} {avoid_correct:14d}"
        )

    # Average repeated holdout predictions for each unique CSV row.
    heldout_predictions = []
    heldout_actuals = []

    for row_index in df.index:
        count = prediction_counts[row_index]
        if count == 0:
            sys.exit(f"ERROR: Dataset row {row_index} was never evaluated.")

        average_probabilities = {
            label: probability_sums[row_index][label] / count
            for label in label_order
        }
        predicted_label = max(average_probabilities, key=average_probabilities.get)

        heldout_predictions.append(predicted_label)
        heldout_actuals.append(df.loc[row_index, TARGET])

    print(
        f"\nPooled results across unique rows: "
        f"{len(heldout_actuals)} rows"
    )
    print(
        "Each row's probabilities are averaged across its ingredient-held-out "
        "runs; these are not independent observations."
    )
    print(
        classification_report(
            heldout_actuals,
            heldout_predictions,
            labels=label_order,
            zero_division=0,
        )
    )

    print("Confusion matrix (rows=true, columns=predicted)")
    print("Label order: AVOID, CAUTION, SAFE")
    print(
        confusion_matrix(
            heldout_actuals,
            heldout_predictions,
            labels=label_order,
        )
    )
    # Train the candidate on all rows after cross-validation.
    # Never overwrite the deployed production model.
    pipeline.fit(X, y)
    joblib.dump(pipeline, CANDIDATE_PATH)
    print(f"\nCandidate model saved to: {CANDIDATE_PATH}")
    print("The existing conflict_model.joblib was not modified.")


if __name__ == "__main__":
    main()
