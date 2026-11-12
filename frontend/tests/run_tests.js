/*
 * Frontend tests -- plain Node, no dependencies.
 *     node tests/run_tests.js
 * Loads the REAL js/analyzer.js against a DOM stub, with fetch() and jsPDF
 * replaced by recording stand-ins.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const { installDom, RecordingPDF } = require("./dom-stub");
const Utils = require(path.join(ROOT, "js/analyzer-utils.js"));
const Pairing = require(path.join(ROOT, "js/pairing-resolver.js"));

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/* ------------------------------------------------------------------ utils */
test("splitProducts: commas, semicolons, new lines, whitespace, duplicates", () => {
    assert.deepStrictEqual(
        Utils.splitProducts("CeraVe, Hydrating   Cleanser; retinol serum\n cerave ,"),
        ["CeraVe", "Hydrating Cleanser", "retinol serum"]);
    assert.deepStrictEqual(Utils.splitProducts("  ,; "), []);
    assert.deepStrictEqual(Utils.splitProducts(null), []);
});

test("resolveApiUrl: meta override, Live Server, other dev ports, file://, Flask, deployed", () => {
    const r = (loc, meta) => Utils.resolveApiUrl(loc, meta);
    const local = port => ({ protocol: "http:", hostname: "127.0.0.1", port });
    assert.strictEqual(r(local("5500")), "http://127.0.0.1:5000/analyze");
    assert.strictEqual(r(local("5173")), "http://127.0.0.1:5000/analyze");
    assert.strictEqual(r(local("3000")), "http://127.0.0.1:5000/analyze");
    assert.strictEqual(r({ protocol: "file:", hostname: "", port: "" }), "http://127.0.0.1:5000/analyze");
    assert.strictEqual(r(local("5000")), "/analyze");
    assert.strictEqual(r({ protocol: "https:", hostname: "glowithm.example.com", port: "" }), "/analyze");
    assert.strictEqual(r(local("5500"), "https://api.example.com/"), "https://api.example.com/analyze");
});

test("describeError: timeout, offline, API errors, bad JSON", () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    assert.match(Utils.describeError(abort), /taking longer than expected/);
    assert.match(Utils.describeError(new TypeError("Failed to fetch")), /Can't reach the Glowithm server/);
    assert.strictEqual(Utils.describeError(Object.assign(new Error("Too many requests."), { status: 429 })), "Too many requests.");
    assert.match(Utils.describeError(new SyntaxError("Unexpected token <")), /unexpected response/);
    assert.match(Utils.describeError(undefined), /Something went wrong/);
});

test("groupSafetyNotes hides internal keys and conflict lines", () => {
    const g = Utils.groupSafetyNotes({
        warnings: ["Conflict detected: A + B", "Retinoid detected.", "Retinoid detected."],
        applied_edits: ["Moved X", "Moved X"], spf_added: true, tips_refined: ["Added tip for retinol: x"]
    });
    assert.deepStrictEqual(g.warnings, ["Retinoid detected."]);
    assert.deepStrictEqual(g.changes, ["Moved X"]);
    assert.deepStrictEqual(Utils.groupSafetyNotes(null), { warnings: [], changes: [] });
});

test("weeklyScheduleRows is ordered and ignores junk", () => {
    assert.deepStrictEqual(
        Utils.weeklyScheduleRows({ Fri: ["Retinol"], Mon: ["Salicylic Acid", "X"], Foo: ["no"], Tue: [] }),
        [{ day: "Mon", text: "Salicylic Acid, X" }, { day: "Fri", text: "Retinol" }]);
    assert.deepStrictEqual(Utils.weeklyScheduleRows([]), []);
});

/* --------------------------------------------------------------- pairing */
const pairData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/ingredient_pairs.json"), "utf8"));
const localRules = {
    "retinol+salicylicAcid": { status: "caution", title: "Use With Caution", description: "local", tags: [] },
    "niacinamide+hyaluronicAcid": { status: "great", title: "Great Pair", description: "local great", tags: [] },
    "retinol+aha": { status: "avoid", title: "Avoid Layering", description: "local avoid", tags: [] }
};
const status = (a, b) => Pairing.resolvePairing(a, b, pairData, localRules).status;

