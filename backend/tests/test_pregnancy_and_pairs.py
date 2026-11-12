import json
import os
import sys
from unittest import mock

from helpers import BACKEND_DIR, basic_llm, has, parse_products, run_engine
from services import analyzer
from services.conflict_checker import check_conflicts_detailed, load_pair_table

try:
    import app as app_module
except ImportError:          # flask / flask-cors not installed
    app_module = None


def detail(text):
    return check_conflicts_detailed(text, actives=parse_products(text)["actives"])


# ------------------------------------------------------------ 1. pregnancy flag
def test_engine_removes_retinoids_when_flag_is_set_even_without_keywords():
    parsed = parse_products("retinol serum")
    context = {
        "concerns": "Acne & Breakouts", "pregnant": True,
        "parsed_products": parsed["products"], "detected_actives": parsed["actives"],
        "spf_value": None, "conflicts": [], "beneficial_combinations": [],
    }
    from services.safety_engine import HybridSafetyEngine
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])
    r, meta = HybridSafetyEngine().intercept_and_remedy(llm, context)
    assert not has(r["night"], "retinol")
    assert has(meta["warnings"], "pregnancy")


def test_flag_off_keeps_retinol():
    r, _ = run_engine("retinol serum", concerns="Acne & Breakouts")
    assert has(r["night"], "retinol")


def test_analyze_skin_pregnant_flag_end_to_end():
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])
    with mock.patch.object(analyzer, "_call_llm", return_value=llm):
        out = analyzer.analyze_skin("dry", "Dryness & Dehydration", "retinol serum", pregnant=True)
    assert out["pregnancy_mode"] is True and not has(out["routine"]["night"], "retinol")
    with mock.patch.object(analyzer, "_call_llm", return_value=basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])):
        out = analyzer.analyze_skin("dry", "Dryness & Dehydration", "retinol serum")
    assert out["pregnancy_mode"] is False and has(out["routine"]["night"], "retinol")


def test_fallback_also_respects_the_flag():
    with mock.patch.object(analyzer, "_call_llm", side_effect=RuntimeError("down")):
        out = analyzer.analyze_skin("dry", "Dryness & Dehydration", "tretinoin cream", pregnant=True)
    assert out["degraded_mode"] is True and out["pregnancy_mode"] is True
    assert not has(out["routine"]["night"], "tretinoin")


def test_prompt_tells_the_llm_about_pregnancy_only_when_set():
    args = ("oily", "acne", "", "Cleanser", "None", "Moisturizer", "Sunscreen SPF 30+", [], [])
    assert "pregnant" in analyzer.build_prompt(*args, pregnant=True).lower()
    assert "pregnant" not in analyzer.build_prompt(*args).lower()


# ------------------------------------------------------------ 3. unverified noise
def test_benign_ingredients_do_not_create_unverified_noise():
    for text in ("ceramide moisturizer, salicylic acid toner",
                 "squalane oil, glycolic acid toner",
                 "hyaluronic acid serum, glycolic acid toner"):
        assert detail(text)["unverified"] == [], text


def test_real_unknowns_are_still_reported():
    r = detail("retinol serum, hydroquinone cream")
    assert len(r["unverified"]) == 1


# ------------------------------------------------------------ 2. shared pair data
UI_IDS = ["ceramide", "hyaluronic_acid", "niacinamide", "retinol", "salicylic_acid", "vitamin_c"]


def test_every_pair_selectable_on_the_ingredients_page_has_data():
    table = load_pair_table()
    missing = []
    for i, a in enumerate(UI_IDS):
        for b in UI_IDS[i + 1:]:
            if frozenset((a, b)) not in table:
                missing.append((a, b))
    assert missing == [], f"pairs with no CSV row: {missing}"


def test_salicylic_vitamin_c_and_retinol_vitamin_c_are_caution():
    t = load_pair_table()
    assert t[frozenset(("salicylic_acid", "vitamin_c"))] == "CAUTION"
    assert t[frozenset(("retinol", "vitamin_c"))] == "CAUTION"
    assert detail("retinol serum, vitamin c serum")["warnings"]


def _export():
    sys.path.insert(0, os.path.join(BACKEND_DIR, "scripts"))
    import export_pairs
    return export_pairs


def test_export_matches_csv():
    data = _export().build_pairs_json()
    table = load_pair_table()
    assert len(data["pairs"]) == len(table)
    assert data["pairs"]["retinol+vitamin_c"] == "CAUTION"      # keys are sorted a+b
    assert all(k == "+".join(sorted(k.split("+"))) for k in data["pairs"])


def test_frontend_json_is_not_stale():
    path = _export().default_output_path()
    if not os.path.exists(path):
        return                                                   # frontend folder not next to backend
    on_disk = json.load(open(path, encoding="utf-8"))
    assert on_disk == _export().build_pairs_json(), \
        "frontend/data/ingredient_pairs.json is out of date: run python scripts/export_pairs.py"


# ------------------------------------------------------------ app: flag handling
OK = {"skin_type": "oily", "concerns": "acne", "products": "retinol serum"}


def _client():
    app_module.app.config["TESTING"] = True
    app_module._hits.clear()
    return app_module.app.test_client()


def test_app_passes_the_pregnant_flag_through():
    if app_module is None:
        return
    for sent, expected in ((True, True), ("true", True), ("on", True), (False, False), ("false", False), (None, False)):
        body = dict(OK) if sent is None else {**OK, "pregnant": sent}
        with mock.patch.object(app_module, "analyze_skin", return_value={"routine": {}}) as m:
            r = _client().post("/analyze", json=body)
        assert r.status_code == 200
        assert m.call_args.kwargs["pregnant"] is expected, sent


def test_app_accepts_form_encoded_flag_like_the_frontend_sends():
    if app_module is None:
        return
    with mock.patch.object(app_module, "analyze_skin", return_value={"routine": {}}) as m:
        r = _client().post("/analyze", data={**OK, "pregnant": "true"})
    assert r.status_code == 200 and m.call_args.kwargs["pregnant"] is True


def test_app_rejects_nonsense_flag():
    if app_module is None:
        return
    r = _client().post("/analyze", json={**OK, "pregnant": "maybe"})
    assert r.status_code == 400 and "true or false" in r.get_json()["error"]
