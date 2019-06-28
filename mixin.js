import * as _hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


export default ((C, shadowy=true) => class extends (C || null) {

    constructor() {
        super();
        if (shadowy)
            this.attachShadow({mode:"open"});
    }

    get hoquet() { return _hoquet; }
    get template() {}
    get styles() {}

    select(container, ...selectors) {
        selectors.forEach((x) => {
            Object.defineProperty(this, x[0], {
                value: container[x[2] || "getElementById"](x[1]),
                writable: true
            });
        });
    }

    shadowSelect(...selectors) {
        this.select(this.shadowRoot, ...selectors);
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

    render(container = this.shadowRoot) {
        this.replace(container, ["style", this.styles], this.template);
    }

    importCSS(...sources) {
        // Assume we want to affect only the stylesheet this mixin created
        // when `render` was called.
        const styleSheet = this.shadowRoot.styleSheets[0];
        return styleSheet && importCSS(sources).forEach(x => styleSheet.insertRule(x));
    }
});


