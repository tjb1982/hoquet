import materialIcons from "../html/material-icons-link.html";
import stackStyles from "./stack.css";
import flexStyles from "./flex.css";
import tabStyles from "./tab.css";


const template = document.createElement("template");
template.innerHTML = `
${materialIcons}
<style>#nav.hidden {display: none;}</style>
<style id="stack">${stackStyles}</style>
<style id="flex">${flexStyles}</style>
<style id="tab">${tabStyles}</style>
<nav id="nav" class="hidden">
    <ul id="menu"></ul>
</nav>
`;


const navItemTemplate = document.createElement("template");
navItemTemplate.innerHTML = `
<li class="menu-item">
    <a>
        <i class="material-icons" aria-hidden="true"></i>
        <span></span>
    </a>
</li>
`;

const displayModes = ["stack","flex","tab"] as const;
type DisplayMode = typeof displayModes[number];
export type MenuItem = {
    name: string;
    label: string;
    icon: string;
    href: string;
    selected?: boolean;
    spa?: boolean;
}

const CONTENT = Symbol();
const SELECTED = Symbol();
const ITEMS = Symbol();
const STYLES = Symbol();
const CLEAR_STYLES = Symbol();
const observedAttributes = ["display-mode"];


export default class Nav extends HTMLElement {

    [CONTENT]: DocumentFragment;
    [SELECTED]?: MenuItem;
    [ITEMS]: MenuItem[] = [];
    [STYLES]: Record<DisplayMode,HTMLStyleElement> = {} as any;
    $nav: HTMLElement;
    $menu: HTMLUListElement;
    
    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$nav =
            this[CONTENT].getElementById("nav") as
                HTMLElement;
        this.$menu =
            this[CONTENT].getElementById("menu") as
                HTMLUListElement;

        displayModes.forEach(mode => {
            this[STYLES][mode] =
                this[CONTENT].getElementById(mode) as
                    HTMLStyleElement;
        });

        this[CLEAR_STYLES]();
    }

    connectedCallback() {
        if (this[CONTENT].hasChildNodes()) {
            this.shadowRoot?.appendChild(this[CONTENT]);
            this.displayMode = "none";    
        }
    }

    [CLEAR_STYLES]() {
        displayModes.forEach(x => {
            const $style = this[STYLES][x];
            // parentNode is shadowRoot or null
            $style.parentNode?.removeChild($style);
        });
    }

    set displayMode(x: DisplayMode | "none") {
        if (!this.shadowRoot?.hasChildNodes()) {
            return;
        }
        const styles = document.createDocumentFragment();

        this.$nav.classList.add("hidden");
        this[CLEAR_STYLES]();

        switch(x) {
            case "none":
                return;
            case "tab":
                styles.appendChild(this[STYLES].tab);
                // no break
            case "flex":
                styles.prepend(this[STYLES].flex);
                // no break
            default:
                this.$nav.classList.remove("hidden");
                styles.prepend(this[STYLES].stack);
                this.shadowRoot?.insertBefore(styles, this.$nav);
                break;
        }
    }

    get selectedItem(): MenuItem | undefined {
        return this[SELECTED];
    }
    set selected(name: string) {
        this.items.forEach(item => {
            if (item.name === name) {
                item.selected = true;
                this[SELECTED] = item;
            }
            else {
                item.selected = false;
            }
        });

        const selected = this.selectedItem;
        if (selected) {
            this.updateSelected(selected);
        }
    }

    updateSelected(item: MenuItem) {
        Array.from(this.$menu.querySelectorAll("a")).forEach($anchor => {
            $anchor.classList.remove("selected");
            if (
                $anchor.parentElement?.id ===
                    `menu-item__${item.name}`
            ) {
                $anchor.classList.add("selected");
            }
        });
    }

    get items() { return this[ITEMS] }

    addItem(item: MenuItem) {
        this[ITEMS].push(item);
    }

    static get observedAttributes() {
        return observedAttributes;
    }
    attributeChangedCallback(k: string, p: string, c: string) {
        switch (k) {
            case "display-mode":
                if (!displayModes.includes(c as any)) {
                    throw new Error(
                        `Attribute "display-mode" must be one of ${
                            JSON.stringify(displayModes)
                        }`
                    );
                }
                this.displayMode = c as DisplayMode || "stack";
                break;
        }
    }

    init() {
        while (this.$menu.firstElementChild)
            this.$menu.removeChild(this.$menu.lastElementChild as Node);

        this.items.forEach(item => {
            const $item =
                navItemTemplate.content.cloneNode(true) as
                    DocumentFragment;
            const $li = $item.querySelector("li") as HTMLLIElement;
            const $anchor = $item.querySelector("a") as HTMLAnchorElement;
            const $icon = $item.querySelector("i") as HTMLSpanElement;
            const $label = $item.querySelector("span") as HTMLSpanElement;

            $li.id = `menu-item__${item.name}`;
            $anchor.href = item.href;
            if (item.spa) {
                $anchor.addEventListener("click", e => {
                    e.preventDefault();
                    window.history.pushState({}, "", $anchor.href);
                    window.dispatchEvent(new Event("popstate"));
                });
            }
            if (item.selected) {
                $anchor.classList.add("selected");
            }
            $anchor.title = item.label;
            $icon.innerText = item.icon;
            $label.innerText = item.label;

            this.$menu.appendChild($item);
        });
    }
}

window.customElements.define("hq-nav", Nav);
