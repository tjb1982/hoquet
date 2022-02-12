const CONTENT = Symbol();

const template = document.createElement("template");
template.innerHTML = `<slot id="slot"></slot>`;


export default class Pages extends HTMLElement {

    [CONTENT]: DocumentFragment;
    $slot: HTMLSlotElement;
    classForHidden: string = "hidden";

    attrForSelected?: string;
    fallbackSelection?: string;
    selected?: HTMLElement;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;
        this.$slot =
            this[CONTENT].getElementById("slot") as
                HTMLSlotElement;
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.$slot.assignedElements().forEach($ => {
            // ($ as HTMLElement).style.display = "none";
            ($ as HTMLElement).classList.add(this.classForHidden);
        });

        const defaultSelection = this.getAttribute("default-selection");
        if (defaultSelection) {
            this.select(defaultSelection);
        }
    }

    static get observedAttributes() {
        return [
            "attr-for-selected",
            "fallback-selection",
            "default-selection",
            "class-for-hidden",
        ];
    }
    attributeChangedCallback(name: string, old: string, newv: string) {
        switch (name) {
        case "attr-for-selected":
            this.attrForSelected = newv;
            break;
        case "fallback-selection":
            this.fallbackSelection = newv;
            break;
        case "class-for-hidden":
            this.classForHidden = newv;
            break;
        }
    }

    selectByAttribute(items: HTMLElement[], id: string) {
        let selected;
        
        if (!this.attrForSelected) {
            return;
        }

        for (let item of items) {
            if (item.getAttribute(this.attrForSelected) === id) {
                // item.style.display = "";
                item.classList.remove(this.classForHidden);
                selected = item;
            } else {
                // item.style.display = "none";
                item.classList.add(this.classForHidden);
            }
        }
        return selected;
    }

    select(id: string) {
        const items =
            this.$slot.assignedElements() as
                HTMLElement[];
        delete this.selected;

        if (this.attrForSelected) {
            this.selected = this.selectByAttribute(items, id);
            if (!this.selected && this.fallbackSelection) {
                this.selected = this.selectByAttribute(items, this.fallbackSelection);
            }
        } else {
            // No `attrForSelected`; trying id == idx approach
            let idx = parseInt(id);

            if (isNaN(idx)) {
                throw Error("No suitable `id` found.");
            }

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (i === idx) {
                    item.classList.remove(this.classForHidden);
                    this.selected = item;
                }
                else {
                    item.classList.add(this.classForHidden);
                }
            }
        }
    }
}
window.customElements.define("hq-pages", Pages);
