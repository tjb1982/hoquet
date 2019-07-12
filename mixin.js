import * as _hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


export default ((C = null, shadowy=true) => class extends (C) {

    constructor(...args) {
        super(...args);
        if (shadowy) {
            this.attachShadow({mode:"open"});
            this.$container = this.shadowRoot;
        } else {
            this.$container = this;
        }
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
                value: this.$container[x[2] || "getElementById"](x[1]),
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

    render() {
        this.replace(this.$container, ["style", this.styles], this.template);
    }

});


