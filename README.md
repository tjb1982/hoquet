# Hoquet
A tiny, minimal, platform-native, vanilla JavaScript web component library.

The goal of this project is not necessarily to suggest using this particular library (although I use it in my own projects). Instead, the goal is as much to demostrate patterns you can use in your own projects using Web Components without having to use any framework/library.

## `HTMLElement` mixin
The `Hoquet` mixin is the core of the library. It is designed to wrap any `class` that `extends` `HTMLElement`. It provides a small number of interfaces for dealing with template rendering, stylesheet construction, Shadow DOM, and attribute observation/reflection. Nothing that is provided is required. The template and stylesheets for each component are constructed only once, when the class is declared.

The following is a traditional todo app implementation using platform-native web components and the `Hoquet` mixin. It consists of a `TodoItem` component that subclasses `HTMLLIElement`, and can have three states (todo, doing, and done), and a `TodoApp` component that can hold any number of `TodoItem`s. See `./example` for the entire source. To run this demo with npm, run `npm run demo` in a terminal at the top level of this repository.

```javascript
// todo-item.js
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
```

```javascript
// todo-app.js
import Hoquet from "../mixin.js";
import { stylesheet, template } from "../utils.js";

import TodoItem from "./todo-item.js";


const capitalize = (x) => `${x[0].toUpperCase()}${x.substr(1)}`;

const styles = "...";

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
```

```html
<!doctype html>
<html>
<head><script type="module" src="/example/todo-list.js"></script></head>
<body>
    <todo-list placeholder="what do you want to do today?"></todo-list>
</body>
</html>
```

You can see an example todo app using the web component mixin by running the "demo" script from the top level of the repo using npm/yarn.

```bash
$ npm install && npm run demo
```



## Templating DSL basic usage (optional)

```javascript
import { render } from "@pojagi/hoquet/hoquet";


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

Within a class using `Hoquet` mixin:

```javascript
class Foo extends Hoquet(HTMLElement) {
    connectedCallback() {
        this.things = ["bread", "milk", "eggs"];
        this.render();
    }

    get template() {
        return (
            ["div", {class: "container"},
             ["ul",
              this.things.map(thing => ["li", thing])]]
        );
    }
}
```
