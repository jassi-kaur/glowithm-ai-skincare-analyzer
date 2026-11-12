/* =========================================================
   GLOWITHM ANALYZER UTILITIES
   ---------------------------------------------------------
   Small, side-effect-free helpers used by analyzer.js.
   They live in their own file so they can be unit-tested
   with plain Node (see tests/run_tests.js) without a browser.
========================================================= */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.GlowithmUtils = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {

    const MAX_PRODUCTS = 15;
    const MAX_PRODUCT_LENGTH = 60;
    const ANALYZE_TIMEOUT_MS = 120000;   // local LLMs can be slow on CPU

    const DISCLAIMER_TITLE = "Important notice";
    const DISCLAIMER_TEXT =
        "Glowithm provides general skincare information and is not medical " +
        "advice. It cannot diagnose skin conditions or replace a doctor or " +
        "dermatologist. If you are pregnant or breastfeeding, have a skin " +
        "condition or allergies, or notice a reaction, stop the product and " +
        "speak to a healthcare professional.";
    const DISCLAIMER_SHORT =
        "General skincare guidance, not medical advice.";

    /* ---------------------------------------------------------
       PRODUCTS
       A comma / semicolon / new line separates products (the
       backend splits on the same characters, so the tags the
       user sees always match what is analysed).
    --------------------------------------------------------- */
    function splitProducts(text) {
        const seen = new Set();
        const out = [];
        String(text == null ? "" : text)
            .split(/[,;\n\r]+/)
            .map(part => part.replace(/\s+/g, " ").trim())
            .filter(Boolean)
            .forEach(part => {
                const key = part.toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    out.push(part);
                }
            });
        return out;
    }

    /* ---------------------------------------------------------
       API URL
       1. <meta name="glowithm-api-base" content="https://..."> wins.
       2. Opened from file:// or a local dev server that is NOT
          Flask (Live Server 5500, Vite 5173, ...): call Flask on 5000.
       3. Otherwise (served by Flask, or deployed): same origin.
    --------------------------------------------------------- */
    function resolveApiUrl(loc, metaBase) {
        const base = String(metaBase || "").trim().replace(/\/+$/, "");
        if (base) {
            return base + "/analyze";
        }
        loc = loc || {};
        const host = loc.hostname || "";
        const isLocalHost =
            host === "" || host === "localhost" ||
            host === "127.0.0.1" || host === "[::1]";
        const servedByFlask = String(loc.port) === "5000";

        if (loc.protocol === "file:" || (isLocalHost && !servedByFlask)) {
            return "http://127.0.0.1:5000/analyze";
        }
        return "/analyze";
    }

    /* ---------------------------------------------------------
       ERROR MESSAGES
    --------------------------------------------------------- */
    function describeError(error) {
        const message = error && error.message ? String(error.message) : "";
        const name = error && error.name;

        if (name === "AbortError") {
            return "Glowithm is taking longer than expected. The AI model " +
                "may still be warming up, so please wait a moment and try again.";
        }
        if (error && error.status) {
            // Messages from our own API (400 validation, 429 rate limit, 500)
            return message || `The server returned an error (${error.status}).`;
        }
        if (name === "SyntaxError") {
            return "The server sent an unexpected response. Please try again.";
        }
        if (name === "TypeError" || /failed to fetch|networkerror|load failed/i.test(message)) {
            return "Can't reach the Glowithm server. Make sure the backend " +
                "is running, then try again.";
        }
        return message || "Something went wrong while analyzing your skin. Please try again.";
    }

    /* ---------------------------------------------------------
       SAFETY NOTES
       The backend's `safety_notes` object also carries internal
       bookkeeping (spf_added, tips_refined, ...). Only these two
       lists are meant for people:
         warnings - excluding "Conflict detected:" lines, which
                    already appear in the ingredient-conflict card
         changes  - what the safety engine adjusted
    --------------------------------------------------------- */
    function groupSafetyNotes(notes) {
        const clean = list => Array.isArray(list)
            ? [...new Set(list.filter(item => typeof item === "string" && item.trim()))]
            : [];
        const source = notes && typeof notes === "object" ? notes : {};
        return {
            warnings: clean(source.warnings).filter(
                w => !w.trim().toLowerCase().startsWith("conflict detected:")
            ),
            changes: clean(source.applied_edits)
        };
    }

    /* ---------------------------------------------------------
       WEEKLY SCHEDULE -> ordered rows [{day, text}]
    --------------------------------------------------------- */
    function weeklyScheduleRows(schedule) {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
            return [];
        }
        return days
            .filter(day => Array.isArray(schedule[day]) && schedule[day].length > 0)
            .map(day => ({ day, text: schedule[day].join(", ") }));
    }

    /* ---------------------------------------------------------
       INGREDIENT NOTES (from the API's `ingredient_notes`)
       Only https links are kept: a source URL is data from a file
       and must never become a javascript: or http: link.
    --------------------------------------------------------- */
    function safeHttpsUrl(url) {
        try {
            const parsed = new URL(String(url));
            return parsed.protocol === "https:" ? parsed.href : "";
        } catch (error) {
            return "";
        }
    }

    function textList(value) {
        return Array.isArray(value)
            ? value.filter(item => typeof item === "string" && item.trim()).map(item => item.trim())
            : [];
    }

    function displayIngredientName(name) {
        const special = { aha: "AHA", bha: "BHA" };
        const text = String(name || "").trim();
        if (special[text.toLowerCase()]) {
            return special[text.toLowerCase()];
        }
        return text.replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function normalizeIngredientNotes(notes) {
        if (!Array.isArray(notes)) {
            return [];
        }
        return notes
            .filter(note => note && typeof note === "object" && typeof note.name === "string" && note.name.trim())
            .map(note => ({
                name: note.name.trim(),
                benefits: textList(note.benefits),
                usage: textList(note.usage),
                precautions: textList(note.precautions),
                sources: (Array.isArray(note.sources) ? note.sources : [])
                    .map(source => ({
                        title: String((source && source.title) || "").trim(),
                        organization: String((source && source.organization) || "").trim(),
                        url: safeHttpsUrl(source && source.url)
                    }))
                    .filter(source => source.url)
            }));
    }

    return {
        safeHttpsUrl,
        displayIngredientName,
        normalizeIngredientNotes,
        MAX_PRODUCTS,
        MAX_PRODUCT_LENGTH,
        ANALYZE_TIMEOUT_MS,
        DISCLAIMER_TITLE,
        DISCLAIMER_TEXT,
        DISCLAIMER_SHORT,
        splitProducts,
        resolveApiUrl,
        describeError,
        groupSafetyNotes,
        weeklyScheduleRows
    };
});
