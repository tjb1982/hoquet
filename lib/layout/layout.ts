import { Mutex, debounce } from "../utils";

import materialIcons from "../html/material-icons-link.html";

import styles from "./layout.css";
import html from "./layout.html";

// import globe from "../../assets/world.svg";
import Breakpointer from "../breakpointer/breakpointer";


const CONTENT = Symbol();
const template = document.createElement("template");
template.innerHTML = `
    ${materialIcons}
    <style>${styles}</style>
    ${html}
`;

const DIVIDER = Symbol();
export {
    DIVIDER
}

type DrawerSide = "left"|"right";
type ClasslistMethod = "toggle"|"add"|"remove";


export default class Layout extends HTMLElement {
// , {
//     template: html`${template}`,
//     stylesheets: [
//         stylesheet`${styles}`,
//         importCSS(document, {
//             "material-icons": /.*/,
//             "round-button": /.*/
//         })
//     ]
// }) {

    [CONTENT]: DocumentFragment;
    
    $mainTitle: HTMLElement;
    $contextMenu: HTMLElement;
    $loadingModal: HTMLElement;
    $modal: HTMLElement;

    $header: HTMLElement;
    $footer: HTMLElement;

    $drawers: {
        left: HTMLElement;
        right: HTMLElement;
    }
    breakpointer: Breakpointer;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment;

        this.$mainTitle =
            this[CONTENT].getElementById("main-title") as
                HTMLElement;

        this.$contextMenu =
            this[CONTENT].getElementById("context-menu") as
                HTMLElement;

        this.$loadingModal =
            this[CONTENT].getElementById("loading-modal") as
                HTMLElement;

        this.$header =
            this[CONTENT].getElementById("header-wrapper") as
                HTMLElement;
        this.$footer =
            this[CONTENT].getElementById("footer") as
                HTMLElement;

        this.$drawers = {
            left: this[CONTENT].getElementById("left-drawer") as
                HTMLElement,
            right: this[CONTENT].getElementById("right-drawer") as
                HTMLElement,
        };

        this.$modal =
            this[CONTENT].getElementById("modal") as
                HTMLElement;

        const drawerWidth = 500;
        const bottomNavHeight = 600;
        this.breakpointer = new Breakpointer({
            minHeight: bottomNavHeight,
            minWidth: drawerWidth,
        });

        this.bindDrawerListeners();
        this.bindAnimatedHeader();
        this.bindLoading();
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.breakpointer.addHandler(this.handleBreakpoints.bind(this));
    }

    handleBreakpoints(minHeight: boolean, minWidth: boolean) {
        this.$footer.classList[
            minWidth ? "add" : "remove"
        ]("padded");

        this.$contextMenu.classList[
            minWidth ? "remove" : "add"
        ]("hidden");
    }

    bindLoading() {
        let loadingCount = 0;
        const mutex = new Mutex;

        this.addEventListener("loading-start", (async (e) => {
            const unlock = await mutex.lock();
            loadingCount++;
            this.$loadingModal.classList.add("show");
            unlock();
        }));
        this.addEventListener("loading-end", (async (e) => {
            const unlock = await mutex.lock();
            if (--loadingCount <= 0) {
                this.$loadingModal.classList.remove("show");
                loadingCount = 0;
            }
            unlock();
        }));
    }

    bindAnimatedHeader() {
        let lastWinTop = 0;
        window.addEventListener("scroll", debounce(() => {
            const headerHeight = this.$header.offsetHeight;
            const classList = this.$header.classList;
            const winTop = window.scrollY;
            if (winTop < 1) {
                classList.remove("sticky");
                classList.remove("hidden");
                classList.remove("hidden-transition");
            } else if (winTop < lastWinTop) {
                classList.add("sticky");
                classList.remove("hidden");
                if (lastWinTop > headerHeight)
                    classList.add("hidden-transition");
            } else if (winTop > headerHeight && winTop > lastWinTop) {
                classList.remove("sticky");
                classList.add("hidden");
            }

            this.$footer.className = "";
            classList.forEach(x => {
                if (x !== "padded")
                    this.$footer.classList.add(x)
            });

            lastWinTop = winTop;
        }, 10));
    }

    bindDrawerListeners() {
        this.$drawers.left.addEventListener("click", e => this.handleCloseClick(e, "left"));
        this.$modal.addEventListener("click", e => this.closeDrawers());
        window.addEventListener("keyup", e => {
            if (e.key === "Escape")
                this.closeDrawers();
        });
        this.addEventListener("layout-drawer-toggle", (e: Event) => {
            const {which, action} = (e as CustomEvent).detail;
            this.toggleDrawer(which, action);
        });
    }

    closeDrawers() {
        this.closeDrawer("left");
        this.closeDrawer("right");
    }
    toggleDrawer(which: DrawerSide, action: ClasslistMethod = "toggle") {
        this.$drawers[which].classList[action]("open");
        this.$modal.classList[action]("show");
        document.documentElement.classList[action]("modal");
    }
    closeDrawer(which: DrawerSide) { this.toggleDrawer(which, "remove"); }
    openDrawer(which: DrawerSide) { this.toggleDrawer(which, "add"); }

    handleCloseClick(e: Event, which: DrawerSide = "left", force?: boolean) {
        const $target = e.target as Element;
        if (!force && $target.slot === `${which}-drawer`)
            return;
        this.closeDrawer(which);
    }

    set title(src: string) {
        this.$mainTitle.innerHTML = src;
    }

    /**
     * `src` here is HTML that might be an SVG or an `img` tag with `src`
     * attribute set appropriately, etc.
     */
    set loadingModalImg(src: string) {
        this.$loadingModal.innerHTML = src;
    }
}

window.customElements.define("hq-layout", Layout);
