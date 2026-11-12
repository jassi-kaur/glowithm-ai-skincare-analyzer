"""Run evaluation cases and summarise the results."""
import collections
import copy
import json
import logging
import statistics
import time
from typing import Any, Callable, Dict, List, Optional
from unittest import mock

from services import analyzer
from services.analyzer import parse_products

from .invariants import FINAL_ONLY_CHECKS, RAW_CHECKS, check_final, check_raw
from .mock_llm import MALFORMED


def run_case(case: Dict[str, Any], llm_for_case: Optional[Callable] = None) -> Dict[str, Any]:
    """
    Run one case through analyze_skin and capture what the LLM said (raw) and
    what the user would see (final). `llm_for_case(case, parsed)` returns a raw
    routine dict (or raises); None means "use the real Ollama model".
    """
    parsed = parse_products(case["products"])
    captured: Dict[str, Any] = {"raw": None, "error": None, "seconds": None}
    real_call = analyzer._call_llm

    def wrapper(prompt: str):
        start = time.perf_counter()
        try:
            raw = real_call(prompt) if llm_for_case is None else llm_for_case(case, parsed)
            captured["raw"] = copy.deepcopy(raw)
            return raw
        except Exception as exc:                       # becomes the fallback path
            captured["error"] = f"{type(exc).__name__}: {exc}"
            raise
        finally:
            captured["seconds"] = time.perf_counter() - start

    with mock.patch.object(analyzer, "_call_llm", wrapper):
        result = analyzer.analyze_skin(case["skin_type"], case["concerns"], case["products"],
                                       pregnant=bool(case.get("pregnant")))

    raw_checks = check_raw(case, parsed, captured["raw"]) if isinstance(captured["raw"], dict) else {}
    return {
        "case": case["id"], "why": case.get("why", ""), "raw": captured["raw"],
        "llm_error": captured["error"], "seconds": captured["seconds"],
        "degraded": bool(result.get("degraded_mode")), "result": result,
        "raw_checks": raw_checks, "final_checks": check_final(case, parsed, result),
    }


def fingerprint(run: Dict[str, Any]) -> str:
    routine = run["result"]["routine"]
    return json.dumps({k: routine.get(k) for k in ("morning", "night", "weekly_schedule")}, sort_keys=True)


def _jaccard(a: set, b: set) -> float:
    return 1.0 if not a and not b else len(a & b) / len(a | b)


def evaluate(cases: List[Dict[str, Any]], llm_for_case: Optional[Callable] = None,
             repeat: int = 1, progress: Optional[Callable[[str], None]] = None) -> Dict[str, Any]:
    runs: Dict[str, List[Dict[str, Any]]] = {}
    for case in cases:
        runs[case["id"]] = []
        for i in range(repeat):
            if progress:
                progress(f"{case['id']} run {i + 1}/{repeat}")
            runs[case["id"]].append(run_case(case, llm_for_case))

    raw_fail, raw_app = collections.Counter(), collections.Counter()
    fin_fail, fin_app = collections.Counter(), collections.Counter()
    violations, changed, edits, seconds = [], 0, [], []
    degraded = llm_errors = total = 0
    for cid, lst in runs.items():
        for run in lst:
            total += 1
            degraded += run["degraded"]
            llm_errors += bool(run["llm_error"])
            if run["seconds"] is not None and not run["llm_error"]:
                seconds.append(run["seconds"])
            for key, value in run["raw_checks"].items():
                raw_app[key] += 1
                raw_fail[key] += value is not None
            for key, value in run["final_checks"].items():
                fin_app[key] += 1
                if value is not None:
                    fin_fail[key] += 1
                    violations.append({"case": cid, "check": key, "detail": value})
            edits.append(len(run["result"]["safety_notes"].get("applied_edits", [])))
            raw = run["raw"]
            if isinstance(raw, dict):
                final = run["result"]["routine"]
                changed += (raw.get("morning") != final["morning"]) or (raw.get("night") != final["night"])

    consistency = None
    if repeat > 1:
        same, jac = [], []
        for lst in runs.values():
            prints = collections.Counter(fingerprint(r) for r in lst)
            same.append(prints.most_common(1)[0][1] / len(lst))
            sets = [set(r["result"]["routine"]["morning"] + r["result"]["routine"]["night"]) for r in lst]
            jac += [_jaccard(a, b) for i, a in enumerate(sets) for b in sets[i + 1:]]
        consistency = {"identical_final_routine_share": round(statistics.mean(same), 3),
                       "mean_item_overlap_jaccard": round(statistics.mean(jac), 3)}

    return {
        "runs": runs, "total_runs": total, "cases": len(cases), "repeat": repeat,
        "raw": {k: {"violations": raw_fail[k], "applicable": raw_app[k]} for k in RAW_CHECKS if raw_app[k]},
        "final": {k: {"violations": fin_fail[k], "applicable": fin_app[k]} for k in RAW_CHECKS + FINAL_ONLY_CHECKS if fin_app[k]},
        "violations": violations, "degraded_runs": degraded, "llm_error_runs": llm_errors,
        "routines_changed_by_safety_engine": changed, "mean_edits_per_run": round(statistics.mean(edits), 2) if edits else 0,
        "latency_seconds": ({"mean": round(statistics.mean(seconds), 2), "median": round(statistics.median(seconds), 2),
                             "max": round(max(seconds), 2)} if seconds else None),
        "consistency": consistency,
    }


