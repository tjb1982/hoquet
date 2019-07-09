import * as _hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


export default ((C, shadowy=true) => class extends (C || null) {

    constructor() {
        super();
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
        selectors.forEach((x) => {
            Object.defineProperty(this, x[0], {
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


