import {render, isNumber} from "./hoquet.js";
import {_importStyleRules} from "./utils.js";


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
                            : val === null ? false
                            : val;
                    },
                    set: (value) => {
                        if (value === true || value === "")
                            this.setAttribute(k, "");
                        else if (!value && !isNumber(value))
                            this.removeAttribute(k);
                        else
                            this.setAttribute(k, value);
                    },
                    enumerable: true,
                    configurable: true
                });
            });
        }

        reflect() {
            this.constructor.reflectedAttributes.forEach(
                k => this[k] = this[k]
            );
        }

        get template() { return ""; }
        get styles() { return ""; }

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
                let obj = this.$;

                if (configIsNotArray || config.length === 1) {
                    selector = propName = configIsNotArray ? config : propName;
                    method = void(0);
                }

                Object.defineProperty(obj, propName, {
                    value: this[_container][method || "getElementById"](selector),
                    writable: true
                });
            });

            return this.$;
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
            const container = this[_container];
            const _styles = this.styles;
            const styles = typeof _styles === "string"
                ? ["style", _styles]
                : _styles;

            if (this.$ === void(0))
                Object.defineProperty(this, "$", {value: {}});

            switch (strategy) {
            case renderStrategy.APPEND:
                container.appendChild(this.fragment(styles, this.template));
                break;
            case renderStrategy.PREPEND:
                container.insertBefore(
                    this.fragment(styles, this.template),
                    container.firstChild
                );
                break;
            case renderStrategy.REPLACE:
            default:
                this.replace(container, styles, this.template);
                break;
            }

            Array.from(container.querySelectorAll("[id]")).forEach($el => {
                this.$[$el.id] = $el;
            });

            this.reflect();
        }

        adoptStyleSheets(...sources) {
            _importStyleRules(this[_container], sources, shadowy);
        }
    }

    return A;
});

