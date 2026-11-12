# Phase 4 — Ingredient Knowledge and Retrieval

## 1. Objective

Provide source-backed ingredient information to Glowithm's skincare routine
analyzer through a local, structured knowledge base and deterministic
ingredient retrieval.

## 2. Implementation

- Knowledge base: `backend/data/ingredient_knowledge.json`
- Retrieval service: `backend/services/ingredient_retrieval.py`
- Ingredient recognition: shared `find_ingredients()` function from
  `backend/services/ingredients.py`
- Prompt integration: `build_prompt()` in `backend/services/analyzer.py`

The knowledge base uses schema version 1.0 and contains 24 ingredient records.
Each record contains a canonical name, category, potential benefits, usage
guidance, precautions, and source metadata.

Each source entry contains a title, organization, and URL.

## 3. Retrieval behavior

The retrieval service:

1. Loads ingredient records from the local JSON file.
2. Indexes valid records by case-insensitive canonical ingredient name.
3. Uses the shared ingredient recognizer to find ingredients in input text.
4. Returns matching records and suppresses duplicate matches.
5. Returns no records for unknown ingredients or empty input.
6. Returns an empty mapping when the knowledge file is missing or invalid.

The analyzer serializes retrieved records into its LLM prompt. The prompt
instructs the model not to invent benefits, precautions, or sources and states
that existing safety rules and conflict checks take priority.

## 4. Verification evidence

### Knowledge-base audit

- 24 ingredient records inspected.
- Required record fields and source metadata were audited.
- Schema structure verified: `schema_version`, `source_policy`, and
  `ingredients`.

### Retrieval tests

Command:

`python -m pytest .\backend\tests\test_ingredient_retrieval.py -v`

Result: 19 passed in 0.43 seconds.

Coverage includes loading the knowledge base, multiple ingredients, supported
synonyms, selected ingredient records, unknown ingredients, empty input,
missing or malformed files, custom knowledge files, and retrieval across the
knowledge base.

### Analyzer-flow tests

Command:

`python -m pytest .\backend\tests\test_analyze_flow.py -v`

Result: 9 passed in 2.92 seconds.

Coverage includes retrieved knowledge in the prompt, handling no matching
knowledge, input separation, safety-engine execution, fallback behavior,
pregnancy handling, and invalid LLM response handling.

These results document the targeted test runs; they do not represent a new
full-backend test run.

## 5. Known limitations

- Retrieval is deterministic lookup using the shared ingredient recognizer.
  It does not implement embeddings, vector search, or semantic similarity.
- A record's source metadata does not by itself prove that every claim in the
  record is fully supported by the linked source.
- Retrieval returns only knowledge associated with recognized ingredients
  that have matching records in the knowledge base.
- The LLM may still make errors; the prompt's instructions are not a substitute
  for validation and the deterministic safety engine.

## 6. Acceptance status

The knowledge-base structure, targeted retrieval tests, and targeted
analyzer-flow tests have been verified as described above.

Final Phase 4 completion is pending confirmation that the documented evidence
satisfies the project's intended scope. No claim is made here that the entire
application has passed a new end-to-end or full-backend regression run.
