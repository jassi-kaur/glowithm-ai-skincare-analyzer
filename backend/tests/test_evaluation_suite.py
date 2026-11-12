"""
Regression suite built on the evaluation package: 36 realistic cases x two simulated
models, plus 12 kinds of malformed model output. A single final-output violation
fails the build. (Simulated models only test the safety engine, not llama3.2.)
"""
from helpers import BACKEND_DIR  # noqa: F401  (puts backend/ on sys.path)

from evaluation import runner
from evaluation.cases import CASES
from evaluation.invariants import check_raw
from evaluation.mock_llm import MALFORMED, simulated


def _total(report):
    return sum(v["violations"] for v in report["final"].values())


def test_case_set_is_large_and_unique():
    ids = [c["id"] for c in CASES]
    assert len(CASES) >= 30 and len(ids) == len(set(ids))


def test_well_behaved_model_produces_no_final_violations():
    report = runner.evaluate(CASES, simulated("good"))
    assert _total(report) == 0, report["violations"][:5]
    assert report["degraded_runs"] == 0


def test_badly_behaved_model_is_fully_corrected_by_the_safety_engine():
    report = runner.evaluate(CASES, simulated("naive"))
    assert _total(report) == 0, report["violations"][:5]
    # ...and the harness really does detect the raw model's mistakes (otherwise a pass means nothing)
    raw_total = sum(v["violations"] for v in report["raw"].values())
    assert raw_total > 100
    for rule in ("sunscreen_not_night", "no_hallucinated_actives", "structure"):
        assert report["raw"][rule]["violations"] >= 20, rule
    assert report["routines_changed_by_safety_engine"] == report["total_runs"]


def test_malformed_model_output_never_crashes_and_stays_safe():
    rows = runner.injection_report()
    assert len(rows) == len(MALFORMED)
    assert [r["response"] for r in rows if r["crashed"]] == []
    assert [r for r in rows if r["violations"]] == []


def test_invariants_do_detect_violations():
    case = {"id": "T", "skin_type": "Oily", "concerns": "pregnant", "products": "retinol serum, vitamin c serum"}
    from services.analyzer import parse_products
    parsed = parse_products(case["products"])
    bad = {"morning": ["Cleanser", "Retinol Serum"], "night": ["Cleanser", "Vitamin C Serum", "Sunscreen SPF 30"]}
    found = {k for k, v in check_raw(case, parsed, bad).items() if v}
    assert {"retinoid_pm_only", "vitc_am_only", "sunscreen_not_night", "sunscreen_am", "pregnancy_no_retinoid"} <= found


def test_repeated_runs_are_consistent_for_a_deterministic_model():
    report = runner.evaluate(CASES[:6], simulated("good"), repeat=3)
    assert report["consistency"]["identical_final_routine_share"] == 1.0


def test_report_renders():
    report = runner.evaluate(CASES[:3], simulated("good"))
    md = runner.render_markdown("T", "banner", report, runner.injection_report())
    assert "Rule violations" in md and "Malformed" in md


def test_active_placement_invariant_detects_wrong_routines():
    from services.analyzer import parse_products

    products = (
        "vitamin c serum, retinol serum, glycolic acid serum, "
        "salicylic acid serum, azelaic acid serum"
    )
    parsed = parse_products(products)

    routine = {
        "morning": [
            "Retinol Serum",
            "Glycolic Acid Serum",
            "Salicylic Acid Serum",
        ],
        "night": [
            "Vitamin C Serum",
            "Azelaic Acid Serum",
        ],
    }

    result = check_raw(
        {"id": "PLACEMENT_BAD", "skin_type": "Oily", "concerns": "", "products": products},
        parsed,
        routine,
    )

    assert result["active_placement"] is not None
    assert "vitamin c in night" in result["active_placement"]
    assert "retinol in morning" in result["active_placement"]
    assert "glycolic acid in morning" in result["active_placement"]
    assert "salicylic acid in morning" in result["active_placement"]


def test_active_placement_invariant_accepts_correct_routines():
    from services.analyzer import parse_products

    products = (
        "vitamin c serum, retinol serum, glycolic acid serum, "
        "salicylic acid serum, azelaic acid serum"
    )
    parsed = parse_products(products)

    routine = {
        "morning": [
            "Vitamin C Serum",
            "Azelaic Acid Serum",
        ],
        "night": [
            "Retinol Serum",
            "Glycolic Acid Serum",
            "Salicylic Acid Serum",
        ],
    }

    result = check_raw(
        {"id": "PLACEMENT_GOOD", "skin_type": "Oily", "concerns": "", "products": products},
        parsed,
        routine,
    )

    assert result["active_placement"] is None
