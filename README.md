# Hoquet
A tiny, minimal, platform-native, vanilla JavaScript web component framework.


## `HTMLElement` mixin
The `Hoquet` mixin is the core of the library. It is designed to wrap any `class` that `extends` `HTMLElement`. It provides a small number of interfaces for dealing with template rendering, stylesheet construction, Shadow DOM, and attribute observation/reflection. Nothing that is provided is required. The template and stylesheets for each component are constructed only once, when the class is declared.

The following is a traditional todo app implementation using platform-native web components and the `Hoquet` mixin. It consists of a `TodoItem` component that can have three states (todo, doing, and done), and a `TodoList` component that can hold any number of `TodoItem`s. See `./example` for the source files. To run this demo with npm, run `npm run demo` in a terminal at the top level of this repository.


```javascript
// todo-list.js
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
            this.removeItem(e.detail.item);
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
```

```javascript
// todo-item.js
import Hoquet from "../mixin.js";
import { rendered, stylesheet, template } from "../utils.js";


const styles = stylesheet`
...
`;

const states = ["todo", "doing", "done"];

export default class TodoItem extends Hoquet(HTMLElement, {
    stylesheets: [styles],
    attributes: ["state", "name"],
    template: template`
        <li id="item">
            <span id="name"></span>
            <span id="x">x</span>
        </li>
    `
}) {
    
    constructor(name) {
        super();
        this.name = name;
        this.state = states[0];
    }

    connectedCallback() {
        this.render();

        this.$["item"].addEventListener("click", e => this.toggleState());
        
        this.$["x"].addEventListener("click", e => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("item-deleted", {
                composed: true, bubbles: true, detail: {item: this}
            }));
        });
    }

    attributeChangedCallback(key, prev, curr) {
        if (!rendered(this))
            return;

        if (key === "state") {
            states.forEach(state => this.$.item.classList.remove(state));
            this.$.item.classList.add(curr);
        } else if (key === "name") {
            this.$.name.innerText = curr;
        }
    }

    toggleState() {
        const currentStateIndex = states.indexOf(this.state);
        this.state = states[
            currentStateIndex >= states.length - 1
                ? 0 : currentStateIndex + 1
        ];
    }

    /**
     * If you would prefer to render a component with its state interpolated
     * into the template at "runtime" (as we're doing below with `this.name`),
     * you can provide a `template` getter in lieu of a declared template,
     * which can be either a structured list of S-expressions like the below
     * form, an `HTMLTemplateElement`, or a normal template string, such as:
     * 
     * `<li id="item">
     *     <span class="name">${this.name}</span>
     *     <span id="x">x</span>
     * </li>`
     * 
     * This is unnecessary in most cases, though, because the state could
     * be handled by the delivered `attributeChangedCallback` mechanism,
     * which provides better flexibility and performance, and then you only
     * render once, which means that the browser doesn't have to construct any
     * elements more than once, and you can describe imperatively how to
     * surgically change their state within `attributeChangedCallback`.
     */
    // get template() {
    //     return (
    //         ["li", {id: "item"},
    //          ["span", {id: "name"}, this.name],
    //          ["span", {id: "x"}, "x"]]
    //     );
    // }

}

window.customElements.define("todo-item", TodoItem);
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
