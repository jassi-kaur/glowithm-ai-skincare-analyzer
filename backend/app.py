import logging
import os
import re
import threading
import time
from collections import defaultdict, deque

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from services.analyzer import analyze_skin

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

# The frontend must sit NEXT TO this backend folder:  <project>/backend + <project>/frontend
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
)
_REQUIRED_FRONTEND_FILES = (
    "analyzer.html", "css/style.css", "css/analyzer.css", "js/analyzer.js", "js/analyzer-utils.js",
)

app = Flask(
    __name__,
    template_folder=FRONTEND_DIR,
    static_folder=FRONTEND_DIR,
    static_url_path="",
)

# While developing, never let the browser reuse a stale stylesheet or script.
if os.getenv("FLASK_DEBUG") == "1":
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


def missing_frontend_files():
    return [f for f in _REQUIRED_FRONTEND_FILES
            if not os.path.isfile(os.path.join(FRONTEND_DIR, f))]


def _check_frontend_at_startup():
    """
    A wrong folder name/location is the usual reason a page looks unstyled
    ("CSS is gone"): Flask then answers 404 for every stylesheet. Say so loudly.
    """
    missing = missing_frontend_files()
    if missing:
        logger.error(
            "FRONTEND PROBLEM: expected the frontend folder at %s but these files are "
            "missing: %s. Pages will load without styles/scripts. Make sure the folder is "
            "named exactly 'frontend' and sits next to 'backend'.",
            FRONTEND_DIR, ", ".join(missing),
        )
    else:
        logger.info("Frontend found at %s", FRONTEND_DIR)


_check_frontend_at_startup()

# Origins come from the environment so deployment doesn't need a code change.
# Common local dev ports (Flask, VS Code Live Server, Vite, simple http.server...).
_DEFAULT_ORIGINS = ",".join(
    f"http://{host}:{port}"
    for port in (5000, 5500, 5501, 3000, 5173, 8000, 8080)
    for host in ("127.0.0.1", "localhost")
)
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _DEFAULT_ORIGINS).split(",") if o.strip()]

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

# ----------------------------------------------------------------------
# Input limits
# ----------------------------------------------------------------------
FIELD_LIMITS = {"skin_type": 100, "concerns": 500, "products": 1000}
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class ValidationError(Exception):
    pass


def _clean_field(name: str, value) -> str:
    """Accept a string (or a list of strings, joined by commas); reject the rest."""
    if value is None:
        return ""
    if isinstance(value, list) and all(isinstance(v, str) for v in value):
        value = ", ".join(value)
    if not isinstance(value, str):
        raise ValidationError(f"'{name}' must be text.")
    value = _CONTROL_CHARS.sub("", value).strip()
    if len(value) > FIELD_LIMITS[name]:
        raise ValidationError(f"'{name}' is too long (max {FIELD_LIMITS[name]} characters).")
    return value


def _clean_flag(name: str, value) -> bool:
    """Checkbox-style field: true/false, "true"/"on"/"1"/"yes" (form posts send strings)."""
    if value is None or value == "":
        return False
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)
    if isinstance(value, str) and value.strip().lower() in ("1", "true", "yes", "on", "0", "false", "no", "off"):
        return value.strip().lower() in ("1", "true", "yes", "on")
    raise ValidationError(f"'{name}' must be true or false.")


# ----------------------------------------------------------------------
# Tiny in-memory rate limiter (per IP).  Every /analyze call can trigger an
# LLM run, so unbounded requests are a cost/DoS risk.  For multi-process
# deployments use flask-limiter + Redis instead.
# ----------------------------------------------------------------------
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "20"))
_hits = defaultdict(deque)
_hits_lock = threading.Lock()


def _rate_limited(ip: str) -> bool:
    if RATE_LIMIT_PER_MIN <= 0:
        return False
    now = time.monotonic()
    with _hits_lock:
        q = _hits[ip]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE_LIMIT_PER_MIN:
            return True
        q.append(now)
        return False


# ----------------------------------------------------------------------
# Routes
# (The old catch-all "/<path:path>" static route was dead code: Flask already
# registers an identical static route because static_url_path="", and it also
# caught FileNotFoundError while Flask raises NotFound.)
# ----------------------------------------------------------------------
@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/analyzer.html")
def analyzer_page():
    return app.send_static_file("analyzer.html")


@app.route("/health")
def health():
    from services.ml_conflict_checker import is_available

    ollama_ok = False
    try:
        import ollama
        ollama.Client(timeout=2).list()
        ollama_ok = True
    except Exception:
        pass
    missing = missing_frontend_files()
    return jsonify({
        "status": "ok" if not missing else "degraded",
        "ml_model_loaded": is_available(),
        "ollama_reachable": ollama_ok,
        "frontend_found": not missing,
        "frontend_missing_files": missing,
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    if _rate_limited(request.remote_addr or "unknown"):
        return jsonify({"error": "Too many requests. Please wait a minute and try again."}), 429

    data = request.get_json(silent=True)
    if data is None:
        data = request.form.to_dict()
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    try:
        skin_type = _clean_field("skin_type", data.get("skin_type"))
        concerns = _clean_field("concerns", data.get("concerns"))
        products = _clean_field("products", data.get("products"))
        pregnant = _clean_flag("pregnant", data.get("pregnant"))
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    # Lengths only: skincare details are personal, so they are not logged at INFO.
    logger.info("analyze: skin_type=%d chars, concerns=%d chars, products=%d chars",
                len(skin_type), len(concerns), len(products))

    if not skin_type:
        return jsonify({"error": "Skin type is required."}), 400
    if not concerns:
        return jsonify({"error": "At least one skin concern is required."}), 400

    try:
        routine = analyze_skin(skin_type, concerns, products, pregnant=pregnant)
        logger.info("Routine generated (degraded_mode=%s)", routine.get("degraded_mode"))
        return jsonify(routine)
    except Exception as e:
        logger.exception("Unhandled error while generating routine: %s", e)
        return jsonify({
            "error": "Unable to generate your skincare routine right now.",
            "details": str(e) if app.debug else None,
        }), 500


# ----------------------------------------------------------------------
# Error handlers: always JSON (previously only 404 was, so anything else
# returned Flask's HTML page and broke response.json() in the frontend).
# ----------------------------------------------------------------------
_ASSET_PREFIXES = ("/css/", "/js/", "/assets/", "/components/", "/data/")


@app.errorhandler(HTTPException)
def handle_http_error(e):
    if (e.code == 404 and request.path.startswith(_ASSET_PREFIXES)
            and not request.path.startswith("/js/vendor/")):   # optional local libraries
        # A missing stylesheet/script is the classic cause of an unstyled page.
        logger.warning("404 for frontend asset %s (looked in %s)", request.path, FRONTEND_DIR)
    return jsonify({"error": e.description or e.name}), e.code


@app.errorhandler(Exception)
def handle_unexpected_error(e):
    logger.exception("Unexpected error: %s", e)
    return jsonify({"error": "Something went wrong on our side."}), 500


if __name__ == "__main__":
    # SAFE DEFAULTS: the Werkzeug debugger allows remote code execution, so it
    # must never be reachable from the network.  Opt in with FLASK_DEBUG=1 and
    # expose the server with HOST=0.0.0.0 only if you really mean to.
    app.run(
        debug=os.getenv("FLASK_DEBUG") == "1",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
    )
