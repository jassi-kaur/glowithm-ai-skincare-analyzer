"""
Glowithm LLM evaluation.

    python scripts/evaluate_llm.py --mode live --repeat 3     # real Ollama model (needs `ollama serve`)
    python scripts/evaluate_llm.py --mode mock --mock-profile naive   # simulated model, no Ollama

What it measures (36 cases, see evaluation/cases.py):
  * how often the MODEL'S OWN output breaks a safety/format rule  (raw)
  * how often the output the USER SEES breaks it, after the safety engine (final)
  * how often the engine had to change the model's routine
  * consistency across repeated runs, latency, fallbacks
  * behaviour on malformed or hostile model responses (never crash, stay safe)

Exit code: 0 = no rule broken in the final output, 1 = a final-output violation,
2 = live mode requested but Ollama is not reachable.

Live results are the evidence for the project report. Mock results only show how
the safety engine copes with a badly-behaved model; they say nothing about llama3.2.
"""
import argparse
import json
import os
import sys
import time
import warnings
from datetime import datetime, timezone

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)
warnings.filterwarnings("ignore")

from evaluation import runner                      # noqa: E402
from evaluation.cases import CASES                 # noqa: E402
from evaluation.mock_llm import MOCKS, simulated  # noqa: E402
from services import analyzer                      # noqa: E402


def ollama_reachable() -> bool:
    try:
        import ollama
        ollama.Client(timeout=3).list()
        return True
    except Exception:
        return False


def compact(report):
    """JSON-friendly summary (full routines are kept per run, internals are dropped)."""
    runs = []
    for cid, lst in report["runs"].items():
        for i, run in enumerate(lst):
            final = run["result"]["routine"]
            raw = run["raw"] if isinstance(run["raw"], dict) else None
            runs.append({
                "case": cid, "run": i + 1, "seconds": None if run["seconds"] is None else round(run["seconds"], 2),
                "degraded": run["degraded"], "llm_error": run["llm_error"],
                "raw_morning": raw.get("morning") if raw else None, "raw_night": raw.get("night") if raw else None,
                "final_morning": final["morning"], "final_night": final["night"],
                "raw_violations": {k: v for k, v in run["raw_checks"].items() if v},
                "final_violations": {k: v for k, v in run["final_checks"].items() if v},
            })
    out = {k: v for k, v in report.items() if k != "runs"}
    out["runs"] = runs
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mode", choices=("live", "mock"), default="live")
    ap.add_argument("--mock-profile", choices=sorted(MOCKS), default="naive")
    ap.add_argument("--repeat", type=int, default=1, help="runs per case (use 3 for a consistency measurement)")
    ap.add_argument("--cases", help="comma-separated case ids, e.g. C01,C13,S2")
    ap.add_argument("--out-dir", default=os.path.join(BACKEND, "reports"))
    args = ap.parse_args()

    cases = CASES
    if args.cases:
        wanted = {c.strip() for c in args.cases.split(",")}
        cases = [c for c in CASES if c["id"] in wanted]
        if not cases:
            sys.exit(f"No case matches {sorted(wanted)}. Known ids: {[c['id'] for c in CASES]}")

    if args.mode == "live":
        if not ollama_reachable():
            print("Ollama is not reachable. Start it (`ollama serve`) and make sure the model is pulled "
                  f"({analyzer.OLLAMA_MODEL}), or use --mode mock.")
            sys.exit(2)
        llm, title = None, f"LLM evaluation - LIVE ({analyzer.OLLAMA_MODEL})"
        banner = f"**Live run** against `{analyzer.OLLAMA_MODEL}`."
    else:
        llm, title = simulated(args.mock_profile), f"LLM evaluation - SIMULATED ({args.mock_profile} model)"
        banner = ("> **SIMULATED MODEL.** These numbers show how the safety engine copes with a "
                  f"{args.mock_profile} model. They say NOTHING about the quality of the real LLM.")

    print(f"{title}: {len(cases)} cases x {args.repeat} run(s)")
    started = time.time()
    report = runner.evaluate(cases, llm, repeat=args.repeat,
                             progress=lambda m: print("  ", m, flush=True) if args.mode == "live" else None)
    injection = runner.injection_report()
    markdown = runner.render_markdown(title, banner, report, injection)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    os.makedirs(args.out_dir, exist_ok=True)
    base = os.path.join(args.out_dir, f"llm_eval_{args.mode}_{stamp}")
    payload = {"title": title, "mode": args.mode, "model": analyzer.OLLAMA_MODEL if args.mode == "live" else f"simulated:{args.mock_profile}",
               "generated_utc": datetime.now(timezone.utc).isoformat(), "duration_seconds": round(time.time() - started, 1),
               "report": compact(report), "malformed_response_tests": injection}
    with open(base + ".json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    with open(base + ".md", "w", encoding="utf-8") as f:
        f.write(markdown)
    if args.mode == "live":     # only real runs may overwrite the "latest" evidence file
        with open(os.path.join(args.out_dir, "llm_evaluation_latest.json"), "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    print("\n" + markdown)
    print(f"Saved: {base}.md / .json")
    total = sum(v["violations"] for v in report["final"].values())
    crashed = [r for r in injection if r["crashed"]]
    if total or crashed:
        print(f"FAILED: {total} final-output violation(s), {len(crashed)} crash(es).")
        sys.exit(1)
    print("PASSED: no rule is broken in the output users see.")


if __name__ == "__main__":
    main()
