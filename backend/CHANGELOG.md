# Changes in this version (covers backend AND frontend)

Built on backend3 + frontend3. Test status when this was packaged:
**backend 159 passed, frontend 31 passed** (`pytest` in `backend/`, `node tests/run_tests.js` in `frontend/`).
17 deliberate regressions were injected into the backend and 13 into the frontend; every one is caught by a test.

## Phase A - backend bugs
| Fix | Where |
|---|---|
| A1  A plain moisturizer/cleanser no longer overwrites an active product with "cream/lotion/wash" in its name (retinal cream, salicylic acid cleanser, azelaic acid cream used to vanish silently). A second plain moisturizer/cleanser is now reported instead of silently dropped. | `services/safety_engine.py` |
| A2  Knowledge layer can no longer take the API down: wrong-encoding/corrupt file returns "no knowledge", parsed JSON is cached until the file changes, retrieval errors are swallowed in the analyzer. | `services/ingredient_retrieval.py`, `services/analyzer.py` |
| A3  No more false "could not be verified" warnings (or nonsense ML warnings) for pairs involving gentle ingredients (humectants, ceramides, emollients, peptides). Your conservative rule for reactive pairs is kept. | `services/conflict_checker.py` |
| A4  CAUTION warnings give advice again ("use them at different times of day or on alternate nights") while still not forbidding layering outright. | `services/conflict_checker.py` |
| A5  Engine hardening: non-list model output no longer becomes single characters; zero-width/control characters removed; item length capped; invented generic items ("Serum", "Exfoliant"...) always removed; odd `alternate_nights` values tolerated; benzoyl peroxide kept in the morning is not also scheduled for nights. | `services/safety_engine.py` |
| A6  Cleanup: 13 backup/stale files deleted (including importable `*_backup_*.py` modules), tests use one import style, the whole-pipeline hash-seed determinism test is back, BOM removed. | repo |

## Phase B - making the project defensible
* **Pregnancy flag** end to end (`pregnant` field, checkbox in the UI). Shared pair data: the website now reads `frontend/data/ingredient_pairs.json`, generated from the CSV (`python scripts/export_pairs.py`). 4 CSV rows added so every pair selectable on the Ingredients page has data.
* **Phase 4 is now visible**: the API returns `ingredient_notes` (benefits, usage, precautions, https sources); the results page and PDF show them. Knowledge file cleaned: instructions to the AI moved to a separate `llm_guidance` field (never shown to users), categories unified, pregnancy precautions added for AHAs/BHA to match the engine.
* **Prompt** trimmed (max 6 records, 2 bullets per field, no URLs): the 12-product prompt dropped from ~2,400 to under 1,500 tokens. `tips` is no longer requested (the engine always discarded them); the model is asked for a short `summary` instead, accepted only if it passes validation (no claims, no URLs, no unlisted ingredients, nothing about retinoids when pregnant), otherwise a deterministic template summary is used. `ollama/Modelfile` creates a 4096-token model.
* **Evaluation** (`evaluation/`, `scripts/evaluate_llm.py`): 36 cases, ~20 rules checked on the model's RAW output and on the FINAL output, repeat runs for consistency, latency, 12 kinds of malformed model output. Your old 4-scenario result is kept as `reports/llm_evaluation_smoke_4cases_2026-10-29.json`.
* **ML honesty** note with re-measured numbers: `ml/ML_EVALUATION.md`.

## Phase C - frontend
Pregnancy checkbox, disclaimer (step 4, results, footer, PDF), toast messages instead of `alert()`, 120 s request timeout with specific messages (offline / rate limit / timeout / bad response), configurable API URL (`<meta name="glowithm-api-base">`; any local dev port works), commas split into separate product tags (15 products, 60 characters each), "SPF Applied" note and dead tips block removed, built-in-routine banner, routine summary, "About your ingredients" with source links, PDF (summary, weekly schedule, clean safety notes, ingredient notes with sources, disclaimer), ingredients page uses the shared pair data and says "No specific guidance" instead of a silent "compatible", navbar toggle is a real keyboard-operable button, visible focus styles, labelled inputs, heading fix, `prefers-reduced-motion`.
**Assets: 32.1 MB -> 1.0 MB** (PNGs to WebP, nine identical placeholder images share one file, file names without spaces, one stray unreferenced file removed). jsPDF loads from `js/vendor/` first with the CDN as fallback.

## Phase D - the missing-CSS mystery
Not reproducible from the code (all stylesheets valid, linked, served as `text/css`). New diagnostics: startup logs `FRONTEND PROBLEM` listing missing files; every 404 for `/css`, `/js`, `/assets`, `/components` is logged with its path; `/health` reports `frontend_found`; no browser caching of static files when `FLASK_DEBUG=1`. See the README troubleshooting section.

## Needs YOUR action or decision
1. **Run the live evaluation** (`python scripts\evaluate_llm.py --mode live --repeat 3`). Everything I ran used a simulated model, so real llama3.2 numbers and your latency figures can only come from you. Simulated runs show the safety engine copes; they say nothing about the model.
2. **Vendor jsPDF once**: `python tools\vendor_jspdf.py` (needs internet) so the PDF works offline during a demo.
3. **Create the 4096-token model** (`ollama create glowithm -f ollama\Modelfile`, then `OLLAMA_MODEL=glowithm`) and check an analysis still works. I could not test the live LLM call, including the new `summary` field.
4. **Content decisions**: the label for adapalene + benzoyl peroxide (CAUTION), the four CSV rows I added (vitamin C + retinol CAUTION; ceramide + salicylic acid, ceramide + vitamin C, hyaluronic acid + salicylic acid SAFE), and the new pregnancy precautions in the knowledge file should be confirmed against a dermatology source. The source URLs could not be opened offline.
5. `assets/home-page/home-products.webp` shows real brand names (Minimalist, SKIN1004, Beauty of Joseon) and a visible Gemini sparkle watermark: replace it before public use.
6. The navbar "login" button still goes nowhere (`href="#"`); the model file `conflict_model_candidate.joblib` is not used by the app.

## Not done / out of scope
No embeddings or vector database, no retraining of the model, no redesign. Browser rendering and the live Ollama call were not verified.
