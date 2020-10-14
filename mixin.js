import { render } from "./hoquet.js";
import { _importStyleRules, normalizeStylesEntry, rendered, defineReflectedAttributes, uuid } from "./utils.js";


const _nullobj = Object.create(null);
const CONTAINER_KEY = Symbol();
const CONTAINER_PTR = Symbol();

export default ((C = HTMLElement, {
    template = "",
    stylesheets = [],
    attributes = [],
    /**
     * If true, shadow DOM is initialized by the constructor.
     */
    shadowy = true,
    /**
     * If false, subsequent calls to render will not create new DOM elements,
     * only update references and reflect attributes.
     */
    rerenderable = false,
    /**
     * If true, any element with an `id` attribute will be cached
     * in the `this.$` property for easy access. Otherwise, a Proxy
     * is created for `this.$` doing `container.getElementById`.
     */
    cacheIDs = false //!shadowy
} = {}) => {

    const isHTMLElement = HTMLElement === C || HTMLElement.isPrototypeOf(C);
    if (!isHTMLElement) {
        throw new Error(
            "Hoquet mixin must wrap either HTMLElement or a subclass of " +
            "HTMLElement."
        );
    }

    const _reflectedAttributes = new Set([...(C.reflectedAttributes || []), ...attributes] || []);
    const _observedAttributes = [...(C.observedAttributes || [])];
    const _getElementById = shadowy
        ? function(id) { return this.shadowRoot.getElementById(id); }
        : function(id) { return this.querySelector(`#${id}`); };

    class A extends (C) {

        constructor(...args) {
            super(...args);

            if (shadowy) {
                if (!this.shadowRoot) {
                    this.attachShadow({mode:"open"});
                }
                this[CONTAINER_KEY] = this.shadowRoot;
            } else {
                this[CONTAINER_KEY] = this;
            }
        }

        static get reflectedAttributes() {
            return _reflectedAttributes;
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
            defineReflectedAttributes(this);
            return [..._observedAttributes, ...this.reflectedAttributes];
        }

        /**
         * This method is required to exist, otherwise `observedAttributes`
         * won't be called by the browser. However, client code can override
         * (or not) as normal.
         * 
         * Also, we don't try to determine whether `attributeChangedCallback`
         * is a function or not for performance reasons.
         */
        attributeChangedCallback(k, p, c) {
            if (super.attributeChangedCallback) {
                super.attributeChangedCallback(k, p, c);
            }
        }

        reflect() {
            for (let k of _reflectedAttributes) {
                this[k] = this[k]
            }
        }

        get template() { return template; }
        get styles() { return ""; }

        set [CONTAINER_KEY](value) { Object.defineProperty(this, CONTAINER_PTR, {value}); }
        get [CONTAINER_KEY]() { return this[CONTAINER_PTR]; }

        fragment(...sources) {
            return sources.map(source => source instanceof HTMLTemplateElement
                ? document.importNode(source.content, true)
                : source instanceof DocumentFragment || source instanceof HTMLElement
                ? document.importNode(source, true)
                : document.createRange().createContextualFragment(render(source))
            ).reduce((parent, child) => {
                parent.appendChild(child);
                return parent;
            }, document.createDocumentFragment());
        }

        replace(container, ...sources) {
            let child;
            while(child = container.firstChild)
                child.remove();
            container.appendChild(this.fragment(...sources));
        }

        get rendered() { return this.hasOwnProperty("$"); }

        render(options = {}) {
            const {
                /**
                 * If true, after the template/styles have been rendered, all
                 * `reflectedAttributes` will be reapplied, triggering
                 * `attributeChangedCallback`, so that DOM changes can be made.
                 */
                reflect = true
            } = options;
            const container = this[CONTAINER_KEY];
            const rendered = this.rendered;

            if (!rendered || rerenderable) {
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

                if (!rendered) {
                    Object.defineProperty(this, "$", {
                        value: cacheIDs
                            ? {}
                            : new Proxy(_nullobj, {
                                get: (_, k) => _getElementById.call(this, k)
                            })
                    });
                }
            }

            if (cacheIDs) {
                Array.from(container.querySelectorAll("[id]")).forEach(
                    el => this.$[el.id] = el
                );
            }

            if (reflect) {
                this.reflect();
            }
        }

        adoptStyleSheets(...sources) {
            return !sources.length || _importStyleRules(this[CONTAINER_KEY], sources, shadowy);
        }
    }

    return A;
});

