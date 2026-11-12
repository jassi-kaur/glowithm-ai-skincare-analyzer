/* =========================================================
   GLOWITHM — INGREDIENT INTELLIGENCE
   CLEAN INTERACTIVE INGREDIENT SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Glowithm Ingredient Intelligence Loaded");


/* =====================================================
   1. INGREDIENT DATABASE
   SINGLE SOURCE OF TRUTH — 14 INGREDIENTS
===================================================== */
const ingredientData = {

    /* =====================================================
       NIACINAMIDE
    ===================================================== */

    niacinamide: {
        name: "Niacinamide",
        subtitle: "Vitamin B3",
        category: "BRIGHTENING · BARRIER SUPPORT",
        visualCategory: "BRIGHTENING",
        visualSupport: "BARRIER SUPPORT",
        image: "assets/ingredients/niacinamide.webp",
        categories: ["brightening", "barrier-care", "acne-care"],
        meta: ["Water-soluble", "Beginner-friendly", "Daily use"],
        whatItIs: "Niacinamide is a form of vitamin B3 commonly used in skincare to support the skin barrier, balance excess oil and improve the appearance of uneven skin tone.",
        whatItDoes: ["Supports the skin barrier", "Helps control excess oil", "Improves the appearance of uneven skin tone"],
        howItWorks: "Niacinamide supports several functions of the skin barrier and can help regulate excess sebum while supporting a more even-looking complexion.",
        bestFor: ["Acne-prone skin", "Uneven skin tone", "Visible dark spots", "Weak skin barrier"],
        skinTypes: ["Oily", "Combination", "Normal", "Dry", "Sensitive"],
        usage: "Can generally be used once or twice daily after cleansing and before moisturizer.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Hyaluronic Acid", "Ceramides", "Vitamin C"],
        avoidWith: [],
        notes: "A versatile ingredient that fits into many skincare routines and is generally well tolerated.",
        compatibility: {
            acne: { label: "Excellent", score: 5 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Good", score: 3 },
            redness: { label: "Good", score: 4 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       VITAMIN C
    ===================================================== */

    vitaminC: {
        name: "Vitamin C",
        subtitle: "Ascorbic Acid",
        category: "BRIGHTENING · ANTIOXIDANT",
        visualCategory: "BRIGHTENING",
        visualSupport: "ANTIOXIDANT",
        image: "assets/ingredients/vitamin-c.webp",
        categories: ["antioxidants", "brightening"],
        meta: ["Antioxidant", "Brightening", "AM-friendly"],
        whatItIs: "Vitamin C is an antioxidant ingredient commonly used to support brighter-looking skin and protect against environmental stressors.",
        whatItDoes: ["Supports brighter-looking skin", "Helps defend against environmental stress", "Improves the appearance of uneven tone"],
        howItWorks: "Vitamin C provides antioxidant support and can help reduce the visible effects of environmental stress while supporting a more even-looking complexion.",
        bestFor: ["Pigmentation", "Dark spots", "Uneven skin tone", "Dull-looking skin"],
        skinTypes: ["Normal", "Combination", "Oily", "Dry"],
        usage: "Often used in the morning after cleansing and before moisturizer and sunscreen.",
        routine: { morning: true, night: true },
        beginnerFriendly: false,
        pairings: ["Niacinamide", "Hyaluronic Acid"],
        avoidWith: ["Strong exfoliating actives when irritation occurs"],
        notes: "Vitamin C formulas can vary considerably in strength and stability, so beginners should introduce active formulas gradually.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Good", score: 3 },
            redness: { label: "Good", score: 3 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       SALICYLIC ACID
    ===================================================== */

    salicylicAcid: {
        name: "Salicylic Acid",
        subtitle: "Beta Hydroxy Acid",
        category: "EXFOLIATING · ACNE CARE",
        visualCategory: "ACNE CARE",
        visualSupport: "EXFOLIATING",
        image: "assets/ingredients/salicylic-acid.webp",
        categories: ["exfoliation", "acne-care"],
        meta: ["Oil-soluble", "Exfoliating", "Pore care"],
        whatItIs: "Salicylic Acid is a beta hydroxy acid commonly used to exfoliate the skin and help manage clogged pores and excess oil.",
        whatItDoes: ["Helps unclog pores", "Supports clearer-looking skin", "Helps manage excess oil"],
        howItWorks: "As an oil-soluble exfoliant, Salicylic Acid can work within oily areas of the skin and help remove accumulated dead skin cells and debris.",
        bestFor: ["Acne-prone skin", "Clogged pores", "Blackheads", "Excess oil"],
        skinTypes: ["Oily", "Combination", "Normal"],
        usage: "Usually introduced gradually, depending on product strength and skin tolerance.",
        routine: { morning: false, night: true },
        beginnerFriendly: false,
        pairings: ["Hyaluronic Acid", "Niacinamide"],
        avoidWith: ["Retinol when irritation occurs", "Other strong exfoliating actives when irritation occurs"],
        notes: "Overuse can contribute to dryness or irritation, particularly when combined with other strong actives.",
        compatibility: {
            acne: { label: "Excellent", score: 5 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Use carefully", score: 2 },
            redness: { label: "Use carefully", score: 2 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       HYALURONIC ACID
    ===================================================== */

    hyaluronicAcid: {
        name: "Hyaluronic Acid",
        subtitle: "Hydrating Humectant",
        category: "HYDRATING · BARRIER SUPPORT",
        visualCategory: "HYDRATION",
        visualSupport: "BARRIER SUPPORT",
        image: "assets/ingredients/hyaluronic-acid.webp",
        categories: ["hydration", "soothing"],
        meta: ["Humectant", "Hydrating", "Beginner-friendly"],
        whatItIs: "Hyaluronic Acid is a humectant that helps attract and retain water in the skin.",
        whatItDoes: ["Helps support skin hydration", "Improves the feel of dry skin", "Supports a comfortable skin barrier"],
        howItWorks: "Hyaluronic Acid acts as a humectant, helping attract and hold water around the skin's surface.",
        bestFor: ["Dry skin", "Dehydrated skin", "Tight-feeling skin", "Supporting active routines"],
        skinTypes: ["Dry", "Normal", "Combination", "Oily", "Sensitive"],
        usage: "Can generally be used morning and night, followed by a moisturizer to help support hydration.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Niacinamide", "Ceramides", "Vitamin C", "Retinol"],
        avoidWith: [],
        notes: "One of the easiest ingredients to incorporate into a routine focused on hydration.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       RETINOL
    ===================================================== */

    retinol: {
        name: "Retinol",
        subtitle: "Vitamin A Derivative",
        category: "RENEWAL · ANTI-AGING",
        visualCategory: "SKIN RENEWAL",
        visualSupport: "VITAMIN A",
        image: "assets/ingredients/retinol.webp",
        categories: ["retinoids", "anti-aging"],
        meta: ["Vitamin A", "Active ingredient", "PM-focused"],
        whatItIs: "Retinol is a vitamin A derivative commonly used to support skin renewal and improve the appearance of texture and visible signs of aging.",
        whatItDoes: ["Supports skin renewal", "Improves the appearance of skin texture", "Helps reduce visible signs of aging"],
        howItWorks: "Retinol supports skin cell turnover and can gradually improve the appearance of texture, uneven tone and fine lines with consistent use.",
        bestFor: ["Uneven texture", "Fine lines", "Acne", "Uneven tone"],
        skinTypes: ["Normal", "Combination", "Oily"],
        usage: "Generally introduced gradually in an evening routine. Sunscreen is important during the day.",
        routine: { morning: false, night: true },
        beginnerFriendly: false,
        pairings: ["Hyaluronic Acid", "Ceramides"],
        avoidWith: ["Strong exfoliating acids when irritation occurs", "Other strong actives when irritation occurs"],
        notes: "Retinol can cause dryness or irritation when first introduced, so gradual use is important.",
        compatibility: {
            acne: { label: "Excellent", score: 5 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Use carefully", score: 2 },
            redness: { label: "Use carefully", score: 2 },
            fineLines: { label: "Excellent", score: 5 }
        }
    },


    /* =====================================================
       CERAMIDES
    ===================================================== */

    ceramides: {
        name: "Ceramides",
        subtitle: "Skin Barrier Lipids",
        category: "BARRIER SUPPORT · HYDRATION",
        visualCategory: "BARRIER CARE",
        visualSupport: "SKIN BARRIER",
        image: "assets/ingredients/ceramides.webp",
        categories: ["soothing", "barrier-care", "hydration"],
        meta: ["Barrier-supporting", "Moisture-retaining", "Beginner-friendly"],
        whatItIs: "Ceramides are naturally occurring lipids that help support the skin barrier and reduce moisture loss.",
        whatItDoes: ["Helps strengthen the skin barrier", "Supports moisture retention", "Helps improve dry and sensitive-feeling skin"],
        howItWorks: "Ceramides help replenish lipids that are naturally present in the skin barrier, supporting its ability to retain moisture.",
        bestFor: ["Dry skin", "Sensitive skin", "Compromised skin barrier", "Dehydrated skin"],
        skinTypes: ["Dry", "Normal", "Combination", "Sensitive"],
        usage: "Can generally be used morning and night as part of a moisturizing routine.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Niacinamide", "Hyaluronic Acid", "Retinol"],
        avoidWith: [],
        notes: "Ceramides are particularly useful when the goal is maintaining or supporting the skin barrier.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       RETINAL — NEW
    ===================================================== */

    retinal: {
        name: "Retinal",
        subtitle: "Retinaldehyde",
        category: "RETINOID · ANTI-AGING",
        visualCategory: "SKIN RENEWAL",
        visualSupport: "VITAMIN A",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["retinoids", "anti-aging"],
        meta: ["Vitamin A", "Potent", "PM-focused"],
        whatItIs: "Retinal is a vitamin A derivative that is one step closer to retinoic acid than retinol, offering effective skin renewal benefits.",
        whatItDoes: ["Supports skin renewal", "Improves fine lines and texture", "Helps with acne", "Supports even skin tone"],
        howItWorks: "Retinal converts to retinoic acid more efficiently than retinol, providing faster visible results for texture, tone, and signs of aging.",
        bestFor: ["Fine lines", "Uneven texture", "Acne", "Uneven tone"],
        skinTypes: ["Normal", "Combination", "Oily"],
        usage: "Apply at night, starting 2-3 times per week. Always use sunscreen during the day.",
        routine: { morning: false, night: true },
        beginnerFriendly: false,
        pairings: ["Ceramides", "Hyaluronic Acid", "Panthenol"],
        avoidWith: ["Strong exfoliating acids", "Other strong actives when irritation occurs"],
        notes: "More potent than retinol. Start slowly and monitor skin response.",
        compatibility: {
            acne: { label: "Excellent", score: 5 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Use carefully", score: 2 },
            redness: { label: "Use carefully", score: 2 },
            fineLines: { label: "Excellent", score: 5 }
        }
    },


    /* =====================================================
       AZELAIC ACID — NEW
    ===================================================== */

    azelaicAcid: {
        name: "Azelaic Acid",
        subtitle: "Dicarboxylic Acid",
        category: "BRIGHTENING · ACNE CARE",
        visualCategory: "BRIGHTENING",
        visualSupport: "ACNE CARE",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["brightening", "soothing", "acne-care"],
        meta: ["Brightening", "Soothing", "Acne care"],
        whatItIs: "Azelaic Acid is a naturally occurring acid used to address acne, uneven pigmentation, and visible redness.",
        whatItDoes: ["Improves acne", "Fades dark marks", "Helps even skin tone", "Soothes visible redness"],
        howItWorks: "Azelaic Acid works by supporting skin cell turnover while also providing soothing properties, making it effective for both acne and pigmentation concerns.",
        bestFor: ["Acne", "Redness", "Dark spots", "Pigmentation"],
        skinTypes: ["All skin types", "Sensitive"],
        usage: "Usually once daily initially, increasing according to tolerance.",
        routine: { morning: true, night: true },
        beginnerFriendly: false,
        pairings: ["Niacinamide", "Alpha Arbutin", "Hyaluronic Acid", "Ceramides"],
        avoidWith: ["Strong exfoliating actives when irritation occurs"],
        notes: "Can cause initial tingling or mild irritation. Start slowly.",
        compatibility: {
            acne: { label: "Excellent", score: 5 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Good", score: 3 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       CENTELLA ASIATICA — NEW
    ===================================================== */

    centella: {
        name: "Centella Asiatica",
        subtitle: "Cica · Tiger Grass",
        category: "SOOTHING · BARRIER SUPPORT",
        visualCategory: "SOOTHING",
        visualSupport: "BARRIER SUPPORT",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["soothing", "barrier-care"],
        meta: ["Soothing", "Barrier-supporting", "Gentle"],
        whatItIs: "Centella Asiatica is a botanical ingredient commonly used to calm and soothe stressed, sensitive skin.",
        whatItDoes: ["Soothes visible irritation", "Supports skin comfort", "Helps support the skin barrier"],
        howItWorks: "Centella Asiatica contains bioactive compounds that help calm visible redness and support the skin's natural recovery process.",
        bestFor: ["Redness", "Irritation", "Sensitivity", "Barrier support"],
        skinTypes: ["All skin types", "Sensitive", "Dry"],
        usage: "Can be used morning and night as part of a soothing routine.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Panthenol", "Allantoin", "Ceramides", "Hyaluronic Acid"],
        avoidWith: [],
        notes: "Generally gentle. Suitable for sensitive and compromised skin.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       PANTHENOL — NEW
    ===================================================== */

    panthenol: {
        name: "Panthenol",
        subtitle: "Provitamin B5",
        category: "SOOTHING · HYDRATION",
        visualCategory: "SOOTHING",
        visualSupport: "HYDRATION",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["soothing", "barrier-care"],
        meta: ["Soothing", "Hydrating", "Beginner-friendly"],
        whatItIs: "Panthenol is a provitamin B5 ingredient valued for its moisturizing and skin-conditioning properties.",
        whatItDoes: ["Helps hydrate", "Supports barrier function", "Soothes uncomfortable-feeling skin", "Improves skin softness"],
        howItWorks: "Panthenol penetrates deeply to provide hydration and support the skin barrier, helping skin feel comfortable and resilient.",
        bestFor: ["Dryness", "Irritation", "Barrier support", "Sensitive skin"],
        skinTypes: ["All skin types", "Dry", "Sensitive"],
        usage: "Can be used morning and night. Works well in moisturizers and serums.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Ceramides", "Centella", "Hyaluronic Acid", "Allantoin"],
        avoidWith: [],
        notes: "Generally beginner-friendly. A great supporting ingredient for active routines.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       ALLANTOIN — NEW
    ===================================================== */

    allantoin: {
        name: "Allantoin",
        subtitle: "Skin Conditioning",
        category: "SOOTHING · BARRIER SUPPORT",
        visualCategory: "SOOTHING",
        visualSupport: "SKIN CONDITIONING",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["soothing", "barrier-care"],
        meta: ["Soothing", "Conditioning", "Gentle"],
        whatItIs: "Allantoin is a skin-conditioning ingredient commonly used in products designed to soothe and moisturize.",
        whatItDoes: ["Helps soothe irritation", "Supports skin comfort", "Helps soften rough-feeling skin"],
        howItWorks: "Allantoin supports the skin's natural recovery process and helps create a comfortable, conditioned skin surface.",
        bestFor: ["Redness", "Irritation", "Sensitivity", "Rough texture"],
        skinTypes: ["All skin types", "Sensitive", "Dry"],
        usage: "Can be used morning and night. Works well in soothing formulas.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Centella", "Panthenol", "Ceramides", "Hyaluronic Acid"],
        avoidWith: [],
        notes: "Very gentle. Suitable for sensitive and compromised skin.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Excellent", score: 5 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       ALPHA ARBUTIN — NEW
    ===================================================== */

    alphaArbutin: {
        name: "Alpha Arbutin",
        subtitle: "Skin Brightener",
        category: "BRIGHTENING · PIGMENTATION",
        visualCategory: "BRIGHTENING",
        visualSupport: "PIGMENTATION CARE",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["brightening"],
        meta: ["Brightening", "Pigmentation care", "Gentle"],
        whatItIs: "Alpha Arbutin is a skin-brightening ingredient used to target the appearance of uneven pigmentation and dark spots.",
        whatItDoes: ["Reduces appearance of dark spots", "Supports more even-looking skin tone", "Targets visible pigmentation"],
        howItWorks: "Alpha Arbutin works by supporting the skin's natural pigment-regulating process, helping reduce the appearance of dark spots over time.",
        bestFor: ["Dark spots", "Pigmentation", "Uneven tone", "Melasma"],
        skinTypes: ["All skin types", "Normal", "Combination", "Dry"],
        usage: "Usually morning and/or night, depending on formulation.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Niacinamide", "Vitamin C", "Azelaic Acid", "Hyaluronic Acid"],
        avoidWith: ["Introduce gradually alongside other brightening actives"],
        notes: "Gentle enough for most skin types. Consistent use is key for results.",
        compatibility: {
            acne: { label: "Good", score: 3 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Good", score: 4 },
            redness: { label: "Good", score: 3 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       GLYCERIN — NEW
    ===================================================== */

    glycerin: {
        name: "Glycerin",
        subtitle: "Hydrating Humectant",
        category: "HYDRATION · BARRIER SUPPORT",
        visualCategory: "HYDRATION",
        visualSupport: "HUMECTANT",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["hydration"],
        meta: ["Humectant", "Hydrating", "Beginner-friendly"],
        whatItIs: "Glycerin is a highly effective humectant that attracts water to help maintain skin hydration.",
        whatItDoes: ["Hydrates skin", "Reduces feeling of dryness", "Supports skin softness", "Helps maintain moisture balance"],
        howItWorks: "Glycerin draws water to the skin's surface, helping to maintain hydration and support a healthy moisture balance.",
        bestFor: ["Dryness", "Dehydration", "Tightness", "Rough texture"],
        skinTypes: ["All skin types", "Dry", "Sensitive", "Dehydrated"],
        usage: "Can be used morning and night. Found in many moisturizers and serums.",
        routine: { morning: true, night: true },
        beginnerFriendly: true,
        pairings: ["Hyaluronic Acid", "Ceramides", "Panthenol", "Niacinamide"],
        avoidWith: [],
        notes: "One of the most common and well-tolerated hydrating ingredients.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Good", score: 3 },
            darkSpots: { label: "Good", score: 3 },
            dryness: { label: "Excellent", score: 5 },
            redness: { label: "Good", score: 4 },
            fineLines: { label: "Good", score: 3 }
        }
    },


    /* =====================================================
       LACTIC ACID — NEW
    ===================================================== */

    lacticAcid: {
        name: "Lactic Acid",
        subtitle: "Alpha Hydroxy Acid",
        category: "EXFOLIANT · BRIGHTENING",
        visualCategory: "EXFOLIATION",
        visualSupport: "BRIGHTENING",
        image: "assets/ingredients/ingredient-placeholder.webp",
        categories: ["exfoliation", "brightening"],
        meta: ["AHA", "Exfoliating", "Hydrating"],
        whatItIs: "Lactic Acid is an alpha-hydroxy acid that exfoliates the skin surface while providing hydration.",
        whatItDoes: ["Removes dead skin cells", "Improves dullness", "Smooths texture", "Helps improve uneven tone"],
        howItWorks: "Lactic Acid gently dissolves dead skin cells on the surface while also attracting moisture, making it more hydrating than some other AHAs.",
        bestFor: ["Dullness", "Texture", "Pigmentation", "Uneven tone"],
        skinTypes: ["Normal", "Dry", "Combination"],
        usage: "Usually at night, a few times per week depending on concentration.",
        routine: { morning: false, night: true },
        beginnerFriendly: false,
        pairings: ["Hyaluronic Acid", "Ceramides", "Panthenol"],
        avoidWith: ["Strong exfoliating acids", "Retinol when irritation occurs"],
        notes: "Less irritating than glycolic acid. Start slowly.",
        compatibility: {
            acne: { label: "Good", score: 4 },
            pigmentation: { label: "Excellent", score: 5 },
            darkSpots: { label: "Excellent", score: 5 },
            dryness: { label: "Good", score: 3 },
            redness: { label: "Good", score: 3 },
            fineLines: { label: "Excellent", score: 5 }
        }
    }
};


/* =====================================================
   2. INGREDIENT ORDER
===================================================== */

    const ingredientOrder = [
        "niacinamide",
        "retinol",
        "vitaminC",
        "hyaluronicAcid",
        "salicylicAcid",
        "ceramides",
        "retinal",
        "azelaicAcid",
        "centella",
        "panthenol",
        "allantoin",
        "alphaArbutin",
        "glycerin",
        "lacticAcid"
    ];


/* =====================================================
   3. FEATURED INGREDIENT CARDS
===================================================== */

    document
        .querySelectorAll(".ingredient-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const ingredientKey =
                        card.dataset.ingredient;

                    if (!ingredientKey) {
                        return;
                    }

                    // Navigate to ingredient detail page
                    window.location.href =
                        `ingredient-detail.html?ingredient=${ingredientKey}`;
                }
            );
        });


/* =====================================================
   4. FEATURED INGREDIENT FILTERS
===================================================== */

// ========================================
// INGREDIENT FILTERS
// ========================================

/* =====================================================
   4. FEATURED INGREDIENT FILTERS - COMPLETE FIX
===================================================== */

// Get DOM elements
const ingredientFilters = document.querySelectorAll(".ingredient-filter");
const ingredientGrid = document.getElementById("ingredient-grid");

// Popular ingredients (shown when "Popular" filter is active)
const popularIngredientKeys = [
    "niacinamide",
    "retinol",
    "vitaminC",
    "hyaluronicAcid",
    "salicylicAcid",
    "ceramides"
];

// Format category names for display
function formatIngredientCategory(category) {
    const categoryNames = {
        "hydration": "Hydration",
        "brightening": "Brightening",
        "exfoliation": "Exfoliation",
        "retinoids": "Retinoids",
        "soothing": "Soothing",
        "barrier-care": "Barrier Care",
        "antioxidants": "Antioxidant",
        "acne-care": "Acne Care",
        "anti-aging": "Anti-Aging"
    };
    return categoryNames[category] || category;
}

// Get first letter of ingredient name
function getFirstLetter(name) {
    if (!name) return "?";
    // Handle special cases
    if (name === "Vitamin C") return "C";
    if (name === "Hyaluronic Acid") return "H";
    if (name === "Salicylic Acid") return "S";
    if (name === "Niacinamide") return "N";
    if (name === "Retinol") return "R";
    if (name === "Ceramides") return "C";
    if (name === "Retinal") return "R";
    if (name === "Azelaic Acid") return "A";
    if (name === "Centella Asiatica") return "C";
    if (name === "Panthenol") return "P";
    if (name === "Allantoin") return "A";
    if (name === "Alpha Arbutin") return "A";
    if (name === "Glycerin") return "G";
    if (name === "Lactic Acid") return "L";
    return name.charAt(0);
}

// Get short category display for card
function getShortCategory(ingredient) {
    if (!ingredient || !ingredient.categories || ingredient.categories.length === 0) {
        return "SKINCARE";
    }
    const cat = ingredient.categories[0];
    return formatIngredientCategory(cat).toUpperCase();
}

function renderIngredientCards(filter = "all") {
    if (!ingredientGrid) {
        console.error("Ingredient grid not found!");
        return;
    }

    let ingredientsToShow = [];
    let title = "";

    // Determine which ingredients to show
    if (filter === "all") {
        // Popular = only the 6 featured ingredients
        ingredientsToShow = popularIngredientKeys
            .map(key => ingredientData[key])
            .filter(ing => ing !== undefined);
        title = "Popular Ingredients";
    } else {
        // Category = search through all 14 ingredients
        ingredientsToShow = ingredientOrder
            .map(key => ingredientData[key])
            .filter(ing => ing && ing.categories && ing.categories.includes(filter));

        // Get category display name
        const filterMap = {
            "hydration": "Hydration",
            "brightening": "Brightening",
            "exfoliation": "Exfoliation",
            "retinoids": "Retinoids",
            "soothing": "Soothing",
            "barrier-care": "Barrier Care",
            "antioxidants": "Antioxidants",
            "acne-care": "Acne Care"
        };
        title = filterMap[filter] || filter;
    }

    // If no ingredients found
    if (ingredientsToShow.length === 0) {
        ingredientGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #68736b;">
                <p style="font-size: 16px; margin-bottom: 8px;">No ingredients found for "${title}"</p>
                <p style="font-size: 13px;">Try selecting "Popular" or another category</p>
            </div>
        `;
        return;
    }

    // Build the grid HTML
    ingredientGrid.innerHTML = ingredientsToShow.map(ingredient => {
        // Find the key for this ingredient
        const ingredientKey = Object.keys(ingredientData).find(
            key => ingredientData[key] === ingredient
        );

        // Get categories for data attribute
        const categories = ingredient.categories ? ingredient.categories.join(" ") : "";

        // Get first letter for icon
        const letter = getFirstLetter(ingredient.name);

        return `
            <article class="ingredient-card" data-ingredient="${ingredientKey}" data-categories="${categories}">
                <div class="card-top">
                    <span class="card-number">${String(ingredientsToShow.indexOf(ingredient) + 1).padStart(2, '0')}</span>
                    <span class="card-category">${getShortCategory(ingredient)}</span>
                </div>

                <div class="card-icon">
                    <span class="icon-letter">${letter}</span>
                </div>

                <div class="card-body">
                    <h3>${ingredient.name}</h3>
                    <span class="card-subtitle">${ingredient.subtitle || ''}</span>
                    <p>${ingredient.whatItIs || ingredient.whatItDoes ? (ingredient.whatItDoes ? ingredient.whatItDoes[0] : '') : 'Learn more about this ingredient'}</p>
                    <div class="card-tags">
                        ${(ingredient.bestFor || []).slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>

                <button class="card-btn" data-ingredient="${ingredientKey}">
                    View Intelligence
                    <span>↗</span>
                </button>
            </article>
        `;
    }).join("");

    // Reattach click events to new cards
    attachIngredientCardEvents();
}

function attachIngredientCardEvents() {
    document.querySelectorAll(".ingredient-card").forEach(card => {
        card.addEventListener("click", function(e) {
            // If click was on the button, let the button handle it
            if (e.target.closest(".card-btn")) return;

            const ingredientKey = this.dataset.ingredient;
            if (ingredientKey) {
                window.location.href = `ingredient-detail.html?ingredient=${ingredientKey}`;
            }
        });

        // Also handle button clicks
        const btn = card.querySelector(".card-btn");
        if (btn) {
            btn.addEventListener("click", function(e) {
                e.stopPropagation();
                const ingredientKey = this.dataset.ingredient;
                if (ingredientKey) {
                    window.location.href = `ingredient-detail.html?ingredient=${ingredientKey}`;
                }
            });
        }
    });
}

// Filter button click handlers
ingredientFilters.forEach(filterButton => {
    filterButton.addEventListener("click", function() {
        const selectedFilter = this.dataset.filter;

        // Update active button
        ingredientFilters.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

        // Render matching ingredients
        renderIngredientCards(selectedFilter);
    });
});

// Initial render - show Popular
renderIngredientCards("all");

// Bento Category Cards click handlers
const bentoCards = document.querySelectorAll(".ingredient-bento-card");
const bentoFilterMap = {
    hydrators: "hydration",
    exfoliants: "exfoliation",
    antioxidants: "antioxidants",
    retinoids: "retinoids",
    brighteners: "brightening",
    soothing: "soothing"
};

bentoCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
        for (const [cls, filterKey] of Object.entries(bentoFilterMap)) {
            if (card.classList.contains(cls)) {
                // Update active button
                ingredientFilters.forEach(btn => {
                    if (btn.dataset.filter === filterKey) {
                        btn.classList.add("active");
                    } else {
                        btn.classList.remove("active");
                    }
                });
                renderIngredientCards(filterKey);
                const targetSection = document.getElementById("featured-ingredients");
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: "smooth" });
                }
                break;
            }
        }
    });
});

console.log("Ingredient filters initialized with " + ingredientOrder.length + " ingredients.");


/* =====================================================
   5. HERO SEARCH
===================================================== */

    const heroIngredientInput =
        document.getElementById("ingredient-hero-input");

    const heroIngredientSearchButton =
        document.getElementById("ingredient-hero-search-btn");

    const heroIngredientSuggestions =
        document.getElementById("ingredient-search-suggestions");

    const heroIngredientMessage =
        document.getElementById("ingredient-search-message");


/* =====================================================
   6. SEARCH ALIASES
===================================================== */

    const ingredientAliases = {
        niacinamide: ["niacinamide", "nicinamide", "niacinimide", "vitamin b3", "b3"],
        retinol: ["retinol", "retinoid", "vitamin a", "retinol serum"],
        vitaminC: ["vitamin c", "vit c", "vitaminc", "ascorbic acid", "ascorbate", "l-ascorbic acid"],
        hyaluronicAcid: ["hyaluronic acid", "hyaluronic", "hyloronic", "hyluronic", "hyalornic", "ha"],
        salicylicAcid: ["salicylic acid", "salicylic", "bha", "beta hydroxy acid", "sal acid"],
        ceramides: ["ceramides", "ceramide", "ceramide complex", "barrier lipids", "ceramide np"],
        retinal: ["retinal", "retinaldehyde", "vitamin a aldehyde"],
        azelaicAcid: ["azelaic acid", "azelaic", "finacea", "az acid"],
        centella: ["centella asiatica", "cica", "tiger grass", "gotu kola", "centella", "cica cream"],
        panthenol: ["panthenol", "provitamin b5", "vitamin b5", "pantothenic acid"],
        allantoin: ["allantoin", "allantoine", "comfrey root"],
        alphaArbutin: ["alpha arbutin", "arbutin", "alpha-arbutin", "arbutin serum"],
        glycerin: ["glycerin", "glycerine", "glycerol", "vegetable glycerin"],
        lacticAcid: ["lactic acid", "lactic", "aha", "alpha hydroxy acid", "milk acid"]
    };


/* =====================================================
   7. NORMALIZE SEARCH
===================================================== */

    function normalizeIngredientSearch(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ");
    }


/* =====================================================
   8. LEVENSHTEIN DISTANCE
===================================================== */

    function levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }


/* =====================================================
   9. FIND INGREDIENT FROM SEARCH
===================================================== */

    function findIngredient(searchValue) {

        const query = normalizeIngredientSearch(searchValue);

        if (!query) {
            return null;
        }

        /* Exact aliases */
        for (const [ingredientKey, aliases] of Object.entries(ingredientAliases)) {
            if (aliases.some(alias => normalizeIngredientSearch(alias) === query)) {
                return ingredientKey;
            }
        }

        /* Partial match */
        for (const [ingredientKey, aliases] of Object.entries(ingredientAliases)) {
            if (aliases.some(alias => {
                const normalizedAlias = normalizeIngredientSearch(alias);
                return normalizedAlias.includes(query) || query.includes(normalizedAlias);
            })) {
                return ingredientKey;
            }
        }

        /* Fuzzy match */
        let bestMatch = null;
        let bestDistance = Infinity;

        for (const [ingredientKey, aliases] of Object.entries(ingredientAliases)) {
            aliases.forEach(alias => {
                const normalizedAlias = normalizeIngredientSearch(alias);
                const distance = levenshteinDistance(query, normalizedAlias);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = ingredientKey;
                }
            });
        }

        const threshold = query.length <= 5 ? 1 : 3;

        if (bestDistance <= threshold) {
            return bestMatch;
        }

        return null;
    }


/* =====================================================
   10. SHOW SEARCH SUGGESTIONS
===================================================== */

    function showIngredientSuggestions(query) {

        if (!heroIngredientSuggestions) {
            return;
        }

        const normalizedQuery = normalizeIngredientSearch(query);

        if (!normalizedQuery) {
            heroIngredientSuggestions.classList.remove("show");
            heroIngredientSuggestions.innerHTML = "";
            return;
        }

        const matches = [];

        Object.entries(ingredientData).forEach(([key, ingredient]) => {
            const searchableText = [
                ingredient.name,
                ingredient.subtitle,
                ingredient.category,
                ...(ingredientAliases[key] || [])
            ].join(" ").toLowerCase();

            if (searchableText.includes(normalizedQuery)) {
                matches.push({ key, ingredient });
            }
        });

        if (!matches.length) {
            heroIngredientSuggestions.classList.remove("show");
            heroIngredientSuggestions.innerHTML = "";
            return;
        }

        heroIngredientSuggestions.innerHTML =
            matches.slice(0, 5).map(({ key, ingredient }) => {
                return `
                    <button
                        type="button"
                        class="ingredient-search-suggestion"
                        data-search-result="${key}"
                    >
                        <span class="suggestion-main">
                            <span class="suggestion-name">${ingredient.name}</span>
                            <span class="suggestion-subtitle">${ingredient.subtitle}</span>
                        </span>
                        <span class="suggestion-arrow">→</span>
                    </button>
                `;
            }).join("");

        heroIngredientSuggestions.classList.add("show");
    }


/* =====================================================
   11. OPEN INGREDIENT (Navigate to Detail Page)
===================================================== */

    function openIngredient(ingredientKey) {

        const ingredient = ingredientData[ingredientKey];

        if (!ingredient) {
            return;
        }

        // Navigate to ingredient detail page
        window.location.href =
            `ingredient-detail.html?ingredient=${ingredientKey}`;
    }


/* =====================================================
   12. HERO SEARCH BUTTON
===================================================== */

    if (heroIngredientSearchButton) {

        heroIngredientSearchButton.addEventListener(
            "click",
            () => {

                const query = heroIngredientInput ? heroIngredientInput.value : "";

                const ingredientKey = findIngredient(query);

                if (ingredientKey) {
                    openIngredient(ingredientKey);
                } else {
                    if (heroIngredientMessage) {
                        heroIngredientMessage.textContent =
                            "We couldn't find that ingredient. Try Niacinamide, Vitamin C, Retinol, or Salicylic Acid.";
                    }

                    if (heroIngredientInput) {
                        heroIngredientInput.focus();
                    }
                }
            }
        );
    }


/* =====================================================
   13. HERO ENTER KEY
===================================================== */

    if (heroIngredientInput) {

        heroIngredientInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();

                    if (heroIngredientSearchButton) {
                        heroIngredientSearchButton.click();
                    }
                }
            }
        );

        heroIngredientInput.addEventListener(
            "input",
            () => {
                const query = heroIngredientInput.value;

                if (heroIngredientMessage) {
                    heroIngredientMessage.textContent = "";
                }

                showIngredientSuggestions(query);
            }
        );
    }


/* =====================================================
   14. HERO SUGGESTION CLICK
===================================================== */

    if (heroIngredientSuggestions) {

        heroIngredientSuggestions.addEventListener(
            "click",
            event => {

                const result = event.target.closest("[data-search-result]");

                if (!result) {
                    return;
                }

                const ingredientKey = result.dataset.searchResult;

                openIngredient(ingredientKey);
            }
        );
    }


/* =====================================================
   15. HERO POPULAR INGREDIENTS
===================================================== */

    document
        .querySelectorAll("[data-hero-ingredient]")
        .forEach(tag => {

            tag.addEventListener(
                "click",
                () => {

                    const ingredientKey = tag.dataset.heroIngredient;

                    openIngredient(ingredientKey);
                }
            );
        });


/* =====================================================
   16. CLOSE SEARCH SUGGESTIONS
===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (!event.target.closest(".ingredient-hero-search")) {

                if (heroIngredientSuggestions) {
                    heroIngredientSuggestions.classList.remove("show");
                }
            }
        }
    );


/* =====================================================
   17. PAIRING INTELLIGENCE
===================================================== */

    const pairingIngredientData = {
        niacinamide: { name: "Niacinamide", category: "Brightening" },
        retinol: { name: "Retinol", category: "Retinoid" },
        vitaminC: { name: "Vitamin C", category: "Antioxidant" },
        hyaluronicAcid: { name: "Hyaluronic Acid", category: "Hydration" },
        salicylicAcid: { name: "Salicylic Acid", category: "Exfoliant" },
        ceramides: { name: "Ceramides", category: "Barrier" },
        retinal: { name: "Retinal", category: "Retinoid" },
        azelaicAcid: { name: "Azelaic Acid", category: "Brightening" },
        centella: { name: "Centella Asiatica", category: "Soothing" },
        panthenol: { name: "Panthenol", category: "Soothing" },
        allantoin: { name: "Allantoin", category: "Soothing" },
        alphaArbutin: { name: "Alpha Arbutin", category: "Brightening" },
        glycerin: { name: "Glycerin", category: "Hydration" },
        lacticAcid: { name: "Lactic Acid", category: "Exfoliant" }
    };


    const pairingImages = {
        niacinamide: "assets/ingredients/niacinamide.webp",
        retinol: "assets/ingredients/retinol.webp",
        vitaminC: "assets/ingredients/vitamin-c.webp",
        hyaluronicAcid: "assets/ingredients/hyaluronic-acid.webp",
        salicylicAcid: "assets/ingredients/salicylic-acid.webp",
        ceramides: "assets/ingredients/ceramides.webp",
        retinal: "assets/ingredients/ingredient-placeholder.webp",
        azelaicAcid: "assets/ingredients/ingredient-placeholder.webp",
        centella: "assets/ingredients/ingredient-placeholder.webp",
        panthenol: "assets/ingredients/ingredient-placeholder.webp",
        allantoin: "assets/ingredients/ingredient-placeholder.webp",
        alphaArbutin: "assets/ingredients/ingredient-placeholder.webp",
        glycerin: "assets/ingredients/ingredient-placeholder.webp",
        lacticAcid: "assets/ingredients/ingredient-placeholder.webp"
    };


    let pairingState = {
        one: "niacinamide",
        two: "hyaluronicAcid"
    };


    /* =====================================================
       PAIRING RULES
    ===================================================== */

    const pairingRules = {

        "niacinamide+hyaluronicAcid": {
            status: "great",
            title: "Great Pair",
            description: "Niacinamide supports the skin barrier while Hyaluronic Acid helps attract and retain moisture. Together they make a gentle, hydration-focused combination.",
            tags: ["Barrier Support", "Hydration", "Skin Comfort"]
        },

        "hyaluronicAcid+niacinamide": {
            status: "great",
            title: "Great Pair",
            description: "Hyaluronic Acid adds hydration while Niacinamide supports the skin barrier. This is a versatile combination for most skin types.",
            tags: ["Hydration", "Barrier Support", "Skin Comfort"]
        },

        "niacinamide+ceramides": {
            status: "great",
            title: "Great Pair",
            description: "Niacinamide and Ceramides complement each other by supporting the skin barrier and helping maintain a healthier moisture balance.",
            tags: ["Barrier Care", "Repair", "Comfort"]
        },

        "ceramides+niacinamide": {
            status: "great",
            title: "Great Pair",
            description: "Ceramides reinforce the skin barrier while Niacinamide helps support barrier function and overall skin resilience.",
            tags: ["Barrier Care", "Repair", "Resilience"]
        },

        "hyaluronicAcid+ceramides": {
            status: "great",
            title: "Great Pair",
            description: "Hyaluronic Acid provides hydration while Ceramides help strengthen the skin barrier and reduce moisture loss.",
            tags: ["Hydration", "Barrier Care", "Moisture"]
        },

        "ceramides+hyaluronicAcid": {
            status: "great",
            title: "Great Pair",
            description: "This combination pairs hydration with barrier support, making it especially useful for maintaining comfortable, hydrated skin.",
            tags: ["Hydration", "Barrier Care", "Comfort"]
        },

        "vitaminC+niacinamide": {
            status: "compatible",
            title: "Generally Compatible",
            description: "Vitamin C and Niacinamide can be used together in modern skincare formulations. Both support a more even-looking complexion and overall skin health.",
            tags: ["Brightening", "Antioxidant Support", "Even Tone"]
        },

        "niacinamide+vitaminC": {
            status: "compatible",
            title: "Generally Compatible",
            description: "Niacinamide and Vitamin C can complement each other for brightening and supporting the skin barrier.",
            tags: ["Brightening", "Barrier Support", "Even Tone"]
        },

        "vitaminC+hyaluronicAcid": {
            status: "compatible",
            title: "Generally Compatible",
            description: "Vitamin C provides antioxidant support while Hyaluronic Acid adds hydration. They work well together in many routines.",
            tags: ["Antioxidant", "Hydration", "Brightening"]
        },

        "hyaluronicAcid+vitaminC": {
            status: "compatible",
            title: "Generally Compatible",
            description: "Hydrating with Hyaluronic Acid alongside Vitamin C can help create a balanced routine focused on hydration and antioxidant support.",
            tags: ["Hydration", "Antioxidant", "Brightening"]
        },

        "retinol+salicylicAcid": {
            status: "caution",
            title: "Use With Caution",
            description: "Retinol and Salicylic Acid can both be effective actives, but using them together may increase dryness or irritation for some skin types.",
            tags: ["Potential Irritation", "Active Combination", "Introduce Slowly"]
        },

        "salicylicAcid+retinol": {
            status: "caution",
            title: "Use With Caution",
            description: "Combining Salicylic Acid and Retinol may be too intense for sensitive or beginner skin. Consider separating them between routines.",
            tags: ["Potential Irritation", "Active Combination", "Alternate Use"]
        },

        "retinol+vitaminC": {
            status: "caution",
            title: "Use With Caution",
            description: "Both ingredients can be valuable actives, but layering them may be unnecessarily intense for some users. Separating them between routines can be a gentler approach.",
            tags: ["Active Combination", "Sensitivity", "Separate Routines"]
        },

        "vitaminC+retinol": {
            status: "caution",
            title: "Use With Caution",
            description: "Vitamin C and Retinol can both contribute to an active routine. If irritation occurs, consider using them at different times.",
            tags: ["Active Combination", "Sensitivity", "Separate Routines"]
        },

        "retinol+aha": {
            status: "avoid",
            title: "Avoid Layering",
            description: "Retinol and strong AHA exfoliants can create a high-irritation combination when layered, particularly for sensitive skin.",
            tags: ["High Irritation Risk", "Strong Actives", "Separate Use"]
        },

            /* =====================================================
       NEW COMPLEMENTARY PAIRS — 8 TOTAL
    ===================================================== */

    "azelaicAcid+niacinamide": {
        status: "great",
        title: "Great Pair",
        description: "Azelaic Acid and Niacinamide work together to brighten, soothe, and support acne-prone skin while improving tone and texture.",
        tags: ["Brightening", "Soothing", "Acne Care", "Barrier Support"]
    },
    "niacinamide+azelaicAcid": {
        status: "great",
        title: "Great Pair",
        description: "This combination targets pigmentation and redness while supporting the skin barrier.",
        tags: ["Brightening", "Soothing", "Acne Care", "Barrier Support"]
    },

    "centella+panthenol": {
        status: "great",
        title: "Great Pair",
        description: "Centella Asiatica and Panthenol combine to calm, soothe, and support compromised or sensitive skin.",
        tags: ["Soothing", "Barrier Support", "Calming", "Sensitive Skin"]
    },
    "panthenol+centella": {
        status: "great",
        title: "Great Pair",
        description: "This soothing duo helps calm irritation and supports the skin barrier for more comfortable skin.",
        tags: ["Soothing", "Barrier Support", "Calming", "Sensitive Skin"]
    },

    "alphaArbutin+niacinamide": {
        status: "great",
        title: "Great Pair",
        description: "Alpha Arbutin and Niacinamide complement each other for brightening and supporting an even skin tone.",
        tags: ["Brightening", "Even Tone", "Dark Spots", "Barrier Support"]
    },
    "niacinamide+alphaArbutin": {
        status: "great",
        title: "Great Pair",
        description: "This brightening combination helps fade dark spots and supports overall skin clarity.",
        tags: ["Brightening", "Even Tone", "Dark Spots", "Barrier Support"]
    },

    "retinal+ceramides": {
        status: "great",
        title: "Great Pair",
        description: "Retinal provides powerful renewal benefits while Ceramides support the skin barrier, reducing the risk of irritation.",
        tags: ["Renewal", "Barrier Support", "Anti-Aging", "Active Support"]
    },
    "ceramides+retinal": {
        status: "great",
        title: "Great Pair",
        description: "Ceramides help strengthen the barrier while Retinal works on texture and fine lines.",
        tags: ["Renewal", "Barrier Support", "Anti-Aging", "Active Support"]
    },

    /* =====================================================
       NEW USE WITH CAUTION PAIRS — 5 TOTAL
    ===================================================== */

    "retinol+lacticAcid": {
        status: "caution",
        title: "Use With Caution",
        description: "Retinol and Lactic Acid are both active ingredients. Using them together may increase dryness or irritation for some skin types.",
        tags: ["Potential Irritation", "Active Combination", "Introduce Slowly"]
    },
    "lacticAcid+retinol": {
        status: "caution",
        title: "Use With Caution",
        description: "Combining Lactic Acid and Retinol may be too intense for sensitive skin. Consider using them on alternate nights.",
        tags: ["Potential Irritation", "Active Combination", "Alternate Use"]
    },

    "retinal+salicylicAcid": {
        status: "caution",
        title: "Use With Caution",
        description: "Retinal and Salicylic Acid are both strong actives. Using them together may increase irritation risk.",
        tags: ["Potential Irritation", "Strong Actives", "Introduce Slowly"]
    },
    "salicylicAcid+retinal": {
        status: "caution",
        title: "Use With Caution",
        description: "Both Salicylic Acid and Retinal are potent. Consider separating them between morning and night routines.",
        tags: ["Potential Irritation", "Strong Actives", "Separate Use"]
    },

    "salicylicAcid+lacticAcid": {
        status: "caution",
        title: "Use With Caution",
        description: "Multiple exfoliating acids can increase irritation risk. Start with one and introduce the other gradually.",
        tags: ["Exfoliation", "Potential Irritation", "Introduce Slowly"]
    },

    "lacticAcid+salicylicAcid": {
        status: "caution",
        title: "Use With Caution",
        description: "Using both BHA and AHA exfoliants together can be too intense for many skin types.",
        tags: ["Exfoliation", "Potential Irritation", "Alternate Use"]
    }
    };


    /* =====================================================
       GET PAIRING RESULT
    ===================================================== */

    function getPairingResult(one, two) {
        // Status comes from the shared pair data (generated from the backend
        // CSV); this page's own wording is only used when it agrees with it
        // or when the pair isn't in the data. See js/pairing-resolver.js.
        return window.GlowithmPairing.resolvePairing(one, two, sharedPairData, pairingRules);
    }

    let sharedPairData = null;

    function loadSharedPairData() {
        fetch("data/ingredient_pairs.json")
            .then(response => (response.ok ? response.json() : null))
            .then(data => {
                if (data && data.pairs) {
                    sharedPairData = data;
                    updatePairingResult();
                }
            })
            .catch(error => {
                console.warn(
                    "Shared compatibility data unavailable; using the page's built-in guidance.",
                    error
                );
            });
    }

    /* =====================================================
       UPDATE PAIRING RESULT
    ===================================================== */

    function updatePairingResult() {

        const resultContainer = document.querySelector(".pairing-result");

        if (!resultContainer) {
            return;
        }

        const result = getPairingResult(pairingState.one, pairingState.two);

        const icon = resultContainer.querySelector(".pairing-status-icon");
        if (icon) {
            const icons = { great: "✓", compatible: "~", caution: "!", avoid: "✕" };
            icon.textContent = icons[result.status] || "✓";
        }

        const titleEl = resultContainer.querySelector(".pairing-status h3");
        if (titleEl) {
            titleEl.textContent = result.title;
        }

        const descEl = resultContainer.querySelector(".pairing-result-body p");
        if (descEl) {
            descEl.textContent = result.description;
        }

        const tagsContainer = resultContainer.querySelector(".pairing-result-tags");
        if (tagsContainer) {
            tagsContainer.innerHTML = result.tags.map(tag => `<span>${tag}</span>`).join("");
        }

        resultContainer.dataset.status = result.status;

        const scoreEl = resultContainer.querySelector(".pairing-result-score");
        if (scoreEl) {
            const scores = { great: "01", compatible: "02", caution: "03", avoid: "04" };
            scoreEl.textContent = scores[result.status] || "02";
        }
    }


    /* =====================================================
       UPDATE PAIRING INGREDIENT
    ===================================================== */

    function updatePairingIngredient(slot, ingredientKey) {

        const ingredient = pairingIngredientData[ingredientKey];

        if (!ingredient) {
            return;
        }

        pairingState[slot] = ingredientKey;

        const nameElement = document.getElementById(`pair-name-${slot}`);
        const categoryElement = document.getElementById(`pair-category-${slot}`);
        const imageElement = document.getElementById(`pair-image-${slot}`);

        if (nameElement) {
            nameElement.textContent = ingredient.name;
        }

        if (categoryElement) {
            categoryElement.textContent = ingredient.category.toUpperCase();
        }

        if (imageElement) {
            imageElement.src = pairingImages[ingredientKey] || "assets/ingredients/ingredient-placeholder.webp";
            imageElement.alt = ingredient.name;
            imageElement.onerror = () => {
                imageElement.src = "assets/ingredients/ingredient-placeholder.webp";
            };
        }

        /* Update active popular pair */
        document.querySelectorAll(".pairing-example-card").forEach(card => {
            const one = card.dataset.pairOne;
            const two = card.dataset.pairTwo;

            const isActive = one === pairingState.one && two === pairingState.two;

            card.classList.toggle("active", isActive);
        });

        updatePairingResult();
    }


    /* =====================================================
       RENDER PAIRING OPTIONS
    ===================================================== */

    function renderPairingOptions(dropdown, slot) {

        if (!dropdown) {
            return;
        }

        dropdown.innerHTML = "";

        Object.entries(pairingIngredientData).forEach(([key, ingredient]) => {

            const option = document.createElement("button");
            option.type = "button";
            option.className = "pairing-option";

            option.innerHTML = `
                <span class="pairing-option-image">
                    <img src="${pairingImages[key] || "assets/ingredients/ingredient-placeholder.webp"}" alt="${ingredient.name}" onerror="this.src='assets/ingredients/ingredient-placeholder.webp'">
                </span>
                <span class="pairing-option-info">
                    <span class="pairing-option-name">${ingredient.name}</span>
                    <span class="pairing-option-category">${ingredient.category}</span>
                </span>
            `;

            option.addEventListener("click", event => {
                event.stopPropagation();
                updatePairingIngredient(slot, key);
                dropdown.classList.remove("show");
            });

            dropdown.appendChild(option);
        });
    }


    /* =====================================================
       TOGGLE PAIRING DROPDOWN
    ===================================================== */

    function toggleDropdown(slot, event) {

        if (event) {
            event.stopPropagation();
        }

        const dropdown = document.getElementById(`pair-dropdown-${slot}`);

        if (!dropdown) {
            return;
        }

        document.querySelectorAll(".pairing-dropdown.show").forEach(dropdownItem => {
            if (dropdownItem.id !== `pair-dropdown-${slot}`) {
                dropdownItem.classList.remove("show");
            }
        });

        const isShowing = dropdown.classList.contains("show");

        dropdown.classList.toggle("show", !isShowing);

        if (!isShowing) {
            renderPairingOptions(dropdown, slot);
        }
    }


    /* =====================================================
       PAIRING SELECT BUTTONS
    ===================================================== */

    document.querySelectorAll(".pairing-select[data-pair-slot]").forEach(button => {

        button.addEventListener("click", event => {
            const slot = button.dataset.pairSlot;
            toggleDropdown(slot, event);
        });
    });


    /* =====================================================
       CLOSE PAIRING DROPDOWNS
    ===================================================== */

    document.addEventListener("click", () => {

        document.querySelectorAll(".pairing-dropdown.show").forEach(dropdown => {
            dropdown.classList.remove("show");
        });
    });


    /* =====================================================
       POPULAR PAIR CARDS
    ===================================================== */

    document.querySelectorAll(".pairing-example-card").forEach(card => {

        card.addEventListener("click", () => {

            const ingredientOne = card.dataset.pairOne;
            const ingredientTwo = card.dataset.pairTwo;

            if (!ingredientOne || !ingredientTwo) {
                return;
            }

            updatePairingIngredient("one", ingredientOne);
            updatePairingIngredient("two", ingredientTwo);

            document.querySelectorAll(".pairing-dropdown.show").forEach(dropdown => {
                dropdown.classList.remove("show");
            });

            const workspace = document.querySelector(".pairing-workspace");
            if (workspace) {
                workspace.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });


    /* =====================================================
       INITIALIZE PAIRING
    ===================================================== */

    updatePairingIngredient("one", pairingState.one);
    updatePairingIngredient("two", pairingState.two);
    loadSharedPairData();

    console.log("Ingredient Intelligence initialized successfully.");
});