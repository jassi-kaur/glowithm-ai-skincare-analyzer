import json
import logging
import tempfile
from pathlib import Path
from unittest import mock

from helpers import BACKEND_DIR, basic_llm, has, parse_products, run_engine
from services import analyzer
from services import ingredient_retrieval as R
from services.ingredients import SYNONYMS
from services.safety_engine import HybridSafetyEngine, MAX_ITEM_LENGTH, _clean_list

try:
    import app as app_module
except ImportError:
    app_module = None


# ------------------------------------------------ A1: plain basics never overwrite actives
def test_plain_moisturizer_does_not_overwrite_an_active_cream():
    llm = basic_llm(night=["Cleanser", "Retinal cream"])
    r, _ = run_engine("Cetaphil moisturizer, retinal cream", llm, "Fine Lines & Aging")
    assert has(r["night"], "retinal cream") and has(r["night"], "Cetaphil moisturizer")


def test_plain_cleanser_does_not_overwrite_an_active_cleanser():
    llm = basic_llm(morning=["Salicylic Acid Cleanser", "Moisturizer"], night=["Salicylic Acid Cleanser", "Moisturizer"])
    r, _ = run_engine("CeraVe Hydrating Cleanser, salicylic acid cleanser", llm, "Acne & Breakouts")
    assert has(r["night"], "salicylic acid cleanser") and has(r["night"], "CeraVe Hydrating Cleanser")


def test_plain_moisturizer_does_not_overwrite_azelaic_acid_cream():
    llm = basic_llm(morning=["Cleanser", "Azelaic Acid Cream"], night=["Cleanser", "Azelaic Acid Cream"])
    r, _ = run_engine("Cetaphil moisturizer, azelaic acid cream", llm, "Acne & Breakouts")
    assert has(r["night"], "azelaic acid cream") and has(r["morning"], "azelaic acid cream")


def test_generic_moisturizer_is_still_replaced_by_the_users_own():
    r, _ = run_engine("Cetaphil moisturizer")
    assert has(r["morning"], "Cetaphil moisturizer") and not any(i == "Moisturizer" for i in r["morning"] + r["night"])


def test_a_second_plain_moisturizer_is_reported_not_silently_dropped():
    _, meta = run_engine("oil-free moisturizer, Cetaphil moisturizer")
    assert has(meta["warnings"], "more than one moisturizer")


# ------------------------------------------------ A5: engine hardening
def test_clean_list_ignores_non_lists():
    for bad in ("Cleanser", None, {"a": 1}, 5):
        assert _clean_list(bad) == []


def test_clean_list_removes_invisible_and_control_characters():
    assert _clean_list(["\u200b", "Cle\u202eanser\x00", "Retinol\nSerum"]) == ["Cleanser", "Retinol Serum"]


def test_clean_list_caps_item_length():
    out = _clean_list(["A" * 5000])
    assert len(out) == 1 and len(out[0]) <= MAX_ITEM_LENGTH + 3


def test_llm_string_instead_of_list_does_not_become_characters():
    r, _ = run_engine("retinol serum", {"morning": "Cleanser", "night": "Retinol Serum", "conflicts": [], "tips": []})
    assert all(len(i) > 1 for i in r["morning"] + r["night"])
    assert has(r["night"], "retinol")


def test_invented_generic_items_are_always_removed():
    llm = basic_llm(morning=["Cleanser", "Serum", "Moisturizer"], night=["Cleanser", "Exfoliant", "Treatment", "Essence", "Moisturizer"])
    r, _ = run_engine("niacinamide serum", llm)
    lowered = [i.lower() for i in r["morning"] + r["night"]]
    assert not {"serum", "exfoliant", "treatment", "essence"} & set(lowered)


def test_benzoyl_peroxide_kept_in_the_morning_is_not_scheduled_for_nights():
    llm = basic_llm(morning=["Cleanser", "Benzoyl Peroxide Wash", "Moisturizer"],
                    night=["Cleanser", "Retinol Serum", "Benzoyl Peroxide Wash", "Moisturizer"])
    r, meta = run_engine("benzoyl peroxide wash, retinol serum", llm, "Fine Lines & Aging")
    assert has(r["morning"], "benzoyl peroxide") and not has(r["night"], "benzoyl peroxide")
    scheduled = [x for v in (r.get("weekly_schedule") or {}).values() for x in v]
    assert "Benzoyl Peroxide" not in scheduled and "Retinol" in scheduled
    assert has(meta["applied_edits"], "Kept Benzoyl Peroxide in the morning")


