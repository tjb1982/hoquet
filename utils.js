const uuid = "f1c1d5a2-a012-4cdf-ade9-365935290f88";

const hasAdoptedStyleSheetsProperty = !!Object.getOwnPropertyDescriptor(
    ShadowRoot.prototype, "adoptedStyleSheets"
);
if (!hasAdoptedStyleSheetsProperty) {
    console.warn(
        "Cannot `adoptStyleSheets`: will fall back to " +
        "appending `cssRules` to template style tag (for each component " +
        "instance)."
    );
}
try {
    new CSSStyleSheet;
} catch (e) {
    console.warn(
        "Cannot use `CSSStyleSheet` constructor: will fall back to " +
        "constructing `CSSStyleSheet` by creating/appending/removing style " +
        "tag."
    );
}

class StyleDummy extends HTMLElement {
    constructor(styles) {
        super();
        this.attachShadow({mode: "open"});
        const $ = document.createElement("style");
        $.innerHTML = styles || "";
        this.shadowRoot.appendChild($);
        // this.$ = $;
        document.body.appendChild(this);
        const stylesheet = $.sheet;
        document.body.removeChild(this);
        return stylesheet;
    }
}
window.customElements.define(uuid, StyleDummy);

const styleSheetFromString = (styles) => {
    let styleSheet;
    try {
        styleSheet = new CSSStyleSheet;
        styleSheet.replaceSync(styles);
    } catch (e) {
        styleSheet = new StyleDummy(styles);
    }
    return styleSheet;
};

const stylesheet = (strs, ...argv) => {
    let a = [];
    for (let i = 0; i < strs.length; i++) {
        a.push(strs[i].replace(/\s\s+/g, " "));
        a.push(`${argv.shift() || ""}`);
    }

    return styleSheetFromString(a.join(""));
}

const html = (parts, ...argv) => {
    const template = document.createElement("template");
    template.innerHTML = parts.map(
        x => x.replace(/\s\s+/g, " ")
    ).reduce((p, c) => {
        return p + argv.shift() + c;
    });
    return template;
};

const template = html;


const _importStyleRules = (
    container,
    sources,
    shadowy
) => {
    // NOTE: empty array ([]) is truthy (i.e., adoptedStyleSheets is not `hasOwnProperty`
    // but should be an empty array if it exists.
    if (shadowy && hasAdoptedStyleSheetsProperty) {
        container.adoptedStyleSheets = [...container.adoptedStyleSheets, ...sources];
        return true;
    }
    // else {
    //     let target;
    //     target = container.firstElementChild;
    //     if (!target?.sheet) {
    //         const firstElement = target;
    //         target = document.createElement("style");
    //         container.insertBefore(target, firstElement);
    //     }
    //     // NOTE: this is just like is done with, e.g., webpack, when you import a CSS file
    //     // as a string and prepend it to each newly constructed component. It's not ideal,
    //     // but the only other workaround would be what's commented out below, but you'd
    //     // have to call `this.adoptStyleSheets` with every `connectedCallback` because
    //     // the styles are lost every time the node is disconnected.
    //     const cssText = sources.map(
    //         source => Array.from(source.rules).map(rule => rule.cssText).join("")
    //     ).join("");

    //     target.innerHTML += cssText;
    // }

    // `target` used to be container.firstElementChild.sheet
    //sources.forEach(source => {
    //    Array.from(source.rules).forEach(rule => target.insertRule(rule.cssText));
    //});
};


const importCSS = (doc, sources) => {
    let target, k, l;
    try {
        target = new CSSStyleSheet;
    } catch (e) {
        target = new StyleDummy();
    }

    for (const id in sources) {
        const tests = sources[id];

        const style = doc.querySelector(`style[name="${id}"], link[name="${id}"]`);
        const sheet = style && style.sheet;
        const rules = sheet && sheet.cssRules;

        if (!rules)
            return target;

        if (!tests || !tests.length) {
            Array.from(rules).forEach(x => target.insertRule(x.cssText));
        } else {
            for (k = 0; k < rules.length; k++) {
                const rule = rules[k];
                const selectorText = rule.selectorText;

                for (l = 0; l < tests.length; l++) {
                    const test = tests[l];
                    if (!selectorText || selectorText.match(test)) {
                        target.insertRule(rule.cssText);
                    }
                }
            }
        }
    }
    return target;
}

/**
 * 
 * @param {*} styles either a single string of CSS, a single item `this.fragment` can handle
 *      (e.g., ["style", "..."], or stylesheet`...`, or HTMLTemplateElement/DocumentFragment, etc.),
 *      or an array of things `this.fragment` can handle.
 */
const normalizeStylesEntry = (styles) => {
    return !styles
    ? []
    : typeof styles === "string"
    ? [["style", styles]]
    : Array.isArray(styles)
    ? styles
    : [styles];
}

const rendered = (h) => {
    return h.hasOwnProperty("$");
}

const defineReflectedAttributes = (C) => {
    for (let k of C.reflectedAttributes) {
        Object.defineProperty(C.prototype, k, {
            get: function() {
                const val = this.getAttribute(k);
                return val === "" ? true
                    : val === null ? false
                    : val;
            },
            set: function(value) {
                if (value === true || value === "")
                    this.setAttribute(k, "");
                else if (!value && value !== 0)
                    this.removeAttribute(k);
                else
                    this.setAttribute(k, value);
            },
            enumerable: true,
            configurable: true
        });
    }
}

export {
    importCSS,
    _importStyleRules,
    stylesheet,
    html,
    template,
    normalizeStylesEntry,
    rendered,
    defineReflectedAttributes,
    uuid
};