def injection_report(case: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Feed malformed / hostile model outputs; the app must never crash and must stay safe."""
    case = case or {"id": "INJ", "skin_type": "Oily", "concerns": "Acne & Breakouts",
                    "products": "retinol serum, vitamin c serum, sunscreen SPF 50"}
    rows = []
    # The app deliberately logs errors for these inputs; keep the report readable.
    previous = logging.root.manager.disable
    logging.disable(logging.CRITICAL)
    try:
        return _injection_rows(case, rows)
    finally:
        logging.disable(previous)


def _injection_rows(case, rows):
    for name, payload in MALFORMED.items():
        def llm(c, parsed, payload=payload):
            if isinstance(payload, Exception):
                raise payload
            return copy.deepcopy(payload)
        row = {"response": name, "crashed": None, "degraded": None, "violations": {}}
        try:
            run = run_case(case, llm)
            row["degraded"] = run["degraded"]
            row["violations"] = {k: v for k, v in run["final_checks"].items() if v}
        except Exception as exc:                       # a crash is the worst outcome
            row["crashed"] = f"{type(exc).__name__}: {exc}"
        rows.append(row)
    return rows


def render_markdown(title: str, banner: str, report: Dict[str, Any], injection: List[Dict[str, Any]]) -> str:
    lines = [f"# {title}", "", banner, "",
             f"- Cases: **{report['cases']}**, runs per case: **{report['repeat']}**, total runs: **{report['total_runs']}**",
             f"- Runs that fell back to the built-in routine (LLM unavailable/invalid): **{report['degraded_runs']}**",
             f"- Runs where the safety engine changed the LLM's routine: **{report['routines_changed_by_safety_engine']}**"
             f" (mean {report['mean_edits_per_run']} recorded edits per run)"]
    if report["latency_seconds"]:
        l = report["latency_seconds"]
        lines.append(f"- LLM latency: mean **{l['mean']} s**, median {l['median']} s, max {l['max']} s")
    if report["consistency"]:
        c = report["consistency"]
        lines.append(f"- Consistency across repeats: identical final routine in **{c['identical_final_routine_share']:.0%}** of cases; "
                     f"mean item overlap {c['mean_item_overlap_jaccard']:.2f}")
    lines += ["", "## Rule violations: LLM output vs what the user sees", "",
              "| Rule | LLM output (raw) | Final output |", "|---|---|---|"]
    names = list(dict.fromkeys(list(report["raw"]) + list(report["final"])))
    for name in names:
        r, f = report["raw"].get(name), report["final"].get(name)
        lines.append(f"| {name} | {f'{r['violations']}/{r['applicable']}' if r else '-'} | "
                     f"{f'{f['violations']}/{f['applicable']}' if f else '-'} |")
    total_final = sum(v["violations"] for v in report["final"].values())
    lines += ["", f"**Total final-output violations: {total_final}**", ""]
    if report["violations"]:
        lines += ["### Final-output violations", ""] + [f"- {v['case']}: {v['check']} - {v['detail']}" for v in report["violations"][:40]] + [""]
    lines += ["## Malformed / hostile model responses", "", "| Response | Crashed? | Fell back? | Final violations |", "|---|---|---|---|"]
    for row in injection:
        lines.append(f"| {row['response']} | {'**YES** ' + row['crashed'][:60] if row['crashed'] else 'no'} | "
                     f"{row['degraded']} | {row['violations'] or 'none'} |")
    return "\n".join(lines) + "\n"
