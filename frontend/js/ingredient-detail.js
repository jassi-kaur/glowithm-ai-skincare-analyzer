/* =========================================================
   GLOWITHM — INGREDIENT DETAIL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Glowithm Ingredient Detail Loaded");


    /* =====================================================
       1. INGREDIENT DATA (Copied from ingredients.js)
    ===================================================== */

    const ingredientData = {
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

        retinal: {
            name: "Retinal",
            subtitle: "Retinaldehyde",
            category: "RETINOID · ANTI-AGING",
            visualCategory: "SKIN RENEWAL",
            visualSupport: "VITAMIN A",
            image: "assets/ingredients/retinal.png",
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

        azelaicAcid: {
            name: "Azelaic Acid",
            subtitle: "Dicarboxylic Acid",
            category: "BRIGHTENING · ACNE CARE",
            visualCategory: "BRIGHTENING",
            visualSupport: "ACNE CARE",
            image: "assets/ingredients/azelaic-acid.png",
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

        centella: {
            name: "Centella Asiatica",
            subtitle: "Cica · Tiger Grass",
            category: "SOOTHING · BARRIER SUPPORT",
            visualCategory: "SOOTHING",
            visualSupport: "BARRIER SUPPORT",
            image: "assets/ingredients/centella.png",
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

        panthenol: {
            name: "Panthenol",
            subtitle: "Provitamin B5",
            category: "SOOTHING · HYDRATION",
            visualCategory: "SOOTHING",
            visualSupport: "HYDRATION",
            image: "assets/ingredients/panthenol.png",
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

        allantoin: {
            name: "Allantoin",
            subtitle: "Skin Conditioning",
            category: "SOOTHING · BARRIER SUPPORT",
            visualCategory: "SOOTHING",
            visualSupport: "SKIN CONDITIONING",
            image: "assets/ingredients/allantoin.png",
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

        alphaArbutin: {
            name: "Alpha Arbutin",
            subtitle: "Skin Brightener",
            category: "BRIGHTENING · PIGMENTATION",
            visualCategory: "BRIGHTENING",
            visualSupport: "PIGMENTATION CARE",
            image: "assets/ingredients/alpha-arbutin.png",
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

        glycerin: {
            name: "Glycerin",
            subtitle: "Hydrating Humectant",
            category: "HYDRATION · BARRIER SUPPORT",
            visualCategory: "HYDRATION",
            visualSupport: "HUMECTANT",
            image: "assets/ingredients/glycerin.png",
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

        lacticAcid: {
            name: "Lactic Acid",
            subtitle: "Alpha Hydroxy Acid",
            category: "EXFOLIANT · BRIGHTENING",
            visualCategory: "EXFOLIATION",
            visualSupport: "BRIGHTENING",
            image: "assets/ingredients/lactic-acid.png",
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
       2. INGREDIENT ORDER — ALL 14
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
       3. SEARCH ALIASES (for finding connected ingredients)
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
       4. NORMALIZE SEARCH
    ===================================================== */

    function normalizeIngredientSearch(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ");
    }


    /* =====================================================
       5. FIND CONNECTED INGREDIENT
    ===================================================== */

    function findConnectedIngredient(value) {

        if (!value) {
            return null;
        }

        const normalized = normalizeIngredientSearch(value);

        /* Check aliases */
        for (const [ingredientKey, aliases] of Object.entries(ingredientAliases)) {
            if (aliases.some(alias => normalizeIngredientSearch(alias) === normalized)) {
                return ingredientKey;
            }
        }

        /* Check if ingredient name appears in text */
        for (const [ingredientKey, ingredient] of Object.entries(ingredientData)) {
            const ingredientName = normalizeIngredientSearch(ingredient.name);
            if (normalized.includes(ingredientName)) {
                return ingredientKey;
            }
        }

        return null;
    }


    /* =====================================================
       6. GET INGREDIENT FROM URL
    ===================================================== */

    function getIngredientFromUrl() {

        const params = new URLSearchParams(window.location.search);
        const ingredientKey = params.get("ingredient");

        if (ingredientKey && ingredientData[ingredientKey]) {
            return ingredientKey;
        }

        return null;
    }


    /* =====================================================
       7. RENDER INGREDIENT DETAIL
    ===================================================== */

    let currentIndex = 0;

    function renderIngredientDetail(ingredientKey) {

        const ingredient = ingredientData[ingredientKey];

        if (!ingredient) {
            document.getElementById("ingredient-detail-page").innerHTML = `
                <div class="detail-loading">
                    <div style="text-align:center;">
                        <h2 style="color:rgba(255,255,255,0.3);">Ingredient Not Found</h2>
                        <p style="color:rgba(255,255,255,0.2);">Please return to the library and try again.</p>
                        <a href="ingredient-library.html" style="color:#d4a373;text-decoration:none;">← Back to Library</a>
                    </div>
                </div>
            `;
            return;
        }

        /* Update current index */
        const index = ingredientOrder.indexOf(ingredientKey);
        if (index !== -1) {
            currentIndex = index;
        }

        /* ---- IMAGE ---- */
        const image = document.getElementById("detail-ingredient-image");
        if (image) {
            image.src = ingredient.image;
            image.alt = ingredient.name;
        }

        /* ---- VISUAL TAGS ---- */
        const visualCategory = document.getElementById("detail-visual-category");
        if (visualCategory) {
            visualCategory.textContent = ingredient.visualCategory || ingredient.category.split(' · ')[0];
        }

        const visualSupport = document.getElementById("detail-visual-support");
        if (visualSupport) {
            visualSupport.textContent = ingredient.visualSupport || ingredient.category.split(' · ')[1] || "";
        }

        /* ---- CATEGORY ---- */
        const category = document.getElementById("detail-category");
        if (category) {
            category.textContent = ingredient.category;
        }

        /* ---- NAME ---- */
        const name = document.getElementById("detail-name");
        if (name) {
            name.textContent = ingredient.name;
        }

        /* ---- SUBTITLE ---- */
        const subtitle = document.getElementById("detail-subtitle");
        if (subtitle) {
            subtitle.textContent = ingredient.subtitle;
        }

        /* ---- META ---- */
        const meta = document.getElementById("detail-meta");
        if (meta && ingredient.meta) {
            meta.innerHTML = ingredient.meta.map((item, index) => {
                const dot = index < ingredient.meta.length - 1
                    ? `<span class="meta-dot">•</span>`
                    : "";
                return `<span>${item}</span> ${dot}`;
            }).join("");
        }

        /* ---- WHAT IT IS ---- */
        const whatItIs = document.getElementById("detail-what-it-is");
        if (whatItIs) {
            whatItIs.textContent = ingredient.whatItIs;
        }

        /* ---- WHAT IT DOES ---- */
        const whatItDoes = document.getElementById("detail-what-it-does");
        if (whatItDoes && ingredient.whatItDoes) {
            whatItDoes.innerHTML = ingredient.whatItDoes.map(item =>
                `<li>${item}</li>`
            ).join("");
        }

        /* ---- HOW IT WORKS ---- */
        const howItWorks = document.getElementById("detail-how-it-works");
        if (howItWorks) {
            howItWorks.textContent = ingredient.howItWorks;
        }

        /* ---- BEST FOR ---- */
        const bestFor = document.getElementById("detail-best-for");
        if (bestFor && ingredient.bestFor) {
            bestFor.innerHTML = ingredient.bestFor.map(item =>
                `<span>${item}</span>`
            ).join("");
        }

        /* ---- SKIN TYPES ---- */
        const skinTypes = document.getElementById("detail-skin-types");
        if (skinTypes && ingredient.skinTypes) {
            skinTypes.innerHTML = ingredient.skinTypes.map(item =>
                `<span>${item}</span>`
            ).join("");
        }

        /* ---- USAGE ---- */
        const usage = document.getElementById("detail-usage");
        if (usage) {
            usage.textContent = ingredient.usage;
        }

        /* ---- ROUTINE ---- */
        const routine = document.getElementById("detail-routine");
        if (routine && ingredient.routine) {
            const badges = [];
            if (ingredient.routine.morning) {
                badges.push(`<span class="routine-badge">Morning</span>`);
            }
            if (ingredient.routine.night) {
                badges.push(`<span class="routine-badge">Night</span>`);
            }
            routine.innerHTML = badges.join("");
        }

        /* ---- PAIRINGS ---- */
        const pairings = document.getElementById("detail-pairings");
        if (pairings && ingredient.pairings) {
            if (ingredient.pairings.length) {
                pairings.innerHTML = ingredient.pairings.map(item => {
                    const connectedKey = findConnectedIngredient(item);
                    return `<span data-connected="${connectedKey || ""}">${item}</span>`;
                }).join("");
            } else {
                pairings.innerHTML = `<span>No specific pairings listed</span>`;
            }
        }

        /* ---- AVOID WITH ---- */
        const avoidWith = document.getElementById("detail-avoid-with");
        if (avoidWith && ingredient.avoidWith) {
            if (ingredient.avoidWith.length) {
                avoidWith.innerHTML = ingredient.avoidWith.map(item => {
                    const connectedKey = findConnectedIngredient(item);
                    return `<span data-connected="${connectedKey || ""}">${item}</span>`;
                }).join("");
            } else {
                avoidWith.innerHTML = `<span>No major conflicts listed</span>`;
            }
        }

        /* ---- NOTES ---- */
        const notes = document.getElementById("detail-notes");
        if (notes) {
            notes.textContent = ingredient.notes || "";
        }

        /* ---- COUNTER ---- */
        const counter = document.getElementById("detail-counter");
        if (counter) {
            counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(ingredientOrder.length).padStart(2, "0")}`;
        }

        /* ---- COMPATIBILITY ---- */
        renderCompatibility(ingredient.compatibility);

        /* ---- CLICK HANDLERS FOR CLICKABLE TAGS ---- */
        document.querySelectorAll(".detail-tags-clickable span[data-connected]").forEach(tag => {
            tag.addEventListener("click", () => {
                const connectedKey = tag.dataset.connected;
                if (connectedKey && ingredientData[connectedKey]) {
                    window.location.href = `ingredient-detail.html?ingredient=${connectedKey}`;
                }
            });
        });
    }


    /* =====================================================
       8. RENDER COMPATIBILITY
    ===================================================== */

    function renderCompatibility(compatibility) {

        const container = document.getElementById("detail-compatibility");

        if (!container) {
            return;
        }

        const concerns = [
            { key: "acne", label: "Acne" },
            { key: "pigmentation", label: "Pigmentation" },
            { key: "darkSpots", label: "Dark Spots" },
            { key: "dryness", label: "Dryness" },
            { key: "redness", label: "Redness" },
            { key: "fineLines", label: "Fine Lines & Aging" }
        ];

        container.innerHTML = concerns.map(concern => {

            const item = compatibility[concern.key];

            if (!item) {
                return "";
            }

            let dots = "";
            for (let i = 1; i <= 5; i++) {
                dots += `<span class="${i <= item.score ? "filled" : "empty"}"></span>`;
            }

            return `
                <div class="compatibility-item">
                    <div class="compatibility-info">
                        <span>${concern.label}</span>
                        <strong>${item.label}</strong>
                    </div>
                    <div class="compatibility-dots">
                        ${dots}
                    </div>
                </div>
            `;

        }).join("");
    }


    /* =====================================================
       9. NAVIGATION — PREVIOUS / NEXT
    ===================================================== */

    function navigateToIngredient(direction) {

        const newIndex = direction === "next"
            ? (currentIndex + 1) % ingredientOrder.length
            : (currentIndex - 1 + ingredientOrder.length) % ingredientOrder.length;

        const ingredientKey = ingredientOrder[newIndex];

        if (ingredientKey) {
            window.location.href = `ingredient-detail.html?ingredient=${ingredientKey}`;
        }
    }


    const prevBtn = document.getElementById("detail-prev");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => navigateToIngredient("prev"));
    }

    const nextBtn = document.getElementById("detail-next");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => navigateToIngredient("next"));
    }


    /* =====================================================
       10. KEYBOARD NAVIGATION
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "ArrowLeft") {
            navigateToIngredient("prev");
        } else if (event.key === "ArrowRight") {
            navigateToIngredient("next");
        }
    });


    /* =====================================================
       11. INITIAL RENDER
    ===================================================== */

    const ingredientKey = getIngredientFromUrl();

    if (ingredientKey) {
        renderIngredientDetail(ingredientKey);
    } else {
        // Default to Niacinamide if no ingredient specified
        renderIngredientDetail("niacinamide");
    }


    console.log("Ingredient Detail initialized successfully.");
});