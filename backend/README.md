# Glowithm backend

Flask API that turns a skin profile and a list of products into a safety-checked
morning/evening routine.

```
frontend (HTML/JS)  ->  POST /analyze  ->  parse products -> conflict check (pair table + ML estimate)
                                        -> ingredient knowledge (shown to the user, trimmed for the LLM)
                                        -> LLM (Ollama + Instructor + Pydantic) -> safety engine -> JSON
```

The language model only proposes a routine. **The deterministic safety engine has the final
say**: it fixes AM/PM placement, removes undeclared or unknown actives, handles pregnancy,
enforces one strong active per routine, orders the steps and builds the tips and summary.
If the LLM is unavailable or returns something invalid, the same engine runs on a built-in
routine (`degraded_mode: true`).

## Setup (Windows PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
ollama pull llama3.2:3b
ollama create glowithm -f ollama\Modelfile     # optional: 4096-token context
$env:OLLAMA_MODEL = "glowithm"                 # optional
python app.py
```

Open http://127.0.0.1:5000/analyzer.html . The `frontend` folder must sit next to `backend`.
Settings (all optional) are listed in `.env.example`.

## API

`POST /analyze` (JSON or form data): `skin_type`, `concerns`, `products` (comma separated),
`pregnant` (true/false). Returns `routine` (morning, night, conflicts, tips, frequency,
weekly_schedule, alternate_nights, summary), `safety_notes`, `ingredient_notes` (benefits,
usage, precautions, sources), `parsed_products`, `degraded_mode`, `pregnancy_mode`.
`GET /health` reports the ML model, Ollama and whether the frontend files were found.

## Tests and evaluation

```powershell
pytest                                   # backend tests
python scripts\evaluate_llm.py --mode live --repeat 3   # REAL model: the evidence for the report
python scripts\evaluate_llm.py --mode mock              # simulated model, no Ollama
python scripts\export_pairs.py           # after editing data\ingredient_pairs.csv
```

`evaluate_llm.py` checks 36 cases against ~20 rules, once on the model's raw output and once
on the final output, plus repeat-run consistency, latency and malformed-response handling.
Reports are written to `reports/`. Simulated runs only test the safety engine.

## Troubleshooting

* **Pages look unstyled:** read the server console; startup logs `FRONTEND PROBLEM` and every
  missing stylesheet logs a 404 with its path. Check that the folders are named `backend` and
  `frontend`, open the page through Flask (http://127.0.0.1:5000/analyzer.html), hard-refresh
  (Ctrl+F5) and look at DevTools > Network. Keep the project (especially `venv`) out of
  OneDrive sync if possible. `/health` shows `frontend_found`.
* **Slow or ignored instructions:** Ollama's default context can be small; use the Modelfile above.
* **Knowledge file edits:** save `data/ingredient_knowledge.json` as UTF-8 (not UTF-16).

## Limitations

General skincare information, not medical advice. The pair table has 46 rows
(see `ml/ML_EVALUATION.md`), ingredient sources are not independently verified, and the
system recognises only the ingredients listed in `services/ingredients.py`.
