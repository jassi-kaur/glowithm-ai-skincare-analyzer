import copy

from helpers import basic_llm, has, run_engine


# ---------------------------------------------------------------- placement
def test_vitamin_c_is_morning_only_even_if_llm_put_it_in_both():
    llm = basic_llm(morning=["Cleanser", "Vitamin C Serum", "Moisturizer"],
                    night=["Cleanser", "Vitamin C Serum", "Moisturizer"])
    r, _ = run_engine("vitamin c serum", llm)
    assert has(r["morning"], "vitamin c") and not has(r["night"], "vitamin c")


def test_vitamin_c_is_added_when_llm_forgot_it():
    r, meta = run_engine("vitamin c serum")
    assert has(r["morning"], "vitamin c") and not has(r["night"], "vitamin c")
    assert has(meta["applied_edits"], "morning")


def test_vitamin_e_is_not_forced_into_the_morning():
    llm = basic_llm(night=["Cleanser", "Vitamin E Oil", "Moisturizer"])
    r, _ = run_engine("vitamin e oil", llm)
    assert has(r["night"], "vitamin e")


def test_ascorbic_acid_wording_counts_as_the_declared_vitamin_c():
    llm = basic_llm(morning=["Cleanser", "Ascorbic Acid Serum", "Moisturizer"])
    r, _ = run_engine("vitamin c serum", llm)
    assert has(r["morning"], "ascorbic acid serum") and len(r["morning"]) == len(set(r["morning"]))


def test_tretinoin_is_now_placed_at_night_with_spf_and_frequency():
    r, meta = run_engine("tretinoin cream")
    assert has(r["night"], "tretinoin") and not has(r["morning"], "tretinoin")
    assert meta["spf_added"] and has(r["morning"], "spf")
    assert has(r["frequency"], "tretinoin")


def test_retinol_is_removed_from_the_morning():
    llm = basic_llm(morning=["Cleanser", "Retinol Serum", "Moisturizer"])
    r, _ = run_engine("retinol serum", llm)
    assert not has(r["morning"], "retinol") and has(r["night"], "retinol")


# ---------------------------------------------------------------- pregnancy
def test_pregnancy_removes_retinoids():
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])
    r, meta = run_engine("retinol serum", llm, concerns="pregnant, fine lines")
    assert not has(r["night"], "retinol") and not has(r["morning"], "retinol")
    assert has(meta["warnings"], "pregnancy")


def test_pregnancy_adds_doctor_note_for_other_flagged_actives():
    _, meta = run_engine("salicylic acid cleanser", concerns="acne, trying to conceive")
    assert has(meta["warnings"], "check with your doctor")


def test_no_pregnancy_wording_means_retinoid_stays():
    r, _ = run_engine("retinol serum", concerns="fine lines")
    assert has(r["night"], "retinol")


# ---------------------------------------------------------------- sunscreen
def test_sunscreen_is_removed_from_night():
    llm = basic_llm(morning=["Cleanser", "Sunscreen SPF 50", "Moisturizer"],
                    night=["Cleanser", "Sunscreen SPF 50", "Moisturizer"])
    r, _ = run_engine("sunscreen SPF 50", llm)
    assert not has(r["night"], "sunscreen") and has(r["morning"], "sunscreen")


def test_spf_moisturizer_is_not_a_sunscreen():
    llm = basic_llm(night=["Cleanser", "Moisturizer with SPF 15"],
                    morning=["Cleanser", "Moisturizer with SPF 15"])
    r, meta = run_engine("moisturizer with SPF 15", llm)
    assert has(r["night"], "moisturizer with spf 15")          # not deleted
    assert has(r["morning"], "SPF 30+")                         # real sunscreen recommended


def test_low_spf_sunscreen_gets_a_warning():
    _, meta = run_engine("sunscreen SPF 15")
    assert has(meta["warnings"], "SPF 30")


def test_daily_sunscreen_always_present_in_morning():
    r, _ = run_engine("hyaluronic acid serum")
    assert has(r["morning"], "sunscreen")


# ---------------------------------------------------------------- ambiguity
def test_unknown_serum_is_actually_removed_not_just_warned_about():
    llm = basic_llm(morning=["Cleanser", "Serum", "Moisturizer"],
                    night=["Cleanser", "Serum", "Moisturizer"])
    r, meta = run_engine("serum", llm)
    assert not any(i.lower() == "serum" for i in r["morning"] + r["night"])
    assert has(meta["warnings"], "active ingredient is unknown")


