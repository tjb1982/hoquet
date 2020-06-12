# hoquet
Minimal web components framework with JavaScript HTML/XML templating using Arrays as S-expressions (loosely based on Clojure's Hiccup).

## Templating DSL basic usage

```javascript
import { render } from "./hoquet.js";

const things = ["bread", "milk", "eggs"];
render(
  ["ul", {class: ["things", "list"]},
   things.map(x => ["li", x])]
);
// <ul class="things list"><li>bread</li><li>milk</li><li>eggs</li></ul>

render(
  ["link", {rel: "stylesheet", href: "styles.css"}]
)
// <link rel="stylesheet" href="styles.css" />
```

## Web component mixin

```javascript
import Hoquet from "@pojagi/hoquet/mixin";


class TodoList extends Hoquet(HTMLElement) {

    // Reflect attributes as properties
    static get reflectedAttributes() { return ["placeholder"]; }

    // Update internal attributes
    static get observedAttributes() { return ["placeholder"]; }
    attributeChangedCallback(key, prev, curr) {
        if (key === "placeholder") {
            this.$["new-todo"].placeholder = curr;
        }
    }

    constructor() {
        super();
        this.placeholder = this.placeholder || "Default placeholder...";

        // Render when appropriate
        this.render();

        // i.e., this.$[name] = this.shadowRoot.getElementById(name)
        this.select("list", "new-todo");
        this.bind();
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
        return (
            ["div",
             ["input", {id: "new-todo", type: "text", placeholder: this.placeholder}],
             ["ul", {id: "list"}, null]]
        );
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
        this.render();

        this.select(
                "x",
                ["$li", "li", "querySelector"]
        );

        this.state = state;

        this.$li.addEventListener("click", e => this.toggleState());
        this.$["x"].addEventListener("click", e => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("item-deleted", {
                composed: true, bubbles: true, detail: {item: this}
            }));
        });
    }

    get state() { return this._state }
    set state(state) {
        this._state = state;
        states.forEach(x => this.$li.classList.remove(x));
        this.$li.classList.add(state);
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
            ["li"
            , ["span", {class: "name"}, this.name]
            , ["span", {id: "x"}, "x"]
            ]
        );
    }

    get styles() { return // "..." }
}

window.customElements.define("todo-list", TodoList);
window.customElements.define("todo-item", TodoItem);
```

```html
<!doctype html>
<html>
<head><script type="module" src="example.js"></script></head>
<body>
    <todo-list placeholder="what do you want to do today?"></todo-list>
</body>
</html>
```

You can see an example todo app using the web component mixin by running the "demo" script from the top level of the repo using npm/yarn.

```bash
$ npm install && npm run demo
```

