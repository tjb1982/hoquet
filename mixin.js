import * as hoquet from "./hoquet.js";
import {importCSS} from "./utils.js";


export default ((C) => class extends (C || null) {

    constructor() {
        super();
        this.attachShadow({mode:"open"});
    }

    static get hoquet() { return hoquet; }
    
    get template() {}
    get styles() {}

    shadowSelect(...selectors) {
        selectors.forEach((x) => {
            Object.defineProperty(this, x[0], {
                value: this.shadowRoot[x[2] || "getElementById"](x[1])
            });
        });
    }

    static fragment(...sources) {
        return document.createRange().createContextualFragment(
            this.hoquet.render(...sources)
        );
    }

    static replace(container, ...sources) {
        let child;
        while(child = container.firstChild)
            child.remove();
        container.appendChild(this.fragment(...sources));
    }

    render() {
        const container = this.shadowRoot;
        this.constructor.replace(container, ["style", this.styles], this.template);
    }

    importCSS(...sources) {
        const styleSheet = this.shadowRoot.styleSheets[0];
        return importCSS(sources).forEach(x => styleSheet.insertRule(x));
    }
});