def test_other_unknown_risky_types_are_handled_too():
    llm = basic_llm(night=["Cleanser", "Exfoliant", "Moisturizer"])
    r, meta = run_engine("exfoliant", llm)
    assert not has(r["night"], "exfoliant") and has(meta["warnings"], "exfoliant")


def test_unidentified_product_is_reported():
    _, meta = run_engine("Mystery Goo 3000")
    assert has(meta["warnings"], "Could not identify")


def test_hallucinated_active_is_removed():
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Moisturizer"])
    r, _ = run_engine("hyaluronic acid serum", llm)
    assert not has(r["night"], "retinol")


def test_hallucinated_extra_active_inside_a_declared_product_is_removed():
    llm = basic_llm(night=["Cleanser", "Retinol + Glycolic Acid Serum", "Moisturizer"])
    r, _ = run_engine("retinol serum", llm)     # glycolic acid was never declared
    assert not has(r["night"], "glycolic")


# ---------------------------------------------------------------- strong actives
def test_one_strong_active_per_routine_with_fixed_priority():
    for order in ("retinol serum, salicylic acid serum", "salicylic acid serum, retinol serum"):
        llm = basic_llm(night=["Cleanser", "Retinol Serum", "Salicylic Acid Serum", "Moisturizer"])
        r, _ = run_engine(order, llm)
        assert has(r["night"], "retinol") and not has(r["night"], "salicylic")


def test_product_holding_two_actives_is_not_deleted_entirely():
    llm = basic_llm(night=["Cleanser", "Retinol + Glycolic Acid Serum", "Moisturizer"])
    r, meta = run_engine("retinol serum, glycolic acid toner", llm)
    assert has(r["night"], "Retinol + Glycolic Acid Serum")
    assert has(meta["warnings"], "more than one strong active")


def test_llm_supplied_schedules_are_discarded():
    llm = basic_llm(
        weekly_schedule={"Mon": ["Unverified Active"]},
        alternate_nights=["Use Unverified Active on Wednesday"],
    )
    r, _ = run_engine("glycerin moisturizer", llm)

    assert "weekly_schedule" not in r
    assert r["alternate_nights"] == []

def test_rotated_out_active_gets_a_real_weekly_schedule():
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Salicylic Acid Serum", "Moisturizer"])
    r, _ = run_engine("retinol serum, salicylic acid serum", llm)
    sched = r["weekly_schedule"]
    assert all(len(v) == 1 for v in sched.values())              # one strong active per night
    days = list(sched)
    for label in ("Retinol", "Salicylic Acid"):
        idx = [i for i, d in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) if d in sched and label in sched[d]]
        assert idx, f"{label} missing from schedule"
        assert all(min((a - b) % 7, (b - a) % 7) > 1 for a in idx for b in idx if a != b)
    assert has(r["tips"], "weekly schedule")
        # Each active must respect its configured 2x/week frequency.
    for label in ("Retinol", "Salicylic Acid"):
        scheduled_days = sum(
            label in active_list for active_list in sched.values()
        )
        assert scheduled_days == 2, (
            f"{label} should be scheduled twice per week, "
            f"but was scheduled {scheduled_days} times."
        )

def test_retinol_and_benzoyl_peroxide_are_scheduled_on_separate_nights():
    llm = basic_llm(
        night=[
            "Cleanser",
            "Retinol Serum",
            "Benzoyl Peroxide Gel",
            "Moisturizer",
        ]
    )
    r, _ = run_engine(
        "retinol serum, benzoyl peroxide gel",
        llm,
        concerns="acne",
    )

    sched = r["weekly_schedule"]
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    assert all(len(activities) == 1 for activities in sched.values())

    retinol_days = [
        day for day in days
        if any("retinol" in active.lower() for active in sched.get(day, []))
    ]
    bp_days = [
        day for day in days
        if any("benzoyl peroxide" in active.lower()
               for active in sched.get(day, []))
    ]

    assert len(retinol_days) == 2
    assert bp_days
    assert set(retinol_days).isdisjoint(bp_days)



def test_benzoyl_peroxide_wash_stays_in_the_routine():
    llm = basic_llm(morning=["Cleanser", "Benzoyl Peroxide Wash", "Moisturizer"])
    r, _ = run_engine("benzoyl peroxide wash", llm, concerns="acne")
    assert has(r["morning"] + r["night"], "benzoyl peroxide")


def test_retinol_has_a_frequency_limit():
    r, _ = run_engine("retinol serum")
    assert has(r["frequency"], "retinol")


def test_high_strength_warning():
    _, meta = run_engine("5% salicylic acid serum")
    assert has(meta["warnings"], "high strength")


