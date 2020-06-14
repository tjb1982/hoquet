function render(a) {
    return arguments.length < 2 ? _render(a)
    : Array.prototype.map.call(arguments, _render, this).join("");
};

function canConcatenate(tester) {
    // empty string must be okay here.
    return tester === String(tester) || (tester && isNumber(tester));
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInvalidTagName(tester) {
    return !tester || tester !== String(tester) || isNumber(tester[0]);
}

function json_btoa(x) {
    const json = JSON.stringify(x);
    try {
        return btoa(json);
    } catch (e) {
        return Buffer.from(json).toString("base64");
    }
}

function renderAttributeValue(val) {
    return Array.isArray(val) ? val.join(" ")
        : canConcatenate(val) ? val
        : json_btoa(JSON.stringify(val));
}

function renderAttribute([k, v]) {
    return v === true
    ? k
    : v ? [k, "=", "\"", renderAttributeValue(v), "\""].join("")
    : "";
}

function renderAttributes(form) {
    const attrs = form === Object(form)
        ? Object.entries(form).map(renderAttribute).filter(x => x)
        : "";
    return attrs.length
        ? [" ", attrs.join(" ")].join("")
        : "";
}

function renderRest(form) {
    return Array.isArray(form) && form.length
        ? _render(form)
        : canConcatenate(form) ? form
        : "";
}

function renderSecondPosition(form, selfClosing) {
    const closer = selfClosing ? "" : ">";
    const rest = renderRest(form);
    return (
        rest
            ? [closer, rest]
            : [renderAttributes(form), closer]
    ).join("");
}

function renderElement(a, selfClosing) {
    return [
        a.map(function(form, i) {
            return i < 1
                ? "<" + form
                : i === 1
                ? renderSecondPosition(form, selfClosing)
                : renderRest(form, selfClosing);
        }).join(""),
        !selfClosing ? "</" + a[0] + ">" : " />"
    ].join("");
}

class InvalidTagName extends Error {
    constructor(x) {
        super(...arguments);
        this.name = "InvalidTagName";
        this.message = `${
            JSON.stringify(x[0])
        } (having type "${typeof x[0]}") is not a valid tag name. Context: ${
            JSON.stringify(x)
        }`;
    }
    static throw() {
        throw new InvalidTagName(...arguments);
    }
}

function _render (a) {

    return canConcatenate(a) ? a
    : !Array.isArray(a) ? ""
    : Array.isArray(a[0]) ? a.map(_render, this).join("")
    : isInvalidTagName(a[0])
    ? InvalidTagName.throw(a)
    : (function(last) {
        return renderElement(
            a,
            a.length > 2 ? false
            : typeof last === "undefined" ? false
            : Array.isArray(last) ? false
            : !canConcatenate(last)
        );
    })(a.length > 1 && a[a.length - 1]);

}

export { render, renderElement, renderAttributes, renderAttribute, renderAttributeValue };

