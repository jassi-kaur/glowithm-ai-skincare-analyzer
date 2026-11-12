
import json
import pytest

from services.ingredient_retrieval import (
    load_ingredient_knowledge,
    retrieve_ingredient_knowledge,
)


def test_loads_existing_knowledge_base():
    knowledge = load_ingredient_knowledge()

    assert {"retinol", "salicylic acid", "azelaic acid"} <= set(knowledge)


def test_retrieves_multiple_known_ingredients():
    results = retrieve_ingredient_knowledge(
        "retinol and azelaic acid"
    )

    names = [item["canonical_name"] for item in results]
    assert names == ["retinol", "azelaic acid"]


def test_retrieves_using_existing_synonym():
    results = retrieve_ingredient_knowledge("BHA cleanser")

    assert [item["canonical_name"] for item in results] == [
        "salicylic acid"
    ]


@pytest.mark.parametrize(
    ("synonym", "expected"),
    [
        ("GHK-Cu", "copper peptide"),
        ("sodium hyaluronate", "hyaluronic acid"),
        ("tocopherol", "vitamin e"),
        ("ascorbic acid", "vitamin c"),
        ("glycerine", "glycerin"),
    ],
)
def test_retrieves_ingredient_knowledge_by_synonym(synonym, expected):
    results = retrieve_ingredient_knowledge(synonym)

    assert [item["canonical_name"].casefold() for item in results] == [
        expected
    ]


def test_retrieves_niacinamide_knowledge():
    results = retrieve_ingredient_knowledge("niacinamide serum")
    assert [item["canonical_name"] for item in results] == ["niacinamide"]
    assert results[0]["potential_benefits"]


def test_retrieves_hyaluronic_acid_knowledge():
    results = retrieve_ingredient_knowledge("hyaluronic acid serum")
    assert [item["canonical_name"] for item in results] == ["hyaluronic acid"]
    assert results[0]["potential_benefits"]


def test_retrieves_benzoyl_peroxide_knowledge():
    results = retrieve_ingredient_knowledge("benzoyl peroxide acne treatment")
    assert [item["canonical_name"] for item in results] == ["benzoyl peroxide"]
    assert results[0]["potential_benefits"]


def test_retrieves_ceramides_knowledge():
    results = retrieve_ingredient_knowledge("ceramides moisturizer")
    assert [item["canonical_name"] for item in results] == ["ceramides"]
    assert results[0]["potential_benefits"]


def test_retrieves_vitamin_c_knowledge():
    results = retrieve_ingredient_knowledge("vitamin c serum")
    assert [item["canonical_name"] for item in results] == ["vitamin c"]
    assert results[0]["potential_benefits"]



def test_does_not_invent_knowledge_for_missing_ingredient():
    assert retrieve_ingredient_knowledge("madeupingredient serum") == []



def test_empty_input_returns_no_results():
    assert retrieve_ingredient_knowledge("") == []


def test_missing_knowledge_file_returns_empty_mapping(tmp_path):
    missing_file = tmp_path / "missing.json"

    assert load_ingredient_knowledge(missing_file) == {}


def test_malformed_knowledge_file_returns_empty_mapping(tmp_path):
    invalid_file = tmp_path / "invalid.json"
    invalid_file.write_text("{invalid json", encoding="utf-8")

    assert load_ingredient_knowledge(invalid_file) == {}


def test_custom_knowledge_file_can_be_loaded(tmp_path):
    custom_file = tmp_path / "custom.json"
    custom_file.write_text(
        json.dumps(
            {
                "ingredients": [
                    {
                        "canonical_name": "retinol",
                        "category": "retinoid",
                        "potential_benefits": ["Example benefit"],
                        "usage_guidance": [],
                        "precautions": [],
                        "sources": [],
                    }
                ]
            }
        ),
        encoding="utf-8",
    )

    knowledge = load_ingredient_knowledge(custom_file)

    assert knowledge["retinol"]["potential_benefits"] == [
        "Example benefit"
    ]




def test_retrieves_all_ingredient_knowledge():
    ingredients = [
        "retinol",
        "salicylic acid",
        "azelaic acid",
        "niacinamide",
        "hyaluronic acid",
        "benzoyl peroxide",
        "ceramides",
        "vitamin c",
        "glycerin",
        "squalane",
        "vitamin e",
        "peptide",
        "copper peptide",
        "glycolic acid",
        "lactic acid",
        "aha",
        "hydroquinone",
        "zinc oxide",
        "titanium dioxide",
        "avobenzone",
        "adapalene",
        "retinaldehyde",
        "retinoid",
        "tretinoin",
    ]

    for ingredient in ingredients:
        results = retrieve_ingredient_knowledge(ingredient)
        names = [
            item["canonical_name"].casefold()
            for item in results
        ]

        assert ingredient in names, (
            f"Knowledge was not retrieved for: {ingredient}. "
            f"Retrieved: {names}"
        )

        record = next(
            item for item in results
            if item["canonical_name"].casefold() == ingredient
        )

        for field in (
            "potential_benefits",
            "usage_guidance",
            "precautions",
            "sources",
        ):
            assert record.get(field), (
                f"Missing {field} for: {ingredient}"
            )