# ---------------------------------------------------------------- shape / ordering
def test_routine_order_is_cleanser_actives_moisturizer_spf():
    llm = basic_llm(morning=["Moisturizer", "Sunscreen SPF 30", "Cleanser"],
                    night=["Moisturizer", "Cleanser"])
    r, _ = run_engine("retinol serum", llm)
    assert r["morning"][0].lower().endswith("cleanser") and has([r["morning"][-1]], "sunscreen")
    assert r["night"].index([i for i in r["night"] if "retinol" in i.lower()][0]) < \
           r["night"].index([i for i in r["night"] if "moisturizer" in i.lower()][0])


def test_missing_moisturizer_is_added_before_spf():
    llm = {"morning": ["Cleanser", "Sunscreen SPF 30"], "night": ["Cleanser"], "conflicts": [], "tips": []}
    r, _ = run_engine("", llm)
    assert has([r["morning"][-1]], "sunscreen") and has(r["morning"], "moisturizer")
    assert has(r["night"], "moisturizer")


def test_users_own_cleanser_and_moisturizer_replace_generic_ones():
    r, _ = run_engine("CeraVe Hydrating Cleanser, Cetaphil moisturizer")
    assert has(r["morning"], "CeraVe Hydrating Cleanser") and has(r["night"], "CeraVe Hydrating Cleanser")
    assert has(r["morning"], "Cetaphil moisturizer")
    assert not any(i == "Moisturizer" for i in r["morning"] + r["night"])


def test_no_placeholder_text_ever_reaches_the_user():
    llm = basic_llm(night=["Cleanser", "Active Treatment (e.g., Acid/Retinoid)", "Moisturizer"])
    r, _ = run_engine("retinol serum", llm)
    assert not has(r["night"], "e.g.")

def test_user_input_metadata_is_removed_from_routine():
    llm = basic_llm(
        morning=[
            "Cleanser",
            "<user_input> - Skin Type: Sensitive</user_input>",
            "<user_input> - Concerns: Sensitivity & Redness</user_input>",
            "Moisturizer",
            "Sunscreen SPF 30+",
        ],
        night=[
            "Cleanser",
            "<user_input> - Concerns: Sensitivity & Redness</user_input>",
            "Moisturizer",
        ],
    )

    r, _ = run_engine("", llm)

    all_items = r["morning"] + r["night"]

    assert not any("skin type:" in item.lower() for item in all_items)
    assert not any("concerns:" in item.lower() for item in all_items)


def test_tips_are_stable_between_calls_and_describe_the_final_routine():
    llm = basic_llm(night=["Cleanser", "Retinol Serum", "Salicylic Acid Serum", "Moisturizer"])
    a, _ = run_engine("retinol serum, salicylic acid serum", llm)
    b, _ = run_engine("retinol serum, salicylic acid serum", llm)
    assert a["tips"] == b["tips"] and len(a["tips"]) == len(set(a["tips"]))
    assert has(a["tips"], "retinol")


def test_input_routine_is_not_mutated():
    llm = basic_llm(morning=["Cleanser", "Retinol Serum"], night=["Cleanser"])
    snapshot = copy.deepcopy(llm)
    run_engine("retinol serum", llm)
    assert llm == snapshot


def test_conflicts_are_clean_and_not_double_prefixed():
    r, meta = run_engine("retinol serum, benzoyl peroxide cleanser")
    assert r["conflicts"] and not any(c[0] in "ðŸ›‘âš ï¸âœ…ðŸš«" for c in r["conflicts"])
    assert not any("Conflict detected: Conflict" in w for w in meta["warnings"])

    r, _ = run_engine("")

    assert all(isinstance(item, str) for item in r["morning"])
    assert all(isinstance(item, str) for item in r["night"])
    assert has(r["morning"], "cleanser")
    assert has(r["night"], "cleanser")
    assert has(r["morning"], "moisturizer")
    assert has(r["night"], "moisturizer")



def test_non_string_routine_items_are_ignored_safely():
    llm = basic_llm(
        morning=["Cleanser", None, 123, "Moisturizer"],
        night=["Cleanser", {"unexpected": "value"}, "Moisturizer"],
    )

    r, _ = run_engine("cleanser, moisturizer", llm)

    assert all(isinstance(item, str) for item in r["morning"])
    assert all(isinstance(item, str) for item in r["night"])

    assert has(r["morning"], "cleanser")
    assert has(r["morning"], "moisturizer")
    assert has(r["night"], "cleanser")
    assert has(r["night"], "moisturizer")
