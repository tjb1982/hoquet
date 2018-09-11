function render(a) {
    return arguments.length < 2 ? _render(a)
    : Array.prototype.map.call(arguments, _render, this).join("");
};

function isPrintable(tester) {
    // empty string must be okay here.
    return typeof tester === "string" || tester && isNumber(tester);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInvalidTagName(tester) {
    return !tester || typeof tester !== "string" || isNumber(tester[0]);
}

function renderAttributeValue(form, key) {
    return form[key] instanceof Array ? form[key].join(" ") : form[key];
}

function renderAttribute(form, key) {
    return form[key] === true
    ? [" ", key].join("")
    : form[key] ? [
        " ",
        key,
        "=",
        "\"", renderAttributeValue(form, key), "\""
    ].join("")
    : null;
}

function renderElement(a, selfClosing) {

    return [
        a.map(function(form, i) {
            return i < 1
                ? "<" + form
                : i === 1 && form instanceof Object && !(form instanceof Array)
                ? [
                    Object.keys(form).map(key => renderAttribute(form, key)).join(""),
                    (!selfClosing ? ">" : "")
                ].join("")
                : (i === 1 && !selfClosing ? ">" : "") + (
                    form instanceof Array && form.length ? _render(form)
                    : isPrintable(form) ? form : ""
                );
        }).join(""),
        (
            !selfClosing ? "</" + a[0] + ">"
            : " />"
        )
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
}

function _render (a) {

    return isPrintable(a) ? a
    : !Array.isArray(a) ? ""
    : Array.isArray(a[0]) ? a.map(_render, this).join("")
    : isInvalidTagName(a[0])
    ? new InvalidTagName(a)
    : (function(last) {
        return renderElement(
            a,
            a.length > 2 ? false
            : typeof last === "undefined" ? false
            : Array.isArray(last) ? false
            : !isPrintable(last)
        );
    })(a.length > 1 && a[a.length - 1]);

}

module.exports = Object.create(null, {
    render: {value: render},
    renderElement: {value: renderElement},
    renderAttribute: {value: renderAttribute},
    renderAttributeValue: {value: renderAttributeValue}
});

