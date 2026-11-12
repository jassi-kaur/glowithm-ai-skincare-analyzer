/* =========================================================
   GLOWITHM PAIRING RESOLVER
   ---------------------------------------------------------
   The ingredients page used to rely only on a hand-written
   table that disagreed with the backend. The backend's
   data/ingredient_pairs.csv is now the single source of truth
   (exported to data/ingredient_pairs.json by
   backend/scripts/export_pairs.py).

   Priority:
     1. exported pair data  -> status (SAFE / CAUTION / AVOID)
     2. the page's own written guidance, only when the pair is
        not in the exported data
     3. an honest "no specific guidance" answer (never a silent
        "compatible")
========================================================= */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.GlowithmPairing = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {

    // ingredients-page id -> name used in the pair table
    const ID_TO_PAIR_NAME = {
        ceramides: "ceramide",
        hyaluronicAcid: "hyaluronic_acid",
        niacinamide: "niacinamide",
        retinol: "retinol",
        retinal: "retinal",
        salicylicAcid: "salicylic_acid",
        vitaminC: "vitamin_c",
        azelaicAcid: "azelaic_acid",
        lacticAcid: "lactic_acid",
        aha: "glycolic_acid",          // generic AHA: same proxy the backend uses
        glycerin: "glycerin"
    };

    const GENERIC = {
        compatible: {
            status: "compatible",
            title: "Generally Compatible",
            description:
                "Glowithm's compatibility data lists no conflict for this pair. " +
                "As with any new active, introduce one product at a time and " +
                "patch-test first.",
            tags: ["Generally Compatible", "Build Gradually"]
        },
        caution: {
            status: "caution",
            title: "Use With Caution",
            description:
                "Glowithm's compatibility data flags this pair as an irritation " +
                "risk. Avoid layering them in the same step; use them at " +
                "different times of day or on alternate nights.",
            tags: ["Potential Irritation", "Separate Use", "Introduce Slowly"]
        },
        avoid: {
            status: "avoid",
            title: "Avoid Layering",
            description:
                "Glowithm's compatibility data flags this pair as a poor " +
                "combination. Do not use them together; keep them on separate " +
                "days, and ask a dermatologist if you are unsure.",
            tags: ["High Irritation Risk", "Separate Use"]
        }
    };

    const NO_DATA = {
        status: "compatible",
        title: "No Specific Guidance",
        description:
            "Glowithm doesn't have specific compatibility data for this pair " +
            "yet. Introduce one product at a time and patch-test before " +
            "combining them.",
        tags: ["No Specific Data", "Build Gradually"]
    };

    function pairKey(a, b) {
        return [a, b].sort().join("+");
    }

    function lookupLabel(one, two, pairData) {
        const a = ID_TO_PAIR_NAME[one];
        const b = ID_TO_PAIR_NAME[two];
        if (!a || !b || !pairData || !pairData.pairs) {
            return undefined;
        }
        return pairData.pairs[pairKey(a, b)];
    }

    function resolvePairing(one, two, pairData, localRules) {
        const rules = localRules || {};
        const local = rules[`${one}+${two}`] || rules[`${two}+${one}`] || null;
        const label = lookupLabel(one, two, pairData);

        if (label) {
            const status =
                label === "AVOID" ? "avoid" :
                label === "CAUTION" ? "caution" :
                (local && local.status === "great" ? "great" : "compatible");

            // Keep the page's richer wording when it agrees with the data.
            if (local && local.status === status) {
                return local;
            }
            return Object.assign({}, GENERIC[status] || GENERIC.compatible, { status });
        }

        return local || NO_DATA;
    }

    return { ID_TO_PAIR_NAME, GENERIC, NO_DATA, pairKey, resolvePairing };
});
