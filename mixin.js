import * as _hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


const renderStrategy = Object.create(null, {
    REPLACE: {value: 1},
    APPEND: {value: 2},
    PREPEND: {value: 3}
});


let __container;


export default ((C = null, shadowy=true) => class extends (C) {

    static get renderStrategy() { return renderStrategy; }

    constructor(...args) {
        super(...args);
        if (shadowy) {
            this.attachShadow({mode:"open"});
            __container = this.shadowRoot;
        } else {
            __container = this;
        }

        // Safer "static" property that can't be overrided
        Object.defineProperty(this.constructor, "renderStrategy", {
            value: renderStrategy
        });
    }

    get hoquet() { return _hoquet; }
    get template() {}
    get styles() {}

    getElementById(id) {
        return this.shadowRoot
            ? this.shadowRoot.getElementById(id)
            : this.querySelector(`#${id}`);
    }

    select(...selectors) {
        let obj = this;
        selectors.forEach((x) => {
            if (x.length === 1) {
                if (typeof this.$ === "undefined")
                    Object.defineProperty(this, "$", {value: {}});
                obj = this.$;
                x[1] = x[0];
            }
            Object.defineProperty(obj, x[0], {
                value: __container[x[2] || "getElementById"](x[1]),
                writable: true
            });
        });
    }

    fragment(...sources) {
        return document.createRange().createContextualFragment(
            this.hoquet.render(...sources)
        );
    }

    replace(container, ...sources) {
        let child;
        while(child = container.firstChild)
            child.remove();
        container.appendChild(this.fragment(...sources));
    }

    render(strategy = renderStrategy.REPLACE) {
        switch (strategy) {
        case renderStrategy.APPEND:
            __container.appendChild(this.fragment(["style", this.styles], this.template));
            break;
        case renderStrategy.PREPEND:
            __container.insertBefore(
                this.fragment(["style", this.styles], this.template),
                __container.firstChild
            );
            break;
        case renderStrategy.REPLACE:
        default:
            this.replace(__container, ["style", this.styles], this.template);
            break;
        }
    }

});


