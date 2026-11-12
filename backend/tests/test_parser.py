import json
import os
import subprocess
import sys

from helpers import BACKEND_DIR, parse_products


def names(parsed):
    return [a["name"] for a in parsed["actives"]]


def test_previously_missing_actives_are_detected():
    p = parse_products("tretinoin cream, adapalene gel, azelaic acid, squalane oil, peptide serum")
    assert names(p) == ["tretinoin", "adapalene", "azelaic acid", "squalane", "peptide"]
    assert all(a["type"] == "retinoid" for a in p["actives"][:2])


def test_synonyms_and_short_forms():
    assert names(parse_products("retinal cream")) == ["retinaldehyde"]
    assert names(parse_products("Differin gel")) == ["adapalene"]
    assert names(parse_products("BPO wash")) == ["benzoyl peroxide"]
    assert names(parse_products("salicylic cleanser")) == ["salicylic acid"]
    assert names(parse_products("2% BHA liquid")) == ["salicylic acid"]
    assert names(parse_products("retinoid serum")) == ["retinoid"]


def test_duplicate_vitamin_c_names_merge():
    assert names(parse_products("L-ascorbic acid vitamin c serum")) == ["vitamin c"]


def test_copper_peptide_is_not_also_peptide():
    assert names(parse_products("copper peptide serum")) == ["copper peptide"]


def test_generic_aha_is_one_active_not_two():
    assert names(parse_products("10% AHA peel")) == ["aha"]


def test_strengths_are_read():
    p = parse_products("20% vitamin c serum, glycolic acid 10% toner")
    strengths = {a["name"]: a["strength"] for a in p["actives"]}
    assert strengths == {"vitamin c": 20.0, "glycolic acid": 10.0}


def test_oil_free_is_not_the_oil_type():
    p = parse_products("oil-free moisturizer")
    assert p["products"][0]["type"] == "moisturizer"


def test_type_priority_is_deterministic():
    # several type words in one segment -> fixed, documented priority
    assert parse_products("vitamin c serum cream")["products"][0]["type"] == "serum"
    assert parse_products("hydrating cream cleanser")["products"][0]["type"] == "cleanser"


def test_type_detection_does_not_depend_on_hash_seed():
    code = (
        "import sys, json; sys.path.insert(0, %r);"
        "from services.analyzer import parse_products;"
        "print(json.dumps(parse_products('oil-free moisturizer, vitamin c serum cream, retinol night cream gel')))"
    ) % BACKEND_DIR
    outs = set()
    for seed in ("1", "2", "3", "4", "5"):
        env = dict(os.environ, PYTHONHASHSEED=seed)
        outs.add(subprocess.run([sys.executable, "-c", code], env=env, capture_output=True,
                                text=True, check=True).stdout)
    assert len(outs) == 1


def test_spf_only_comes_from_real_sunscreens():
    p = parse_products("moisturizer with SPF 15")
    assert p["spf_value"] is None and p["products"][0]["type"] == "moisturizer"
    p = parse_products("sunscreen SPF 50")
    assert p["spf_value"] == 50 and p["products"][0]["type"] == "sunscreen"
    p = parse_products("SPF 30+")
    assert p["spf_value"] == 30 and p["products"][0]["type"] == "sunscreen"


def test_plain_basics_are_not_low_confidence():
    for text, kind in (("CeraVe Hydrating Cleanser", "cleanser"), ("Cetaphil moisturizer", "moisturizer")):
        prod = parse_products(text)["products"][0]
        assert prod["type"] == kind
        assert prod["confidence"] == "medium" and prod["needs_clarification"] is False


def test_unknown_serum_still_needs_clarification():
    prod = parse_products("serum")["products"][0]
    assert prod["ingredient"] is None and prod["needs_clarification"] is True


def test_products_are_attributed_per_segment():
    p = parse_products("vitamin c serum, hyaluronic acid")
    by_ing = {x["ingredient"]: x for x in p["products"]}
    assert by_ing["vitamin c"]["type"] == "serum"
    assert by_ing["hyaluronic acid"]["type"] is None      # never labelled a serum


def test_input_is_capped():
    p = parse_products(", ".join(f"product{i}" for i in range(200)))
    assert len(p["products"]) <= 20
