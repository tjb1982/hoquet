import * as _hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


const renderStrategy = Object.create(null, {
    REPLACE: {value: 1},
    APPEND: {value: 2},
    PREPEND: {value: 3}
});


export default ((C = null, shadowy=true) => class extends (C) {

    static get renderStrategy() { return renderStrategy; }

    constructor(...args) {
        super(...args);
        if (shadowy) {
            this.attachShadow({mode:"open"});
            this.__container = this.shadowRoot;
        } else {
            this.__container = this;
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
        const container = this.__container;
        return container === this.shadowRoot
            ? container.getElementById(id)
            : container.querySelector(`#${id}`);
    }

    select(...configs) {
        let obj = this;
        configs.forEach(config => {
            const configIsNotArray = !Array.isArray(config);
            let [propName, selector, method] = config;

            if (configIsNotArray || config.length === 1) {
                if (this.$ === void(0))
                    Object.defineProperty(this, "$", {value: {}});
                obj = this.$;
                selector = propName = configIsNotArray ? config : propName;
                method = void(0);
            }

            Object.defineProperty(obj, propName, {
                value: this.__container[method || "getElementById"](selector),
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
            this.__container.appendChild(this.fragment(["style", this.styles], this.template));
            break;
        case renderStrategy.PREPEND:
            this.__container.insertBefore(
                this.fragment(["style", this.styles], this.template),
                this.__container.firstChild
            );
            break;
        case renderStrategy.REPLACE:
        default:
            this.replace(this.__container, ["style", this.styles], this.template);
            break;
        }
    }

});


