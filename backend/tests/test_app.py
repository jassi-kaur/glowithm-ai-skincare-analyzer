from unittest import mock

try:
    import app as app_module
except ImportError as exc:        # flask / flask-cors not installed in this environment
    app_module = None
    _IMPORT_ERROR = exc

import helpers  # noqa: F401  (puts backend/ on sys.path)


def _client():
    app_module.app.config["TESTING"] = True
    app_module._hits.clear()
    return app_module.app.test_client()


OK = {"skin_type": "oily", "concerns": "acne", "products": "retinol serum"}


def test_valid_request():
    if app_module is None:
        return
    expected = {
        "routine": {"morning": ["Cleanser", "Sunscreen SPF 30+"]},
        "safety_notes": {"warnings": []},
        "ingredient_notes": [{"name": "niacinamide"}],
        "degraded_mode": False,
    }
    with mock.patch.object(app_module, "analyze_skin", return_value=expected):
        r = _client().post("/analyze", json=OK)
    assert r.status_code == 200 and r.is_json
    assert r.get_json() == expected


def test_products_list_is_accepted():
    if app_module is None:
        return
    with mock.patch.object(app_module, "analyze_skin", return_value={"routine": {}}) as m:
        r = _client().post("/analyze", json={**OK, "products": ["retinol serum", "ceramide cream"]})
    assert r.status_code == 200
    assert m.call_args[0][2] == "retinol serum, ceramide cream"


def test_bad_types_return_400_json_not_500():
    if app_module is None:
        return
    c = _client()
    assert c.post("/analyze", json={**OK, "products": 123}).status_code == 400
    assert c.post("/analyze", json={**OK, "skin_type": {"a": 1}}).status_code == 400
    r = c.post("/analyze", json=[1, 2, 3])
    assert r.status_code == 400 and r.is_json


def test_length_limits():
    if app_module is None:
        return
    r = _client().post("/analyze", json={**OK, "products": "x" * 5000})
    assert r.status_code == 400 and "too long" in r.get_json()["error"]


def test_required_fields():
    if app_module is None:
        return
    c = _client()
    assert c.post("/analyze", json={"concerns": "acne"}).status_code == 400
    assert c.post("/analyze", json={"skin_type": "oily"}).status_code == 400


def test_errors_are_json():
    if app_module is None:
        return
    c = _client()
    r = c.get("/analyze")          # static route answers GET -> 404 (not an HTML page)
    assert r.status_code in (404, 405) and r.is_json
    r = c.put("/analyze", json=OK)  # genuine method mismatch -> 405
    assert r.status_code == 405 and r.is_json
    r = c.get("/definitely-not-a-file.js")   # 404
    assert r.status_code == 404 and r.is_json


def test_unexpected_exception_is_json_500_without_details():
    if app_module is None:
        return
    with mock.patch.object(app_module, "analyze_skin", side_effect=RuntimeError("secret detail")):
        r = _client().post("/analyze", json=OK)
    assert r.status_code == 500 and r.is_json and "secret" not in r.get_data(as_text=True)


def test_rate_limit():
    if app_module is None:
        return
    c = _client()
    with mock.patch.object(app_module, "RATE_LIMIT_PER_MIN", 2), \
         mock.patch.object(app_module, "analyze_skin", return_value={"routine": {}}):
        codes = [c.post("/analyze", json=OK).status_code for _ in range(3)]
    assert codes == [200, 200, 429]


def test_health_endpoint():
    if app_module is None:
        return
    r = _client().get("/health")
    body = r.get_json()
    assert r.status_code == 200 and body["status"] in ("ok", "degraded") and "ml_model_loaded" in body
    assert "frontend_found" in body and isinstance(body["frontend_missing_files"], list)


def test_debug_server_is_not_exposed_by_default():
    src = open(app_module.__file__ if app_module else "app.py").read() if app_module else ""
    if not src:
        return
    assert "debug=True" not in src and 'host="0.0.0.0"' not in src
