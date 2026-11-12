/* =========================================================
   GLOWITHM — CONCERN DETAIL PAGE
   concern-detail.js
========================================================= */


/* =========================================================
   01 — CONCERN DATA
========================================================= */


const concernData = {

    /* =====================================================
       DRYNESS
    ===================================================== */

    dryness: {

        state: "DEHYDRATION",
        number: "05",

        title: "Dryness & Dehydration",

        description:
            "When your skin feels tight, rough, flaky, or uncomfortable, it may be asking for more hydration and barrier support.",

        image:
            "assets/skin-concerns/dryness.jpeg",

        imageAlt:
            "Dryness and dehydration skin concern",

        imageLabel:
            "HYDRATION & BARRIER BALANCE",


        intelligence: {

            heading:
                "Look beyond the symptom.",

            intro:
                "Understanding what you're noticing, what may be contributing to it, and what your skin may need can help you build a more intentional routine.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "These are some of the changes you may notice when dryness or dehydration becomes more noticeable.",

            notice: [
                "Tight or uncomfortable skin",
                "Flakiness or rough texture",
                "Dull-looking skin",
                "Fine dehydration lines"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "More than one factor can influence how dryness or dehydration appears or behaves.",

            contributors: [
                "Low moisture levels",
                "Moisture loss",
                "Over-cleansing",
                "Barrier stress"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The goal is to support your skin rather than overwhelm it with unnecessary steps.",

            needs: [
                "Consistent hydration",
                "Barrier-supportive ingredients",
                "Gentle cleansing",
                "Daily protection"
            ]
        },


        needsDescription:
            "Rather than reacting to every symptom, build your approach around hydration, moisture retention, barrier support, and protection.",

        needs: {

            hydrate: {
                title: "Restore hydration.",
                description: "Help replenish water and maintain a more comfortable skin feel."
            },

            replenish: {
                title: "Support moisture balance.",
                description: "Support the skin with ingredients that help maintain hydration over time."
            },

            repair: {
                title: "Support the barrier.",
                description: "A healthy barrier helps reduce moisture loss and supports overall skin comfort."
            },

            protect: {
                title: "Protect your progress.",
                description: "Keep your routine consistent and protect your skin from avoidable stress."
            }
        },


        ingredients: [
            {
                category: "HYDRATOR",
                name: "Hyaluronic Acid",
                abbreviation: "HA",
                description: "A humectant that helps attract and retain water in the skin.",
                link: "ingredient-detail.html?ingredient=hyaluronicAcid"
            },
            {
                category: "HUMECTANT",
                name: "Glycerin",
                abbreviation: "G",
                description: "A humectant commonly used to support skin hydration.",
                link: "ingredient-detail.html?ingredient=glycerin"
            },
            {
                category: "BARRIER SUPPORT",
                name: "Ceramides",
                abbreviation: "C",
                description: "Skin-identical lipids that help support the protective barrier.",
                link: "ingredient-detail.html?ingredient=ceramides"
            },
            {
                category: "SOOTHING",
                name: "Panthenol",
                abbreviation: "P",
                description: "A conditioning ingredient commonly included in hydrating formulations.",
                link: "ingredient-detail.html?ingredient=panthenol"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "GENTLE CLEANSER",
                name: "Hydrating Cleanser",
                description: "A gentle cleansing option designed to help avoid an overly stripped feeling.",
                why: "Supports a gentler cleansing approach.",
                match: "CONCERN MATCH"
            },
            {
                category: "serum",
                label: "HYDRATING SERUM",
                name: "Hyaluronic Acid Serum",
                description: "A hydration-focused serum that can complement a moisture-supportive routine.",
                why: "Supports hydration-focused care.",
                match: "CONCERN MATCH"
            },
            {
                category: "moisturizer",
                label: "BARRIER MOISTURIZER",
                name: "Ceramide Moisturizer",
                description: "A moisturizer focused on hydration and barrier-supportive ingredients.",
                why: "Supports moisture and barrier care.",
                match: "CONCERN MATCH"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Hydrating Sunscreen",
                description: "Daily sun protection that can be incorporated into a consistent routine.",
                why: "Helps protect your routine's progress.",
                match: "ROUTINE SUPPORT"
            }
        ],


        cautionDescription:
            "More products do not always mean better results. A routine should support your skin rather than overwhelm it.",

        related: [
            "redness",
            "dullness",
            "aging"
        ]

    },


    /* =====================================================
       ACNE
    ===================================================== */

    acne: {

        state: "INFLAMMATION",
        number: "01",

        title: "Acne & Breakouts",

        description:
            "Breakouts can be influenced by clogged pores, excess oil, inflammation, and other factors. A balanced routine focuses on the underlying skin environment rather than simply adding more products.",

        image:
            "assets/skin-concerns/acne.jpeg",

        imageAlt:
            "Acne and breakout skin concern",

        imageLabel:
            "CLARITY & BALANCE",


        intelligence: {

            heading:
                "Look beyond the breakout.",

            intro:
                "Understanding what may be contributing to congestion and inflammation can help you build a routine that supports clearer-looking skin without unnecessarily stressing the barrier.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "Acne-prone skin can show several different types of visible changes.",

            notice: [
                "Active breakouts",
                "Clogged or congested pores",
                "Excess surface oil",
                "Post-breakout marks"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "Breakouts can be influenced by several overlapping factors.",

            contributors: [
                "Excess sebum",
                "Clogged pores",
                "Inflammation",
                "Routine-related irritation"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The goal is to support clearer-looking skin while maintaining overall skin comfort and barrier health.",

            needs: [
                "Gentle cleansing",
                "Pore-supportive ingredients",
                "Barrier support",
                "Consistent protection"
            ]
        },


        needsDescription:
            "Focus on keeping pores clear, supporting the skin barrier, managing excess oil, and avoiding unnecessary irritation.",

        needs: {

            hydrate: {
                title: "Maintain hydration.",
                description: "Keeping acne-prone skin comfortable can help prevent an overly stripped routine."
            },

            replenish: {
                title: "Balance moisture.",
                description: "Use lightweight supportive hydration without unnecessarily overwhelming the skin."
            },

            repair: {
                title: "Support the barrier.",
                description: "A healthy barrier can help skin tolerate a consistent routine more comfortably."
            },

            protect: {
                title: "Protect your progress.",
                description: "Daily sun protection helps support a consistent approach to breakout-prone skin."
            }
        },


        ingredients: [
            {
                category: "EXFOLIANT",
                name: "Salicylic Acid",
                abbreviation: "SA",
                description: "A beta hydroxy acid commonly used to help address clogged pores and excess surface oil.",
                link: "ingredient-detail.html?ingredient=salicylicAcid"
            },
            {
                category: "BRIGHTENER",
                name: "Niacinamide",
                abbreviation: "N",
                description: "An ingredient commonly used to support balanced-looking skin and barrier function.",
                link: "ingredient-detail.html?ingredient=niacinamide"
            },
            {
                category: "SOOTHING",
                name: "Azelaic Acid",
                abbreviation: "AA",
                description: "An ingredient commonly used in routines targeting blemishes and uneven-looking tone.",
                link: "ingredient-detail.html?ingredient=azelaicAcid"
            },
            {
                category: "BARRIER SUPPORT",
                name: "Ceramides",
                abbreviation: "C",
                description: "Lipids that help support the skin barrier while using a treatment-focused routine.",
                link: "ingredient-detail.html?ingredient=ceramides"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "PORE-CLEANSING",
                name: "Salicylic Acid Cleanser",
                description: "A cleanser formulated around an ingredient commonly used for congested skin.",
                why: "Supports a pore-focused cleansing routine.",
                match: "CONCERN MATCH"
            },
            {
                category: "serum",
                label: "BALANCING SERUM",
                name: "Niacinamide Serum",
                description: "A lightweight serum option commonly used in routines for blemish-prone skin.",
                why: "Supports balanced-looking skin.",
                match: "CONCERN MATCH"
            },
            {
                category: "moisturizer",
                label: "BARRIER MOISTURIZER",
                name: "Lightweight Barrier Moisturizer",
                description: "A supportive moisturizer designed to maintain skin comfort without unnecessary heaviness.",
                why: "Supports barrier care during treatment.",
                match: "ROUTINE SUPPORT"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Broad-Spectrum Sunscreen",
                description: "Daily sun protection that complements a consistent acne-focused routine.",
                why: "Supports overall skin protection.",
                match: "ROUTINE SUPPORT"
            }
        ],


        cautionDescription:
            "Aggressive treatment is not always better. Overusing strong actives can add irritation and make a routine harder to maintain.",

        related: [
            "redness",
            "pigmentation",
            "dullness"
        ]

    },


    /* =====================================================
       REDNESS
    ===================================================== */

    redness: {

        state: "INFLAMMATION",
        number: "02",

        title: "Redness & Sensitivity",

        description:
            "Visible redness and sensitivity can be influenced by irritation, environmental stress, or a compromised skin barrier. A gentler approach can help maintain skin comfort.",

        image:
            "assets/skin-concerns/redness.jpeg",

        imageAlt:
            "Redness and sensitivity skin concern",

        imageLabel:
            "CALM & BARRIER SUPPORT",


        intelligence: {

            heading:
                "Look beyond the redness.",

            intro:
                "Understanding possible sources of irritation can help you simplify your routine and focus on maintaining skin comfort.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "Sensitive or redness-prone skin may show several visible signs.",

            notice: [
                "Visible redness",
                "Stinging or discomfort",
                "Reactive-looking skin",
                "Dry or tight areas"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "Redness can be influenced by environmental and routine-related factors.",

            contributors: [
                "Skin irritation",
                "Barrier stress",
                "Environmental exposure",
                "Overuse of active ingredients"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The priority is maintaining skin comfort while reducing unnecessary sources of stress.",

            needs: [
                "Gentle cleansing",
                "Soothing support",
                "Barrier care",
                "Daily protection"
            ]
        },


        needsDescription:
            "Prioritize gentle cleansing, barrier support, hydration, and reducing unnecessary sources of irritation.",

        needs: {

            hydrate: {
                title: "Keep skin hydrated.",
                description: "Adequate hydration can help support a more comfortable skin feel."
            },

            replenish: {
                title: "Maintain moisture balance.",
                description: "Use supportive moisturization without unnecessary complexity."
            },

            repair: {
                title: "Support the barrier.",
                description: "Barrier-supportive care can help reduce the impact of routine-related stress."
            },

            protect: {
                title: "Reduce avoidable stress.",
                description: "Consistent protection can help minimize environmental sources of irritation."
            }
        },


        ingredients: [
            {
                category: "SOOTHING",
                name: "Centella Asiatica",
                abbreviation: "CA",
                description: "A botanical ingredient commonly included in soothing and comfort-focused formulations.",
                link: "ingredient-detail.html?ingredient=centella"
            },
            {
                category: "SOOTHING",
                name: "Panthenol",
                abbreviation: "P",
                description: "A conditioning ingredient commonly used to support comfortable, hydrated-looking skin.",
                link: "ingredient-detail.html?ingredient=panthenol"
            },
            {
                category: "BARRIER SUPPORT",
                name: "Ceramides",
                abbreviation: "C",
                description: "Lipids that help support the skin's protective barrier.",
                link: "ingredient-detail.html?ingredient=ceramides"
            },
            {
                category: "SOOTHING",
                name: "Allantoin",
                abbreviation: "A",
                description: "A conditioning ingredient commonly used in formulations designed for skin comfort.",
                link: "ingredient-detail.html?ingredient=allantoin"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "GENTLE CLEANSER",
                name: "Low-Irritation Cleanser",
                description: "A simple cleansing option designed to support skin comfort.",
                why: "Keeps cleansing gentle and uncomplicated.",
                match: "CONCERN MATCH"
            },
            {
                category: "serum",
                label: "SOOTHING SERUM",
                name: "Panthenol Serum",
                description: "A hydration and comfort-focused serum option.",
                why: "Supports a simpler soothing routine.",
                match: "CONCERN MATCH"
            },
            {
                category: "moisturizer",
                label: "BARRIER MOISTURIZER",
                name: "Ceramide Moisturizer",
                description: "A moisturizer focused on supporting hydration and barrier function.",
                why: "Supports skin comfort and barrier care.",
                match: "CONCERN MATCH"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Sensitive-Skin Sunscreen",
                description: "Daily protection that can fit into a gentle routine.",
                why: "Helps reduce avoidable environmental stress.",
                match: "ROUTINE SUPPORT"
            }
        ],


        cautionDescription:
            "Introducing too many new products or strong actives at once can make it harder to identify what your skin tolerates.",

        related: [
            "dryness",
            "acne",
            "dullness"
        ]

    },


    /* =====================================================
       PIGMENTATION
    ===================================================== */

    pigmentation: {

        state: "UNEVEN TONE",
        number: "03",

        title: "Pigmentation & Dark Spots",

        description:
            "Uneven pigmentation and dark spots can develop from sun exposure, inflammation, hormonal changes, and other factors. A consistent approach focuses on supporting a more even-looking skin tone.",

        image:
            "assets/skin-concerns/pigmentation.jpeg",

        imageAlt:
            "Pigmentation and dark spots skin concern",

        imageLabel:
            "EVEN TONE & BRIGHTENING",


        intelligence: {

            heading:
                "Look beyond the dark spot.",

            intro:
                "Pigmentation can have different contributing factors. A thoughtful routine focuses on consistent protection, gradual brightening support, and minimizing unnecessary irritation.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "Pigmentation concerns can appear in several forms across the skin.",

            notice: [
                "Dark spots",
                "Uneven-looking skin tone",
                "Post-breakout marks",
                "Areas of increased pigmentation"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "Changes in pigmentation can be influenced by several factors.",

            contributors: [
                "Sun exposure",
                "Post-inflammatory changes",
                "Hormonal influences",
                "Skin irritation"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The goal is gradual, consistent support for a more even-looking complexion without overwhelming the skin.",

            needs: [
                "Daily sun protection",
                "Gentle brightening",
                "Antioxidant support",
                "Consistent routine"
            ]
        },


        needsDescription:
            "Focus on daily protection, gentle brightening, antioxidant support, and consistency rather than relying on aggressive treatments.",

        needs: {

            hydrate: {
                title: "Keep skin hydrated.",
                description: "Well-hydrated skin can better support a consistent brightening routine."
            },

            replenish: {
                title: "Support skin balance.",
                description: "Maintain a comfortable moisture balance while targeting uneven-looking tone."
            },

            repair: {
                title: "Minimize irritation.",
                description: "Supporting the barrier can help reduce unnecessary routine-related stress."
            },

            protect: {
                title: "Protect against exposure.",
                description: "Consistent sunscreen use is an important part of managing the appearance of pigmentation."
            }
        },


        ingredients: [
            {
                category: "BRIGHTENER",
                name: "Niacinamide",
                abbreviation: "N",
                description: "An ingredient commonly used to support a more even-looking complexion and barrier function.",
                link: "ingredient-detail.html?ingredient=niacinamide"
            },
            {
                category: "ANTIOXIDANT",
                name: "Vitamin C",
                abbreviation: "C",
                description: "An antioxidant commonly used in routines focused on brightness and environmental protection.",
                link: "ingredient-detail.html?ingredient=vitaminC"
            },
            {
                category: "BRIGHTENER",
                name: "Alpha Arbutin",
                abbreviation: "AA",
                description: "An ingredient commonly included in formulations targeting the appearance of uneven pigmentation.",
                link: "ingredient-detail.html?ingredient=alphaArbutin"
            },
            {
                category: "BRIGHTENER",
                name: "Azelaic Acid",
                abbreviation: "AZ",
                description: "An ingredient commonly used in routines addressing uneven-looking tone and post-breakout marks.",
                link: "ingredient-detail.html?ingredient=azelaicAcid"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "GENTLE CLEANSER",
                name: "Gentle Daily Cleanser",
                description: "A simple cleanser that keeps the routine focused without unnecessary irritation.",
                why: "Supports a consistent brightening routine.",
                match: "ROUTINE SUPPORT"
            },
            {
                category: "serum",
                label: "BRIGHTENING SERUM",
                name: "Vitamin C Serum",
                description: "An antioxidant-focused serum commonly used in routines targeting dull and uneven-looking tone.",
                why: "Supports antioxidant and radiance-focused care.",
                match: "CONCERN MATCH"
            },
            {
                category: "treatment",
                label: "TARGETED TREATMENT",
                name: "Alpha Arbutin Treatment",
                description: "A targeted brightening option designed around uneven-looking pigmentation.",
                why: "Supports a focused approach to dark spots.",
                match: "CONCERN MATCH"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Broad-Spectrum Sunscreen",
                description: "Daily sun protection is an important part of a pigmentation-focused routine.",
                why: "Helps protect against ongoing UV exposure.",
                match: "ESSENTIAL"
            }
        ],


        cautionDescription:
            "Using several brightening or exfoliating actives together can increase irritation. A simpler, consistent routine is often easier for your skin to tolerate.",

        related: [
            "dullness",
            "acne",
            "aging"
        ]

    },


    /* =====================================================
       AGING
    ===================================================== */

    aging: {

        state: "AGING",
        number: "04",

        title: "Fine Lines & Early Aging",

        description:
            "Fine lines and early signs of aging can be influenced by natural collagen changes, repeated sun exposure, dehydration, and other environmental factors.",

        image:
            "assets/skin-concerns/aging.jpeg",

        imageAlt:
            "Fine lines and early aging skin concern",

        imageLabel:
            "FIRMNESS & SKIN SUPPORT",


        intelligence: {

            heading:
                "Look beyond the line.",

            intro:
                "Fine lines are a natural part of skin changing over time. A thoughtful routine focuses on hydration, protection, and gradual support for texture and firmness.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "Early signs of aging can appear gradually and may vary from person to person.",

            notice: [
                "Fine lines",
                "Less visible plumpness",
                "Uneven surface texture",
                "Loss of firmness"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "Several natural and environmental factors can influence visible signs of aging.",

            contributors: [
                "Natural collagen changes",
                "UV exposure",
                "Dehydration",
                "Environmental stress"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The goal is long-term skin support rather than trying to overwhelm the skin with multiple strong actives.",

            needs: [
                "Consistent hydration",
                "Antioxidant protection",
                "Daily sunscreen",
                "Gradual active use"
            ]
        },


        needsDescription:
            "Focus on hydration, antioxidant protection, consistent sunscreen use, and carefully introduced ingredients that support the appearance of firmness and texture.",

        needs: {

            hydrate: {
                title: "Maintain hydration.",
                description: "Hydrated skin can appear smoother and more comfortable."
            },

            replenish: {
                title: "Support moisture balance.",
                description: "Consistent moisturization helps maintain a healthy-looking skin surface."
            },

            repair: {
                title: "Support skin resilience.",
                description: "Barrier-supportive care helps maintain comfort alongside active ingredients."
            },

            protect: {
                title: "Protect from UV exposure.",
                description: "Daily sunscreen is an important part of long-term skin support."
            }
        },


        ingredients: [
            {
                category: "RETINOID",
                name: "Retinol",
                abbreviation: "R",
                description: "A vitamin A derivative commonly used to support smoother-looking texture and visible signs of aging.",
                link: "ingredient-detail.html?ingredient=retinol"
            },
            {
                category: "ANTIOXIDANT",
                name: "Vitamin C",
                abbreviation: "C",
                description: "An antioxidant commonly used to support brightness and protection from environmental stress.",
                link: "ingredient-detail.html?ingredient=vitaminC"
            },
            {
                category: "HYDRATOR",
                name: "Hyaluronic Acid",
                abbreviation: "HA",
                description: "A humectant that helps attract and retain water in the skin.",
                link: "ingredient-detail.html?ingredient=hyaluronicAcid"
            },
            {
                category: "BARRIER SUPPORT",
                name: "Ceramides",
                abbreviation: "C",
                description: "Lipids that help support the skin barrier and moisture retention.",
                link: "ingredient-detail.html?ingredient=ceramides"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "GENTLE CLEANSER",
                name: "Cream Cleanser",
                description: "A gentle cleansing option that helps keep the routine comfortable.",
                why: "Supports a non-stripping routine.",
                match: "ROUTINE SUPPORT"
            },
            {
                category: "serum",
                label: "ANTIOXIDANT SERUM",
                name: "Vitamin C Serum",
                description: "An antioxidant-focused serum commonly used for brightness and environmental support.",
                why: "Supports antioxidant-focused care.",
                match: "CONCERN MATCH"
            },
            {
                category: "treatment",
                label: "RETINOID TREATMENT",
                name: "Retinol Treatment",
                description: "A gradual treatment option commonly used to support smoother-looking texture.",
                why: "Supports a long-term texture-focused routine.",
                match: "CONCERN MATCH"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Broad-Spectrum Sunscreen",
                description: "Daily UV protection that supports long-term skin care.",
                why: "Helps protect against environmental exposure.",
                match: "ESSENTIAL"
            }
        ],


        cautionDescription:
            "Strong anti-aging actives should be introduced gradually. Using too many active ingredients at once can increase irritation and compromise consistency.",

        related: [
            "dryness",
            "dullness",
            "pigmentation"
        ]

    },


    /* =====================================================
       DULLNESS
    ===================================================== */

    dullness: {

        state: "RADIANCE",
        number: "06",

        title: "Dullness & Uneven Tone",

        description:
            "Dull-looking skin can be associated with dehydration, uneven tone, surface buildup, environmental exposure, and other factors.",

        image:
            "assets/skin-concerns/dullness.jpeg",

        imageAlt:
            "Dullness and uneven tone skin concern",

        imageLabel:
            "RADIANCE & EVEN TONE",


        intelligence: {

            heading:
                "Look beyond the lack of glow.",

            intro:
                "Dullness can have more than one contributor. Understanding the skin environment can help you choose a more balanced approach to improving radiance.",

            noticeTitle:
                "The visible signs",

            noticeDescription:
                "Dull-looking skin may appear less even, less hydrated, or less radiant.",

            notice: [
                "Low-looking radiance",
                "Uneven appearance",
                "Rough surface texture",
                "Tired-looking skin"
            ],

            contributorsTitle:
                "Possible contributors",

            contributorsDescription:
                "Several factors can contribute to a less radiant appearance.",

            contributors: [
                "Dehydration",
                "Surface buildup",
                "Uneven tone",
                "Environmental exposure"
            ],

            needsTitle:
                "A balanced approach",

            needsDescription:
                "The goal is to support radiance without relying on excessive exfoliation or unnecessary active ingredients.",

            needs: [
                "Consistent hydration",
                "Gentle renewal",
                "Antioxidant support",
                "Daily protection"
            ]
        },


        needsDescription:
            "Focus on hydration, gentle surface renewal, antioxidant support, and consistent daily protection.",

        needs: {

            hydrate: {
                title: "Restore hydration.",
                description: "Well-hydrated skin can appear smoother and more naturally radiant."
            },

            replenish: {
                title: "Support moisture balance.",
                description: "Consistent moisturization helps maintain a smoother-looking skin surface."
            },

            repair: {
                title: "Maintain skin comfort.",
                description: "Supporting the barrier helps keep a routine focused on radiance more balanced."
            },

            protect: {
                title: "Protect skin from exposure.",
                description: "Daily protection helps support efforts toward a more even-looking complexion."
            }
        },


        ingredients: [
            {
                category: "ANTIOXIDANT",
                name: "Vitamin C",
                abbreviation: "C",
                description: "An antioxidant commonly used to support brighter-looking and more even-looking skin.",
                link: "ingredient-detail.html?ingredient=vitaminC"
            },
            {
                category: "BRIGHTENER",
                name: "Niacinamide",
                abbreviation: "N",
                description: "An ingredient commonly used to support a more even-looking complexion.",
                link: "ingredient-detail.html?ingredient=niacinamide"
            },
            {
                category: "EXFOLIANT",
                name: "Lactic Acid",
                abbreviation: "LA",
                description: "An alpha hydroxy acid commonly used for gentle surface renewal.",
                link: "ingredient-detail.html?ingredient=lacticAcid"
            },
            {
                category: "HYDRATOR",
                name: "Hyaluronic Acid",
                abbreviation: "HA",
                description: "A humectant that helps support skin hydration and a smoother-looking appearance.",
                link: "ingredient-detail.html?ingredient=hyaluronicAcid"
            }
        ],


        products: [
            {
                category: "cleanser",
                label: "GENTLE CLEANSER",
                name: "Gentle Daily Cleanser",
                description: "A simple cleanser that helps keep the routine balanced.",
                why: "Supports a comfortable daily routine.",
                match: "ROUTINE SUPPORT"
            },
            {
                category: "serum",
                label: "RADIANCE SERUM",
                name: "Vitamin C Serum",
                description: "An antioxidant-focused serum designed around radiance support.",
                why: "Supports brighter-looking skin.",
                match: "CONCERN MATCH"
            },
            {
                category: "treatment",
                label: "GENTLE EXFOLIANT",
                name: "Lactic Acid Treatment",
                description: "A surface-renewal option commonly used to improve the appearance of texture.",
                why: "Supports gentle renewal.",
                match: "CONCERN MATCH"
            },
            {
                category: "spf",
                label: "DAILY SPF",
                name: "Broad-Spectrum Sunscreen",
                description: "Daily sun protection that supports a more consistent radiance-focused routine.",
                why: "Helps protect against environmental exposure.",
                match: "ROUTINE SUPPORT"
            }
        ],


        cautionDescription:
            "Using too many exfoliating or brightening actives together can increase irritation without necessarily improving results.",

        related: [
            "pigmentation",
            "dryness",
            "aging"
        ]

    }

};


/* =========================================================
   02 — GET CURRENT CONCERN
========================================================= */

function getCurrentConcern() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const concern =
        params.get("concern");

    if (
        concern &&
        concernData[concern]
    ) {
        return concern;
    }

    return "dryness";
}


/* =========================================================
   03 — UPDATE TEXT
========================================================= */

function updateText(id, value) {

    const element =
        document.getElementById(id);

    if (
        element &&
        value !== undefined &&
        value !== null
    ) {
        element.textContent = value;
    }

}


/* =========================================================
   04 — UPDATE LIST
========================================================= */

function updateList(id, items) {

    const list =
        document.getElementById(id);

    if (
        !list ||
        !Array.isArray(items)
    ) {
        return;
    }

    list.innerHTML = "";

    items.forEach(item => {

        const li =
            document.createElement("li");

        const marker =
            document.createElement("span");

        marker.textContent = "—";

        li.appendChild(marker);

        li.appendChild(
            document.createTextNode(item)
        );

        list.appendChild(li);

    });

}


/* =========================================================
   05 — RENDER INGREDIENTS
========================================================= */

function renderIngredients(ingredients) {

    const grid =
        document.getElementById(
            "concern-ingredient-grid"
        );

    if (
        !grid ||
        !Array.isArray(ingredients)
    ) {
        return;
    }

    grid.innerHTML = "";

    ingredients.forEach(ingredient => {

        const card =
            document.createElement("article");

        card.className =
            "concern-ingredient-card";

        card.dataset.ingredient =
            ingredient.name
                .toLowerCase()
                .replace(/\s+/g, "-");


        card.innerHTML = `
            <div class="ingredient-card-visual">

                <span class="ingredient-orbit">
                    <span></span>
                </span>

                <strong>
                    ${ingredient.abbreviation}
                </strong>

            </div>


            <div class="ingredient-card-content">

                <span class="ingredient-category">
                    ${ingredient.category}
                </span>

                <h3>
                    ${ingredient.name}
                </h3>

                <p>
                    ${ingredient.description}
                </p>

                <a
                    href="${ingredient.link}"
                    class="ingredient-card-link"
                >
                    Explore ingredient

                    <span>
                        →
                    </span>
                </a>

            </div>
        `;

        grid.appendChild(card);

    });

}

const productImageByCategory = {
    cleanser: "assets/products/cleanser.webp",
    serum: "assets/products/serum.webp",
    treatment: "assets/products/serum.webp",
    moisturizer: "assets/products/moisturizer.webp",
    spf: "assets/products/sunscreen.webp"
};

/* =========================================================
   06 — RENDER PRODUCTS
========================================================= */

function renderProducts(products) {

    const grid =
        document.getElementById(
            "concern-product-grid"
        );

    if (
        !grid ||
        !Array.isArray(products)
    ) {
        return;
    }

    grid.innerHTML = "";

    products.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "concern-product-card";

        card.dataset.productCategory =
            product.category;

            const imagePath =
    productImageByCategory[product.category] ||
    "assets/products/placeholder-product.jpg";


        card.innerHTML = `
            <div class="product-card-visual">

                <img
    src="${imagePath}"
    alt="${product.name}"
    onerror="this.onerror=null; this.src='assets/products/placeholder-product.jpg';"
>

                <span class="product-match">
                    ${product.match}
                </span>

            </div>


            <div class="product-card-content">

                <span class="product-category">
                    ${product.label}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description}
                </p>


                <div class="product-why">

                    <span>
                        WHY IT MAY FIT
                    </span>

                    <strong>
                        ${product.why}
                    </strong>

                </div>




            </div>
        `;

        grid.appendChild(card);

    });

}


/* =========================================================
   07 — RENDER RELATED CONCERNS
========================================================= */

function renderRelatedConcerns(relatedKeys) {

    const grid =
        document.getElementById(
            "related-concerns-grid"
        );

    if (
        !grid ||
        !Array.isArray(relatedKeys)
    ) {
        return;
    }

    grid.innerHTML = "";

    relatedKeys.forEach(key => {

        const related =
            concernData[key];

        if (!related) {
            return;
        }

        const card =
            document.createElement("a");

        card.className =
            "related-concern-card";

        card.href =
            `concern-detail.html?concern=${key}`;

        card.dataset.relatedConcern =
            key;


        card.innerHTML = `
            <div class="related-concern-image">

                <img
                    src="${related.image}"
                    alt="${related.imageAlt}"
                >

            </div>


            <div class="related-concern-content">

                <span>
                    ${related.number}
                </span>

                <h3>
                    ${related.title}
                </h3>

                <p>
                    ${getRelatedShortDescription(key)}
                </p>

                <strong>
                    Explore concern →
                </strong>

            </div>
        `;

        grid.appendChild(card);

    });

}


/* =========================================================
   08 — RELATED CONCERN SHORT DESCRIPTIONS
========================================================= */

function getRelatedShortDescription(key) {

    const descriptions = {

        acne:
            "Breakouts · Clogged pores",

        redness:
            "Irritation · Reactive-looking skin",

        pigmentation:
            "Dark spots · Uneven tone",

        aging:
            "Fine lines · Loss of firmness",

        dryness:
            "Tightness · Flakiness",

        dullness:
            "Low radiance · Uneven appearance"

    };

    return descriptions[key] || "";

}


/* =========================================================
   09 — LOAD CONCERN
========================================================= */

function loadConcern(concernKey) {

    const data =
        concernData[concernKey];

    if (!data) {
        return;
    }


    /* =====================================================
       HERO
    ===================================================== */

    updateText(
        "concern-state",
        data.state
    );

    updateText(
        "concern-number",
        data.number
    );

    updateText(
        "concern-title",
        data.title
    );

    updateText(
        "concern-description",
        data.description
    );


    const heroImage =
        document.getElementById(
            "concern-hero-image"
        );

    if (heroImage) {

        heroImage.src =
            data.image;

        heroImage.alt =
            data.imageAlt;

        heroImage.onerror = () => {
            heroImage.src = "assets/skin-concerns/hero-skin-concerns.webp";
        };

    }


    updateText(
        "concern-hero-image-label",
        data.imageLabel
    );


    /* =====================================================
       INTELLIGENCE
    ===================================================== */

    if (data.intelligence) {

        updateText(
            "intelligence-heading",
            data.intelligence.heading
        );

        updateText(
            "intelligence-intro",
            data.intelligence.intro
        );


        updateText(
            "notice-title",
            data.intelligence.noticeTitle
        );

        updateText(
            "notice-description",
            data.intelligence.noticeDescription
        );

        updateList(
            "notice-list",
            data.intelligence.notice
        );


        updateText(
            "contributors-title",
            data.intelligence.contributorsTitle
        );

        updateText(
            "contributors-description",
            data.intelligence.contributorsDescription
        );

        updateList(
            "contributors-list",
            data.intelligence.contributors
        );


        updateText(
            "needs-title",
            data.intelligence.needsTitle
        );

        updateText(
            "needs-description",
            data.intelligence.needsDescription
        );

        updateList(
            "needs-list",
            data.intelligence.needs
        );

    }


    /* =====================================================
       SKIN NEEDS
    ===================================================== */

    updateText(
        "needs-section-description",
        data.needsDescription
    );


    if (data.needs) {

        Object.keys(data.needs).forEach(key => {

            const item =
                data.needs[key];

            updateText(
                `${key}-title`,
                item.title
            );

            updateText(
                `${key}-description`,
                item.description
            );

        });

    }


    /* =====================================================
       INGREDIENTS
    ===================================================== */

    updateText(
        "ingredient-section-description",
        data.ingredientDescription
    );

    renderIngredients(
        data.ingredients
    );


    /* =====================================================
       PRODUCTS
    ===================================================== */

    updateText(
        "product-section-description",
        data.productDescription
    );

    renderProducts(
        data.products
    );


    /* =====================================================
       CAUTION
    ===================================================== */

    updateText(
        "caution-description",
        data.cautionDescription
    );


    /* =====================================================
       RELATED CONCERNS
    ===================================================== */

    renderRelatedConcerns(
        data.related
    );

}


/* =========================================================
   10 — PRODUCT FILTER
========================================================= */

function setupProductFilters() {

    const tabs =
        document.querySelectorAll(
            ".product-tab"
        );

    if (!tabs.length) {
        return;
    }


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const category =
                    tab.dataset.productCategory;


                /* -----------------------------------------
                   ACTIVE TAB
                ----------------------------------------- */

                tabs.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                    item.setAttribute(
                        "aria-selected",
                        "false"
                    );

                });


                tab.classList.add(
                    "active"
                );

                tab.setAttribute(
                    "aria-selected",
                    "true"
                );


                /* -----------------------------------------
                   CURRENT CARDS
                ----------------------------------------- */

                const cards =
                    document.querySelectorAll(
                        ".concern-product-card"
                    );


                cards.forEach(card => {

                    const cardCategory =
                        card.dataset.productCategory;

                    const showCard =
                        category === "all" ||
                        cardCategory === category;


                    if (showCard) {

                        card.classList.remove(
                            "is-hidden"
                        );

                        card.classList.add(
                            "is-visible"
                        );

                    } else {

                        card.classList.remove(
                            "is-visible"
                        );

                        card.classList.add(
                            "is-hidden"
                        );

                    }

                });

            }
        );

    });

}


/* =========================================================
   11 — SMOOTH SCROLL
========================================================= */

function setupSmoothScroll() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });

}


/* =========================================================
   12 — UPDATE PAGE TITLE
========================================================= */

function updatePageTitle(data) {

    if (!data) {
        return;
    }

    document.title =
        `${data.title} | Glowithm`;

}


/* =========================================================
   13 — INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentConcern =
            getCurrentConcern();

        const data =
            concernData[currentConcern];


        loadConcern(
            currentConcern
        );


        updatePageTitle(
            data
        );


        setupProductFilters();


        setupSmoothScroll();

    }
);