import Hoquet from "../mixin.js";
import { template } from "../utils.js";


const states = ["todo", "doing", "done"];

export default class TodoItem extends Hoquet(HTMLLIElement, {
    attributes: ["state", "name"],
    template: template`
        <span class="name"></span>
        <span class="delete">x</span>
    `,
    /**
     * HTMLLIElement doesn't support `attachShadow`
     */
    shadowy: false
}) {
    
    constructor(name) {
        super();
        this.name = name;
        this.state = states[0];
    }

    static states = states;

    connectedCallback() {
        this.render();

        this.addEventListener("click", e => {
            if (e.target.classList.contains("delete")) {
                this.dispatch("item-deleted");
            } else {
                this.toggleState()
            }
        });
    }

    dispatch(name) {
        this.dispatchEvent(new CustomEvent(name, {
            composed: true, bubbles: true, detail: this
        }));
    }

    attributeChangedCallback(key, prev, curr) {
        if (!this.rendered)
            return;

        if (key === "state") {
            states.forEach(state => this.classList.remove(state));
            this.classList.add(curr);
            this.dispatch("item-state-changed");
        } else if (key === "name") {
            const $name = this.querySelector(".name");
            $name.innerText = curr;
        }
    }

    toggleState() {
        const currentStateIndex = states.indexOf(this.state);
        this.state = states[
            currentStateIndex >= states.length - 1
                ? 0 : currentStateIndex + 1
        ];
    }
}

window.customElements.define("todo-item", TodoItem, {extends: "li"});