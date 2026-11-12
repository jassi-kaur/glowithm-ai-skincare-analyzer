# Glowithm frontend

Plain HTML, CSS and JavaScript (no build step). It must sit **next to** the `backend` folder:
`Project/backend` + `Project/frontend`. Start the backend (`python app.py`) and open
http://127.0.0.1:5000/analyzer.html .

* `js/analyzer.js` - the analyzer page; `js/analyzer-utils.js` - small testable helpers;
  `js/pairing-resolver.js` + `data/ingredient_pairs.json` - ingredient compatibility on the
  Ingredients page (generated from the backend CSV: `python scripts/export_pairs.py` in `backend/`).
* To point the page at a backend on another address set `<meta name="glowithm-api-base" content="https://...">` in `analyzer.html`.
* PDF export uses jsPDF: run `python tools/vendor_jspdf.py` once so it works offline (CDN fallback otherwise).

## Tests

```
node tests/run_tests.js
```
Runs the real `analyzer.js` against a small DOM stub (no browser needed) with `fetch` and jsPDF replaced by
recording stand-ins, plus checks on assets, labels and duplicate ids. It cannot judge how the page *looks*:
check layout in the browser (DevTools device toolbar for mobile).