test("pairing: the two pairs the site used to get wrong now match the backend", () => {
    assert.strictEqual(status("salicylicAcid", "vitaminC"), "caution");   // was "Generally Compatible"
    assert.strictEqual(status("vitaminC", "salicylicAcid"), "caution");   // order does not matter
    assert.strictEqual(status("retinol", "vitaminC"), "caution");
});

test("pairing: every pair selectable on the page has an answer from the shared data", () => {
    const ui = ["ceramides", "hyaluronicAcid", "niacinamide", "retinol", "salicylicAcid", "vitaminC"];
    for (let i = 0; i < ui.length; i++) for (let j = i + 1; j < ui.length; j++) {
        const res = Pairing.resolvePairing(ui[i], ui[j], pairData, {});
        assert.notStrictEqual(res.title, "No Specific Guidance", `${ui[i]}+${ui[j]} fell through to "no data"`);
    }
});

test("pairing: data wins over the page's own text; page wording kept when they agree", () => {
    assert.strictEqual(Pairing.resolvePairing("retinol", "salicylicAcid", pairData, localRules).description, "local");
    assert.strictEqual(status("niacinamide", "hyaluronicAcid"), "great");
    const aha = Pairing.resolvePairing("retinol", "aha", pairData, localRules);   // data says CAUTION, page said avoid
    assert.strictEqual(aha.status, "caution");
    assert.notStrictEqual(aha.description, "local avoid");
});

test("pairing: unknown pair is honest, and works when the JSON failed to load", () => {
    assert.strictEqual(Pairing.resolvePairing("centella", "retinol", pairData, {}).title, "No Specific Guidance");
    assert.strictEqual(Pairing.resolvePairing("retinol", "salicylicAcid", null, localRules).description, "local");
});

test("pairing: generic results are copies (the shared objects are never mutated)", () => {
    const a = Pairing.resolvePairing("retinol", "aha", pairData, {});
    a.title = "changed";
    assert.strictEqual(Pairing.GENERIC.caution.title, "Use With Caution");
});

/* ------------------------------------------------------- page, end to end */
const SAMPLE_RESULT = {
    routine: {
        morning: ["Cleanser", "Moisturizer", "Sunscreen SPF 30+"],
        night: ["Cleanser", "Retinol serum", "Moisturizer"],
        alternate_nights: [], conflicts: ["Retinol + Salicylic Acid: use with caution."],
        beneficial_combinations: [], tips: ["Apply moisturizer after cleansing."],
        weekly_schedule: { Mon: ["Retinol"], Fri: ["Retinol"], Wed: ["Salicylic Acid"] },
        summary: "A simple combination skin routine focused on acne and breakouts."
    },
    safety_notes: {
        warnings: ["Conflict detected: Retinol + Salicylic Acid: use with caution.",
                   "Retinoid detected: avoid use during pregnancy."],
        applied_edits: ["Added broad-spectrum SPF 30+ as a daily morning step."],
        spf_added: true, tips_refined: ["Added tip for retinol: Start 1-2x/week"]
    },
    parsed_products: [{ type: "serum", ingredient: "retinol", confidence: "high", original_input: "retinol serum" }],
    ingredient_notes: [
        { name: "retinol", category: "retinoid", benefits: ["May help improve uneven skin tone."],
          usage: ["Introduce cautiously."], precautions: ["Avoid retinoids during pregnancy."],
          sources: [{ title: "Retinoid or retinol?", organization: "AAD", url: "https://www.aad.org/retinoids" }] },
        { name: "aha", category: "alpha_hydroxy_acid", benefits: ["Exfoliates."], usage: [], precautions: [],
          sources: [] }
    ],
    degraded_mode: false, pregnancy_mode: false
};

