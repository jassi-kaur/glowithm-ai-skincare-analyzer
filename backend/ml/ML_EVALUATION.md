# ML conflict classifier - evaluation and limitations

Numbers below come from running `python ml/train_conflict_model.py` on the current
`data/ingredient_pairs.csv` (46 rows: CAUTION 23, SAFE 18, AVOID 5). Re-run the script
after any change to the CSV; do not quote older numbers.

## Results

| Validation | Accuracy | AVOID precision / recall | Notes |
|---|---|---|---|
| Always predict CAUTION (baseline) | 0.50 | - | majority class |
| 5-fold cross-validation | **0.80** | 0.75 / **0.60** | pairs of the same ingredient leak between folds, so this is optimistic |
| Ingredient-held-out | **0.76** | 1.00 / **0.40** | the model never saw the held-out ingredient: closest to "a new ingredient" |
| In-sample (what a training-data test shows) | 1.00 | - | memorisation, not evidence of quality |

Older figures (accuracy 0.89 on a 9-row test split, AVOID F1 1.00) came from a single tiny
split and should not be quoted: with only 5 AVOID examples a single pair changes AVOID
recall by 20 percentage points.

## What this means for the application

* **The CSV pair table is the primary source.** It answers 44 of the 231 possible pairs
  between recognised ingredients, in any order, with no model involved.
* The model is a **labelled fallback** ("estimated from limited data") for pairs the table
  does not cover. It cannot evaluate 6 ingredients at all (avobenzone, glycerin,
  hydroquinone, titanium dioxide, vitamin E, zinc oxide).
* It only produces a warning when its prediction is non-SAFE with confidence >= 0.7 AND neither
  ingredient is a gentle type (humectant, ceramide, emollient, peptide). With the shipped
  model that currently applies to four pairs: adapalene + lactic acid, adapalene + salicylic
  acid, azelaic acid + lactic acid, tretinoin + vitamin C.
* A pair that is neither in the table nor estimable, and involves a reactive active, shows
  "compatibility could not be verified" instead of silently passing.
* Because AVOID recall is low, **a missing warning must never be read as "safe"**. This is
  why the deterministic safety engine, not the classifier, has the final say.

## Known limitations

* 46 rows and only 5 AVOID examples: far too small for clinical reliability. Labels were
  curated by hand and should be reviewed against dermatology sources (for example
  adapalene + benzoyl peroxide is a marketed combination and is labelled CAUTION).
* The deployed `conflict_model.joblib` was produced by an earlier script and is not
  reproducible from the current one. `conflict_model_candidate.joblib` is what
  `train_conflict_model.py` writes today; replacing the deployed model is a deliberate step.
* The model was saved with scikit-learn 1.9.0, which `requirements.txt` pins. Loading it with
  another version produces warnings and may change predictions.

## Most valuable improvement

Add curated rows to the CSV for the pairs users actually enter. Each row is answered
exactly, whereas retraining on this little data changes little.
