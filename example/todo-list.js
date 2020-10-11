import Hoquet from "../mixin.js";
import { stylesheet, template, rendered } from "../utils.js";

import TodoItem from "./todo-item.js";


class TodoList extends Hoquet(HTMLElement, {
    template: template`
        <div>
            <input id="new-todo-input" type="text">
            <ul id="list"></ul>
        </div>
    `,
    stylesheets: [
        stylesheet`
            #list { margin: 0; padding: 0; }
            #new-todo-input { font-size: 2rem; margin: 0; padding: 0; width: 100%; }
        `
    ],
    attributes: ["placeholder"]
}) {

    connectedCallback() {
        this.render();
        this.bind();
        this.placeholder = this.placeholder || "Default placeholder...";
    }

    attributeChangedCallback(key, prev, curr) {
        if (!rendered(this))
            return;
            
        if (key === "placeholder") {
            this.$["new-todo-input"].placeholder = curr;
        }
    }

    bind() {
        this.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                const name = this.$["new-todo-input"].value.trim();
                if (name) {
                    this.addItem(name);
                }
                this.$["new-todo-input"].value = null;
            }
        });

        this.addEventListener("item-deleted", (e) => {
            this.removeItem(e.detail);
        });
    }

    removeItem(item) {
        this.$["list"].removeChild(item);
    }

    addItem(item) {
        this.$["list"].appendChild(new TodoItem(item));
    }
}

window.customElements.define("todo-list", TodoList);
