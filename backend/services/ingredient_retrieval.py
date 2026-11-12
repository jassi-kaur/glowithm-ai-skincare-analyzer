"""Retrieve source-backed ingredient knowledge from a local JSON file.

Two different views of a record are produced from the same data:

* ``prompt_view``  - a SMALL subset for the language model (no URLs, capped
  length) so the prompt stays well inside a small local model's context window.
* ``public_view``  - the user-facing fields (benefits, usage, precautions and
  clickable sources) returned by the API and shown on the results page / PDF.
  Instructions meant for the model (``llm_guidance``) never appear here.
"""

import copy
import json
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

from .ingredients import find_ingredients

logger = logging.getLogger(__name__)

KNOWLEDGE_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "ingredient_knowledge.json"
)

MAX_PROMPT_RECORDS = 6        # records sent to the LLM
PROMPT_ITEMS_PER_FIELD = 2    # bullets per field sent to the LLM
MAX_TEXT_LENGTH = 400         # defensive cap on any single text item

_cache: Dict[str, Any] = {"key": None, "value": None}
_cache_lock = threading.Lock()


def load_ingredient_knowledge(
    path: Optional[Path] = None,
) -> Dict[str, Dict[str, Any]]:
    """Load knowledge records indexed by canonical ingredient name.

    Returns an empty mapping if the file is missing or invalid (including a
    file saved in the wrong encoding, e.g. UTF-16 by Windows PowerShell).
    The parsed result is cached until the file changes, so the JSON is not
    re-read and re-parsed on every request.
    """
    source_path = Path(path) if path is not None else KNOWLEDGE_PATH

    try:
        stat = source_path.stat()
        cache_key = (str(source_path), stat.st_mtime_ns, stat.st_size)
    except OSError as exc:
        logger.warning("Could not load ingredient knowledge from %s: %s", source_path, exc)
        return {}

    with _cache_lock:
        if _cache["key"] == cache_key:
            return copy.deepcopy(_cache["value"])

    try:
        with source_path.open("r", encoding="utf-8-sig") as file:
            data = json.load(file)

        records = data.get("ingredients")
        if not isinstance(records, list):
            logger.warning("Ingredient knowledge file has no valid ingredients list")
            return {}

        knowledge: Dict[str, Dict[str, Any]] = {}

        for record in records:
            if not isinstance(record, dict):
                continue

            name = record.get("canonical_name")
            if not isinstance(name, str) or not name.strip():
                continue

            entry = {
                "canonical_name": name.strip(),
                "category": record.get("category", ""),
                "potential_benefits": record.get("potential_benefits", []),
                "usage_guidance": record.get("usage_guidance", []),
                "precautions": record.get("precautions", []),
                "sources": record.get("sources", []),
            }
            if "llm_guidance" in record:
                entry["llm_guidance"] = record["llm_guidance"]
            knowledge[name.strip().casefold()] = entry

    # ValueError covers JSONDecodeError AND UnicodeDecodeError.
    except (OSError, ValueError, AttributeError, TypeError) as exc:
        logger.warning("Could not load ingredient knowledge from %s: %s", source_path, exc)
        return {}

    with _cache_lock:
        _cache["key"], _cache["value"] = cache_key, knowledge
    return copy.deepcopy(knowledge)


def retrieve_ingredient_knowledge(
    text: str,
    knowledge: Optional[Dict[str, Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """Retrieve records for recognized ingredients mentioned in text.

    Unknown ingredients and ingredients absent from the knowledge base
    produce no records. This function does not infer missing information.
    """
    records = knowledge if knowledge is not None else load_ingredient_knowledge()
    if not records or not isinstance(text, str) or not text.strip():
        return []

    matches = find_ingredients(text)
    retrieved: List[Dict[str, Any]] = []
    seen = set()

    for canonical_name, _strength in matches:
        key = canonical_name.casefold()

        if key in seen:
            continue
        seen.add(key)

        record = records.get(key)
        if record is not None:
            retrieved.append(record)

    return retrieved


def safe_retrieve(text: str) -> List[Dict[str, Any]]:
    """Retrieval that can never raise: knowledge is an extra, not a dependency."""
    try:
        return retrieve_ingredient_knowledge(text)
    except Exception:                      # pragma: no cover - defensive
        logger.exception("Ingredient retrieval failed; continuing without it")
        return []


def _text_list(value: Any, limit: Optional[int] = None) -> List[str]:
    if not isinstance(value, list):
        return []
    out = []
    for item in value:
        if isinstance(item, str) and item.strip():
            out.append(item.strip()[:MAX_TEXT_LENGTH])
    return out[:limit] if limit else out


def prompt_view(
    records: List[Dict[str, Any]],
    limit: int = MAX_PROMPT_RECORDS,
    items: int = PROMPT_ITEMS_PER_FIELD,
) -> List[Dict[str, Any]]:
    """Compact records for the LLM prompt: no URLs, capped size."""
    view = []
    for record in records[:limit]:
        entry = {
            "canonical_name": record.get("canonical_name", ""),
            "potential_benefits": _text_list(record.get("potential_benefits"), items),
            "usage_guidance": _text_list(record.get("usage_guidance"), items),
            "precautions": _text_list(record.get("precautions"), items),
        }
        guidance = _text_list(record.get("llm_guidance"), items)
        if guidance:
            entry["llm_guidance"] = guidance
        view.append(entry)
    return view


def public_view(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """User-facing notes for the API / UI / PDF (sources limited to https links)."""
    notes = []
    for record in records:
        sources = []
        for source in record.get("sources") or []:
            if not isinstance(source, dict):
                continue
            url = source.get("url")
            if not (isinstance(url, str) and url.startswith("https://")):
                continue
            sources.append({
                "title": str(source.get("title", "")).strip()[:200],
                "organization": str(source.get("organization", "")).strip()[:100],
                "url": url.strip(),
            })
        notes.append({
            "name": record.get("canonical_name", ""),
            "category": record.get("category", ""),
            "benefits": _text_list(record.get("potential_benefits")),
            "usage": _text_list(record.get("usage_guidance")),
            "precautions": _text_list(record.get("precautions")),
            "sources": sources,
        })
    return notes