# ------------------------------------------------ B3: validated summary
def test_template_summary_is_used_when_the_llm_gives_none():
    r, _ = run_engine("retinol serum, hyaluronic acid serum", concerns="Fine Lines & Aging")
    assert r["summary_source"] == "template"
    assert r["summary"].startswith("A simple") and "Mornings:" in r["summary"] and "Evenings:" in r["summary"]
    assert "fine lines and aging" in r["summary"].lower()


def test_valid_ai_summary_is_accepted():
    text = "Your routine pairs a gentle cleanser with a retinol serum at night and sunscreen every morning."
    r, _ = run_engine("retinol serum", basic_llm(summary=text))
    assert r["summary_source"] == "ai" and r["summary"] == text


def test_unsafe_ai_summaries_are_rejected():
    bad = [
        "Visit https://example.com for a retinol serum that gives you flawless skin every day.",
        "This retinol serum cures acne and heals your skin within a few days of daily use.",
        "Your routine adds a niacinamide serum and a retinol serum for a simple evening plan.",
        "Too short.",
        "<b>Your retinol serum routine is ready</b> and includes a simple cleanser step now.",
        12345, None,
    ]
    for text in bad:
        r, _ = run_engine("retinol serum", basic_llm(summary=text))
        assert r["summary_source"] == "template", text


def test_ai_summary_mentioning_a_retinoid_is_rejected_when_pregnant():
    text = "Your routine uses a gentle cleanser and a retinol serum at night plus morning sunscreen."
    r, _ = run_engine("retinol serum", basic_llm(summary=text), concerns="pregnant")
    assert r["summary_source"] == "template" and "Retinoids are left out" in r["summary"]
    assert "retinol" not in r["summary"].lower().replace("retinoids", "")


# ------------------------------------------------ A2/B2: knowledge layer
def test_corrupt_or_wrongly_encoded_knowledge_file_never_breaks_the_api():
    with tempfile.TemporaryDirectory() as tmp:
        bad = Path(tmp) / "k.json"
        bad.write_bytes("{}".encode("utf-16"))                # what PowerShell writes by default
        assert R.load_ingredient_knowledge(bad) == {}
        with mock.patch.object(R, "KNOWLEDGE_PATH", bad), \
             mock.patch.object(analyzer, "_call_llm", return_value=basic_llm()):
            out = analyzer.analyze_skin("Oily", "Acne", "retinol serum")
    assert out["degraded_mode"] is False and out["ingredient_notes"] == []


def test_retrieval_errors_cannot_break_analysis():
    with mock.patch.object(analyzer, "retrieve_ingredient_knowledge", side_effect=RuntimeError("boom")), \
         mock.patch.object(analyzer, "_call_llm", return_value=basic_llm()):
        out = analyzer.analyze_skin("Oily", "Acne", "retinol serum")
    assert out["degraded_mode"] is False and out["ingredient_notes"] == []


def test_knowledge_is_cached_until_the_file_changes():
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "k.json"
        f.write_text(json.dumps({"ingredients": [{"canonical_name": "retinol", "potential_benefits": ["a"]}]}), encoding="utf-8")
        real_load = json.load
        with mock.patch.object(R.json, "load", side_effect=real_load) as spy:
            first = R.load_ingredient_knowledge(f)
            second = R.load_ingredient_knowledge(f)
            assert spy.call_count == 1                     # parsed once
        assert first == second and first is not second     # callers get independent copies
        f.write_text(json.dumps({"ingredients": [{"canonical_name": "retinol", "potential_benefits": ["changed value"]}]}), encoding="utf-8")
        assert R.load_ingredient_knowledge(f)["retinol"]["potential_benefits"] == ["changed value"]


def test_ingredient_notes_are_returned_with_https_sources_and_no_model_instructions():
    with mock.patch.object(analyzer, "_call_llm", return_value=basic_llm()):
        out = analyzer.analyze_skin("Oily", "Acne", "retinol serum, hydroquinone cream")
    notes = {n["name"]: n for n in out["ingredient_notes"]}
    assert set(notes) == {"retinol", "hydroquinone"}
    for note in notes.values():
        assert set(note) == {"name", "category", "benefits", "usage", "precautions", "sources"}
        assert note["sources"] and all(s["url"].startswith("https://") for s in note["sources"])
    assert "Prolonged or unsupervised use is not recommended." in notes["hydroquinone"]["precautions"]
    assert "llm_guidance" not in json.dumps(out["ingredient_notes"])
    assert "Do not recommend" not in json.dumps(out["ingredient_notes"])


def test_fallback_path_also_returns_notes():
    with mock.patch.object(analyzer, "_call_llm", side_effect=RuntimeError("down")):
        out = analyzer.analyze_skin("Oily", "Acne", "retinol serum")
    assert out["degraded_mode"] is True and [n["name"] for n in out["ingredient_notes"]] == ["retinol"]


