/* Minimal DOM stand-in, just enough to run js/analyzer.js under plain Node. */

class StubElement {
    constructor(tag = "div", id = "") {
        this.tagName = tag.toUpperCase();
        this.id = id;
        this.children = [];
        this.parent = null;
        this.style = {};
        this.dataset = {};
        this.attrs = {};
        this.listeners = {};
        this.hidden = false;
        this.disabled = false;
        this.checked = false;
        this.value = "";
        this.className = "";
        this._text = "";
        this._html = "";
        this._classes = new Set();
        const owner = this;
        this.classList = {
            add: (...c) => c.forEach(x => owner._classes.add(x)),
            remove: (...c) => c.forEach(x => owner._classes.delete(x)),
            contains: c => owner._classes.has(c),
            toggle: c => (owner._classes.has(c) ? owner._classes.delete(c) : owner._classes.add(c))
        };
        this._auto = {};
    }
    get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
    set textContent(v) { this._text = String(v); this.children = []; }
    get innerHTML() { return this._html; }
    set innerHTML(v) { this._html = String(v); if (v === "") { this.children = []; this._text = ""; } }
    appendChild(child) { child.parent = this; this.children.push(child); return child; }
    append(...nodes) { nodes.forEach(n => this.appendChild(typeof n === "string" ? Object.assign(new StubElement("#text"), { _text: n }) : n)); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
    async dispatch(type, extra = {}) {
        for (const fn of this.listeners[type] || []) await fn({ type, target: this, preventDefault() {}, ...extra });
    }
    querySelector(sel) { return (this._auto[sel] = this._auto[sel] || new StubElement("div")); }
    querySelectorAll() { return []; }
    focus() {}
    scrollIntoView() {}
}

function installDom({ location } = {}) {
    const byId = {};
    const lists = {};
    const queries = {};
    const docListeners = {};
    const body = new StubElement("body");

    const document = {
        body,
        getElementById(id) { return (byId[id] = byId[id] || new StubElement("div", id)); },
        querySelector(sel) { return (queries[sel] = queries[sel] || new StubElement("div")); },
        querySelectorAll(sel) { return lists[sel] || []; },
        createElement(tag) { return new StubElement(tag); },
        addEventListener(type, fn) { (docListeners[type] = docListeners[type] || []).push(fn); }
    };

    global.document = document;
    global.window = global;
    global.location = location || { protocol: "http:", hostname: "127.0.0.1", port: "5000", pathname: "/analyzer.html" };
    global.scrollTo = () => {};
    return { document, byId, lists, queries, docListeners, body };
}

/* A jsPDF look-alike that records everything written to the page. */
class RecordingPDF {
    constructor() {
        this.texts = [];
        this.pages = 1;
        this.saved = null;
        this.internal = {
            pageSize: { getWidth: () => 210, getHeight: () => 297 },
            getNumberOfPages: () => this.pages
        };
        const noop = () => this;
        for (const m of ["setFont", "setFontSize", "setTextColor", "setFillColor", "setDrawColor",
                         "setLineWidth", "rect", "roundedRect", "circle", "line", "setPage"]) {
            this[m] = noop;
        }
    }
    text(value) {
        (Array.isArray(value) ? value : [value]).forEach(v => this.texts.push(String(v)));
        return this;
    }
    splitTextToSize(text, width) {
        const max = Math.max(20, Math.floor(width * 0.55));
        const words = String(text).split(/\s+/);
        const lines = [];
        let line = "";
        for (const w of words) {
            if ((line + " " + w).trim().length > max) { lines.push(line); line = w; } else { line = (line + " " + w).trim(); }
        }
        if (line) lines.push(line);
        return lines;
    }
    addPage() { this.pages += 1; return this; }
    save(name) { this.saved = name; }
    get allText() { return this.texts.join("\n"); }
}

module.exports = { StubElement, installDom, RecordingPDF };