function bootPage(opts = {}) {
    const env = require("./dom-stub").installDom({ location: opts.location });
    delete require.cache[require.resolve(path.join(ROOT, "js/analyzer-utils.js"))];
    global.GlowithmUtils = require(path.join(ROOT, "js/analyzer-utils.js"));
    const code = fs.readFileSync(path.join(ROOT, "js/analyzer.js"), "utf8");
    vm.runInThisContext(code, { filename: "analyzer.js" });
    const origLog = console.log;
    console.log = () => {};                                   // the page logs a lot
    try { env.docListeners.DOMContentLoaded.forEach(fn => fn()); } finally { console.log = origLog; }
    return env;
}
const quiet = async fn => { const l = console.log, e = console.error; console.log = () => {}; console.error = () => {}; try { return await fn(); } finally { console.log = l; console.error = e; } };
const toasts = env => (env.byId["glowithm-toasts"] ? env.byId["glowithm-toasts"].children : []);
const toastText = env => toasts(env).map(t => t.textContent);

test("page: product box splits commas into separate tags and clears the input", async () => {
    const env = bootPage();
    const input = env.byId["product-input"];
    input.value = "CeraVe cleanser, retinol serum; ceramide cream";
    await quiet(() => window.GlowithmApp.addProduct());
    assert.deepStrictEqual(window.glowithmAnalyzerData.products, ["CeraVe cleanser", "retinol serum", "ceramide cream"]);
    assert.strictEqual(env.byId["product-list"].children.length, 3);
    assert.strictEqual(input.value, "");
});

test("page: over-long names and the 15-product cap show a message instead of failing silently", async () => {
    const env = bootPage();
    env.byId["product-input"].value = "x".repeat(61);
    await quiet(() => window.GlowithmApp.addProduct());
    assert.strictEqual(window.glowithmAnalyzerData.products.length, 0);
    assert.match(toastText(env)[0], /too long/);

    for (let i = 0; i < 15; i++) { env.byId["product-input"].value = `product ${i}`; await quiet(() => window.GlowithmApp.addProduct()); }
    env.byId["product-input"].value = "one too many";
    await quiet(() => window.GlowithmApp.addProduct());
    assert.strictEqual(window.glowithmAnalyzerData.products.length, 15);
    assert.ok(toastText(env).some(t => /up to 15 products/.test(t)));
});

test("page: pregnancy checkbox updates state and note, and Analyze Again resets it", async () => {
    const env = bootPage();
    const box = env.byId["pregnancy-checkbox"];
    box.checked = true;
    await box.dispatch("change");
    assert.strictEqual(window.glowithmAnalyzerData.pregnant, true);
    assert.strictEqual(env.byId["summary-pregnancy-note"].hidden, false);
    await quiet(() => env.byId["analyzeAgainBtn"].dispatch("click"));
    assert.strictEqual(window.glowithmAnalyzerData.pregnant, false);
    assert.strictEqual(box.checked, false);
    assert.strictEqual(env.byId["summary-pregnancy-note"].hidden, true);
});

test("page: request goes to the right URL and carries the pregnancy flag", async () => {
    const env = bootPage({ location: { protocol: "http:", hostname: "localhost", port: "5173", pathname: "/" } });
    Object.assign(window.glowithmAnalyzerData, { skinType: "Dry", concerns: ["Dryness & Dehydration"], products: ["retinol serum"], pregnant: true });
    let seen;
    global.fetch = async (url, init) => { seen = { url, body: String(init.body), signal: init.signal }; return { ok: true, json: async () => SAMPLE_RESULT }; };
    await quiet(() => window.GlowithmApp.analyzeSkin());
    assert.strictEqual(seen.url, "http://127.0.0.1:5000/analyze");
    const params = new URLSearchParams(seen.body);
    assert.strictEqual(params.get("pregnant"), "true");
    assert.strictEqual(params.get("skin_type"), "Dry");
    assert.strictEqual(params.get("products"), "retinol serum");
    assert.ok(seen.signal, "a timeout signal must be attached");
    assert.deepStrictEqual(toasts(env), []);
    assert.strictEqual(env.byId["morningRoutine"].children.length, 3);          // results were rendered
});

