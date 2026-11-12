document.addEventListener("DOMContentLoaded", () => {

    console.log("Glowithm Analyzer Script Loaded");


    /* =========================================================
       ANALYZER STATE
    ========================================================= */

    const analyzerData = {
        skinType: "",
        concerns: [],
        products: [],
        pregnant: false
    };

    window.glowithmAnalyzerData = analyzerData;

    const Utils = window.GlowithmUtils;

    if (!Utils) {
        throw new Error(
            "Glowithm: js/analyzer-utils.js did not load. " +
            "Check that analyzer.html includes it before analyzer.js."
        );
    }

    /* =========================================================
       NOTIFICATIONS (replaces browser alert() pop-ups)
    ========================================================= */

    function notify(message, type = "info") {

        let region = document.getElementById("glowithm-toasts");

        if (!region) {
            region = document.createElement("div");
            region.id = "glowithm-toasts";
            region.setAttribute("aria-live", "polite");
            document.body.appendChild(region);
        }

        const toast = document.createElement("div");
        toast.className = `glowithm-toast glowithm-toast--${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const text = document.createElement("span");
        text.textContent = message;

        const close = document.createElement("button");
        close.type = "button";
        close.className = "glowithm-toast-close";
        close.setAttribute("aria-label", "Dismiss message");
        close.textContent = "\u00d7";
        close.addEventListener("click", () => toast.remove());

        toast.append(text, close);
        region.appendChild(toast);

        setTimeout(() => toast.remove(), type === "error" ? 10000 : 6000);
    }

    /* =========================================================
       PREGNANCY / BREASTFEEDING OPTION
    ========================================================= */

    const pregnancyCheckbox =
        document.getElementById("pregnancy-checkbox");
    const pregnancyNote =
        document.getElementById("summary-pregnancy-note");

    function syncPregnancyUI() {

        if (pregnancyCheckbox) {
            pregnancyCheckbox.checked = analyzerData.pregnant;
        }

        if (pregnancyNote) {
            pregnancyNote.hidden = !analyzerData.pregnant;
        }

    }

    if (pregnancyCheckbox) {
        pregnancyCheckbox.addEventListener("change", () => {
            analyzerData.pregnant = pregnancyCheckbox.checked;
            syncPregnancyUI();
        });
    }

    /* Disclaimer text lives in analyzer-utils.js so the page and the
       PDF always say the same thing. */
    document.querySelectorAll("[data-disclaimer]").forEach(element => {
        element.textContent = Utils.DISCLAIMER_TEXT;
    });


    /* =========================================================
       WORKSPACE ELEMENTS
    ========================================================= */

    const workspaceStates =
        document.querySelectorAll(".workspace-state");

    const progressSteps =
        document.querySelectorAll(".progress-step");

    const skinCards =
        document.querySelectorAll(".skin-type-card");

    const concernCards =
        document.querySelectorAll(".concern-card");

    const concernsNext =
        document.getElementById("concerns-next");

    const productsNext =
        document.getElementById("products-next");

    const analyzeBtn =
        document.getElementById("analyze-btn");

    const processingState =
        document.getElementById("ai-processing");


    /* =========================================================
       PRODUCT ELEMENTS
    ========================================================= */

    const productInput =
        document.getElementById("product-input");

    const addProductBtn =
        document.getElementById("add-product-btn");

    const productList =
        document.getElementById("product-list");


    /* =========================================================
       RESULTS ELEMENTS
    ========================================================= */

    const resultsSection =
        document.getElementById("resultsSection");

    const morningRoutine =
        document.getElementById("morningRoutine");

    const nightRoutine =
        document.getElementById("nightRoutine");

    const ingredientWarnings =
        document.getElementById("ingredientWarnings");

    const ingredientSafe =
        document.getElementById("ingredientSafe");

    const personalizedTips =
        document.getElementById("personalizedTips");

    const analyzedProducts =
        document.getElementById("analyzedProducts");


    const analyzeAgainBtn =
        document.getElementById("analyzeAgainBtn");

    const saveRoutineBtn =
        document.getElementById("saveRoutineBtn");





    /* =========================================================
       SHOW WORKSPACE STEP
    ========================================================= */

    function showStep(stepNumber) {

        workspaceStates.forEach(state => {
            state.classList.remove("active");
        });

        const targetState =
            document.querySelector(
                `.workspace-state[data-step="${stepNumber}"]`
            );

        if (targetState) {
            targetState.classList.add("active");
        }

        progressSteps.forEach((step, index) => {

            const currentStep = index + 1;

            step.classList.remove(
                "active",
                "completed"
            );

            if (currentStep < stepNumber) {
                step.classList.add("completed");
            }

            if (currentStep === stepNumber) {
                step.classList.add("active");
            }

        });

    }


    /* =========================================================
       NAVIGATION: Click on progress steps (TWO-WAY)
    ========================================================= */

    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;

        step.addEventListener("click", () => {
            // Only allow navigation to steps that have been completed
            // or the current step
            const isCompleted = step.classList.contains("completed");
            const isActive = step.classList.contains("active");

            if (isCompleted || isActive) {
                console.log(`Navigating to step ${stepNumber}`);
                showStep(stepNumber);

                // If going back to step 1, clear any analysis state
                if (stepNumber === 1) {
                    // Keep skin type selection visible but allow changes
                }

                // Scroll to top of workspace
                const workspace = document.getElementById("analyzer-workspace");
                if (workspace) {
                    workspace.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
    });


    /* =========================================================
       BACK BUTTON HANDLERS
    ========================================================= */

    // Back button for Step 2 (Concerns)
    const backToSkinBtn = document.getElementById("back-to-skin");
    if (backToSkinBtn) {
        backToSkinBtn.addEventListener("click", () => {
            if (analyzerData.skinType) {
                showStep(1);
            } else {
                notify("Please select your skin type first.");
            }
        });
    }

    // Back button for Step 3 (Products)
    const backToConcernsBtn = document.getElementById("back-to-concerns");
    if (backToConcernsBtn) {
        backToConcernsBtn.addEventListener("click", () => {
            if (analyzerData.concerns.length > 0) {
                showStep(2);
            } else {
                notify("Please select at least one skin concern.");
            }
        });
    }

    // Back button for Step 4 (Analysis)
    const backToProductsBtn = document.getElementById("back-to-products");
    if (backToProductsBtn) {
        backToProductsBtn.addEventListener("click", () => {
            showStep(3);
        });
    }


    /* =========================================================
       STEP 01 — SKIN TYPE
    ========================================================= */

    skinCards.forEach(card => {

        card.addEventListener("click", () => {

            skinCards.forEach(item => {
                item.classList.remove("selected");
            });

            card.classList.add("selected");

            analyzerData.skinType =
                card.dataset.skinType;

            console.log(
                "Skin type:",
                analyzerData.skinType
            );

            setTimeout(() => {
                showStep(2);
            }, 350);

        });

    });


    /* =========================================================
       STEP 02 — CONCERNS
    ========================================================= */

    concernCards.forEach(card => {

        card.addEventListener("click", () => {

            const concern =
                card.dataset.concern;

            if (!concern) return;

            if (
                analyzerData.concerns.includes(
                    concern
                )
            ) {

                analyzerData.concerns =
                    analyzerData.concerns.filter(
                        item => item !== concern
                    );

                card.classList.remove("selected");

            } else {

                analyzerData.concerns.push(
                    concern
                );

                card.classList.add("selected");

            }

            console.log(
                "Concerns:",
                analyzerData.concerns
            );

        });

    });


    /* =========================================================
       CONCERNS → PRODUCTS
    ========================================================= */

    if (concernsNext) {

        concernsNext.addEventListener(
            "click",
            () => {

                if (
                    analyzerData.concerns.length === 0
                ) {

                    notify(
                        "Please select at least one skin concern."
                    );

                    return;
                }

                showStep(3);

            }
        );

    }


    /* =========================================================
       STEP 03 — ADD PRODUCT
    ========================================================= */

    function addProduct() {

        if (!productInput || !productList) {

            console.error(
                "Glowithm: Product elements not found."
            );

            return;
        }

        /* One box can hold several products separated by commas,
           semicolons or new lines (the backend splits on the same
           characters, so the tags always match what is analysed). */

        const pieces = Utils.splitProducts(productInput.value);

        productInput.value = "";

        if (pieces.length === 0) {
            return;
        }

        let message = "";

        pieces.forEach(product => {

            if (product.length > Utils.MAX_PRODUCT_LENGTH) {
                message =
                    `"${product.slice(0, 20)}..." is too long. ` +
                    `Please keep each product to ${Utils.MAX_PRODUCT_LENGTH} characters or fewer.`;
                return;
            }

            const duplicate =
                analyzerData.products.some(
                    item =>
                        item.toLowerCase() ===
                        product.toLowerCase()
                );

            if (duplicate) {
                return;
            }

            if (analyzerData.products.length >= Utils.MAX_PRODUCTS) {
                message =
                    `You can add up to ${Utils.MAX_PRODUCTS} products. ` +
                    "Remove one to add another.";
                return;
            }

            appendProductTag(product);

        });

        if (message) {
            notify(message, "info");
        }

        productInput.focus();

    }


    function appendProductTag(product) {

        analyzerData.products.push(product);

        /* Remove empty state */

        const emptyMessage =
            document.getElementById(
                "product-empty"
            );

        if (emptyMessage) {
            emptyMessage.remove();
        }

        /* Create product tag */

        const productTag =
            document.createElement("div");

        productTag.className =
            "product-tag";

        productTag.innerHTML = `
            <span class="product-name">
                ${escapeHTML(product)}
            </span>

            <button
                type="button"
                class="remove-product"
                aria-label="Remove ${escapeHTML(product)}">
                ×
            </button>
        `;

        const removeBtn =
            productTag.querySelector(
                ".remove-product"
            );

        removeBtn.addEventListener(
            "click",
            () => {

                analyzerData.products =
                    analyzerData.products.filter(
                        item => item !== product
                    );

                productTag.remove();

                if (
                    analyzerData.products.length === 0
                ) {
                    createEmptyProductState();
                }

            }
        );

        productList.appendChild(
            productTag
        );

    }


    /* =========================================================
       EMPTY PRODUCT STATE
    ========================================================= */

    function createEmptyProductState() {

        if (
            document.getElementById(
                "product-empty"
            )
        ) {
            return;
        }

        const emptyState =
            document.createElement("div");

        emptyState.className =
            "product-empty";

        emptyState.id =
            "product-empty";

        emptyState.innerHTML = `

            <span>＋</span>

            <p>
                No products added yet
            </p>

        `;

        productList.appendChild(
            emptyState
        );

    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value == null ? "" : String(value);

        return div.innerHTML;

    }


    /* =========================================================
       ADD PRODUCT BUTTON
    ========================================================= */

    if (addProductBtn) {

        addProductBtn.addEventListener(
            "click",
            addProduct
        );

    }


    /* =========================================================
       ENTER → ADD PRODUCT
    ========================================================= */

    if (productInput) {

        productInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addProduct();

                }

            }
        );

    }


    /* =========================================================
       PRODUCTS → ANALYSIS
    ========================================================= */

    if (productsNext) {

        productsNext.addEventListener(
            "click",
            () => {

                updateSummary();

                showStep(4);

            }
        );

    }


    /* =========================================================
       UPDATE ANALYSIS SUMMARY
    ========================================================= */

    function updateSummary() {

        const skinSummary =
            document.getElementById(
                "summary-skin"
            );

        const concernsSummary =
            document.getElementById(
                "summary-concerns"
            );

        const productsSummary =
            document.getElementById(
                "summary-products"
            );


        if (skinSummary) {

            skinSummary.textContent =
                analyzerData.skinType || "—";

        }


        if (concernsSummary) {

            concernsSummary.textContent =
                analyzerData.concerns.length;

        }


        if (productsSummary) {

            productsSummary.textContent =
                analyzerData.products.length > 0
                    ? analyzerData.products.length
                    : "None added";

        }


        console.log(
            "Final profile:",
            analyzerData
        );

    }


    /* =========================================================
       STEP 04 — ANALYZE MY SKIN
    ========================================================= */

    if (analyzeBtn) {

        analyzeBtn.addEventListener(
            "click",
            analyzeSkin
        );

    }


    /* =========================================================
       SMART FALLBACK URL FOR FETCH
    ========================================================= */

    function getApiUrl() {
        // Optional override: <meta name="glowithm-api-base" content="https://...">.
        // Otherwise: same origin when served by Flask, or Flask on port 5000
        // when the page comes from another local dev server / file://.
        const meta = document.querySelector(
            'meta[name="glowithm-api-base"]'
        );

        return Utils.resolveApiUrl(
            window.location,
            meta ? meta.getAttribute("content") : ""
        );
    }


    async function analyzeSkin() {

        console.log(
            "Analyze My Skin clicked"
        );

        analyzeBtn.disabled = true;


        /* Show processing */

        workspaceStates.forEach(state => {

            state.classList.remove(
                "active"
            );

        });


        if (processingState) {

            processingState.classList.add(
                "active"
            );

        }


        /* Complete previous progress steps */

        progressSteps.forEach(step => {

            step.classList.remove(
                "active"
            );

            step.classList.add(
                "completed"
            );

        });


        const analysisProgress =
            document.getElementById(
                "progress-step-4"
            );

        if (analysisProgress) {

            analysisProgress.classList.remove(
                "completed"
            );

            analysisProgress.classList.add(
                "active"
            );

        }


        startProcessingAnimation();


        /* =====================================================
           SEND DATA TO FLASK (with Smart Fallback URL)
        ===================================================== */

        try {

            const formData =
                new URLSearchParams();


            formData.append(
                "skin_type",
                analyzerData.skinType
            );


            formData.append(
                "concerns",
                analyzerData.concerns.join(", ")
            );


            formData.append(
                "products",
                analyzerData.products.join(", ")
            );


            formData.append(
                "pregnant",
                analyzerData.pregnant ? "true" : "false"
            );


            console.log(
                "Sending to Flask:",
                {
                    skin_type:
                        analyzerData.skinType,

                    concerns:
                        analyzerData.concerns,

                    products:
                        analyzerData.products
                }
            );

            const apiUrl = getApiUrl();
            console.log("API URL:", apiUrl);

            // Local models can be slow, but never wait forever.
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                Utils.ANALYZE_TIMEOUT_MS
            );

            let response;

            try {

                response = await fetch(
                    apiUrl,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: formData,
                        signal: controller.signal
                    }
                );

            } finally {

                clearTimeout(timeoutId);

            }


            if (!response.ok) {

                // The API answers with JSON {"error": "..."} for validation
                // problems (400), rate limiting (429) and server errors (500).
                let serverMessage = null;

                try {
                    const errorBody = await response.json();
                    serverMessage = errorBody && errorBody.error;
                } catch (parseError) {
                    // Not JSON: fall through to the generic message below.
                }

                const httpError = new Error(
                    serverMessage ||
                        `Server error: ${response.status}`
                );

                httpError.status = response.status;

                throw httpError;

            }


            const result =
                await response.json();


            console.log(
                "AI Result:",
                result
            );
            console.log(
    "DEBUG — Backend applied edits:",
    result.safety_notes?.applied_edits
);


            /* Save result */

            window.glowithmResult =
                result;


            stopProcessingAnimation();


            /* Display results */

            showResults(
                result
            );

        }

        catch (error) {

            console.error(
                "Analyzer error:",
                error
            );

            stopProcessingAnimation();

            showStep(4);

            analyzeBtn.disabled =
                false;

            notify(Utils.describeError(error), "error");

        }

    }


    /* =========================================================
       AI PROCESSING ANIMATION
    ========================================================= */

    let processingInterval = null;


    function startProcessingAnimation() {

        const processingSteps = [

            {
                id: "process-profile",

                title:
                    "Understanding your profile",

                description:
                    "Analyzing your skin type and preferences."
            },

            {
                id: "process-concerns",

                title:
                    "Reviewing your concerns",

                description:
                    "Understanding what your skin needs."
            },

            {
                id: "process-products",

                title:
                    "Checking your ingredients",

                description:
                    "Looking for active ingredients and conflicts."
            },

            {
                id: "process-routine",

                title:
                    "Building your routine",

                description:
                    "Creating your personalized skincare plan."
            }

        ];


        let currentIndex = 0;


        function updateProcessingStep() {

            document
                .querySelectorAll(
                    ".processing-status-item"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            const currentStep =
                document.getElementById(
                    processingSteps[
                        currentIndex
                    ].id
                );


            if (currentStep) {

                currentStep.classList.add(
                    "active"
                );

            }


            const title =
                document.getElementById(
                    "processing-title"
                );


            if (title) {

                title.textContent =
                    processingSteps[
                        currentIndex
                    ].title;

            }


            const description =
                document.getElementById(
                    "processing-description"
                );


            if (description) {

                description.textContent =
                    processingSteps[
                        currentIndex
                    ].description;

            }


            currentIndex =
                (
                    currentIndex + 1
                ) %
                processingSteps.length;

        }


        updateProcessingStep();


        processingInterval =
            setInterval(
                updateProcessingStep,
                1800
            );

    }


    /* =========================================================
       STOP PROCESSING ANIMATION
    ========================================================= */

    function stopProcessingAnimation() {

        if (processingInterval) {

            clearInterval(
                processingInterval
            );

            processingInterval =
                null;

        }

    }


    /* =========================================================
       NORMALIZE BACKEND RESPONSE
       ---------------------------------------------------------
       The backend has now been fixed so both the success path and
       the fallback path (get_fallback_routine, used when the LLM
       or safety engine throws) return the SAME nested shape:

           { routine: { morning, night, conflicts,
                         beneficial_combinations, tips },
             safety_notes: {...}, parsed_products: [...], ... }

       This normalizer is kept as a defense-in-depth safety net
       (in case an older/unpatched backend is still deployed
       somewhere, or a future change reintroduces a flat shape) —
       it accepts either the nested shape or a flat one with no
       "routine" wrapper.

       UPDATE: "conflicts" and "beneficial_combinations" are now
       two separate arrays from the backend (they used to be mixed
       into one "conflicts" list, which is what forced the old
       keyword-guessing hack in renderConflicts()). Both are read
       here.
    ========================================================= */

    function normalizeResult(result) {
        const routine =
            (result && result.routine) ||
            result ||
            {};


        return {
            morning: routine.morning || [],
            night: routine.night || [],
            alternateNights: routine.alternate_nights || [],
            weeklySchedule: routine.weekly_schedule || {},
            conflicts: routine.conflicts || [],
            beneficialCombinations: routine.beneficial_combinations || [],
            tips: routine.tips || [],
            safetyNotes: (result && result.safety_notes) || null,
            parsedProducts: (result && result.parsed_products) || [],
            pregnancyMode: Boolean(result && result.pregnancy_mode),
            degradedMode: Boolean(result && result.degraded_mode),
            summary: typeof routine.summary === "string" ? routine.summary.trim() : "",
            ingredientNotes: Utils.normalizeIngredientNotes(result && result.ingredient_notes)
        };

    }




    /* =========================================================
       SUMMARY, BUILT-IN NOTICE, INGREDIENT NOTES
       Everything comes from the API and is inserted with textContent
       (never innerHTML), so no value can inject markup.
    ========================================================= */

    function renderSummary(text) {

        const block = document.getElementById("routineSummaryBlock");
        const target = document.getElementById("routineSummaryText");

        if (!block || !target) return;

        const value = typeof text === "string" ? text.trim() : "";

        target.textContent = value;
        block.hidden = !value;

    }


    function renderDegradedBanner(isDegraded) {

        const banner = document.getElementById("degradedBanner");

        if (banner) {
            banner.hidden = !isDegraded;
        }

    }


    function renderIngredientNotes(notes) {

        const block = document.getElementById("ingredientNotesBlock");
        const list = document.getElementById("ingredientNotesList");

        if (!block || !list) return;

        list.innerHTML = "";

        if (!notes.length) {
            block.hidden = true;
            return;
        }

        const addList = (parent, title, items) => {

            if (!items.length) return;

            const heading = document.createElement("h5");
            heading.className = "ingredient-note-heading";
            heading.textContent = title;
            parent.appendChild(heading);

            const ul = document.createElement("ul");
            ul.className = "ingredient-note-list";

            items.forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            parent.appendChild(ul);

        };

        notes.forEach((note, index) => {

            const details = document.createElement("details");
            details.className = "ingredient-note";
            details.open = index === 0;

            const summary = document.createElement("summary");
            summary.textContent = Utils.displayIngredientName(note.name);
            details.appendChild(summary);

            const body = document.createElement("div");
            body.className = "ingredient-note-body";

            addList(body, "Potential benefits", note.benefits);
            addList(body, "How to use", note.usage);
            addList(body, "Precautions", note.precautions);

            if (note.sources.length) {

                const heading = document.createElement("h5");
                heading.className = "ingredient-note-heading";
                heading.textContent = "Sources";
                body.appendChild(heading);

                const ul = document.createElement("ul");
                ul.className = "ingredient-note-list ingredient-note-sources";

                note.sources.forEach(source => {

                    const li = document.createElement("li");
                    const link = document.createElement("a");

                    link.href = source.url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent =
                        (source.organization ? source.organization + ": " : "") +
                        (source.title || source.url);

                    li.appendChild(link);
                    ul.appendChild(li);

                });

                body.appendChild(ul);

            }

            details.appendChild(body);
            list.appendChild(details);

        });

        block.hidden = false;

    }


    /* =========================================================
       RENDER PRODUCT KNOWLEDGE STATE (✅/⚠️ summary)
    ========================================================= */

    function renderProductKnowledgeState(parsedProducts) {

        const container = document.getElementById("product-knowledge-state");

        if (!container) return;

        let knownCount = 0;
        let recognizedCount = 0;
        let unclearCount = 0;

        parsedProducts.forEach(p => {
            if (p.needs_clarification || p.confidence === "low") {
                unclearCount++;
            } else if (p.confidence === "high" && p.ingredient) {
                knownCount++;
            } else if (p.type) {
                recognizedCount++;
            }
        });

        container.innerHTML = `
            <div class="knowledge-summary">
                <span class="known-count">Ingredients identified: ${knownCount}</span>
                <span> | </span>
                <span>Product types recognized: ${recognizedCount}</span>
                <span> | </span>
                <span class="unclear-count">Need clarification: ${unclearCount}</span>
            </div>
            <p class="knowledge-note">
                Glowithm distinguishes identified ingredients from recognized product types. Share key ingredients or full product names for more precise analysis.
            </p>
        `;

        container.hidden = parsedProducts.length === 0;
    }

    /* =========================================================
       RENDER CURRENT PRODUCTS ANALYSIS (detailed per-item view)
    ========================================================= */

    function renderCurrentProductsAnalysis(parsedProducts) {

        const container = document.getElementById("current-products-analysis");

        if (!container) return;

        if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
            container.innerHTML = "";
            container.hidden = true;
            return;
        }

        let html = "<h4>Current Products Analysis</h4><ul>";

        parsedProducts.forEach(p => {
            let statusClass;
            let detailsText;

            const ingredientLabel = Array.isArray(p.ingredient)
                ? p.ingredient.join(", ")
                : (p.ingredient || "");

            if (p.needs_clarification || p.confidence === "low") {
                statusClass = "needs-clarification";
                detailsText = p.type
                    ? `${p.type}: ingredient details need clarification`
                    : "Product type and ingredient need clarification";
            } else if (p.confidence === "high" && ingredientLabel) {
                statusClass = "identified";
                detailsText = `${p.type || "Product"}: ${ingredientLabel} (high confidence)`;
            } else if (p.type) {
                statusClass = "recognized";
                detailsText = `${p.type}: ingredient unspecified`;
            } else {
                statusClass = "needs-clarification";
                detailsText = "Product details need clarification";
            }

            html += `<li class="${statusClass}"><strong>${escapeHTML(p.original_input || "")}</strong>: ${escapeHTML(detailsText)}</li>`;
        });

        html += "</ul>";

        const needsInfo = parsedProducts.some(
            p => p.needs_clarification || p.confidence === "low"
        );

        if (needsInfo) {
            html += `<p class="clarification-note mt-2">
                To improve accuracy, specify the active ingredients (for example, vitamin C or niacinamide 5%) or provide the full product names for items marked above.
            </p>`;
        }

        container.innerHTML = html;
        container.hidden = false;
    }

    /* =========================================================
       RESULTS — ROUTINE
    ========================================================= */

    function renderRoutine(
        container,
        routine
    ) {

        if (!container) return;

        container.innerHTML = "";


        if (
            !routine ||
            routine.length === 0
        ) {

            container.innerHTML = `

                <div class="routine-empty">
                    No routine steps available.
                </div>

            `;

            return;
        }


        routine.forEach(
            (step, index) => {

                const stepItem =
                    document.createElement(
                        "div"
                    );

                stepItem.className =
                    "routine-step";


                let title = "";
                let description = "";


                if (
                    typeof step === "string"
                ) {

                    title = step;

                }


                else if (
                    typeof step === "object" &&
                    step !== null
                ) {

                    title =
                        step.name ||
                        step.product ||
                        step.step ||
                        step.title ||
                        "Skincare Step";


                    description =
                        step.description ||
                        step.reason ||
                        "";

                }


                stepItem.innerHTML = `

                    <div class="step-number">
                        ${String(
                            index + 1
                        ).padStart(2, "0")}
                    </div>

                    <div class="step-content">

                        <h5>
                            ${escapeHTML(title)}
                        </h5>

                        ${
                            description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            description
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                `;


                container.appendChild(
                    stepItem
                );

            }
        );
    }

        /* =========================================================
        RESULTS — ALTERNATE NIGHTS
        ========================================================= */

        function renderAlternateNights(alternateNights) {
            const section = document.getElementById("alternateNightsSection");
            const container = document.getElementById("alternateNightsRoutine");

            if (!section || !container) {
                console.warn("Alternate nights container not found in analyzer.html");
                return;
            }

            container.innerHTML = "";

            if (!Array.isArray(alternateNights) || alternateNights.length === 0) {
                section.hidden = true;
                return;
            }

            renderRoutine(container, alternateNights);
            section.hidden = false;
        }


    /* =========================================================
       RESULTS — WEEKLY SCHEDULE
    ========================================================= */

    function renderWeeklySchedule(weeklySchedule) {
        const section = document.getElementById("weeklyScheduleSection");
        const container = document.getElementById("weeklyScheduleRoutine");

        if (!section || !container) {
            console.warn("Weekly schedule container not found in analyzer.html");
            return;
        }

        container.innerHTML = "";

        if (
            !weeklySchedule ||
            typeof weeklySchedule !== "object" ||
            Array.isArray(weeklySchedule) ||
            Object.keys(weeklySchedule).length === 0
        ) {
            section.hidden = true;
            return;
        }

        const list = document.createElement("div");
        list.className = "weekly-schedule-list";

        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        dayOrder
            .filter(day => Object.prototype.hasOwnProperty.call(weeklySchedule, day))
            .forEach(day => {
                const actives = weeklySchedule[day];
            if (!Array.isArray(actives) || actives.length === 0) {
                return;
            }

            const row = document.createElement("div");
            row.className = "weekly-schedule-day";

            const dayLabel = document.createElement("strong");
            dayLabel.textContent = day;

            const activeList = document.createElement("span");
            activeList.textContent = actives.join(", ");

            row.append(dayLabel, activeList);
            list.appendChild(row);
        });

        if (!list.childElementCount) {
            section.hidden = true;
            return;
        }

        container.appendChild(list);
        section.hidden = false;
    }



    /* =========================================================
       RESULTS — INGREDIENT CONFLICTS
       ---------------------------------------------------------
       UPDATE: the backend now returns real warnings and beneficial
       combinations as two SEPARATE arrays — "conflicts" and
       "beneficial_combinations" — instead of one mixed list with
       emoji prefixes to guess from. This function now takes both
       directly, so there's no more keyword/emoji guessing (the old
       version broke on messages like "... is a beneficial
       combination for skin barrier health", which didn't match its
       exclusion-keyword list). The backend also already strips
       emoji prefixes from both arrays before sending them, but the
       replace() calls below are kept as a harmless no-op safety net
       in case an older backend response still includes them.
    ========================================================= */

    function renderConflicts(conflicts, beneficialCombinations) {

        if (!ingredientWarnings || !ingredientSafe) {
            return;
        }

        const realWarnings = (Array.isArray(conflicts) ? conflicts : [])
            .filter(c => typeof c === "string" && c.trim() !== "");

        const beneficial = (Array.isArray(beneficialCombinations) ? beneficialCombinations : [])
            .filter(c => typeof c === "string" && c.trim() !== "");

        console.log("Real warnings:", realWarnings);
        console.log("Beneficial combos:", beneficial);

        if (realWarnings.length === 0) {

            // No real conflicts — show the safe card.
            ingredientWarnings.style.display = "none";
            ingredientSafe.style.display = "flex";


            const safeMessage =
                document.querySelector("#ingredientSafe .card-message");

            if (safeMessage) {
                safeMessage.textContent =
                    beneficial.length > 0
                        ? beneficial[0].replace(/^✅\s*/, "")
                        : "Your ingredient combination appears compatible. Continue with your routine.";
            }

            return;
        }

        // Has real conflicts — show warning card.
        ingredientSafe.style.display = "none";
        ingredientWarnings.style.display = "flex";

        const conflictTitle =
            document.getElementById("conflictTitle");

        const conflictMessage =
            document.getElementById("conflictMessage");

        if (conflictTitle) {
            conflictTitle.textContent =
                "⚠️ Ingredient Combination Detected";
        }

        const cleanWarning = (warning) =>
            warning.replace(/^[^\p{L}\p{N}]+/u, "").trim();

        if (conflictMessage) {
            conflictMessage.textContent = cleanWarning(realWarnings[0]);
        }

        const conflictList = document.getElementById("conflictList");

        if (conflictList) {
            conflictList.innerHTML = "";

            if (realWarnings.length > 1) {
                realWarnings.slice(1).forEach((warning) => {
                    const item = document.createElement("li");
                    item.textContent = cleanWarning(warning);
                    item.style.marginTop = "6px";
                    conflictList.appendChild(item);
                });

                conflictList.style.display = "block";
            } else {
                conflictList.style.display = "none";
            }
        }


    }


    /* =========================================================
       RESULTS — PERSONALIZED TIPS
    ========================================================= */

    function renderTips(tips) {

        if (!personalizedTips) return;


        personalizedTips.innerHTML = "";


        if (
            !tips ||
            tips.length === 0
        ) {

            personalizedTips.innerHTML = `

                <div class="tip-item">
                    Keep your routine simple and consistent.
                </div>

            `;

            return;
        }


        tips.forEach(tip => {

            const tipItem =
                document.createElement(
                    "div"
                );


            tipItem.className =
                "tip-item";


            let text = "";


            if (
                typeof tip === "string"
            ) {

                text = tip;

            }

            else if (
                typeof tip === "object" &&
                tip !== null
            ) {

                text =
                    tip.text ||
                    tip.tip ||
                    tip.message ||
                    "";

            }


            tipItem.textContent =
                text;


            personalizedTips.appendChild(
                tipItem
            );

        });

    }


    /* =========================================================
       RESULTS — CURRENT PRODUCTS
    ========================================================= */

    function renderProducts(
        products
    ) {

        if (!analyzedProducts) return;


        analyzedProducts.innerHTML = "";


        if (
            !products ||
            products.length === 0
        ) {

            analyzedProducts.innerHTML = `

                <span class="product-result-tag">
                    No current products added
                </span>

            `;

            return;
        }


        products.forEach(product => {

            const productTag =
                document.createElement(
                    "span"
                );


            productTag.className =
                "product-result-tag";


            productTag.textContent =
                product;


            analyzedProducts.appendChild(
                productTag
            );

        });

    }


    /* =========================================================
       RESULTS — UPDATE PROFILE (with dynamic focus)
    ========================================================= */

    function updateResultProfile() {

        const resultSkinType =
            document.getElementById(
                "resultSkinType"
            );

        const resultConcernCount =
            document.getElementById(
                "resultConcernCount"
            );

        const resultProductCount =
            document.getElementById(
                "resultProductCount"
            );


        const profileSkinType =
            document.getElementById(
                "profileSkinType"
            );

        const profilePrimaryConcern =
            document.getElementById(
                "profilePrimaryConcern"
            );

        const profileOtherConcerns =
            document.getElementById(
                "profileOtherConcerns"
            );

        const profileConcerns =
            document.querySelector(
                ".profile-concerns"
            );

        const profileRoutineFocus =
            document.getElementById(
                "profileRoutineFocus"
            );
            console.log(
    "Routine focus element found:",
    !!profileRoutineFocus
);


        /* Skin type */

        const skinType =
            analyzerData.skinType ||
            "Not specified";


        if (resultSkinType) {

            resultSkinType.textContent =
                skinType;

        }


        if (profileSkinType) {

            profileSkinType.textContent =
                skinType;

        }


        /* Concern count */

        const concernCount =
            analyzerData.concerns.length;


        if (resultConcernCount) {

            resultConcernCount.textContent =
                `${concernCount} ${
                    concernCount === 1
                        ? "Concern"
                        : "Concerns"
                }`;

        }


        /* Product count */

        const productCount =
            analyzerData.products.length;


        if (resultProductCount) {

            resultProductCount.textContent =
                `${productCount} ${
                    productCount === 1
                        ? "Product"
                        : "Products"
                } Analyzed`;

        }


        /* Primary concern */

        if (profilePrimaryConcern) {

            profilePrimaryConcern.textContent =
                analyzerData.concerns[0] ||
                "No concern selected";

        }


        /* Other concerns */

        if (profileOtherConcerns) {

            const otherConcerns =
                analyzerData.concerns.slice(1);


            profileOtherConcerns.textContent =
                otherConcerns.length > 0
                    ? otherConcerns.join(", ")
                    : "None";

        }


        /* Concern tags */

        if (profileConcerns) {

            profileConcerns.innerHTML = "";


            analyzerData.concerns.forEach(
                concern => {

                    const tag =
                        document.createElement(
                            "span"
                        );


                    tag.className =
                        "concern-tag";


                    tag.textContent =
                        concern;


                    profileConcerns.appendChild(
                        tag
                    );

                }
            );

        }

        /* Dynamic routine focus based on primary concern */

        if (profileRoutineFocus) {

            const primaryConcern =
                analyzerData.concerns[0] || "";
                console.log("Primary concern for routine focus:", primaryConcern);
                console.log("Routine focus element:", profileRoutineFocus);

            let focusText = "Balanced skincare routine";
            let focusEmoji = "✨";

            switch (primaryConcern.toLowerCase()) {

                case "acne":
                case "breakouts":
                case "acne & breakouts":
                    focusText = "Oil control & blemish prevention";
                    focusEmoji = "🧼";
                    break;

                case "dark spots":
                case "pigmentation":
                    focusText = "Brightening & even tone";
                    focusEmoji = "🌟";
                    break;

                case "dryness":
                case "dehydration":
                    focusText = "Deep hydration & moisture barrier";
                    focusEmoji = "💧";
                    break;

                case "sensitivity":
                case "redness":
                    focusText = "Calming & soothing sensitive skin";
                    focusEmoji = "🌿";
                    break;

                case "fine lines":
                case "aging":
                    focusText = "Anti-aging & skin renewal";
                    focusEmoji = "🔬";
                    break;

                case "uneven":
                case "dullness":
                case "uneven skin tone":
                    focusText = "Brightening & texture improvement";
                    focusEmoji = "✨";
                    break;

                default:
                    focusText = "Balanced skincare routine";
                    focusEmoji = "✨";

            }

            profileRoutineFocus.innerHTML = `
                <span class="focus-emoji">${focusEmoji}</span>
                <span class="focus-text">${escapeHTML(focusText)}</span>
            `;
            console.log(
                "Routine focus text after update:",
                    profileRoutineFocus.innerText
            );

        }

    }


    /* =========================================================
       SHOW RESULTS
       ---------------------------------------------------------
       Single, merged implementation. Previously this function
       was declared twice — in JavaScript, the second declaration
       silently replaces the first, so the version that rendered
       product-knowledge / product-analysis panels never ran.
       This version keeps everything from both and normalizes the
       backend response first so it also survives the fallback
       (non-"routine"-wrapped) response shape.
    ========================================================= */

    function showResults(result) {

        console.log("Showing results:", result);

        const normalized = normalizeResult(result);

        renderDegradedBanner(normalized.degradedMode);
        renderSummary(normalized.summary);

        renderRoutine(morningRoutine, normalized.morning);
        renderRoutine(nightRoutine, normalized.night);
        renderAlternateNights(normalized.alternateNights);
        renderWeeklySchedule(normalized.weeklySchedule);

        renderConflicts(normalized.conflicts, normalized.beneficialCombinations);
        renderTips(normalized.tips);

        renderSafetyNotes(normalized.safetyNotes);
        renderIngredientNotes(normalized.ingredientNotes);

        renderProductKnowledgeState(normalized.parsedProducts);
        renderCurrentProductsAnalysis(normalized.parsedProducts);

        renderProducts(analyzerData.products);
        updateResultProfile();

        /* Hide workspace, show results */

        const workspace =
            document.getElementById("analyzer-workspace");

        if (workspace) {
            workspace.style.display = "none";
        }

        if (resultsSection) {

            resultsSection.hidden = false;
            resultsSection.style.display = "block";

            setTimeout(() => {
                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 150);

        }

    }


    /* =========================================================
       RESULTS — SAFETY NOTES
    ========================================================= */

    function renderSafetyNotes(safetyNotes) {

        const safetyContainer =
            document.getElementById("safety-notes");

        if (!safetyContainer) {
            console.warn(
                "Safety notes container (#safety-notes) not found in analyzer.html"
            );
            return;
        }

        safetyContainer.innerHTML = "";

        // Only people-facing lists are shown. The backend also sends internal
        // bookkeeping (spf_added, tips_refined...) that must never reach the UI.
        const groups = Utils.groupSafetyNotes(safetyNotes);

        if (groups.warnings.length === 0 && groups.changes.length === 0) {
            safetyContainer.style.display = "none";
            return;
        }

        const addGroup = (title, className, items) => {

            if (items.length === 0) {
                return;
            }

            const heading = document.createElement("h4");
            heading.className = `safety-heading ${className}`;
            heading.textContent = title;
            safetyContainer.appendChild(heading);

            items.forEach(text => {
                const item = document.createElement("p");
                item.className = "safety-item";
                item.textContent = `\u2022 ${text}`;
                safetyContainer.appendChild(item);
            });

        };

        addGroup(
            "\u26a0\ufe0f Safety Warnings",
            "safety-heading--warning",
            groups.warnings
        );

        addGroup(
            "\ud83d\udee1\ufe0f Applied Safety Changes",
            "safety-heading--changes",
            groups.changes
        );

        safetyContainer.style.display = "block";

    }

    /* =========================================================
       PREMIUM GLOWITHM PDF
       Builds the downloadable report with jsPDF (loaded from the CDN
       in analyzer.html). Safety notes use the same people-facing
       lists as the page; the disclaimer is on the last page and in
       every page footer.
    ========================================================= */
function saveRoutineAsPDF() {
    const result = window.glowithmResult;
    const profile = window.glowithmAnalyzerData || {};

    if (!result) {
        notify("Please analyze your skin and generate a routine first.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        notify("PDF generator is unavailable. Please check your internet connection, refresh the page and try again.", "error");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ format: "a4", unit: "mm" });

        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const M = 17;
        const CONTENT = W - M * 2;

        const C = {
            paper: [250, 249, 245],
            white: [255, 255, 255],
            ink: [43, 56, 47],
            muted: [112, 120, 108],
            sage: [111, 133, 110],
            lightSage: [232, 237, 228],
            line: [221, 225, 216],
            cream: [243, 239, 228],
            warning: [155, 104, 61],
            danger: [151, 76, 71]
        };

        const normalized = normalizeResult(result);
        let y = 18;
        let sectionNumber = 0;

        const safeArray = value => Array.isArray(value) ? value : [];

        function clean(value) {
            if (value === null || value === undefined) return "";
            if (typeof value === "string") return value.trim();
            if (typeof value === "number" || typeof value === "boolean") {
                return String(value);
            }
            return formatItem(value);
        }

        function formatItem(item) {
            if (item === null || item === undefined) return "";

            if (typeof item === "string" || typeof item === "number") {
                return String(item);
            }

            if (typeof item !== "object") return "";

            const title =
                item.name ||
                item.product ||
                item.product_name ||
                item.step ||
                item.title ||
                item.ingredient ||
                item.active ||
                "";

            const description =
                item.description ||
                item.reason ||
                item.message ||
                item.details ||
                item.explanation ||
                item.recommendation ||
                item.note ||
                "";

            if (title && description) {
                return `${title}: ${description}`;
            }

            if (title || description) {
                return String(title || description);
            }

            return Object.entries(item)
                .filter(([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    typeof value !== "object"
                )
                .map(([key, value]) => {
                    const label = key.replace(/_/g, " ");
                    return `${label}: ${value}`;
                })
                .join(" | ");
        }

        function setText(color) {
            doc.setTextColor(...color);
        }

        function setFill(color) {
            doc.setFillColor(...color);
        }

        function ensureSpace(height = 12) {
            if (y + height > H - 19) {
                doc.addPage();
                y = 23;
            }
        }

        function paragraph(text, options = {}) {
            const value = clean(text);
            if (!value) return;

            const size = options.size || 9.5;
            const indent = options.indent || 0;
            const width = CONTENT - indent;
            const lineHeight = options.lineHeight || size * 0.48;

            doc.setFont(
                "helvetica",
                options.bold ? "bold" : "normal"
            );
            doc.setFontSize(size);
            setText(options.color || C.ink);

            const lines = doc.splitTextToSize(value, width);
            const height = lines.length * lineHeight + 2;

            ensureSpace(height);
            doc.text(lines, M + indent, y);
            y += height;
        }

        function pill(text, x, top, width, height = 7) {
            setFill(C.lightSage);
            doc.roundedRect(x, top, width, height, 2, 2, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            setText(C.sage);
            doc.text(text.toUpperCase(), x + 3, top + 4.6);
        }

        function section(title, subtitle = "") {
            sectionNumber += 1;

            ensureSpace(subtitle ? 24 : 18);
            y += 4;

            pill(String(sectionNumber).padStart(2, "0"), M, y - 4, 10);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            setText(C.ink);
            doc.text(title.toUpperCase(), M + 14, y + 1);

            y += 6;

            if (subtitle) {
                paragraph(subtitle, {
                    size: 8.5,
                    color: C.muted
                });
            }

            doc.setDrawColor(...C.line);
            doc.setLineWidth(0.3);
            doc.line(M, y, W - M, y);
            y += 5;
        }

        function itemCard(item, index, label) {
            const text = formatItem(item);
            if (!text) return;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.2);

            const lines = doc.splitTextToSize(text, CONTENT - 19);
            const cardHeight = Math.max(15, lines.length * 4.5 + 8);

            ensureSpace(cardHeight + 3);

            setFill(C.white);
            doc.setDrawColor(...C.line);
            doc.setLineWidth(0.25);
            doc.roundedRect(
                M, y, CONTENT, cardHeight, 2, 2, "FD"
            );

            setFill(C.lightSage);
            doc.circle(M + 6, y + 7, 3, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            setText(C.sage);
            doc.text(String(index + 1), M + 6, y + 8, {
                align: "center"
            });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.2);
            setText(C.ink);
            doc.text(lines, M + 13, y + 6);

            y += cardHeight + 3;
        }

        function itemList(items, emptyMessage) {
            const list = safeArray(items).filter(item => formatItem(item));

            if (!list.length) {
                paragraph(emptyMessage || "No items were provided.", {
                    size: 9,
                    color: C.muted
                });
                return;
            }

            list.forEach((item, index) => itemCard(item, index, ""));
        }

        function profileCard(label, value, x, top, width) {
            setFill(C.white);
            doc.setDrawColor(...C.line);
            doc.roundedRect(x, top, width, 22, 2, 2, "FD");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            setText(C.muted);
            doc.text(label.toUpperCase(), x + 4, top + 7);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            setText(C.ink);

            const lines = doc.splitTextToSize(
                String(value || "Not specified"),
                width - 8
            );

            doc.text(lines.slice(0, 2), x + 4, top + 14);
        }

        function productName(product) {
            if (typeof product === "string") return product;

            if (!product || typeof product !== "object") {
                return clean(product);
            }

            return (
                product.name ||
                product.product_name ||
                product.product ||
                product.input ||
                product.original_name ||
                product.ingredient ||
                formatItem(product)
            );
        }

        // --------------------------------------------------
        // REPORT COVER / HEADER
        // --------------------------------------------------

        setFill(C.paper);
        doc.rect(0, 0, W, H, "F");

        setFill(C.sage);
        doc.rect(0, 0, W, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        setText(C.ink);
        doc.text("GLOWITHM", M, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        setText(C.sage);
        doc.text("AI SKINCARE INTELLIGENCE", M, 24);

        doc.setDrawColor(...C.line);
        doc.line(M, 29, W - M, 29);

        y = 41;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        setText(C.ink);
        doc.text("Your Skin,", M, y);
        y += 10;
        setText(C.sage);
        doc.text("understood.", M, y);
        y += 9;

        paragraph(
            "A personalized skincare routine created around your skin type, concerns, and existing products.",
            { size: 10, color: C.muted }
        );

        y += 3;
        pill(
            `GENERATED ${new Date().toLocaleDateString("en-GB")}`,
            M, y, 49
        );
        y += 17;

        // --------------------------------------------------
        // SKIN PROFILE
        // --------------------------------------------------

        section("Your Skin Profile");

        const concerns = safeArray(profile.concerns);
        const selectedProducts = safeArray(profile.products);
        const parsedProducts = safeArray(normalized.parsedProducts);

        const skinType = profile.skinType || "Not specified";
        const concernText = concerns.length
            ? concerns.join(", ")
            : "Not specified";

        const productCount = selectedProducts.length
            ? selectedProducts.length
            : parsedProducts.length;

        const gap = 3;
        const cardWidth = (CONTENT - gap * 2) / 3;

        profileCard("Skin type", skinType, M, y, cardWidth);
        profileCard(
            "Products analyzed",
            productCount,
            M + cardWidth + gap,
            y,
            cardWidth
        );
        profileCard(
            "Concerns selected",
            concerns.length || "None listed",
            M + (cardWidth + gap) * 2,
            y,
            cardWidth
        );

        y += 28;

        paragraph(`Your concerns: ${concernText}`, {
            size: 8.5,
            color: C.muted
        });

        if (profile.pregnant || normalized.pregnancyMode) {
            paragraph(
                "Pregnancy / breastfeeding: yes. Retinoids were left out of this routine.",
                { size: 8.5, color: C.muted }
            );
        }

        if (normalized.summary) {
            y += 2;
            paragraph(normalized.summary, { size: 9.5 });
        }

        if (normalized.degradedMode) {
            paragraph(
                "Note: the AI model was unavailable, so this routine uses Glowithm's built-in safety rules.",
                { size: 8.5, color: C.muted }
            );
        }

        // --------------------------------------------------
        // MORNING AND NIGHT ROUTINES
        // --------------------------------------------------

        section(
            "Morning Routine",
            "Your daytime steps, in the order to apply them."
        );

        itemList(
            normalized.morning,
            "No morning steps were returned for this routine."
        );

        section(
            "Night Routine",
            "Your evening steps, in the order to apply them."
        );

        itemList(
            normalized.night,
            "No night steps were returned for this routine."
        );

        if (safeArray(normalized.alternateNights).length) {
            section(
                "Alternate-Night Routine",
                "Follow these steps on the nights specified in your routine."
            );

            itemList(normalized.alternateNights);
        }

        // --------------------------------------------------
        // WEEKLY SCHEDULE
        // --------------------------------------------------

        const scheduleRows = Utils.weeklyScheduleRows(normalized.weeklySchedule);

        if (scheduleRows.length) {
            section(
                "Weekly Active Schedule",
                "Use one strong active per night, on these nights. On other nights, cleanse and moisturize only."
            );
            scheduleRows.forEach((row, index) => {
                itemCard(`${row.day}: ${row.text}`, index, "");
            });
        }

        // --------------------------------------------------
        // INGREDIENT INTELLIGENCE
        // --------------------------------------------------

        section(
            "Ingredient Intelligence",
            "Compatibility information from your analysis."
        );

        const conflicts = safeArray(normalized.conflicts);
        const combinations = safeArray(normalized.beneficialCombinations);

        if (!conflicts.length) {
            setFill(C.lightSage);
            doc.roundedRect(M, y, CONTENT, 15, 2, 2, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            setText(C.sage);
            doc.text("NO REPORTED CONFLICTS", M + 4, y + 6);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            setText(C.ink);
            doc.text(
                "No major ingredient conflicts were detected in this analysis.",
                M + 4, y + 11
            );

            y += 19;
        } else {
            conflicts.forEach((item, index) => {
                itemCard(item, index, "");
            });
        }

        if (combinations.length) {
            y += 2;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            setText(C.sage);
            doc.text("BENEFICIAL COMBINATIONS", M, y + 2);
            y += 7;

            itemList(combinations);
        }

        // --------------------------------------------------
        // PERSONALIZED TIPS
        // --------------------------------------------------

        if (safeArray(normalized.tips).length) {
            section(
                "Personalized Tips",
                "Small, consistent habits to support your routine."
            );

            normalized.tips.forEach((tip, index) => {
                ensureSpace(17);

                pill("TIP", M, y, 10);
                y += 10;

                paragraph(formatItem(tip), { size: 9.2 });
                y += 1;
            });
        }

        // --------------------------------------------------
        // PRODUCTS ANALYZED
        // --------------------------------------------------

        const productsToShow = parsedProducts.length
            ? parsedProducts
            : selectedProducts;

        if (productsToShow.length) {
            section(
                "Products Analyzed",
                "Products supplied for this skincare assessment."
            );

            productsToShow.forEach((product, index) => {
                const name = productName(product);
                if (!name) return;

                itemCard(name, index, "");

                if (product && typeof product === "object") {
                    const details = [
                        product.type ? `Type: ${product.type}` : "",
                        product.ingredient
                            ? `Ingredient: ${product.ingredient}`
                            : "",
                        product.confidence
                            ? `Recognition confidence: ${product.confidence}`
                            : ""
                    ].filter(Boolean).join(" | ");

                    if (details) {
                        paragraph(details, {
                            size: 8,
                            color: C.muted,
                            indent: 4
                        });
                    }
                }
            });
        }

        // --------------------------------------------------
        // SAFETY NOTES
        // --------------------------------------------------

        const safetyGroups = Utils.groupSafetyNotes(normalized.safetyNotes);

        if (safetyGroups.warnings.length || safetyGroups.changes.length) {

            section(
                "Safety Notes",
                "Important guidance from Glowithm's safety checks."
            );

            safetyGroups.warnings.forEach((warning, index) => {
                itemCard(warning, index, "");
            });

            if (safetyGroups.changes.length) {
                y += 2;
                ensureSpace(14);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                setText(C.sage);
                doc.text("CHANGES MADE BY THE SAFETY CHECKS", M, y + 2);
                y += 7;
                itemList(safetyGroups.changes);
            }

        }

        // --------------------------------------------------
        // ABOUT YOUR INGREDIENTS (general information with sources)
        // --------------------------------------------------

        if (normalized.ingredientNotes.length) {

            section(
                "About Your Ingredients",
                "General information, not medical advice. Sources are listed under each ingredient."
            );

            normalized.ingredientNotes.forEach(note => {

                ensureSpace(24);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                setText(C.ink);
                doc.text(Utils.displayIngredientName(note.name), M, y);
                y += 5;

                [
                    ["Potential benefits", note.benefits.slice(0, 2)],
                    ["How to use", note.usage.slice(0, 2)],
                    ["Precautions", note.precautions.slice(0, 3)]
                ].forEach(([label, items]) => {
                    items.forEach(text =>
                        paragraph(`${label}: ${text}`, { size: 8.5, indent: 3 })
                    );
                });

                note.sources.slice(0, 2).forEach(source =>
                    paragraph(
                        `Source: ${source.organization ? source.organization + " - " : ""}${source.title}  ${source.url}`,
                        { size: 7.5, indent: 3, color: C.muted }
                    )
                );

                y += 2;

            });

        }

        // --------------------------------------------------
        // IMPORTANT NOTICE (disclaimer)
        // --------------------------------------------------

        section(Utils.DISCLAIMER_TITLE);
        paragraph(Utils.DISCLAIMER_TEXT, { size: 9 });

        // --------------------------------------------------
        // CLOSING PAGE
        // --------------------------------------------------

        ensureSpace(35);
        y += 7;

        setFill(C.lightSage);
        doc.roundedRect(M, y, CONTENT, 29, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        setText(C.ink);
        doc.text("GLOWITHM", M + 6, y + 9);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Your routine is ready.", M + 6, y + 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setText(C.muted);
        doc.text(
            "Keep it simple. Stay consistent. Give your skin time.",
            M + 6, y + 23
        );

        // --------------------------------------------------
        // PAGE FOOTERS
        // --------------------------------------------------

        const totalPages = doc.internal.getNumberOfPages();

        for (let page = 1; page <= totalPages; page++) {
            doc.setPage(page);

            setFill(C.paper);
            doc.rect(0, H - 13, W, 13, "F");

            doc.setDrawColor(...C.line);
            doc.line(M, H - 13, W - M, H - 13);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            setText(C.muted);

            doc.text(
                `Glowithm - ${Utils.DISCLAIMER_SHORT}`,
                M,
                H - 7
            );

            doc.text(
                `Page ${page} of ${totalPages}`,
                W - M,
                H - 7,
                { align: "right" }
            );
        }

        doc.save("Glowithm-Personalized-Skincare-Routine.pdf");

        console.log("Glowithm: Styled skincare report downloaded.");

    } catch (error) {
        console.error("Glowithm: PDF generation failed:", error);
        notify("Could not generate the PDF. Please try again.", "error");
    }
}





    /* =========================================================
       SAVE ROUTINE BUTTON
    ========================================================= */

    if (saveRoutineBtn) {

        saveRoutineBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                console.log(
                    "Glowithm: Save Routine clicked"
                );

                saveRoutineAsPDF();

            }
        );

    } else {

        console.error(
            "Glowithm: saveRoutineBtn was not found. Check the button ID in analyzer.html."
        );

    }


    /* =========================================================
       ANALYZE AGAIN
    ========================================================= */

    if (analyzeAgainBtn) {

        analyzeAgainBtn.addEventListener(
            "click",
            () => {

                /* Hide results */

                if (resultsSection) {

                    resultsSection.hidden =
                        true;

                    resultsSection.style.display =
                        "";

                }


                /* Show workspace */

                const workspace =
                    document.getElementById(
                        "analyzer-workspace"
                    );


                if (workspace) {

                    workspace.style.display =
                        "";

                }


                /* Reset analyzer */

                analyzerData.skinType =
                    "";

                analyzerData.concerns =
                    [];

                analyzerData.products =
                    [];


                /* Reset stored result */

                window.glowithmResult =
                    null;


                /* Reset skin cards */

                skinCards.forEach(card => {

                    card.classList.remove(
                        "selected"
                    );

                });


                /* Reset concern cards */

                concernCards.forEach(card => {

                    card.classList.remove(
                        "selected"
                    );

                });


                /* Reset pregnancy option */
                analyzerData.pregnant = false;
                syncPregnancyUI();

                /* Reset products */

                if (productList) {

                    productList.innerHTML =
                        "";

                    createEmptyProductState();

                }


                /* Enable analyze button */

                if (analyzeBtn) {

                    analyzeBtn.disabled =
                        false;

                }


                /* Return to Step 1 */

                showStep(1);


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================================================
       INITIAL STATE
    ========================================================= */

    if (resultsSection) {

        resultsSection.hidden =
            true;

    }


    createEmptyProductState();

    showStep(1);


    // Exposed so the Node test-harness (tests/) can drive the page logic.
    window.GlowithmApp = {
        addProduct,
        analyzeSkin,
        showResults,
        normalizeResult,
        saveRoutineAsPDF,
        notify,
        getApiUrl
    };

    console.log(
        "Analyzer initialized successfully."
    );

});