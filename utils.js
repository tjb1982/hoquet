const _anchor = document.createElement("a");

const absolutePath = (src) => {
    _anchor.href = src;
    return !src ? null : _anchor.href;
}

const _importStyleRules = (container, sources, shadowy) => {
    let target, targetIsShadowRoot = false;
    if (shadowy && Object.hasOwnProperty(container, "adoptedStyleSheets")) {
        targetIsShadowRoot = true;
        target = container;
    } else {
        target = container.firstElementChild.sheet;
    }

    if (targetIsShadowRoot) {
        target.adoptedStyleSheets = sources;
        return;
    }
    sources.forEach(source => {
        Array.from(source.rules).forEach(rule => target.insertRule(rule.cssText));
    });
};

const importCSS = (doc, sources) => {
    //const styleSheets = doc.styleSheets;
    let target, k, l;
    try {
        target = new CSSStyleSheet;
    } catch (e) {
        const $style = document.createElement("style");
        document.body.appendChild($style);
        target = $style.sheet;
        document.body.removeChild($style);
    }

    for (const id in sources) {
        const tests = sources[id];

        const style = doc.querySelector(`style[name="${id}"], link[name="${id}"]`);
        const sheet = style?.sheet;
        const rules = sheet?.cssRules;

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

export { importCSS, _importStyleRules };