test("page: failures become readable messages (offline, 429, bad JSON, timeout) and the button is usable again", async () => {
    const cases = [
        [async () => { throw new TypeError("Failed to fetch"); }, /Can't reach the Glowithm server/],
        [async () => ({ ok: false, status: 429, json: async () => ({ error: "Too many requests. Please wait a minute and try again." }) }), /Too many requests/],
        [async () => ({ ok: false, status: 500, json: async () => { throw new SyntaxError("not json"); } }), /Server error: 500/],
        [async () => ({ ok: true, json: async () => { throw new SyntaxError("Unexpected token <"); } }), /unexpected response/],
        [(url, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })))), /taking longer than expected/]
    ];
    for (const [impl, expected] of cases) {
        const env = bootPage();
        Object.assign(window.glowithmAnalyzerData, { skinType: "Oily", concerns: ["Acne & Breakouts"], products: [] });
        window.GlowithmUtils.ANALYZE_TIMEOUT_MS = 30;
        global.fetch = impl;
        await quiet(() => window.GlowithmApp.analyzeSkin());
        assert.match(toastText(env).join(" "), expected);
        assert.strictEqual(env.byId["analyze-btn"].disabled, false);
        assert.strictEqual(toasts(env)[0].getAttribute("role"), "alert");
    }
});

test("page: safety panel shows warnings + changes only (no SPF banner, no internal keys, no duplicates)", async () => {
    const env = bootPage();
    Object.assign(window.glowithmAnalyzerData, { skinType: "Oily", concerns: ["Acne & Breakouts"], products: [] });
    global.fetch = async () => ({ ok: true, json: async () => SAMPLE_RESULT });
    await quiet(() => window.GlowithmApp.analyzeSkin());
    const panel = env.byId["safety-notes"].textContent;
    assert.match(panel, /Retinoid detected: avoid use during pregnancy/);
    assert.match(panel, /Added broad-spectrum SPF 30\+ as a daily morning step/);
    assert.doesNotMatch(panel, /SPF Applied|photosensitive|Personalized Tips|Added tip for|Conflict detected/);
    assert.strictEqual(env.byId["safety-notes"].style.display, "block");
    await quiet(() => window.GlowithmApp.showResults({ routine: { morning: ["A"], night: ["B"] }, safety_notes: { spf_added: true, tips_refined: ["Added tip for x"] } }));
    assert.strictEqual(env.byId["safety-notes"].style.display, "none");        // nothing human-facing -> hidden
});

test("page: disclaimer text is injected wherever data-disclaimer appears", () => {
    const env = require("./dom-stub").installDom();
    const el = new (require("./dom-stub").StubElement)("p");
    env.lists["[data-disclaimer]"] = [el];
    global.GlowithmUtils = Utils;
    vm.runInThisContext(fs.readFileSync(path.join(ROOT, "js/analyzer.js"), "utf8"), { filename: "analyzer.js" });
    const l = console.log; console.log = () => {};
    try { env.docListeners.DOMContentLoaded.forEach(fn => fn()); } finally { console.log = l; }
    assert.match(el.textContent, /not medical advice/);
    assert.strictEqual(el.textContent, Utils.DISCLAIMER_TEXT);
});

test("utils: safeHttpsUrl keeps only https links", () => {
    assert.strictEqual(Utils.safeHttpsUrl("https://www.aad.org/x"), "https://www.aad.org/x");
    for (const bad of ["http://insecure.example", "javascript:alert(1)", "data:text/html,x", "//evil.example", "", null, "not a url"]) {
        assert.strictEqual(Utils.safeHttpsUrl(bad), "", String(bad));
    }
});

test("utils: normalizeIngredientNotes drops junk and unsafe sources, keeps good data", () => {
    const notes = Utils.normalizeIngredientNotes([
        { name: " retinol ", benefits: ["a", "", 5], sources: [{ title: "T", organization: "O", url: "https://ok.example/p" },
                                                            { title: "bad", url: "javascript:alert(1)" }, null] },
        { name: "" }, null, "x", { benefits: ["no name"] }
    ]);
    assert.strictEqual(notes.length, 1);
    assert.deepStrictEqual(notes[0].benefits, ["a"]);
    assert.deepStrictEqual(notes[0].sources, [{ title: "T", organization: "O", url: "https://ok.example/p" }]);
    assert.deepStrictEqual(Utils.normalizeIngredientNotes("nope"), []);
    assert.strictEqual(Utils.displayIngredientName("vitamin c"), "Vitamin C");
    assert.strictEqual(Utils.displayIngredientName("aha"), "AHA");
});

