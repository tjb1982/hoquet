import {render} from "./hoquet.js";
import {_importStyleRules, normalizeStylesEntry, rendered} from "./utils.js";


const _container_key = "f1c1d5a2-a012-4cdf-ade9-365935290f88";
const _container_ptr = "e9312871-6a6a-4227-9cda-00cbd67d397f";

export default ((C = HTMLElement, {
    template = "",
    stylesheets = [],
    attributes = [],
    /**
     * If true, shadow DOM is initialized by the constructor.
     */
    shadowy = true,
    /**
     * If true, subsequent calls to render will not create new DOM elements,
     * only update references and reflect attributes.
     */
    renderOnce = true
} = {}) => {

    const isHTMLElement = HTMLElement === C || HTMLElement.isPrototypeOf(C);
    if (!isHTMLElement) {
        throw new Error(
            "Hoquet mixin must wrap either HTMLElement or a subclass of " +
            "HTMLElement."
        );
    }

    class A extends (C) {

        constructor(...args) {
            super(...args);

            if (shadowy) {
                this.attachShadow({mode:"open"});
                this[_container_key] = this.shadowRoot;
            } else {
                this[_container_key] = this;
            }
        }

        static get reflectedAttributes() { return attributes || []; }

        static defineReflectedAttributes() {
            if (!this.reflectedAttributes.length)
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
                        else if (!value && value !== 0)
                            this.removeAttribute(k);
                        else
                            this.setAttribute(k, value);
                    },
                    enumerable: true,
                    configurable: true
                });
            });
        }

        /**
         * By default, all `reflectedAttributes` are `observedAttributes`, but
         * it's also possible to override this so that additional attributes
         * can be defined that aren't reflected (e.g., if they wouldn't trigger
         * immediate mutations to the DOM). Just be careful not to forget to
         * include the `reflectedAttributes` in the override. E.g., this
         * probably does what you want:
         * 
         * ```
         * static get observedAttributes() {
         *     return [
         *         ...super.observedAttributes, // i.e., creates `reflectedAttributes`, returns their names
         *         "further", "unreflected", "attributes"
         *     ];
         * }
         * ```
         * 
         * And this is functionally equivalent to `inst.render({reflect: false})`:
         * 
         * ```
         * static get observedAttributes() {
         *     return [
         *          ...this.reflectedAttributes, // i.e., returns `attributes` without creating `reflectedAttributes`
         *          "ignoring", "all", "reflected", "attributes"
         *     ];
         * }
         * ```
         */
        static get observedAttributes() {
            this.defineReflectedAttributes();
            return this.reflectedAttributes || void(0);
        }

        /**
         * This method is required to exist, otherwise `observedAttributes`
         * won't be called by the browser. However, client code can override
         * (or not) as normal.
        */
        attributeChangedCallback() {}

        reflect() {
            this.constructor.reflectedAttributes.forEach(
                k => this[k] = this[k]
            );
        }

        get template() { return template; }
        get styles() { return ""; }

        set [_container_key](value) { Object.defineProperty(this, _container_ptr, {value}); }
        get [_container_key]() { return this[_container_ptr]; }

        getElementById(id) {
            const container = this[_container_key];
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
                    value: this[_container_key][method || "getElementById"](selector),
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

        render(options = {}) {
            const {
                /**
                 * If true, after the template/styles have been rendered, all
                 * `reflectedAttributes` will be reapplied, triggering
                 * `attributeChangedCallback`, so that DOM changes can be made.
                 */
                reflect = true,
                /**
                 * If true, any element with an `id` attribute will be culled
                 * into the `this.$` property for easy access.
                 */
                mapIDs = true
            } = options;
            const container = this[_container_key];
            const canRenderMultipleTimes = !renderOnce;

            if (!rendered(this) || canRenderMultipleTimes) {
                const {sheets, styles} = normalizeStylesEntry(this.styles).reduce(
                    (conf, source) => {
                        conf[
                            source instanceof CSSStyleSheet
                                ? "sheets"
                                : "styles"
                        ].push(source);

                        return conf;
                    },
                    {sheets: [], styles: []}
                );

                if (!this.adoptStyleSheets(...stylesheets, ...sheets)) {
                    [...stylesheets, ...sheets].forEach(sheet => {
                        styles.push(["style", Array.from(sheet.rules).map(
                            rule => rule.cssText
                        ).join(" ")]);
                    });
                }

                this.replace(container, ...styles, this.template);

                if (!this.hasOwnProperty("$"))
                    Object.defineProperty(this, "$", {value: {}});
            }

            if (mapIDs) {
                Array.from(container.querySelectorAll("[id]")).forEach($el => {
                    this.$[$el.id] = $el;
                });
            }

            if (reflect) {
                this.reflect();
            }
        }

        adoptStyleSheets(...sources) {
            return _importStyleRules(this[_container_key], sources, shadowy);
        }
    }

    return A;
});

