import {render, isNumber} from "./hoquet.js";
import {_importStyleRules, normalizeStylesEntry} from "./utils.js";


const _container = "f1c1d5a2-a012-4cdf-ade9-365935290f88";
const __container = "e9312871-6a6a-4227-9cda-00cbd67d397f";

export default ((C = null, {
    shadowy = true,
    template = "",
    stylesheets = [],
    attributes = []
} = {}) => {

    class A extends (C) {

        static get reflectedAttributes() { return attributes; }

        constructor(...args) {
            super(...args);
            if (shadowy) {
                this.attachShadow({mode:"open"});
                this[_container] = this.shadowRoot;
            } else {
                this[_container] = this;
            }
        }

        static defineReflectedAttributes() {
            if (!this.reflectedAttributes && !attributes.length)
                return;

            Array.from(this.reflectedAttributes).forEach(k => {
                Object.defineProperty(this.prototype, k, {
                    get: function() {
                        const val = this.getAttribute(k);
                        return val === "" ? true
                            : val === null ? false
                            : val;
                    },
                    set: function(value) {
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

        static get observedAttributes() {
            this.defineReflectedAttributes();
            return this.reflectedAttributes || void(0);
        }

        // Required to exist, otherwise `observedAttributes` won't be called
        attributeChangedCallback(k, p, c) {}

        reflect() {
            this.constructor.reflectedAttributes.forEach(
                k => this[k] = this[k]
            );
        }

        get template() { return template; }
        get styles() { return ""; } //stylesheets; }

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

        render() {
            const container = this[_container];
            const {sheets, styles} = normalizeStylesEntry(this.styles).reduce((conf, source) => {
                conf[
                    source instanceof CSSStyleSheet
                        ? "sheets"
                        : "styles"
                ].push(source);

                return conf;
            }, {sheets: [], styles: []});

            if (!this.adoptStyleSheets(...stylesheets, ...sheets)) {
                [...stylesheets, ...sheets].forEach(sheet => {
                    styles.push(["style", Array.from(sheet.rules).map(rule => rule.cssText).join(" ")]);
                });
            }

            this.replace(container, ...styles, this.template);

            if (this.$ === void(0))
                Object.defineProperty(this, "$", {value: {}});

            Array.from(container.querySelectorAll("[id]")).forEach($el => {
                this.$[$el.id] = $el;
            });

            this.reflect();
        }

        adoptStyleSheets(...sources) {
            return _importStyleRules(this[_container], sources, shadowy);
        }
    }

    return A;
});