async function showSample(result) {
    const env = bootPage();
    Object.assign(window.glowithmAnalyzerData, { skinType: "Oily", concerns: ["Acne & Breakouts"], products: [] });
    global.fetch = async () => ({ ok: true, json: async () => result });
    await quiet(() => window.GlowithmApp.analyzeSkin());
    return env;
}
const walk = (el, fn) => { fn(el); el.children.forEach(c => walk(c, fn)); };

test("page: summary and ingredient notes are shown, sources are safe links, nothing uses innerHTML for API text", async () => {
    const env = await showSample(SAMPLE_RESULT);
    assert.strictEqual(env.byId["routineSummaryBlock"].hidden, false);
    assert.strictEqual(env.byId["routineSummaryText"].textContent, SAMPLE_RESULT.routine.summary);
    const list = env.byId["ingredientNotesList"];
    assert.strictEqual(env.byId["ingredientNotesBlock"].hidden, false);
    assert.strictEqual(list.children.length, 2);
    assert.strictEqual(list.children[0].open, true);                       // first one is expanded
    assert.match(list.children[0].textContent, /Retinol/);
    assert.match(list.children[0].textContent, /Avoid retinoids during pregnancy/);
    assert.strictEqual(list.children[1].textContent.startsWith("AHA"), true);
    const links = [];
    walk(list, el => { if (el.tagName === "A") links.push(el); });
    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].href, "https://www.aad.org/retinoids");
    assert.strictEqual(links[0].rel, "noopener noreferrer");
    assert.strictEqual(links[0].target, "_blank");
    walk(list, el => assert.strictEqual(el.innerHTML, "", "innerHTML must not be used for API text"));
});

test("page: hostile ingredient notes cannot inject markup or unsafe links", async () => {
    const evil = { ...SAMPLE_RESULT, ingredient_notes: [{ name: "<img src=x onerror=alert(1)>", benefits: ["<script>alert(1)</script>"], usage: [], precautions: [],
        sources: [{ title: "x", organization: "y", url: "javascript:alert(1)" }, { title: "ok", organization: "o", url: "https://ok.example" }] }] };
    const env = await showSample(evil);
    const list = env.byId["ingredientNotesList"];
    assert.ok(list.textContent.toLowerCase().includes("<img src=x onerror=alert(1)>"));   // shown as plain text
    walk(list, el => assert.ok(!["IMG", "SCRIPT"].includes(el.tagName), "no element may be created from API text"));
    const hrefs = [];
    walk(list, el => { if (el.tagName === "A") hrefs.push(el.href); });
    assert.deepStrictEqual(hrefs, ["https://ok.example/"]);
    walk(list, el => assert.strictEqual(el.innerHTML, ""));
});

test("page: summary, notes and the built-in notice hide when absent and never leave stale content", async () => {
    const env = await showSample(SAMPLE_RESULT);
    assert.strictEqual(env.byId["ingredientNotesBlock"].hidden, false);
    global.fetch = async () => ({ ok: true, json: async () => ({ routine: { morning: ["A"], night: ["B"] }, safety_notes: {} }) });
    await quiet(() => window.GlowithmApp.analyzeSkin());
    assert.strictEqual(env.byId["ingredientNotesBlock"].hidden, true);
    assert.strictEqual(env.byId["ingredientNotesList"].children.length, 0);
    assert.strictEqual(env.byId["routineSummaryBlock"].hidden, true);
    assert.strictEqual(env.byId["degradedBanner"].hidden, true);
});

