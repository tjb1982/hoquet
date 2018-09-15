const _anchor = document.createElement("a");

const absolutePath = (src) => {
    _anchor.href = src;
    return !src ? null : _anchor.href;
}

const importCSS = (sources) => {
    const styleSheets = document.styleSheets;
    let matchingRules = [], i, j, k, l;

    for (i = 0; i < sources.length; i++) {
        const source = sources[i];
        const src = absolutePath(source.src);
        const tests = source.rules;
        for (j = 0; j < styleSheets.length; j++) {
            const sheet = styleSheets[j];
            if (sheet.href === src) {
                const rules = sheet.cssRules;
                if (!tests) {
                    matchingRules = matchingRules.concat(Array.from(rules).map(x => x.cssText));
                } else {
                    for (k = 0; k < rules.length; k++) {
                        const rule = rules[k];
                        const selectorText = rule.selectorText;

                        for (l = 0; l < tests.length; l++) {
                            const test = tests[l];
                            if (!selectorText || selectorText.match(test)) {
                                matchingRules.push(rule.cssText)
                            }
                        }
                    }
                }
            }
        }
    }
    return matchingRules;
}

export { importCSS };
