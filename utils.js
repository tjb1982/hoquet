const _anchor = document.createElement("a");

const absolutePath = (src) => {
    _anchor.href = src;
    return !src ? null : _anchor.href;
}

const hasAdoptedStyleSheetsProperty = !!Object.getOwnPropertyDescriptor(
    ShadowRoot.prototype, "adoptedStyleSheets"
);

class StyleDummy extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        const $s = document.createElement("style");
        this.shadowRoot.appendChild($s);
    }

    get styleElement() {
        return this.shadowRoot.firstChild;
    }
}
window.customElements.define(`abc-def-ghi-jkl-mno-pqr-stu-vwx-yz`, StyleDummy);

const styleSheetFromString = (styles) => {
    let styleSheet;
    try {
        styleSheet = new CSSStyleSheet;
        styleSheet.replaceSync(styles);
    } catch (e) {
        const dummy = new StyleDummy;
        document.body.appendChild(dummy);
        const $style = dummy.styleElement;
        $style.innerHTML = styles;
        styleSheet = $style.sheet;
        document.body.removeChild(dummy);
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
        return p.trim() + argv.shift() + c.trim();
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
    //const styleSheets = doc.styleSheets;
    let target, k, l;
    try {
        target = new CSSStyleSheet;
    } catch (e) {
        const $dummy = new StyleDummy;
        document.body.appendChild($dummy);
        target = $dummy.styleElement.sheet;
        document.body.removeChild($dummy);
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
    return typeof styles === "string"
    ? [["style", styles]]
    : Array.isArray(styles)
    ? styles
    : [styles];
}

const rendered = (h) => {
    return h.hasOwnProperty("$");
}


export {
    importCSS,
    _importStyleRules,
    stylesheet,
    html,
    template,
    normalizeStylesEntry,
    rendered
};
