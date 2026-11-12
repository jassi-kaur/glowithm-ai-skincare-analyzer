/* =========================================================
   GLOWITHM — SKIN CONCERNS PAGE
   skin-concerns.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const stateCards =
        document.querySelectorAll(".skin-state-card");

    const concernCards =
        document.querySelectorAll(".concern-card");

    const exploreButtons =
        document.querySelectorAll(".concern-explore");

    const activeStateText =
        document.getElementById("active-state-text");

    const concernFilter =
        document.getElementById("concern-filter");

    const skinTypeFilter =
        document.getElementById("skin-type-filter");

    const sensitivityFilter =
        document.getElementById("sensitivity-filter");

    const resetButton =
        document.getElementById("reset-filters");

    const resultText =
        document.getElementById("filter-result-text");

    const profileTitle =
        document.getElementById("filter-profile-title");

    const resultCount =
        document.getElementById("filter-result-count");

    const profileMatchValue =
        document.getElementById("profile-match-value");

    const progressBar =
        document.getElementById("profile-progress-bar");

    const filterCard =
        document.querySelector(".smart-filter-card");


    /* =====================================================
       01 — STATE DESCRIPTIONS
    ===================================================== */

    const stateDescriptions = {

        dehydration:
            "Focus on hydration, moisture balance, and supporting a comfortable skin barrier.",

        inflammation:
            "Focus on reducing unnecessary irritation while supporting calmer, more balanced skin.",

        pigmentation:
            "Focus on improving the appearance of uneven tone while protecting skin from further discoloration.",

        aging:
            "Focus on maintaining firmness, supporting healthy skin function, and improving the appearance of fine lines."

    };


    /* =====================================================
       02 — FILTER CONCERNS BY SKIN STATE
    ===================================================== */

    function filterByState(state) {

        concernCards.forEach(card => {

            const cardState =
                card.dataset.state;

            card.classList.remove("filter-match");

            if (cardState === state) {

                card.classList.remove("filtered-out");

                requestAnimationFrame(() => {
                    card.classList.add("filter-match");
                });

            } else {

                card.classList.add("filtered-out");

            }

        });


        if (
            activeStateText &&
            stateDescriptions[state]
        ) {

            activeStateText.textContent =
                stateDescriptions[state];

        }

    }


    /* =====================================================
       03 — STATE CARD CLICK
    ===================================================== */

    stateCards.forEach(card => {

        card.addEventListener("click", () => {

            const state =
                card.dataset.state;

            if (!state) return;


            stateCards.forEach(item => {
                item.classList.remove("active");
            });


            card.classList.add("active");


            filterByState(state);


            const explorer =
                document.getElementById("concerns");

            if (explorer) {

                setTimeout(() => {

                    explorer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 120);

            }

        });

    });


    /* =====================================================
       04 — EXPLORE CONCERN

       IMPORTANT:
       This page ONLY navigates to concern-detail.html.
       It does NOT display concern intelligence here.
    ===================================================== */

    exploreButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();


            const concern =
                button.dataset.explore;

            if (!concern) {

                console.warn(
                    "No data-explore value found."
                );

                return;

            }


            console.log(
                "Opening concern:",
                concern
            );


            window.location.href =
                "concern-detail.html?concern=" +
                encodeURIComponent(concern);

        });

    });


    /* =====================================================
       05 — CONCERN CARD CLICK
    ===================================================== */

    concernCards.forEach(card => {

        card.addEventListener("click", event => {

            /*
             * If the user clicked the Explore button,
             * let the Explore button handle navigation.
             */

            if (
                event.target.closest(".concern-explore")
            ) {
                return;
            }


            concernCards.forEach(item => {
                item.classList.remove("active");
            });


            card.classList.add("active");

        });

    });


    /* =====================================================
       06 — SMART FILTER DATA
    ===================================================== */

    const concernNames = {

        all:
            "All skin concerns",

        acne:
            "Acne & Breakouts",

        redness:
            "Redness & Sensitivity",

        pigmentation:
            "Dark Spots & Pigmentation",

        aging:
            "Fine Lines & Firmness",

        dryness:
            "Dryness & Dehydration",

        dullness:
            "Dullness & Uneven Tone"

    };


    const skinTypeNames = {

        all:
            "Any skin type",

        dry:
            "Dry skin",

        oily:
            "Oily skin",

        combination:
            "Combination skin",

        normal:
            "Normal skin",

        sensitive:
            "Sensitive skin"

    };


    const sensitivityNames = {

        all:
            "Any sensitivity",

        low:
            "Low sensitivity",

        normal:
            "Normal sensitivity",

        high:
            "High sensitivity"

    };


    const concernGuidance = {

        acne:
            "Glowithm will prioritize congestion-focused guidance while keeping the routine balanced.",

        redness:
            "Glowithm will prioritize calming, barrier-supportive guidance and minimizing unnecessary irritation.",

        pigmentation:
            "Glowithm will prioritize tone-supportive guidance alongside daily skin protection.",

        aging:
            "Glowithm will prioritize firmness, texture, and long-term skin-supportive care.",

        dryness:
            "Glowithm will prioritize hydration, moisture retention, and barrier-supportive care.",

        dullness:
            "Glowithm will prioritize radiance, smoother-looking texture, and more even-looking skin."

    };


    /* =====================================================
       07 — SMART FILTER UPDATE
    ===================================================== */

    function updateSmartFilter() {

        /*
         * Stop if the filter section does not exist.
         */

        if (
            !concernFilter ||
            !skinTypeFilter ||
            !sensitivityFilter
        ) {
            return;
        }


        const concern =
            concernFilter.value;

        const skinType =
            skinTypeFilter.value;

        const sensitivity =
            sensitivityFilter.value;


        let selectedCount = 0;


        if (concern !== "all") {
            selectedCount++;
        }

        if (skinType !== "all") {
            selectedCount++;
        }

        if (sensitivity !== "all") {
            selectedCount++;
        }


        /* -------------------------------------------------
           UPDATE COUNT
        ------------------------------------------------- */

        if (resultCount) {

            resultCount.textContent =
                `${selectedCount} of 3 selected`;

        }


        if (profileMatchValue) {

            profileMatchValue.textContent =
                `${selectedCount} / 3`;

        }


        /* -------------------------------------------------
           UPDATE PROGRESS
        ------------------------------------------------- */

        if (progressBar) {

            const progress =
                (selectedCount / 3) * 100;

            progressBar.style.width =
                `${progress}%`;

        }


        /* -------------------------------------------------
           FILTER CARD STATE
        ------------------------------------------------- */

        if (filterCard) {

            filterCard.classList.toggle(
                "has-selection",
                selectedCount > 0
            );

        }


        /* -------------------------------------------------
           NOTHING SELECTED
        ------------------------------------------------- */

        if (selectedCount === 0) {

            if (profileTitle) {

                profileTitle.textContent =
                    "Explore the full Glowithm skin library";

            }

            if (resultText) {

                resultText.textContent =
                    "Select your concern, skin type, or sensitivity to make your view more specific.";

            }

            return;

        }


        /* -------------------------------------------------
           BUILD PROFILE
        ------------------------------------------------- */

        const selectedConcern =
            concernNames[concern];

        const selectedSkinType =
            skinTypeNames[skinType];

        const selectedSensitivity =
            sensitivityNames[sensitivity];


        let title = "";

        let details = [];


        if (concern !== "all") {

            title =
                selectedConcern;

        } else {

            title =
                "Your personalized skin profile";

        }


        if (skinType !== "all") {

            details.push(
                selectedSkinType
            );

        }


        if (sensitivity !== "all") {

            details.push(
                selectedSensitivity
            );

        }


        if (profileTitle) {

            profileTitle.textContent =
                title;

        }


        let message = "";


        if (concern !== "all") {

            message =
                concernGuidance[concern];

        } else {

            message =
                "Glowithm is tailoring the information below to the skin profile you've selected.";

        }


        if (details.length > 0) {

            message +=
                ` Your profile: ${details.join(" · ")}.`;

        }


        if (resultText) {

            resultText.textContent =
                message;

        }

    }


    /* =====================================================
       08 — FILTER EVENTS
    ===================================================== */

    if (concernFilter) {

        concernFilter.addEventListener(
            "change",
            updateSmartFilter
        );

    }


    if (skinTypeFilter) {

        skinTypeFilter.addEventListener(
            "change",
            updateSmartFilter
        );

    }


    if (sensitivityFilter) {

        sensitivityFilter.addEventListener(
            "change",
            updateSmartFilter
        );

    }


    /* =====================================================
       09 — RESET FILTERS
    ===================================================== */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                if (concernFilter) {
                    concernFilter.value = "all";
                }

                if (skinTypeFilter) {
                    skinTypeFilter.value = "all";
                }

                if (sensitivityFilter) {
                    sensitivityFilter.value = "all";
                }


                updateSmartFilter();

            }
        );

    }




    /* =====================================================
       10 — INITIALIZE FILTER
    ===================================================== */

    updateSmartFilter();

});