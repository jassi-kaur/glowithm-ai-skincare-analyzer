"""
End-to-end checks through the real Flask app and the sibling `frontend` folder.
Skipped automatically when the frontend folder is not next to the backend.
"""
import re
import urllib.parse
from pathlib import Path
from unittest import mock

from helpers import BACKEND_DIR, basic_llm

try:
    import app as app_module
except ImportError:
    app_module = None

FRONTEND = Path(BACKEND_DIR).parent / "frontend"


def _client():
    app_module.app.config["TESTING"] = True
    app_module._hits.clear()
    return app_module.app.test_client()


def _available():
    return app_module is not None and FRONTEND.is_dir()


def test_every_local_resource_of_every_page_is_served():
    if not _available():
        return
    client, problems = _client(), []
    for page in sorted(FRONTEND.glob("*.html")) + sorted((FRONTEND / "components").glob("*.html")):
        html = page.read_text(encoding="utf-8", errors="replace")
        for ref in set(re.findall(r'(?:href|src)=["\']([^"\'#?]+)["\']', html)):
            if re.match(r"(https?:|//|mailto:|tel:|data:|javascript:)", ref):
                continue
            if ref.startswith("js/vendor/"):
                continue                      # optional local jsPDF (CDN fallback)
            r = client.get("/" + urllib.parse.quote(ref.lstrip("/")))
            if r.status_code != 200:
                problems.append((page.name, ref, r.status_code))
    assert problems == []


def test_stylesheets_and_scripts_have_the_right_content_type():
    if not _available():
        return
    client = _client()
    assert client.get("/css/style.css").mimetype == "text/css"
    assert client.get("/css/analyzer.css").mimetype == "text/css"
    assert "javascript" in client.get("/js/analyzer.js").mimetype


def test_health_sees_the_frontend():
    if not _available():
        return
    body = _client().get("/health").get_json()
    assert body["frontend_found"] is True and body["status"] == "ok" and body["frontend_missing_files"] == []


def test_form_post_like_the_browser_sends_it_returns_everything_the_ui_needs():
    if app_module is None:
        return
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])
    with mock.patch("services.analyzer._call_llm", return_value=llm):
        r = _client().post("/analyze", data={
            "skin_type": "Dry", "concerns": "Dryness & Dehydration, Fine Lines & Aging",
            "products": "retinol serum, hyaluronic acid serum, Cetaphil moisturizer", "pregnant": "true"})
    body = r.get_json()
    assert r.status_code == 200
    for key in ("routine", "safety_notes", "ingredient_notes", "parsed_products", "degraded_mode", "pregnancy_mode"):
        assert key in body, key
    routine = body["routine"]
    for key in ("morning", "night", "conflicts", "tips", "summary", "summary_source", "frequency"):
        assert key in routine, key
    assert body["pregnancy_mode"] is True
    assert not any("retinol" in item.lower() for item in routine["morning"] + routine["night"])
    assert {n["name"] for n in body["ingredient_notes"]} == {"retinol", "hyaluronic acid"}
    assert any("Cetaphil moisturizer" in item for item in routine["night"])