test("page: built-in routine banner appears only in degraded mode", async () => {
    let env = await showSample({ ...SAMPLE_RESULT, degraded_mode: true });
    assert.strictEqual(env.byId["degradedBanner"].hidden, false);
    env = await showSample({ ...SAMPLE_RESULT, degraded_mode: false });
    assert.strictEqual(env.byId["degradedBanner"].hidden, true);
});

/* ------------------------------------------------------------------- PDF */
async function makePdf(result, profile) {
    bootPage();
    const pdfs = [];
    global.jspdf = { jsPDF: function () { const d = new RecordingPDF(); pdfs.push(d); return d; } };
    global.glowithmResult = result;
    Object.assign(window.glowithmAnalyzerData, { skinType: "Combination", concerns: ["Acne & Breakouts"], products: ["retinol serum"], ...profile });
    const msgs = [];
    await quiet(() => window.GlowithmApp.saveRoutineAsPDF());
    assert.strictEqual(pdfs.length, 1, "PDF was not generated");
    return pdfs[0];
}

test("PDF: has the weekly schedule, clean safety notes, disclaimer and footer", async () => {
    const pdf = await makePdf(SAMPLE_RESULT, {});
    const text = pdf.allText;
    assert.strictEqual(pdf.saved, "Glowithm-Personalized-Skincare-Routine.pdf");
    assert.match(text, /WEEKLY ACTIVE SCHEDULE/);
    assert.match(text, /Mon: Retinol/);
    assert.match(text, /Wed: Salicylic Acid/);
    assert.match(text, /Retinoid detected: avoid use during pregnancy/);
    assert.match(text, /CHANGES MADE BY THE SAFETY CHECKS/);
    assert.match(text, /Added broad-spectrum SPF 30\+/);
    assert.ok(text.includes("IMPORTANT NOTICE"));
    // the FULL notice must be in the body (the footer alone also says "not medical advice")
    assert.ok(text.replace(/\s+/g, " ").includes(Utils.DISCLAIMER_TEXT), "full disclaimer missing from the PDF body");
    assert.match(text, /Glowithm - General skincare guidance, not medical advice\./);   // footer
    assert.doesNotMatch(text, /Spf Added|Tips Refined|Applied Edits|Added tip for/);
    assert.doesNotMatch(text, /Conflict detected/);                           // conflicts have their own section
    assert.match(text, /Retinol \+ Salicylic Acid: use with caution/);
});

test("PDF: includes the summary, ingredient notes with sources, and the built-in notice when relevant", async () => {
    const pdf = await makePdf({ ...SAMPLE_RESULT, degraded_mode: true }, {});
    const text = pdf.allText.replace(/\s+/g, " ");
    assert.match(text, /A simple combination skin routine focused on acne and breakouts/);
    assert.match(text, /ABOUT YOUR INGREDIENTS/);
    assert.match(text, /Retinol/);
    assert.match(text, /Precautions: Avoid retinoids during pregnancy/);
    assert.match(text, /Source: AAD - Retinoid or retinol\?\s+https:\/\/www\.aad\.org\/retinoids/);
    assert.match(text, /AI model was unavailable/);
    const clean = await makePdf(SAMPLE_RESULT, {});
    assert.doesNotMatch(clean.allText, /AI model was unavailable/);
});

test("PDF: unsafe source links never reach the PDF", async () => {
    const evil = { ...SAMPLE_RESULT, ingredient_notes: [{ name: "x", benefits: ["b"], usage: [], precautions: [],
        sources: [{ title: "bad", organization: "o", url: "javascript:alert(1)" }] }] };
    assert.doesNotMatch((await makePdf(evil, {})).allText, /javascript:/);
});

test("PDF: no schedule/safety sections when there is nothing to show, but the notice is always there", async () => {
    const pdf = await makePdf({ routine: { morning: ["Cleanser"], night: ["Cleanser"] }, safety_notes: { spf_added: true, tips_refined: ["Added tip for x"] } }, {});
    assert.doesNotMatch(pdf.allText, /WEEKLY ACTIVE SCHEDULE|SAFETY NOTES|CHANGES MADE/);
    assert.match(pdf.allText, /IMPORTANT NOTICE/);
});

