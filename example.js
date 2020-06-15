import Hoquet from "./mixin.js";

const states = ["todo", "doing", "done"];


const listTemplate = document.createElement("template");
listTemplate.innerHTML = `
<div>
    <input id="new-todo" type="text">
    <ul id="list"></ul>
</div>
`;


class TodoList extends Hoquet(HTMLElement) {

    static get reflectedAttributes() { return ["placeholder"]; }
    static get observedAttributes() { return this.reflectedAttributes; }
    attributeChangedCallback(k, prev, curr) {
        if (!this.$)
            return;

        if (k === "placeholder") {
            this.$["new-todo"].placeholder = curr;
        }
    }

    connectedCallback() {
        this.render();
        this.bind();
        this.placeholder = this.placeholder || "Default placeholder...";
    }

    bind() {
        this.addEventListener("keyup", (e) => {
            switch (e.key) {
            case "Enter":
                this.$["new-todo"].value && this.addItem({
                        name: this.$["new-todo"].value,
                        state: "todo"
                });
                this.$["new-todo"].value = null;
                break;
            }
        });

        this.addEventListener("item-deleted", (e) => {
            this.$["list"].removeChild(e.detail.item);
        });
    }

    addItem(item) {
        this.$["list"].appendChild(new TodoItem(item));
    }

    get template() {
        return listTemplate;
    }

    get styles() {
        return `
            #list { margin: 0; padding: 0; }
            #new-todo { font-size: 2rem; margin: 0; padding: 0; width: 100%; }
        `;
    }

}


class TodoItem extends Hoquet(HTMLElement) {
    constructor({name, state}) {
        super();
        this.name = name;
        this.state = state;
    }

    connectedCallback() {
        this.render();

        this.$["li"].addEventListener("click", e => this.toggleState());
        this.$["x"].addEventListener("click", e => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("item-deleted", {
                composed: true, bubbles: true, detail: {item: this}
            }));
        });
    }

    static get reflectedAttributes() { return ["state", "name"]; }
    static get observedAttributes() { return this.reflectedAttributes; }
    attributeChangedCallback(k, prev, curr) {
        if (!this.$)
            return;

        if (k === "state") {
            states.forEach(x => this.$.li.classList.remove(x));
            this.$.li.classList.add(curr);
        }
    }

    toggleState() {
        const currentStateIndex = states.indexOf(this.state);
        this.state = states[
            currentStateIndex >= states.length - 1
                ? 0 : currentStateIndex + 1
        ];
    }

    get template() {
        return (
            ["li", {id: "li"},
             ["span", {class: "name"}, this.name],
             ["span", {id: "x"}, "x"]]
        );
    }

    get styles() {
        return `
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
            #x {
                text-decoration: none!important;
                display: block;
                float: right;
                background-color: #fff;
                padding: 0 10px;
                font-size: 2rem;
            }
        `;
    }
}


window.Hoquet = Hoquet;
window.TodoList = TodoList;
window.TodoItem = TodoItem;
window.customElements.define("todo-list", TodoList);
window.customElements.define("todo-item", TodoItem);
