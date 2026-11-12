from unittest import mock

from helpers import parse_products
from services.conflict_checker import check_conflicts, check_conflicts_detailed


def detail(text):
    return check_conflicts_detailed(text, actives=parse_products(text)["actives"])


def test_retinol_benzoyl_peroxide_is_avoid():
    w = detail("retinol serum, benzoyl peroxide cleanser")["warnings"]
    assert len(w) == 1 and "Retinol" in w[0] and "Benzoyl Peroxide" in w[0] and "avoid" in w[0].lower()


def test_result_does_not_depend_on_input_order():
    a = detail("retinol serum, salicylic acid toner")["warnings"]
    b = detail("salicylic acid toner, retinol serum")["warnings"]
    assert a and sorted(x.split(":")[1] for x in a) == sorted(x.split(":")[1] for x in b)


def test_reports_the_ingredient_the_user_actually_has():
    # used to say "Glycolic Acid + Retinol" because category -> aliases[0]
    w = detail("lactic acid serum, retinol serum")["warnings"]
    assert w and "Lactic Acid" in w[0] and "Glycolic" not in w[0]


def test_tretinoin_is_not_treated_as_retinol():
    w = detail("tretinoin cream, benzoyl peroxide wash")["warnings"]
    assert w and "Tretinoin" in w[0] and "Retinol" not in w[0]


def test_same_category_pairs_are_checked():
    # glycolic + lactic (both AHAs) were skipped before; the CSV marks them CAUTION
    w = detail("glycolic acid serum, lactic acid toner")["warnings"]
    assert w and "caution" in w[0].lower()


def test_vitamin_c_and_e_are_not_flagged():
    assert detail("vitamin c serum, vitamin e oil")["warnings"] == []


def test_adapalene_benzoyl_peroxide_is_caution_not_avoid():
    # adapalene + BPO is a marketed combination product
    w = detail("adapalene gel, benzoyl peroxide gel")["warnings"]
    assert w and "caution" in w[0].lower() and "avoid" not in w[0].lower()

def test_caution_warning_does_not_forbid_layering():
    w = detail("adapalene gel, benzoyl peroxide gel")["warnings"]
    assert w
    assert "potential irritation" in w[0].lower()
    assert "follow product instructions" in w[0].lower()
    assert "do not layer" not in w[0].lower()

def test_pair_table_works_without_the_ml_model():
    with mock.patch("services.conflict_checker.predict_conflict", return_value=None):
        w = detail("retinol serum, benzoyl peroxide cleanser")["warnings"]
    assert w and "avoid" in w[0].lower()


def test_unknown_pair_is_flagged_not_silently_safe():
    r = detail("hydroquinone cream, tretinoin cream")
    assert r["warnings"] == [] and len(r["unverified"]) == 1
    assert "could not be verified" in r["unverified"][0]


def test_low_confidence_ml_estimate_flags_reactive_pair_as_unverified():
    fake_prediction = {"label": "CAUTION", "confidence": 0.55}

    with mock.patch(
        "services.conflict_checker.predict_conflict",
        return_value=fake_prediction,
    ):
        r = detail("retinol serum, hydroquinone cream")

    assert r["warnings"] == []
    assert len(r["unverified"]) == 1
    assert "could not be verified" in r["unverified"][0]

def test_high_confidence_safe_estimate_does_not_silently_verify_reactive_pair():
    fake_prediction = {"label": "SAFE", "confidence": 0.95}

    with mock.patch(
        "services.conflict_checker.predict_conflict",
        return_value=fake_prediction,
    ):
        r = detail("retinol serum, hydroquinone cream")

    assert r["warnings"] == []
    assert len(r["unverified"]) == 1
    assert "could not be verified" in r["unverified"][0]


def test_high_strength_makes_pair_worse():
    r = detail("20% vitamin c serum, tretinoin cream")
    assert r["warnings"] and "avoid" in r["warnings"][0].lower()


def test_high_strength_glycolic_acid_makes_retinol_pair_avoid():
    r = detail("10% glycolic acid serum, retinol serum")
    assert r["warnings"] and "avoid" in r["warnings"][0].lower()
    assert "Glycolic Acid" in r["warnings"][0]


def test_high_strength_lactic_acid_makes_retinol_pair_avoid():
    r = detail("10% lactic acid serum, retinol serum")
    assert r["warnings"] and "avoid" in r["warnings"][0].lower()
    assert "Lactic Acid" in r["warnings"][0]


def test_beneficial_messages_use_ingredient_names():
    b = detail("hyaluronic acid serum, ceramide moisturizer")["beneficial"]
    assert b and "Hyaluronic Acid" in b[0] and "Ceramides" in b[0]
    assert "Barrier Support" not in b[0] and "Vitamin B3" not in b[0]


def test_messages_do_not_expose_ml_internals():
    for w in detail("retinol serum, salicylic acid toner")["warnings"]:
        assert "ML Model" not in w and "confidence" not in w.lower()


def test_legacy_text_only_path_still_works():
    warnings, _ = check_conflicts("Retinol serum with Salicylic acid")
    assert warnings and "caution" in warnings[0].lower()


def test_ml_prediction_failure_returns_none():
    from services.ml_conflict_checker import MLConflictChecker

    checker = MLConflictChecker()
    checker.model = mock.Mock()
    checker.model.predict.side_effect = RuntimeError("Simulated prediction failure")

    with mock.patch(
        "services.ml_conflict_checker.get_category_function",
        return_value=("retinoid", "anti_aging"),
    ):
        result = checker.predict_conflict("retinol", "tretinoin")

    assert result is None



def test_ml_prediction_skips_when_ingredient_metadata_is_missing():
    from services.ml_conflict_checker import MLConflictChecker

    checker = object.__new__(MLConflictChecker)
    checker.model = mock.Mock()

    with mock.patch(
        "services.ml_conflict_checker.get_category_function",
        side_effect=[
            ("retinoid", "anti_aging"),
            (None, None),
        ],
    ):
        result = checker.predict_conflict("retinol", "glycerin")

    assert result is None
    checker.model.predict.assert_not_called()
