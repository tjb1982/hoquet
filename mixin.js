import {render} from "./hoquet.js";
import {importCSS} from "./utils.js";


const renderStrategy = Object.create(null, {
    REPLACE: {value: 1},
    APPEND: {value: 2},
    PREPEND: {value: 3}
});

const _container = "f1c1d5a2-a012-4cdf-ade9-365935290f88";
const __container = "e9312871-6a6a-4227-9cda-00cbd67d397f";


export default ((C = null, {shadowy = true} = {}) => {

    class A extends (C) {

        static get renderStrategy() { return renderStrategy; }
        static get reflectedAttributes() { return []; }

        constructor(...args) {
            super(...args);
            if (shadowy) {
                this.attachShadow({mode:"open"});
                this[_container] = this.shadowRoot;
            } else {
                this[_container] = this;
            }

            this.constructor.reflectedAttributes.forEach(k => {
                Object.defineProperty(this, k, {
                    get: () => {
                        const val = this.getAttribute(k);
                        return val === "" ? true
                            : !val ? false
                            : val;
                    },
                    set: (value) => {
                        if (value === true || value === "")
                            this.setAttribute(k, "");
                        else if (!value)
                            this.removeAttribute(k);
                        else
                            this.setAttribute(k, value);
                    },
                    enumerable: true,
                    configurable: true
                });
            });
        }

        get template() {}
        get styles() {}

        set [_container](value) { Object.defineProperty(this, __container, {value}); }
        get [_container]() { return this[__container]; }

        getElementById(id) {
            const container = this[_container];
            return container === this.shadowRoot
                ? container.getElementById(id)
                : container.querySelector(`#${id}`);
        }

        select(...configs) {
            configs.forEach(config => {
                const configIsNotArray = !Array.isArray(config);
                let [propName, selector, method] = config;
                let obj = this;

                if (configIsNotArray || config.length === 1) {
                    if (this.$ === void(0))
                        Object.defineProperty(this, "$", {value: {}});
                    obj = this.$;
                    selector = propName = configIsNotArray ? config : propName;
                    method = void(0);
                }

                Object.defineProperty(obj, propName, {
                    value: this[_container][method || "getElementById"](selector),
                    writable: true
                });
            });
        }

        fragment(...sources) {
            const container = document.createDocumentFragment();
            sources.map(source => {
                if (source instanceof HTMLTemplateElement)
                    return document.importNode(source.content, true);
                else if (source instanceof DocumentFragment || source instanceof HTMLElement)
                    return document.importNode(source, true);
                return document.createRange().createContextualFragment(
                    render(source)
                );
            }).forEach(frag => container.appendChild(frag));
            return container;
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
                this[_container].appendChild(this.fragment(["style", this.styles], this.template));
                break;
            case renderStrategy.PREPEND:
                this[_container].insertBefore(
                    this.fragment(["style", this.styles], this.template),
                    this[_container].firstChild
                );
                break;
            case renderStrategy.REPLACE:
            default:
                this.replace(this[_container], ["style", this.styles], this.template);
                break;
            }
        }
    }

    return A;
});