test("PDF: pregnancy line appears only when pregnancy mode was used", async () => {
    assert.match((await makePdf(SAMPLE_RESULT, { pregnant: true })).allText, /Pregnancy \/ breastfeeding: yes/);
    assert.doesNotMatch((await makePdf(SAMPLE_RESULT, { pregnant: false })).allText, /Pregnancy \/ breastfeeding: yes/);
    assert.match((await makePdf({ ...SAMPLE_RESULT, pregnancy_mode: true }, { pregnant: false })).allText, /Pregnancy \/ breastfeeding: yes/);
});

test("PDF: without a result or without jsPDF the user gets a message, not a crash", async () => {
    const env = bootPage();
    global.glowithmResult = null;
    await quiet(() => window.GlowithmApp.saveRoutineAsPDF());
    assert.match(toastText(env).join(" "), /analyze your skin/);
    global.glowithmResult = SAMPLE_RESULT;
    delete global.jspdf;
    await quiet(() => window.GlowithmApp.saveRoutineAsPDF());
    assert.match(toastText(env).join(" "), /PDF generator is unavailable/);
});

/* ----------------------------------------------------------------- assets */
test("assets: every referenced image exists, none is orphaned, none is oversized", () => {
    const readAll = dir => fs.readdirSync(path.join(ROOT, dir)).filter(f => /\.(html|js|css)$/.test(f)).map(f => path.join(ROOT, dir, f));
    const sources = [...readAll("."), ...readAll("js"), ...readAll("css"), ...readAll("components")];
    const refs = new Set();
    for (const file of sources) {
        const text = fs.readFileSync(file, "utf8");
        for (const m of text.matchAll(/assets\/[A-Za-z0-9_\-./ %]+\.(?:png|jpe?g|webp|gif|svg)/g)) refs.add(decodeURIComponent(m[0]));
    }
    assert.ok(refs.size > 10);
    const missing = [...refs].filter(r => !fs.existsSync(path.join(ROOT, r)));
    assert.deepStrictEqual(missing, [], "missing image files");
    const all = [];
    (function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name); e.isDirectory() ? walk(p) : all.push(p); } })(path.join(ROOT, "assets"));
    const rel = all.map(p => path.relative(ROOT, p).split(path.sep).join("/"));
    assert.deepStrictEqual(rel.filter(r => !refs.has(r)), [], "unreferenced assets");
    const big = rel.filter(r => fs.statSync(path.join(ROOT, r)).size > 300 * 1024);
    assert.deepStrictEqual(big, [], "images over 300 KB (convert to WebP / resize)");
    assert.ok(rel.every(r => !/\s/.test(r)), "file names must not contain spaces");
});

test("pages: no duplicate ids, labelled inputs, and the navbar toggle is a real button", () => {
    const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(["components/navbar.html"]);
    for (const page of pages) {
        const html = fs.readFileSync(path.join(ROOT, page), "utf8");
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
        assert.deepStrictEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], `${page}: duplicate ids`);
        for (const m of html.matchAll(/<input\b[^>]*>/g)) {
            const tag = m[0];
            if (/type="(hidden|submit|button|checkbox)"/.test(tag)) continue;
            const id = (tag.match(/\sid="([^"]+)"/) || [])[1];
            const labelled = /aria-label(ledby)?=/.test(tag) || (id && new RegExp(`for="${id}"`).test(html));
            assert.ok(labelled, `${page}: unlabeled input ${tag.slice(0, 60)}`);
        }
    }
    const nav = fs.readFileSync(path.join(ROOT, "components/navbar.html"), "utf8");
    assert.match(nav, /<button[^>]*class="menu-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="mobile-menu"/s);
});

/* ------------------------------------------------------------------ run */
(async () => {
    let passed = 0, failed = 0;
    for (const [name, fn] of tests) {
        try { await fn(); passed++; console.log("PASS ", name); }
        catch (e) { failed++; console.log("FAIL ", name, "\n     ", (e && e.stack || e).toString().split("\n").slice(0, 6).join("\n      ")); }
    }
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
})();