def test_public_view_drops_non_https_sources():
    notes = R.public_view([{"canonical_name": "x", "sources": [
        {"title": "t", "organization": "o", "url": "http://insecure.example"},
        {"title": "t", "organization": "o", "url": "javascript:alert(1)"},
        {"title": "ok", "organization": "o", "url": "https://secure.example/page"}]}])
    assert [s["url"] for s in notes[0]["sources"]] == ["https://secure.example/page"]


def test_prompt_stays_small_even_with_many_products():
    many = ("foaming cleanser, niacinamide serum, salicylic acid toner, hyaluronic acid serum, vitamin c serum, "
            "ceramide moisturizer, sunscreen SPF 30, glycolic acid toner, retinol serum, squalane oil, "
            "peptide serum, zinc oxide sunscreen")
    parsed = parse_products(many)
    prompt = analyzer.build_prompt("Combination", "Acne", many, "Cleanser", "Retinol", "Moisturizer",
                                   "Sunscreen SPF 30+", [], [], parsed)
    assert len(prompt) // 4 < 1500, f"prompt is ~{len(prompt)//4} tokens"
    assert prompt.count('"canonical_name"') <= R.MAX_PROMPT_RECORDS
    assert "summary" in prompt and '"tips"' not in prompt


def test_knowledge_file_integrity():
    data = json.loads(Path(BACKEND_DIR, "data", "ingredient_knowledge.json").read_text(encoding="utf-8-sig"))
    ai_phrases = ("do not recommend", "avoid promising", "identify the specific", "before recommending", "before providing")
    names = [r["canonical_name"] for r in data["ingredients"]]
    assert len(names) == len(set(names)) and set(names) <= set(SYNONYMS)       # every record is retrievable
    for r in data["ingredients"]:
        for field in ("potential_benefits", "usage_guidance", "precautions"):
            assert r[field], f"{r['canonical_name']}: empty {field}"
            for text in r[field]:
                assert not any(p in text.lower() for p in ai_phrases), f"model instruction in user text: {text}"
        assert r["sources"] and all(s["url"].startswith("https://") for s in r["sources"])
    cats = {r["category"] for r in data["ingredients"]}
    assert not {c for c in cats if c.endswith("_category") or c.startswith(("topical_", "prescription_"))}
    for n in ("glycolic acid", "lactic acid", "salicylic acid", "aha"):         # consistent with the engine's pregnancy note
        rec = next(r for r in data["ingredients"] if r["canonical_name"] == n)
        assert any("pregnan" in p.lower() for p in rec["precautions"]), n


# ------------------------------------------------ D: missing-CSS diagnostics
def test_health_reports_a_missing_frontend():
    if app_module is None:
        return
    with tempfile.TemporaryDirectory() as empty, mock.patch.object(app_module, "FRONTEND_DIR", empty):
        app_module.app.config["TESTING"] = True
        body = app_module.app.test_client().get("/health").get_json()
    assert body["status"] == "degraded" and body["frontend_found"] is False
    assert "css/style.css" in body["frontend_missing_files"]


def test_startup_check_logs_a_clear_error_when_the_frontend_is_missing():
    if app_module is None:
        return
    with tempfile.TemporaryDirectory() as empty, mock.patch.object(app_module, "FRONTEND_DIR", empty), \
         mock.patch.object(app_module.logger, "error") as err:
        app_module._check_frontend_at_startup()
    assert err.called and "named exactly 'frontend'" in err.call_args[0][0]


def test_missing_stylesheet_requests_are_logged():
    if app_module is None:
        return
    app_module.app.config["TESTING"] = True
    with mock.patch.object(app_module.logger, "warning") as warn:
        r = app_module.app.test_client().get("/css/does-not-exist.css")
    assert r.status_code == 404 and warn.called and "/css/does-not-exist.css" in warn.call_args[0][1]


# ------------------------------------------------ CAUTION advice and startup wiring
def test_caution_message_gives_actionable_advice_without_forbidding_layering_blindly():
    from services.conflict_checker import check_conflicts_detailed
    text = "retinol serum, salicylic acid serum"
    warnings = check_conflicts_detailed(text, actives=parse_products(text)["actives"])["warnings"]
    assert len(warnings) == 1
    w = warnings[0].lower()
    assert "potential irritation" in w and "alternate nights" in w and "different times of day" in w
    assert "follow product instructions" in w


def test_frontend_check_really_runs_when_the_app_starts():
    import ast
    source = Path(BACKEND_DIR, "app.py").read_text(encoding="utf-8")
    top_level_calls = [
        node.value.func.id for node in ast.parse(source).body
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call)
        and isinstance(node.value.func, ast.Name)
    ]
    assert "_check_frontend_at_startup" in top_level_calls
