import Hoquet from "../mixin.js";
import { stylesheet, template } from "../utils.js";

import TodoItem from "./todo-item.js";


const capitalize = (x) => `${x[0].toUpperCase()}${x.substr(1)}`;

const styles = `
#list { margin: 0; padding: 0; }
#new-todo-input { font-size: 2rem; margin: 0; padding: 0; width: 100%; }

li {
    cursor: pointer;
    list-style: none;
    padding: 10px 15px;
    background-color: #fafafa;
    border: 1px solid #ff0;
    margin: 5px 0;
    font-family: sans-serif;
    font-size: 2rem;
}

.todo .name { color: #33a; }
.doing .name { color: orange }
.doing .name::after { content: " (in progress)" }
.done .name {
    text-decoration: line-through;
    color: #888;
}

.name {
    width: 75%;
}
.delete {
    text-decoration: none!important;
    display: block;
    float: right;
    background-color: #fff;
    padding: 0 10px;
    font-size: 2rem;
}
header {
    padding: 5px;
    color: #888;
    background: #444;
    display: flex;
    justify-content: space-between;
    font-family: monospace;
}
#report {
    font-size: 1.5rem;
}
#clear-done {
    border: none;
    border-radius: 3px;
}
`;

class TodoApp extends Hoquet(HTMLElement, {
    template: template`
        <header>
            <div id="report">
            ${
                TodoItem.states.map(
                    state => (
                        `${capitalize(state)}: <span id="${state}-count">0</span>`
                    )
                ).join(", ")
            }
            </div>
            <button id="clear-done">Clear done</button>
        </header>
        <input id="new-todo-input" type="text">
        <ul id="list"></ul>
    `,
    stylesheets: [
        stylesheet`${styles}`
    ],
    attributes: ["placeholder"]
}) {

    connectedCallback() {
        this.render();
        this.bind();
        this.placeholder = this.placeholder || "Default placeholder...";
    }

    attributeChangedCallback(key, prev, curr) {
        if (!this.rendered)
            return;
            
        if (key === "placeholder") {
            this.$["new-todo-input"].placeholder = curr;
        }
    }

    bind() {
        this.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                const name = this.$["new-todo-input"].value.trim();
                if (name) {
                    this.addItem(name);
                }
                this.$["new-todo-input"].value = null;
            }
        });

        this.addEventListener("item-state-changed", e => {
            this.updateReport();
        });

        this.addEventListener("item-deleted", e => {
            this.removeItem(e.detail);
            this.updateReport();
        });

        this.$["clear-done"].addEventListener("click", e => {
            this.clear("done");
        });
    }

    updateReport() {
        TodoItem.states.forEach(state => {
            this.$[`${state}-count`].innerText =
                [...this.$["list"].children].reduce(
                    (count, $item) => count + ($item.state === state), 0
                );
        });
    }

    removeItem(item, update = false) {
        this.$["list"].removeChild(item);
    }

    addItem(item) {
        this.$["list"].appendChild(new TodoItem(item));
    }

    clear(state) {
        [...this.$["list"].children].forEach($item => {
            if ($item.state === state) {
                this.removeItem($item);
            }
        });
        this.updateReport();
    }
}

window.customElements.define("todo-app", TodoApp);
